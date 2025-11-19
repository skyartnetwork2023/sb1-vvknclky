import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardPage } from './DashboardPage';
import { VoucherPage } from './VoucherPage';
import { CropsPage } from './CropsPage';
import { CapexPage } from './CapexPage';
import { InvestmentPage } from './InvestmentPage';
import { VisualizationPage } from './VisualizationPage';
import { LoansPage } from './LoansPage';
import { PlanningPage } from './PlanningPage';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'voucher':
        return <VoucherPage />;
      case 'crops':
        return <CropsPage />;
      case 'capex':
        return <CapexPage />;
      case 'investment':
        return <InvestmentPage />;
      case 'visualization':
        return <VisualizationPage />;
      case 'loans':
        return <LoansPage />;
      case 'planning':
        return <PlanningPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 ml-64">
        {renderPage()}
      </div>
    </div>
  );
}
