import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeSlash,
  LockKey,
  EnvelopeSimple,
  User,
  SignIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  WarningCircle,
  Key,
  PaperPlaneTilt,
  CheckCircle,
  PaperPlaneRight,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';

type AuthMode = 'login' | 'register' | 'forgot_password';

function translateSupabaseError(error: string): { title: string; hint?: string; isUnconfirmedEmail?: boolean } {
  const lower = error.toLowerCase();

  if (lower.includes('email not confirmed')) {
    return {
      title: 'Tu correo electrónico aún no ha sido confirmado.',
      hint: 'Revisa tu bandeja de entrada (y spam) para hacer clic en el enlace de verificación.',
      isUnconfirmedEmail: true,
    };
  }
  if (lower.includes('invalid login credentials')) {
    return {
      title: 'Correo electrónico o contraseña incorrectos.',
      hint: 'Verifica que tus datos estén bien escritos o usa "¿Olvidaste tu contraseña?".',
    };
  }
  if (lower.includes('user already registered')) {
    return {
      title: 'Este correo ya tiene una cuenta registrada.',
      hint: 'Selecciona la pestaña "Iniciar Sesión" para ingresar.',
    };
  }
  if (lower.includes('password should be at least 6 characters')) {
    return {
      title: 'La contraseña es demasiado corta.',
      hint: 'Debe tener un mínimo de 6 caracteres.',
    };
  }
  if (lower.includes('otp_expired') || lower.includes('email link is invalid or has expired')) {
    return {
      title: 'El enlace de correo ha expirado o ya fue utilizado.',
      hint: 'Por favor solicita un nuevo correo de acceso o confirmación.',
      isUnconfirmedEmail: true,
    };
  }
  if (lower.includes('rate limit')) {
    return {
      title: 'Demasiadas solicitudes consecutivas.',
      hint: 'Por favor espera unos momentos antes de intentar otra vez.',
    };
  }

  return { title: error };
}

export const AuthView: React.FC = () => {
  const {
    login,
    register,
    resetPasswordForEmail,
    updateUserPassword,
    resendVerificationEmail,
    isMockMode,
    isPasswordRecovery,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [errorDetails, setErrorDetails] = useState<{ title: string; hint?: string; isUnconfirmedEmail?: boolean } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Detect URL Hash errors from Supabase (e.g. expired OTP / invalid redirect)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const errorDesc = params.get('error_description');
      const errorCode = params.get('error_code');

      if (errorDesc || errorCode) {
        const errorText = decodeURIComponent(errorDesc || errorCode || '');
        setErrorDetails(translateSupabaseError(errorText));
        // Clear hash from URL for a clean appearance
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setErrorDetails({ title: 'Ingresa tu correo en el campo inferior para reenviar el enlace.' });
      return;
    }
    setIsResendingEmail(true);
    setErrorDetails(null);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.error) {
        setErrorDetails(translateSupabaseError(res.error));
      } else {
        setSuccessMsg(`¡Nuevo enlace de verificación enviado a ${email.trim()}! Revisa tu bandeja de entrada.`);
      }
    } catch {
      setErrorDetails({ title: 'Error al reenviar el correo de verificación.' });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    setIsLoading(true);

    try {
      if (isPasswordRecovery) {
        if (newPassword.length < 6) {
          setErrorDetails({ title: 'La nueva contraseña debe tener al menos 6 caracteres.' });
          setIsLoading(false);
          return;
        }
        const res = await updateUserPassword(newPassword);
        if (res.error) {
          setErrorDetails(translateSupabaseError(res.error));
        } else {
          setSuccessMsg('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
          setNewPassword('');
        }
        setIsLoading(false);
        return;
      }

      if (mode === 'forgot_password') {
        if (!cleanEmail) {
          setErrorDetails({ title: 'Ingresa tu correo para enviarte el enlace de recuperación.' });
          setIsLoading(false);
          return;
        }
        const res = await resetPasswordForEmail(cleanEmail);
        if (res.error) {
          setErrorDetails(translateSupabaseError(res.error));
        } else {
          setSuccessMsg(`Te hemos enviado un correo a ${cleanEmail} con las instrucciones para restablecer tu contraseña.`);
        }
        setIsLoading(false);
        return;
      }

      if (mode === 'login') {
        if (!cleanEmail || !cleanPassword) {
          setErrorDetails({ title: 'Por favor ingresa tu correo y contraseña.' });
          setIsLoading(false);
          return;
        }
        const res = await login(cleanEmail, cleanPassword);
        if (res.error) {
          setErrorDetails(translateSupabaseError(res.error));
        }
      } else {
        if (!cleanEmail || !cleanPassword || !fullName.trim()) {
          setErrorDetails({ title: 'Por favor completa todos los campos del registro.' });
          setIsLoading(false);
          return;
        }
        const res = await register(cleanEmail, cleanPassword, fullName.trim());
        if (res.error) {
          setErrorDetails(translateSupabaseError(res.error));
        } else if (res.requiresEmailConfirmation) {
          // Non-invasive notification indicating email verification was sent
          setSuccessMsg(`¡Cuenta creada con éxito! Hemos enviado un enlace de confirmación a ${cleanEmail}. Por favor revisa tu bandeja de entrada o spam para activar tu acceso.`);
          setMode('login');
          setPassword('');
        }
      }
    } catch {
      setErrorDetails({ title: 'Ocurrió un error inesperado al procesar la solicitud.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-emerald-600/[0.03] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#11131a] border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            {isPasswordRecovery ? <Key size={26} weight="bold" /> : <ShieldCheck size={26} weight="bold" />}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {isPasswordRecovery
              ? 'Restablecer Contraseña'
              : mode === 'forgot_password'
              ? 'Recuperar Mi Cuenta'
              : 'Portal Multipropósito'}
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            {isPasswordRecovery
              ? 'Ingresa tu nueva contraseña para actualizar tu cuenta'
              : mode === 'forgot_password'
              ? 'Te enviaremos un enlace seguro a tu correo para restablecer tu acceso'
              : 'Acceso seguro a tu Centro de Tareas y Gestor de Finanzas Personales'}
          </p>

          {/* Connection Status Badge */}
          <div className="mt-1">
            <StatusBadge isMockMode={isMockMode} />
          </div>
        </div>

        {/* Tab Switcher */}
        {!isPasswordRecovery && mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80 relative">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorDetails(null);
                setSuccessMsg(null);
              }}
              className={`relative py-2 text-xs font-bold transition-colors z-10 ${
                mode === 'login' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode === 'login' && (
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
                setMode('register');
                setErrorDetails(null);
                setSuccessMsg(null);
              }}
              className={`relative py-2 text-xs font-bold transition-colors z-10 ${
                mode === 'register' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode === 'register' && (
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
        )}

        {/* Error Alert con botón de Reenvío si aplica */}
        <AnimatePresence>
          {errorDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <WarningCircle size={16} weight="fill" className="shrink-0 text-rose-400" />
                <span>{errorDetails.title}</span>
              </div>
              {errorDetails.hint && (
                <p className="text-[11px] text-zinc-300 leading-relaxed pl-6">
                  {errorDetails.hint}
                </p>
              )}

              {errorDetails.isUnconfirmedEmail && (
                <div className="pt-2 border-t border-rose-500/20 pl-6 flex justify-start">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResendingEmail}
                    className="text-xs font-semibold text-rose-300 hover:text-white underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <PaperPlaneRight size={13} />
                    <span>{isResendingEmail ? 'Reenviando...' : 'Reenviar correo de verificación ahora'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5"
            >
              <CheckCircle size={18} weight="fill" className="shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isPasswordRecovery ? (
            /* Modo Actualización de Contraseña */
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <LockKey size={16} />
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ) : mode === 'forgot_password' ? (
            /* Modo Olvidé mi Contraseña */
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Correo Electrónico Registrado
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
          ) : (
            /* Modo Login / Registro Normal */
            <>
              {mode === 'register' && (
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
                      placeholder="Ej: Andree Sosa"
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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorDetails(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <LockKey size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Procesando...</span>
            ) : isPasswordRecovery ? (
              <>
                <span>Guardar Nueva Contraseña</span>
                <CheckCircle size={15} weight="bold" />
              </>
            ) : mode === 'forgot_password' ? (
              <>
                <span>Enviar Enlace de Recuperación</span>
                <PaperPlaneTilt size={15} weight="bold" />
              </>
            ) : mode === 'login' ? (
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

          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorDetails(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors text-center mt-1"
            >
              ← Volver a Iniciar Sesión
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};