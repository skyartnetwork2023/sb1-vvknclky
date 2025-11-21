import { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, Leaf, TrendingUp, PiggyBank, Eye, DollarSign, Calendar, LogOut, User, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voucher', label: 'Voucher', icon: Ticket },
    { id: 'crops', label: 'Crops', icon: Leaf },
    { id: 'capex', label: 'Capex', icon: TrendingUp },
    { id: 'investment', label: 'Investment', icon: PiggyBank },
    { id: 'visualization', label: 'Visualization', icon: Eye },
    { id: 'loans', label: 'Loans', icon: DollarSign },
    { id: 'planning', label: 'Planning', icon: Calendar },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-56'} bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl transition-all duration-200`}>
      <div className="relative flex items-center justify-between p-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-800">
            <Menu className="w-5 h-5 text-slate-300" />
          </div>
          {!collapsed && <h1 className="text-lg font-semibold text-slate-100">FinDash</h1>}
        </div>

        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(v => !v)}
          className="absolute right-2 top-2 w-7 h-7 rounded-md flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-1 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          // Restore collapsed state from localStorage on mount
          useEffect(() => {
            try {
              if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('sidebar-collapsed');
                if (saved !== null) setCollapsed(saved === 'true');
              }
            } catch (e) {
              // ignore
            }
          }, []);

          // Persist collapsed state when it changes
          useEffect(() => {
            try {
              if (typeof window !== 'undefined') localStorage.setItem('sidebar-collapsed', String(collapsed));
            } catch (e) {
              // ignore
            }
          }, [collapsed]);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative w-full flex items-center ${collapsed ? 'group justify-center' : 'gap-3 pl-3 pr-4'} py-3 rounded-r-lg transition-colors text-left overflow-hidden ${
                isActive
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {isActive && <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-cyan-400`} />}

              <div className="flex items-center z-10">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="font-medium text-sm ml-3 truncate">{item.label}</span>}

                {collapsed && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded shadow z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-slate-800">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-2 rounded-md`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-slate-900" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.email ? user.email.split('@')[0] : 'Account'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {!collapsed ? (
          <div className="mt-3">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => signOut()}
              className="w-9 h-9 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
