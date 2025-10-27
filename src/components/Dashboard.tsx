import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
                <p className="text-slate-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-slate-500">Email:</span>
                <p className="text-slate-900">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">User ID:</span>
                <p className="text-slate-900 font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">Account created:</span>
                <p className="text-slate-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
