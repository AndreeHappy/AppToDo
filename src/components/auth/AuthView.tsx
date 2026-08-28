import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockKey,
  EnvelopeSimple,
  User,
  SignIn,
  UserPlus,
  ShieldCheck,
  Database,
  ArrowRight,
  WarningCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, register, isMockMode } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo para el perfil.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await login(cleanEmail, cleanPassword);
        if (res.error) setErrorMsg(res.error);
      } else {
        const res = await register(cleanEmail, cleanPassword, fullName.trim());
        if (res.error) setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Background subtle noise and glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-emerald-600/[0.03] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#11131a] border border-white/[0.08] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <ShieldCheck size={26} weight="bold" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Portal Multipropósito
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Acceso seguro a tu Centro de Tareas y Gestor de Finanzas Personales
          </p>

          {/* Connection Mode Pill */}
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border bg-zinc-900/90 border-zinc-800 text-zinc-300">
            <Database size={13} className={isMockMode ? 'text-amber-400' : 'text-emerald-400'} />
            <span>
              {isMockMode ? 'Modo Local / Demo Rápido' : 'Conectado a Supabase Cloud'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80 relative">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg(null);
            }}
            className={`relative py-2 text-xs font-bold transition-colors z-10 ${
              isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isLogin && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-[#1e212d] rounded-lg shadow-sm border border-white/[0.08]"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <SignIn size={14} weight="bold" />
              <span>Iniciar Sesión</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg(null);
            }}
            className={`relative py-2 text-xs font-bold transition-colors z-10 ${
              !isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {!isLogin && (
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute inset-0 bg-[#1e212d] rounded-lg shadow-sm border border-white/[0.08]"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <UserPlus size={14} weight="bold" />
              <span>Registrarse</span>
            </span>
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
            >
              <WarningCircle size={16} weight="fill" className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1.5"
            >
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Alex Stern"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <EnvelopeSimple size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu_correo@ejemplo.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <LockKey size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Procesando...</span>
            ) : isLogin ? (
              <>
                <span>Ingresar al Portal</span>
                <ArrowRight size={15} weight="bold" />
              </>
            ) : (
              <>
                <span>Crear Mi Cuenta</span>
                <UserPlus size={15} weight="bold" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};