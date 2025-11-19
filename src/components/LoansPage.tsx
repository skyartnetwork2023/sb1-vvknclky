import { Plus, Trash2, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Loan {
  id: string;
  loan_name: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  status: string;
}

export function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    loan_name: '',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    status: 'active',
  });

  useEffect(() => {
    if (!user) return;

    const fetchLoans = async () => {
      const { data } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setLoans(data);
      setLoading(false);
    };

    fetchLoans();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.loan_name || !formData.principal_amount) return;

    const { data } = await supabase
      .from('loans')
      .insert([
        {
          user_id: user.id,
          loan_name: formData.loan_name,
          principal_amount: parseFloat(formData.principal_amount),
          interest_rate: parseFloat(formData.interest_rate) || 0,
          tenure_months: parseInt(formData.tenure_months) || 12,
          status: formData.status,
          start_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .maybeSingle();

    if (data) {
      setLoans([data, ...loans]);
      setFormData({
        loan_name: '',
        principal_amount: '',
        interest_rate: '',
        tenure_months: '',
        status: 'active',
      });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('loans').delete().eq('id', id);
    setLoans(loans.filter(l => l.id !== id));
  };

  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
  const totalInterest = loans.reduce(
    (sum, loan) => sum + (loan.principal_amount * loan.interest_rate / 100),
    0
  );

  const calculateMonthlyEMI = (principal: number, rate: number, months: number) => {
    if (months === 0) return 0;
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Loans</h1>
            <p className="text-slate-400">Manage your loan portfolio</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Loan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm">Total Principal</p>
            <p className="text-3xl font-bold text-white mt-2">${totalPrincipal.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm">Total Interest</p>
            <p className="text-3xl font-bold text-red-400 mt-2">${totalInterest.toLocaleString()}</p>
          </div>
        </div>

        {isAdding && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Loan Name"
                value={formData.loan_name}
                onChange={(e) => setFormData({ ...formData, loan_name: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-red-500 focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Principal Amount"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-red-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Interest Rate %"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  className="bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-red-500 focus:outline-none"
                  step="0.1"
                />
              </div>
              <input
                type="number"
                placeholder="Tenure (months)"
                value={formData.tenure_months}
                onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 border border-slate-600 focus:border-red-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 transition-colors font-medium"
                >
                  Add Loan
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
            <div className="text-slate-400">Loading loans...</div>
          ) : loans.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
              <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No loans recorded</p>
            </div>
          ) : (
            loans.map(loan => {
              const emi = calculateMonthlyEMI(loan.principal_amount, loan.interest_rate, loan.tenure_months);
              const totalPayable = emi * loan.tenure_months;
              return (
                <div key={loan.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{loan.loan_name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-slate-400 text-sm">Principal</p>
                          <p className="text-white font-semibold">${loan.principal_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Rate</p>
                          <p className="text-white font-semibold">{loan.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Monthly EMI</p>
                          <p className="text-blue-400 font-semibold">${emi.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Total Payable</p>
                          <p className="text-red-400 font-semibold">${totalPayable.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(loan.id)}
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
