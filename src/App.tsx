import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { TodoProvider } from './context/TodoContext';
import { AuthView } from './components/auth/AuthView';
import { DashboardHub } from './components/dashboard/DashboardHub';
import { ToDoModule } from './components/todo/ToDoModule';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import type { ActiveModule } from './types';
import {
  House,
  ListChecks,
  TrendUp,
  SignOut,
  User,
  CircleNotch,
} from '@phosphor-icons/react';

const MainPortal: React.FC = () => {
  const { user, profile, loading, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('hub');

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex items-center justify-center flex-col gap-3">
        <CircleNotch size={32} className="animate-spin text-indigo-400" />
        <span className="text-xs font-mono text-zinc-500">Cargando portal...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (activeModule === 'hub') {
    return <DashboardHub onSelectModule={setActiveModule} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex flex-col antialiased">
      {/* Top Portal Navigation */}
      <nav className="bg-[#11131a] border-b border-white/[0.08] px-4 sm:px-6 py-3 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModule('hub')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <House size={14} weight="bold" />
            <span>Volver al Hub</span>
          </button>

          <span className="text-zinc-600 hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            {activeModule === 'todo' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <ListChecks size={16} weight="bold" />
                <span>Módulo To-Do</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <TrendUp size={16} weight="bold" />
                <span>Módulo de Finanzas</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Module Switcher & User */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveModule(activeModule === 'todo' ? 'finance' : 'todo')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span>Cambiar a {activeModule === 'todo' ? 'Finanzas' : 'To-Do'}</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs text-zinc-400">
            <User size={14} />
            <span className="hidden md:inline font-mono">{profile?.full_name || user.email}</span>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <SignOut size={16} />
          </button>
        </div>
      </nav>

      {/* Module Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeModule === 'todo' ? (
          <ToDoModule />
        ) : (
          <FinanceDashboard onBackToHub={() => setActiveModule('hub')} />
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <TodoProvider>
          <MainPortal />
        </TodoProvider>
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;