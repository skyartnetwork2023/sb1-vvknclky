import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CapexItem {
  id: string;
  item_name: string;
  amount: number;
  category: string;
  status: string;
  date: string;
}

export function CapexPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CapexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ item_name: '', amount: '', category: '', status: 'pending' });

  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      const { data } = await supabase
        .from('capex')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data) setItems(data);
      setLoading(false);
    };

    fetchItems();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.item_name || !formData.amount) return;

    const { data } = await supabase
      .from('capex')
      .insert([
        {
          user_id: user.id,
          item_name: formData.item_name,
          amount: parseFloat(formData.amount),
          category: formData.category,
          status: formData.status,
          date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setItems([data, ...items]);
      setFormData({ item_name: '', amount: '', category: '', status: 'pending' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('capex').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const categories = ['Equipment', 'Infrastructure', 'Technology', 'Vehicles', 'Other'];
  const statuses = ['pending', 'approved', 'completed'];

  const statusColors = {
    pending: 'bg-amber-600/20 text-amber-300',
    approved: 'bg-blue-600/20 text-blue-300',
    completed: 'bg-green-600/20 text-green-300',
  };

  const totalCapex = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Capital Expenditure</h1>
            <p className="text-slate-400">Manage your investment purchases</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Item
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Capex</p>
              <p className="text-3xl font-bold text-white mt-2">${totalCapex.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Add Item
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

        <div className="space-y-3">
          {loading ? (
            <div className="text-slate-400">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-400">No capex items yet</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.item_name}</h3>
                    <div className="flex gap-3 mt-2">
                      <span className="text-slate-400 text-sm">{item.category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status as keyof typeof statusColors] || 'bg-slate-600/20'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-white">${item.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
