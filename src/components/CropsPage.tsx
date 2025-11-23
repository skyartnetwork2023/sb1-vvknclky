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
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold">Crops</h1>
    </div>
  );
  );
}
