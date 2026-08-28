import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthView } from './components/auth/AuthView';
import { DashboardHub } from './components/dashboard/DashboardHub';
import { ToDoModule } from './components/todo/ToDoModule';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { StatusBadge } from './components/ui/StatusBadge';
import type { ActiveModule } from './types';
import {
  House,
  ListChecks,
  TrendUp,
  SignOut,
  User,
  CircleNotch,
  Sun,
  Moon,
  GithubLogo,
  List,
  X,
} from '@phosphor-icons/react';

const MODULE_SESSION_KEY = 'app_portal_active_module';

const MainPortal: React.FC = () => {
  const { user, profile, loading, logout, isMockMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Remember active module on page refresh, but start at hub on fresh login
  const [activeModule, setActiveModuleState] = useState<ActiveModule>(() => {
    const saved = sessionStorage.getItem(MODULE_SESSION_KEY);
    return (saved === 'todo' || saved === 'finance') ? (saved as ActiveModule) : 'hub';
  });

  const setActiveModule = (mod: ActiveModule) => {
    setActiveModuleState(mod);
    sessionStorage.setItem(MODULE_SESSION_KEY, mod);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(MODULE_SESSION_KEY);
    setActiveModuleState('hub');
    setIsMobileMenuOpen(false);
    await logout();
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

  if (activeModule === 'hub') {
    return <DashboardHub onSelectModule={setActiveModule} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex flex-col justify-between antialiased transition-colors">
      {/* Top Navigation Bar (Mobile Optimized) */}
      <nav className="bg-[#11131a] border-b border-white/[0.08] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-30 select-none">
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
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendUp size={15} weight="bold" /> Módulo de Finanzas
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Desktop Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => setActiveModule(activeModule === 'todo' ? 'finance' : 'todo')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span>Cambiar a {activeModule === 'todo' ? 'Finanzas' : 'To-Do'}</span>
          </button>

          <a
            href="https://github.com/AndreeHappy/AppToDo"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver repositorio en GitHub"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <GithubLogo size={15} />
          </a>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs text-zinc-400">
            <User size={14} />
            <span className="font-mono">{profile?.full_name || user.email?.split('@')[0]}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <SignOut size={16} />
          </button>
        </div>

        {/* Right Side: Mobile Controls (Clean & Compact) */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
          >
            <SignOut size={15} />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-indigo-600 text-white font-bold transition-all"
          >
            <List size={16} weight="bold" />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          <div className="relative z-50 w-72 bg-[#11131a] h-full shadow-2xl flex flex-col justify-between p-5 border-l border-white/[0.08]">
            <div className="flex flex-col gap-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <User size={16} className="text-indigo-400" />
                  <span className="truncate max-w-[170px]">{profile?.full_name || user.email}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Badge */}
              <StatusBadge isMockMode={isMockMode} />

              {/* Navigation Links */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Módulos de Trabajo
                </span>

                <button
                  onClick={() => setActiveModule('todo')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    activeModule === 'todo'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ListChecks size={16} /> Módulo To-Do
                  </span>
                  {activeModule === 'todo' && <span className="text-[10px] font-bold">Activo</span>}
                </button>

                <button
                  onClick={() => setActiveModule('finance')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    activeModule === 'finance'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TrendUp size={16} /> Finanzas Personales
                  </span>
                  {activeModule === 'finance' && <span className="text-[10px] font-bold">Activo</span>}
                </button>
              </div>

              {/* GitHub Link */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Enlaces
                </span>
                <a
                  href="https://github.com/AndreeHappy/AppToDo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <GithubLogo size={16} />
                  <span>Repositorio GitHub</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <SignOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
              <span className="text-[10px] text-center text-zinc-500 font-mono">
                AppToDo • Happy
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Module Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeModule === 'todo' ? (
          <ToDoModule />
        ) : (
          <FinanceDashboard onBackToHub={() => setActiveModule('hub')} />
        )}
      </div>

      {/* Global Footer */}
      <footer className="py-2.5 px-4 bg-[#11131a] border-t border-white/[0.06] text-center text-[11px] text-zinc-500 flex items-center justify-between">
        <span>AppToDo • Desarrollado por <strong>Happy</strong></span>
        <a
          href="https://github.com/AndreeHappy/AppToDo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:underline flex items-center gap-1"
        >
          <GithubLogo size={12} />
          <span>GitHub</span>
        </a>
      </footer>
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