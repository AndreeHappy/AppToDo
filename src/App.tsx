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
import { InteractiveBackground } from './components/ui/InteractiveBackground';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActiveModule } from './types';
import {
  House,
  User,
  CircleNotch,
  ShieldCheck,
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
      {/* Sticky Global Top Bar (Static when scrolling across all views, without gear icon) */}
      <nav className="sticky top-0 z-40 bg-[#11131a]/85 backdrop-blur-md border-b border-white/[0.08] px-3.5 sm:px-6 py-2.5 flex items-center justify-between select-none transition-colors">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {activeModule === 'hub' ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck size={18} weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-black text-white tracking-tight leading-none block truncate">
                  Portal Multipropósito
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveModule('hub')}
                title="Volver al Hub"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-[0.98] shrink-0"
              >
                <House size={16} weight="bold" />
                <span className="hidden sm:inline">Volver al Hub</span>
              </button>

              <span className="text-zinc-600 hidden sm:inline">/</span>

              <span className="text-xs font-bold text-zinc-300 hidden sm:inline">
                {activeModule === 'todo'
                  ? 'Gestor de Tareas'
                  : activeModule === 'finance'
                  ? 'Gestor de Finanzas'
                  : activeModule === 'profile'
                  ? 'Mi Perfil'
                  : 'Ajustes del Sistema'}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions: User profile pill (No gear icon) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveModule('profile')}
            title="Ver mi perfil"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <User size={14} className="text-indigo-400" />
            <span className="font-mono font-bold">{profile?.full_name || 'Happy'}</span>
          </button>
        </div>
      </nav>

      {/* Interactive Dot Matrix Canvas Background */}
      <InteractiveBackground />

      {/* Main Module Content with Smooth Animated Transitions */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col overflow-hidden w-full"
          >
            {activeModule === 'hub' ? (
              <DashboardHub
                onSelectModule={setActiveModule}
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
          </motion.div>
        </AnimatePresence>
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