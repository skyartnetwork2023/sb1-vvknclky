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
  return (
    <div className="flex-1 p-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>
    </div>
  );
}
