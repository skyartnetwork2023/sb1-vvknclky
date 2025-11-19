import { TrendingUp, TrendingDown, Eye, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Metric {
  id: string;
  watches_sold: number;
  open_orders: number;
  capex_amount: number;
  this_week_metric: number;
  this_month_metric: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      const { data } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setMetrics(data);
      } else {
        const { data: newMetric } = await supabase
          .from('dashboard_metrics')
          .insert([
            {
              user_id: user.id,
              watches_sold: 1240,
              open_orders: 145,
              capex_amount: 52000,
              this_week_metric: 8500,
              this_month_metric: 32000,
            },
          ])
          .select()
          .maybeSingle();

        if (newMetric) setMetrics(newMetric);
      }
      setLoading(false);
    };

    fetchMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const StatCard = ({ label, value, change, icon: Icon }: any) => (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center gap-1 mt-3">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Watches Sold"
            value={metrics?.watches_sold || 0}
            change={12}
            icon={TrendingUp}
          />
          <StatCard
            label="Open Orders"
            value={metrics?.open_orders || 0}
            change={5}
            icon={AlertCircle}
          />
          <StatCard
            label="Capex Budget"
            value={metrics?.capex_amount || 0}
            change={-3}
            icon={TrendingDown}
          />
          <StatCard
            label="Visualizations"
            value={8}
            change={0}
            icon={Eye}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">This Week vs This Month</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">This Week</span>
                  <span className="text-white font-semibold">${metrics?.this_week_metric.toLocaleString() || 0}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: '26%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">This Month</span>
                  <span className="text-white font-semibold">${metrics?.this_month_metric.toLocaleString() || 0}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Open vs Capex</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Open Orders</span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full">
                  {metrics?.open_orders || 0} Orders
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Capital Expenditure</span>
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-300 text-sm rounded-full">
                  ${metrics?.capex_amount.toLocaleString() || 0}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 text-sm">
                  Your capex allocation shows strong investment in growth initiatives this quarter.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Updates</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                <span className="text-green-400 font-medium">New feature:</span> Enhanced analytics dashboard with real-time metrics
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                <span className="text-green-400 font-medium">Improved:</span> Faster data loading and better visualization
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                <span className="text-green-400 font-medium">Coming soon:</span> Custom reports export functionality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
