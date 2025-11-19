import { Plus, Trash2, Calendar, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
  id: string;
  plan_name: string;
  category: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  priority: string;
}

export function PlanningPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: '',
    category: '',
    target_amount: '',
    deadline: '',
    priority: 'medium',
  });

  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      const { data } = await supabase
        .from('planning')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (data) setPlans(data);
      setLoading(false);
    };

    fetchPlans();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.plan_name || !formData.target_amount) return;

    const { data } = await supabase
      .from('planning')
      .insert([
        {
          user_id: user.id,
          plan_name: formData.plan_name,
          category: formData.category,
          target_amount: parseFloat(formData.target_amount),
          current_amount: 0,
          deadline: formData.deadline,
          priority: formData.priority,
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setPlans([...plans, data]);
      setFormData({
        plan_name: '',
        category: '',
        target_amount: '',
        deadline: '',
        priority: 'medium',
      });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('planning').delete().eq('id', id);
    setPlans(plans.filter(p => p.id !== id));
  };

  const priorityColors = {
    high: 'bg-red-600/20 text-red-300',
    medium: 'bg-yellow-600/20 text-yellow-300',
    low: 'bg-green-600/20 text-green-300',
  };

  const categories = ['Savings', 'Investment', 'Property', 'Education', 'Travel', 'Other'];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Planning</h1>
            <p className="text-slate-400">Organize your financial goals</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Plan
          </button>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Plan Name"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Target Amount"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Create Plan
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
            <div className="text-slate-400">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No plans yet. Start planning your future!</p>
            </div>
          ) : (
            plans.map(plan => {
              const progress = (plan.current_amount / plan.target_amount) * 100;
              const remaining = plan.target_amount - plan.current_amount;
              return (
                <div key={plan.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{plan.plan_name}</h3>
                      <div className="flex gap-3 mt-2">
                        {plan.category && (
                          <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded">
                            {plan.category}
                          </span>
                        )}
                        {plan.deadline && (
                          <span className="text-sm text-slate-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(plan.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[plan.priority as keyof typeof priorityColors] || 'bg-slate-600/20'}`}>
                        {plan.priority}
                      </span>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-semibold">
                        ${plan.current_amount.toLocaleString()} / ${plan.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-slate-400">
                      Remaining: ${remaining.toLocaleString()} ({Math.round(progress)}% complete)
                    </div>
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
