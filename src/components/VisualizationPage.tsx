import { BarChart3, LineChart, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChartData {
  investments: number;
  loans: number;
  capex: number;
  vouchers: number;
}

export function VisualizationPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData>({
    investments: 0,
    loans: 0,
    capex: 0,
    vouchers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [investments, loans, capex, vouchers] = await Promise.all([
        supabase
          .from('investments')
          .select('amount')
          .eq('user_id', user.id)
          .then(res => res.data?.reduce((sum, item) => sum + item.amount, 0) || 0),
        supabase
          .from('loans')
          .select('principal_amount')
          .eq('user_id', user.id)
          .then(res => res.data?.reduce((sum, item) => sum + item.principal_amount, 0) || 0),
        supabase
          .from('capex')
          .select('amount')
          .eq('user_id', user.id)
          .then(res => res.data?.reduce((sum, item) => sum + item.amount, 0) || 0),
        supabase
          .from('vouchers')
          .select('amount')
          .eq('user_id', user.id)
          .then(res => res.data?.reduce((sum, item) => sum + item.amount, 0) || 0),
      ]);

      setChartData({
        investments,
        loans,
        capex,
        vouchers,
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const total = chartData.investments + chartData.loans + chartData.capex + chartData.vouchers;

  const calculatePercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const ChartSegment = ({
    label,
    value,
    percentage,
    color,
    icon: Icon,
  }: any) => (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="text-lg font-semibold text-white">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-2">${value.toLocaleString()}</p>
      <div className="flex items-center justify-between">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="ml-3 text-slate-300 font-semibold">{percentage}%</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading visualizations...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Visualization</h1>
          <p className="text-slate-400">Financial metrics and analytics</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-white">${total.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSegment
            label="Investments"
            value={chartData.investments}
            percentage={calculatePercentage(chartData.investments)}
            color="bg-emerald-500"
            icon={PieChart}
          />
          <ChartSegment
            label="Loans"
            value={chartData.loans}
            percentage={calculatePercentage(chartData.loans)}
            color="bg-red-500"
            icon={LineChart}
          />
          <ChartSegment
            label="Capex"
            value={chartData.capex}
            percentage={calculatePercentage(chartData.capex)}
            color="bg-purple-500"
            icon={BarChart3}
          />
          <ChartSegment
            label="Vouchers"
            value={chartData.vouchers}
            percentage={calculatePercentage(chartData.vouchers)}
            color="bg-blue-500"
            icon={PieChart}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Distribution Analysis
            </h2>
            <div className="space-y-4">
              {total === 0 ? (
                <p className="text-slate-400">No data available</p>
              ) : (
                <>
                  {chartData.investments > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Investments lead with</span>
                      <span className="font-semibold text-emerald-400">
                        {calculatePercentage(chartData.investments)}%
                      </span>
                    </div>
                  )}
                  {chartData.capex > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Capex allocation</span>
                      <span className="font-semibold text-purple-400">
                        {calculatePercentage(chartData.capex)}%
                      </span>
                    </div>
                  )}
                  {chartData.loans > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Loan obligations</span>
                      <span className="font-semibold text-red-400">
                        {calculatePercentage(chartData.loans)}%
                      </span>
                    </div>
                  )}
                  {chartData.vouchers > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Voucher balance</span>
                      <span className="font-semibold text-blue-400">
                        {calculatePercentage(chartData.vouchers)}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-green-400" />
              Key Insights
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <p className="text-slate-300 text-sm">
                  Your portfolio is well-diversified across investments, capex, and loans.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <p className="text-slate-300 text-sm">
                  Monitor loan payments and ensure timely EMI adjustments for better cash flow.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <p className="text-slate-300 text-sm">
                  Consider diversifying investments to balance portfolio risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
