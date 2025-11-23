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
  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold">Loans</h1>
    </div>
  );
}
