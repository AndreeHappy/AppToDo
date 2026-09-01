import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { CurrencyInput } from '../ui/CurrencyInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
    if (isOpen && profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setAge(profile.age ? profile.age.toString() : '');
      setCountry(profile.country || 'Perú');
      setOccupation(profile.occupation || '');
      setReserveBase(profile.protected_reserve_base ? profile.protected_reserve_base.toFixed(2) : '950.00');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

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
        setSuccessMsg('¡Perfil actualizado con éxito!');
        setTimeout(() => {
          onClose();
        }, 1200);
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
              <User size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Personalizar Perfil
              </h2>
              <span className="text-[11px] text-zinc-400">
                Información personal, país, ocupación y metas de ahorro
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

        {/* Profile Avatar Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-md tracking-wider shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">
              {fullName || 'Happy'}
            </span>
            <span className="text-xs text-zinc-400 truncate font-mono">
              {user?.email}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
              <ShieldCheck size={12} weight="fill" />
              <span>Cuenta Activa y Sincronizada</span>
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
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
            >
              <WarningCircle size={16} weight="fill" className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle size={16} weight="fill" className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* Row 1: Nombre & Correo (read only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Nombre / Apodo
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <User size={15} />
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
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <EnvelopeSimple size={15} />
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

          {/* Row 2: Teléfono & Edad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Teléfono / WhatsApp
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <Phone size={15} />
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
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Edad
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <Calendar size={15} />
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

          {/* Row 3: País & Ocupación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                País / Localidad
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <GlobeHemisphereWest size={15} />
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
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Ocupación / Profesión
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none">
                  <Briefcase size={15} />
                </span>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Ej: Desarrollador de Software"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Base de Ahorro Protegida */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <LockKey size={13} className="text-indigo-400" />
                <span>Base de Ahorro Protegida (S/.)</span>
              </label>
              <span className="text-[10px] text-zinc-500">Fondo Intocable</span>
            </div>
            <CurrencyInput
              value={reserveBase}
              onChange={setReserveBase}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <FloppyDisk size={15} weight="bold" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Perfil'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};