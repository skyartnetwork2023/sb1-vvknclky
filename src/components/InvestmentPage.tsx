import { Plus, Trash2, PiggyBank } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Investment {
  id: string;
  investment_name: string;
  amount: number;
  return_percentage: number;
  status: string;
  start_date: string;
}

export function InvestmentPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    investment_name: '',
    amount: '',
    return_percentage: '',
    status: 'active',
  });

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      const { data } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setInvestments(data);
      setLoading(false);
    };

    fetchInvestments();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.investment_name || !formData.amount) return;

    const { data } = await supabase
      .from('investments')
      .insert([
        {
          user_id: user.id,
          investment_name: formData.investment_name,
          amount: parseFloat(formData.amount),
          return_percentage: parseFloat(formData.return_percentage) || 0,
          status: formData.status,
          start_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setInvestments([data, ...investments]);
      setFormData({ investment_name: '', amount: '', return_percentage: '', status: 'active' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('investments').delete().eq('id', id);
    setInvestments(investments.filter(i => i.id !== id));
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = investments.reduce((sum, inv) => sum + (inv.amount * inv.return_percentage / 100), 0);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Investments</h1>
            <p className="text-slate-400">Track your investment portfolio</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Investment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm">Total Invested</p>
            <p className="text-3xl font-bold text-white mt-2">${totalInvested.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm">Expected Returns</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">${totalReturns.toLocaleString()}</p>
          </div>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Investment Name"
                value={formData.investment_name}
                onChange={(e) => setFormData({ ...formData, investment_name: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Return %"
                  value={formData.return_percentage}
                  onChange={(e) => setFormData({ ...formData, return_percentage: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  step="0.1"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Add Investment
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
            <div className="text-slate-400">Loading investments...</div>
          ) : investments.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <PiggyBank className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Start building your investment portfolio</p>
            </div>
          ) : (
            investments.map(inv => {
              const returns = inv.amount * inv.return_percentage / 100;
              return (
                <div key={inv.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{inv.investment_name}</h3>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-slate-400 text-sm">Amount</p>
                          <p className="text-white font-semibold">${inv.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Return</p>
                          <p className="text-emerald-400 font-semibold">{inv.return_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Expected Gain</p>
                          <p className="text-emerald-400 font-semibold">${returns.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
