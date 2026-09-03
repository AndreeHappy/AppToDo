import React, { useState, useRef, useEffect } from 'react';
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
  CaretDown,
  Gear,
  SignOut,
} from '@phosphor-icons/react';

const MODULE_SESSION_KEY = 'app_portal_active_module';

const MainPortal: React.FC = () => {
  const { user, profile, loading, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const displayName = profile?.nickname || profile?.first_name || (profile?.full_name ? profile.full_name.trim().split(' ')[0] : 'Usuario');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

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

        {/* Right Actions: User profile pill with dropdown menu */}
        <div className="relative shrink-0" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            title="Opciones de cuenta"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all shadow-xs active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="font-mono font-bold truncate max-w-[110px] sm:max-w-[160px]">
              {displayName}
            </span>
            <CaretDown size={11} className={`text-zinc-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0b12] border border-white/[0.12] shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl"
              >
                {/* Header info */}
                <div className="px-3 py-2 border-b border-white/[0.08] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{displayName}</span>
                    <span className="text-[10px] text-zinc-400 truncate">{user?.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setActiveModule('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors w-full text-left"
                >
                  <User size={15} className="text-indigo-400" />
                  <span>Mi Perfil</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModule('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors w-full text-left"
                >
                  <Gear size={15} className="text-zinc-400" />
                  <span>Ajustes</span>
                </button>

                <div className="h-px bg-white/[0.06] my-0.5" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left font-semibold"
                >
                  <SignOut size={15} />
                  <span>Cerrar Sesión</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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