import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LockKey,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  Phone,
  Calendar,
  GlobeHemisphereWest,
  Briefcase,
  EnvelopeSimple,
  Camera,
  House,
  MapPin,
  IdentificationCard,
  Sparkle,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { CurrencyInput } from '../ui/CurrencyInput';
import { CustomSelect } from '../ui/CustomSelect';

interface Props {
  onBackToHub: () => void;
}

const COUNTRIES = [
  'Perú',
  'Colombia',
  'México',
  'Chile',
  'Argentina',
  'Ecuador',
  'Bolivia',
  'España',
  'Estados Unidos',
  'Uruguay',
  'Paraguay',
  'Costa Rica',
  'Panamá',
  'República Dominicana',
  'Otro País',
];

const POPULAR_CITIES = [
  'Lima',
  'Arequipa',
  'Trujillo',
  'Chiclayo',
  'Cusco',
  'Huancayo',
  'Piura',
  'Tacna',
  'Ica',
  'Ilo',
  'Moquegua',
  'Bogotá',
  'Medellín',
  'Ciudad de México',
  'Santiago',
  'Buenos Aires',
  'Madrid',
  'Barcelona',
  'Otra Localidad',
];

export const ProfileView: React.FC<Props> = ({ onBackToHub }) => {
  const { user, profile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState<string>('');
  const [country, setCountry] = useState('Perú');
  const [city, setCity] = useState('Lima');
  const [customCity, setCustomCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [reserveBase, setReserveBase] = useState('950.00');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || (profile.full_name ? profile.full_name.split(' ')[0] : ''));
      setLastName(profile.last_name || (profile.full_name ? profile.full_name.split(' ').slice(1).join(' ') : ''));
      setNickname(profile.nickname || '');
      setPhoneNumber(profile.phone_number || '');
      setAge(profile.age ? profile.age.toString() : '');
      setCountry(profile.country || 'Perú');
      
      const userCity = profile.city || '';
      if (POPULAR_CITIES.includes(userCity)) {
        setCity(userCity);
        setCustomCity('');
      } else if (userCity) {
        setCity('Otra Localidad');
        setCustomCity(userCity);
      } else {
        setCity('Lima');
      }

      setOccupation(profile.occupation || '');
      setReserveBase(profile.protected_reserve_base ? profile.protected_reserve_base.toFixed(2) : '950.00');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const size = 300;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(compressed);
          updateProfile({ avatarUrl: compressed });
          setSuccessMsg('¡Foto de perfil actualizada con éxito!');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    updateProfile({ avatarUrl: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanNick = nickname.trim();

    if (!cleanFirst && !cleanNick) {
      setErrorMsg('Por favor ingresa al menos tus nombres o un apodo/nombre de usuario.');
      return;
    }

    const numBase = parseFloat(reserveBase);
    if (isNaN(numBase) || numBase < 0) {
      setErrorMsg('Ingresa un monto de reserva válido.');
      return;
    }

    const numAge = age ? parseInt(age, 10) : undefined;
    const finalCity = city === 'Otra Localidad' ? customCity.trim() : city;
    const computedFullName = [cleanFirst, cleanLast].filter(Boolean).join(' ') || cleanNick;

    setIsSaving(true);
    try {
      const res = await updateProfile({
        fullName: computedFullName,
        firstName: cleanFirst,
        lastName: cleanLast,
        nickname: cleanNick,
        phoneNumber: phoneNumber.trim() || undefined,
        age: numAge,
        country: country.trim() || undefined,
        city: finalCity || undefined,
        occupation: occupation.trim() || undefined,
        protectedReserveBase: numBase,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('¡Perfil actualizado con éxito! Los cambios se reflejarán en toda la aplicación.');
      }
    } catch {
      setErrorMsg('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayInitials = (nickname || firstName || user?.email?.split('@')[0] || 'HA')
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

      {/* Avatar & User Details */}
      <div className="p-5 rounded-3xl bg-[#0b0c12] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg tracking-wider">
              {displayInitials}
            </div>
          )}

          <label
            title="Subir foto de perfil"
            className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition-all active:scale-95 border border-indigo-400"
          >
            <Camera size={14} weight="bold" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-white truncate">
              {nickname || firstName || profile?.full_name || 'Usuario'}
            </h2>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                title="Quitar foto y usar iniciales"
                className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors underline"
              >
                Quitar foto
              </button>
            )}
          </div>
          <span className="text-xs text-zinc-400 font-mono mt-0.5">
            {user?.email}
          </span>
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
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#0b0c12] border border-white/[0.08] shadow-xl flex flex-col gap-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/[0.06]">
          Datos Personales y de Usuario
        </h3>

        {/* Row 1: Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <User size={14} />
              <span>Nombres</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej: Pedro Rogger"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <IdentificationCard size={14} />
              <span>Apellidos</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej: Vega Daza"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Apodo / Username (Displayed in Header) & Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkle size={14} weight="fill" />
              <span>Apodo / Nombre de Usuario</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej: Happy, Pedrito..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-indigo-500/40 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />
            <span className="text-[11px] text-zinc-400">
              💡 Este nombre o apodo se mostrará en la cabecera superior y en el saludo.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <EnvelopeSimple size={14} />
              <span>Correo Electrónico (Registrado)</span>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400 outline-none font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row 3: Teléfono y Edad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Phone size={14} />
              <span>Teléfono / WhatsApp</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+51 987 654 321"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={14} />
              <span>Edad</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ej: 24"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
            />
          </div>
        </div>

        {/* Row 4: País y Localidad con CustomSelect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <GlobeHemisphereWest size={14} />
              <span>País</span>
            </label>
            <CustomSelect
              options={COUNTRIES}
              value={country}
              onChange={setCountry}
              icon={<GlobeHemisphereWest size={15} />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={14} />
              <span>Localidad / Ciudad</span>
            </label>
            <CustomSelect
              options={POPULAR_CITIES}
              value={city}
              onChange={setCity}
              icon={<MapPin size={15} />}
            />
            {city === 'Otra Localidad' && (
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Escribe tu ciudad o localidad..."
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white placeholder-zinc-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Row 5: Ocupación (General) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Briefcase size={14} />
            <span>Ocupación / Profesión</span>
          </label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Ej: Estudiante, Profesional, Emprendedor, Docente..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        {/* Row 6: Base de Ahorro */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <LockKey size={14} className="text-indigo-400" />
              <span>Base de Ahorro Protegida (S/.)</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-medium">Dinero Intocable</span>
          </div>
          <CurrencyInput
            value={reserveBase}
            onChange={setReserveBase}
            required
          />
          <span className="text-xs text-zinc-500 leading-tight">
            Este monto queda blindado frente a gastos comunes y se descuenta del saldo libre para gastos.
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