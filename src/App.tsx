import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthView } from './components/auth/AuthView';
import { DashboardHub } from './components/dashboard/DashboardHub';
import { ToDoModule } from './components/todo/ToDoModule';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { LiquidNavigator } from './components/navigation/LiquidNavigator';
import type { ActiveModule } from './types';
import {
  House,
  ListChecks,
  TrendUp,
  User,
  CircleNotch,
  Gear,
} from '@phosphor-icons/react';

const MODULE_SESSION_KEY = 'app_portal_active_module';

const MainPortal: React.FC = () => {
  const { user, profile, loading } = useAuth();

  const [activeModule, setActiveModuleState] = useState<ActiveModule>(() => {
    const saved = sessionStorage.getItem(MODULE_SESSION_KEY);
    return (saved === 'todo' || saved === 'finance' || saved === 'profile' || saved === 'settings')
      ? (saved as ActiveModule)
      : 'hub';
  });

  const setActiveModule = (mod: ActiveModule) => {
    setActiveModuleState(mod);
    sessionStorage.setItem(MODULE_SESSION_KEY, mod);
  };

  const handleQuickAction = () => {
    if (activeModule === 'finance') {
      window.dispatchEvent(new CustomEvent('app:open-transaction-modal'));
    } else if (activeModule === 'todo') {
      window.dispatchEvent(new CustomEvent('app:focus-task-input'));
    }
  };

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

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex flex-col justify-between antialiased transition-colors relative pb-24 md:pb-6">
      {/* Clean Module Top Bar (Only visible inside To-Do and Finance) */}
      {(activeModule === 'todo' || activeModule === 'finance') && (
        <nav className="bg-[#11131a] border-b border-white/[0.08] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-30 select-none">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setActiveModule('hub')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-[0.98] shrink-0"
            >
              <House size={14} weight="bold" />
              <span>Volver al Hub</span>
            </button>

            <span className="text-zinc-600 hidden sm:inline">/</span>

            <div className="flex items-center gap-1.5 text-xs font-bold">
              {activeModule === 'todo' ? (
                <span className="text-indigo-400 flex items-center gap-1">
                  <ListChecks size={15} weight="bold" /> Módulo To-Do
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendUp size={15} weight="bold" /> Módulo de Finanzas
                </span>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('profile')}
              title="Personalizar perfil"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <User size={14} className="text-indigo-400" />
              <span className="font-mono font-bold">
                {profile?.full_name || 'Happy'}
              </span>
            </button>

            <button
              onClick={() => setActiveModule('settings')}
              title="Ajustes y configuración"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Gear size={15} />
            </button>
          </div>
        </nav>
      )}

      {/* Main Module Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeModule === 'hub' ? (
          <DashboardHub
            onSelectModule={setActiveModule}
            onOpenProfile={() => setActiveModule('profile')}
            onOpenSettings={() => setActiveModule('settings')}
          />
        ) : activeModule === 'todo' ? (
          <ToDoModule />
        ) : activeModule === 'finance' ? (
          <FinanceDashboard onBackToHub={() => setActiveModule('hub')} />
        ) : activeModule === 'profile' ? (
          <ProfileView onBackToHub={() => setActiveModule('hub')} />
        ) : (
          <SettingsView onBackToHub={() => setActiveModule('hub')} />
        )}
      </div>

      {/* Liquid Navigator (Floating bottom bar with dynamic + button) */}
      <LiquidNavigator
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <TodoProvider>
            <MainPortal />
          </TodoProvider>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;