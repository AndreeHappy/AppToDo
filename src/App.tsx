import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthView } from './components/auth/AuthView';
import { DashboardHub } from './components/dashboard/DashboardHub';
import { ToDoModule } from './components/todo/ToDoModule';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { LiquidNavigator } from './components/navigation/LiquidNavigator';
import { ProfileModal } from './components/profile/ProfileModal';
import { SettingsModal } from './components/settings/SettingsModal';
import type { ActiveModule } from './types';
import {
  House,
  ListChecks,
  TrendUp,
  User,
  CircleNotch,
  Sun,
  Moon,
  Gear,
} from '@phosphor-icons/react';

const MODULE_SESSION_KEY = 'app_portal_active_module';

const MainPortal: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeModule, setActiveModuleState] = useState<ActiveModule>(() => {
    const saved = sessionStorage.getItem(MODULE_SESSION_KEY);
    return (saved === 'todo' || saved === 'finance') ? (saved as ActiveModule) : 'hub';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const setActiveModule = (mod: ActiveModule) => {
    setActiveModuleState(mod);
    sessionStorage.setItem(MODULE_SESSION_KEY, mod);
  };

  const handleQuickAction = () => {
    if (activeModule === 'finance') {
      window.dispatchEvent(new CustomEvent('app:open-transaction-modal'));
    } else if (activeModule === 'todo') {
      window.dispatchEvent(new CustomEvent('app:focus-task-input'));
    } else {
      // If at Hub, default to opening finance or switching
      setActiveModule('finance');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('app:open-transaction-modal'));
      }, 100);
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
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex flex-col justify-between antialiased transition-colors relative pb-20 md:pb-6">
      {/* Top Navigation Bar (Clean & Elevated) */}
      <nav className="bg-[#11131a] border-b border-white/[0.08] px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-30 select-none">
        {/* Left Side: Volver al Hub & Active Module Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setActiveModule('hub')}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-[0.98] shrink-0"
          >
            <House size={14} weight="bold" />
            <span>Volver al Hub</span>
          </button>

          <span className="text-zinc-600 hidden sm:inline">/</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold">
            {activeModule === 'todo' ? (
              <span className="text-indigo-400 flex items-center gap-1">
                <ListChecks size={15} weight="bold" /> Módulo To-Do
              </span>
            ) : activeModule === 'finance' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendUp size={15} weight="bold" /> Módulo de Finanzas
              </span>
            ) : (
              <span className="text-zinc-400 font-medium">Centro de Control</span>
            )}
          </div>
        </div>

        {/* Right Side: Quick Header Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Quick Module Switcher on Desktop */}
          {activeModule !== 'hub' && (
            <button
              onClick={() => setActiveModule(activeModule === 'todo' ? 'finance' : 'todo')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>Cambiar a {activeModule === 'todo' ? 'Finanzas' : 'To-Do'}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Personalizar perfil"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <User size={14} className="text-indigo-400" />
            <span className="hidden sm:inline font-mono font-bold">
              {profile?.full_name || 'Happy'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="Ajustes y configuración"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <Gear size={15} />
          </button>
        </div>
      </nav>

      {/* Main Module Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeModule === 'hub' ? (
          <DashboardHub
            onSelectModule={setActiveModule}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        ) : activeModule === 'todo' ? (
          <ToDoModule />
        ) : (
          <FinanceDashboard onBackToHub={() => setActiveModule('hub')} />
        )}
      </div>

      {/* Liquid Navigator (Floating Smart Bottom Bar) */}
      <LiquidNavigator
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onQuickAction={handleQuickAction}
      />

      {/* Profile & Settings Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
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