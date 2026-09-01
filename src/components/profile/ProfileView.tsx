import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LockKey,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  ShieldCheck,
  Phone,
  Calendar,
  GlobeHemisphereWest,
  Briefcase,
  EnvelopeSimple,
  House,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { CurrencyInput } from '../ui/CurrencyInput';

interface Props {
  onBackToHub: () => void;
}

export const ProfileView: React.FC<Props> = ({ onBackToHub }) => {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState<string>('');
  const [country, setCountry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [reserveBase, setReserveBase] = useState('950.00');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setAge(profile.age ? profile.age.toString() : '');
      setCountry(profile.country || 'Perú');
      setOccupation(profile.occupation || '');
      setReserveBase(profile.protected_reserve_base ? profile.protected_reserve_base.toFixed(2) : '950.00');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    if (!cleanName) {
      setErrorMsg('Por favor ingresa tu nombre o apodo.');
      return;
    }

    const numBase = parseFloat(reserveBase);
    if (isNaN(numBase) || numBase < 0) {
      setErrorMsg('Ingresa un monto de reserva válido.');
      return;
    }

    const numAge = age ? parseInt(age, 10) : undefined;

    setIsSaving(true);
    try {
      const res = await updateProfile({
        fullName: cleanName,
        phoneNumber: phoneNumber.trim() || undefined,
        age: numAge,
        country: country.trim() || undefined,
        occupation: occupation.trim() || undefined,
        protectedReserveBase: numBase,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('¡Perfil guardado y sincronizado con éxito!');
      }
    } catch {
      setErrorMsg('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (fullName || user?.email?.split('@')[0] || 'HA')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <User size={15} />
            <span>Perfil de Usuario</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            Personalización de Cuenta
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

      {/* Avatar & Verification Banner */}
      <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg tracking-wider shrink-0">
          {initials}
        </div>
        <div className="flex flex-col text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-white truncate">
              {fullName || 'Happy'}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold">
              PRO
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-mono mt-0.5">
            {user?.email}
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-400 font-semibold mt-1.5">
            <ShieldCheck size={14} weight="fill" />
            <span>Sincronización de Base de Datos Activa</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
          >
            <WarningCircle size={18} weight="fill" className="shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle size={18} weight="fill" className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col gap-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/[0.06]">
          Datos Personales y Profesionales
        </h3>

        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Nombre / Apodo de Programador
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Happy"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Correo Electrónico (Registrado)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <EnvelopeSimple size={16} />
              </span>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400 outline-none font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Teléfono / WhatsApp
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Edad
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Calendar size={16} />
              </span>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ej: 24"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              País / Localidad
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <GlobeHemisphereWest size={16} />
              </span>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej: Perú, Lima"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Ocupación / Profesión
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                <Briefcase size={16} />
              </span>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Ej: Ingeniero / Desarrollador"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Base de Ahorro */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <LockKey size={14} className="text-indigo-400" />
              <span>Base de Ahorro Protegida (S/.)</span>
            </label>
            <span className="text-[11px] text-zinc-500">Dinero Intocable</span>
          </div>
          <CurrencyInput
            value={reserveBase}
            onChange={setReserveBase}
            required
          />
          <span className="text-xs text-zinc-500 leading-tight">
            Este monto queda blindado frente a gastos comunes y se descuenta del saldo libre.
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{isSaving ? 'Guardando en Base de Datos...' : 'Guardar y Sincronizar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};