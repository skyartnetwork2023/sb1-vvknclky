import { Plus, Trash2, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Crop {
  id: string;
  crop_name: string;
  area_planted: number;
  yield: number;
  harvest_date: string;
  status: string;
}

export function CropsPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ crop_name: '', area_planted: '', yield: '', harvest_date: '' });

  useEffect(() => {
    if (!user) return;

    const fetchCrops = async () => {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setCrops(data);
      setLoading(false);
    };

    fetchCrops();
  }, [user]);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.crop_name) return;

    const { data } = await supabase
      .from('crops')
      .insert([
        {
          user_id: user.id,
          crop_name: formData.crop_name,
          area_planted: formData.area_planted ? parseFloat(formData.area_planted) : null,
          yield: formData.yield ? parseFloat(formData.yield) : null,
          harvest_date: formData.harvest_date || null,
          status: 'growing',
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setCrops([data, ...crops]);
      setFormData({ crop_name: '', area_planted: '', yield: '', harvest_date: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('crops').delete().eq('id', id);
    setCrops(crops.filter(c => c.id !== id));
  };

  const statusColors = {
    growing: 'bg-green-600/20 text-green-300',
    harvested: 'bg-amber-600/20 text-amber-300',
    planning: 'bg-blue-600/20 text-blue-300',
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Crops</h1>
            <p className="text-slate-400">Track your agricultural yield</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Crop
          </button>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAddCrop} className="space-y-4">
              <input
                type="text"
                placeholder="Crop Name"
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Area Planted (acres)"
                  value={formData.area_planted}
                  onChange={(e) => setFormData({ ...formData, area_planted: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Expected Yield"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
                  step="0.01"
                />
                <input
                  type="date"
                  value={formData.harvest_date}
                  onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Add Crop
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-slate-400">Loading crops...</div>
          ) : crops.length === 0 ? (
            <div className="col-span-full bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <Leaf className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No crops tracked yet. Start planning your harvest!</p>
            </div>
          ) : (
            crops.map(crop => (
              <div key={crop.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{crop.crop_name}</h3>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Area Planted</p>
                    <p className="text-white font-semibold">{crop.area_planted || 'N/A'} acres</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Expected Yield</p>
                    <p className="text-white font-semibold">{crop.yield || 'N/A'} units</p>
                  </div>
                  <div className="pt-3 border-t border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[crop.status as keyof typeof statusColors] || 'bg-slate-600/20 text-slate-300'}`}>
                      {crop.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
