import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Voucher {
  id: string;
  voucher_number: string;
  amount: number;
  description: string;
  status: string;
}

export function VoucherPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ voucher_number: '', amount: '', description: '' });

  useEffect(() => {
    if (!user) return;

    const fetchVouchers = async () => {
      const { data } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setVouchers(data);
      setLoading(false);
    };

    fetchVouchers();
  }, [user]);

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.voucher_number || !formData.amount) return;

    const { data } = await supabase
      .from('vouchers')
      .insert([
        {
          user_id: user.id,
          voucher_number: formData.voucher_number,
          amount: parseFloat(formData.amount),
          description: formData.description,
          status: 'active',
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setVouchers([data, ...vouchers]);
      setFormData({ voucher_number: '', amount: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('vouchers').delete().eq('id', id);
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Vouchers</h1>
            <p className="text-slate-400">Manage your financial vouchers</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Voucher
          </button>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAddVoucher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Voucher Number"
                  value={formData.voucher_number}
                  onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Save Voucher
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
            <div className="text-slate-400">Loading vouchers...</div>
          ) : vouchers.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-400">No vouchers yet. Create your first one!</p>
            </div>
          ) : (
            vouchers.map(voucher => (
              <div key={voucher.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{voucher.voucher_number}</h3>
                    <p className="text-slate-400 text-sm mt-1">{voucher.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${voucher.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">{voucher.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
