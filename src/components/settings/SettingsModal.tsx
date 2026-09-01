import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
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
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#11131a] border border-white/[0.1] p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 select-none transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Gear size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Ajustes y Configuración
              </h2>
              <span className="text-[11px] text-zinc-400">
                Preferencias de la plataforma y futuras integraciones
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {/* Theme Selector */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={18} weight="bold" /> : <Sun size={18} weight="bold" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Tema Visual</span>
                <span className="text-[11px] text-zinc-400">
                  {theme === 'dark' ? 'Modo Oscuro (Obsidian Dark)' : 'Modo Claro (High Contrast)'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-100 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <span>{theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</span>
            </button>
          </div>

          {/* GitHub Repository Card */}
          <a
            href="https://github.com/AndreeHappy/AppToDo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <GithubLogo size={18} weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Repositorio GitHub Oficial
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  github.com/AndreeHappy/AppToDo
                </span>
              </div>
            </div>
            <ArrowSquareOut size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
          </a>

          {/* Inactivity Security Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} weight="fill" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Seguridad de Sesión</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                  Activa (15 min)
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                Cierre automático de seguridad tras 15 minutos sin interacción.
              </span>
            </div>
          </div>

          {/* Próximas Integraciones */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Próximas Integraciones
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold font-mono">
                Roadmap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Translate size={16} className="text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Multi-Idioma</span>
                  <span className="text-[10px] text-zinc-400">Español / English</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Bank size={16} className="text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Bancos Peruanos</span>
                  <span className="text-[10px] text-zinc-400">BCP, BBVA, Interbank, BN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Credits */}
          <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Code size={15} className="text-indigo-400" />
              <span>Programador / Autor:</span>
            </div>
            <strong className="text-white font-mono font-bold">
              {profile?.full_name || 'Happy'}
            </strong>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <SignOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};