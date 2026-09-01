import React from 'react';
import {
  Gear,
  Sun,
  Moon,
  GithubLogo,
  ShieldCheck,
  SignOut,
  ArrowSquareOut,
  Code,
  Translate,
  Bank,
  House,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onBackToHub: () => void;
}

export const SettingsView: React.FC<Props> = ({ onBackToHub }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Gear size={15} />
            <span>Configuración Global</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Ajustes del Sistema
          </h1>
        </div>

        <button
          onClick={onBackToHub}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <House size={14} />
          <span>Volver al Hub</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Tema Visual */}
        <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Moon size={22} weight="bold" /> : <Sun size={22} weight="bold" />}
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-white">Tema de Interfaz</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                {theme === 'dark'
                  ? 'Actualmente en Modo Oscuro (Obsidian Dark con contraste suave).'
                  : 'Actualmente en Modo Claro (Alta definición y lectura nítida).'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{theme === 'dark' ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}</span>
          </button>
        </div>

        {/* Card 2: GitHub Repository */}
        <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shrink-0">
              <GithubLogo size={22} weight="bold" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-white">Código Fuente</h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                AndreeHappy / AppToDo
              </p>
            </div>
          </div>

          <a
            href="https://github.com/AndreeHappy/AppToDo"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Ver Repositorio en GitHub</span>
            <ArrowSquareOut size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Card 3: Seguridad de Sesión */}
        <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Bloqueo por Inactividad</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                  15 min
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Tu sesión se cierra automáticamente si no se detecta ninguna interacción física en 15 minutos para proteger tus finanzas.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            Estado: Protección activa en tiempo real
          </div>
        </div>

        {/* Card 4: Roadmap & Próximas Integraciones */}
        <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
              Próximas Integraciones
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold font-mono">
              Roadmap
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
              <Translate size={18} className="text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Soporte Multi-Idioma</span>
                <span className="text-[11px] text-zinc-400">Español & English</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80">
              <Bank size={18} className="text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Integración con Bancos Peruanos</span>
                <span className="text-[11px] text-zinc-400">BCP, Interbank, BBVA, Banco de la Nación</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Logout */}
      <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 text-indigo-400 flex items-center justify-center">
            <Code size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">
              Desarrollado con dedicación por <strong className="text-white">Happy</strong>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Cuenta: {user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <SignOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};