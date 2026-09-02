import React, { useState, useRef } from 'react';
import {
  Gear,
  Sun,
  Moon,
  GithubLogo,
  SignOut,
  ArrowSquareOut,
  Code,
  Translate,
  Bank,
  House,
  Sparkle,
  Image as ImageIcon,
  Trash,
  UploadSimple,
  Check,
  Drop,
  Sliders,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getStoredBgSettings,
  saveStoredBgSettings,
  type BgSettings,
} from '../ui/InteractiveBackground';

interface Props {
  onBackToHub: () => void;
}

export const SettingsView: React.FC<Props> = ({ onBackToHub }) => {
  const { user, logout } = useAuth();
  const { style, mode, setStyle, setMode } = useTheme();
  const [bgSettings, setBgSettings] = useState<BgSettings>(getStoredBgSettings);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateBgSetting = (partial: Partial<BgSettings>) => {
    const updated = { ...bgSettings, ...partial };
    setBgSettings(updated);
    saveStoredBgSettings(updated);
  };

  // Handle custom background image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      // Optimize image size using offscreen canvas to prevent localStorage quota issues
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let w = img.width;
        let h = img.height;

        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateBgSetting({
            mode: 'custom_image',
            customImageUrl: compressedDataUrl,
          });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = () => {
    updateBgSetting({
      mode: 'dots',
      customImageUrl: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        {/* Card 1: Temas de Interfaz (Glassmorphism & Minimalista con Dark & White) */}
        <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <Drop size={22} weight="bold" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-white">Temas de Interfaz</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Selecciona la arquitectura visual y la modalidad de contraste.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 pt-1 text-xs">
            {/* 1. Theme Style (Glassmorphism vs Minimalista) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Estilo Visual
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStyle('glassmorphism')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    style === 'glassmorphism'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkle size={14} weight="bold" />
                  <span>Glassmorphism</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyle('minimalist')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    style === 'minimalist'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Check size={14} weight="bold" />
                  <span>Minimalista</span>
                </button>
              </div>
            </div>

            {/* 2. Theme Mode (Dark vs White/Light) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Modalidad de Color
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('dark')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    mode === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon size={14} weight="bold" />
                  <span>Dark (Oscuro)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('light')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    mode === 'light'
                      ? 'bg-zinc-100 border-zinc-300 text-zinc-900 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun size={14} weight="bold" />
                  <span>White (Claro)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Fondo Personalizado & Sliders de Desenfoque e Intensidad */}
        <div className="p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] shadow-xl flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <ImageIcon size={22} weight="bold" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-white">Fondo de Pantalla</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Sube tu propia imagen o utiliza la matriz de puntos interactiva.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 pt-1 text-xs">
            {/* Custom Image Upload Box */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Imagen Personalizada
              </span>

              <div className="flex items-center gap-2">
                <label className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <UploadSimple size={15} weight="bold" className="text-indigo-400" />
                  <span>{bgSettings.customImageUrl ? 'Cambiar Imagen' : 'Subir Imagen de Fondo'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {bgSettings.customImageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    title="Quitar imagen y volver al fondo interactivo"
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>

              {uploadError && (
                <span className="text-[11px] text-rose-400">{uploadError}</span>
              )}

              {bgSettings.customImageUrl ? (
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <Check size={13} weight="bold" />
                  <span>Imagen personalizada activa</span>
                </div>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  Fondo interactivo de matriz de puntos activo (80% intensidad)
                </span>
              )}
            </div>

            {/* Slider 1: Blur / Desenfoque (Barra continua) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders size={13} />
                  <span>Desenfoque (Blur)</span>
                </span>
                <span className="font-mono text-indigo-400 font-bold text-xs">
                  {bgSettings.blur === 0 ? '0px (Nítido)' : `${bgSettings.blur}px`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={bgSettings.blur}
                onChange={(e) => updateBgSetting({ blur: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>

            {/* Slider 2: Opacity / Intensidad (Barra continua) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders size={13} />
                  <span>Intensidad / Opacidad</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  {bgSettings.opacity}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bgSettings.opacity}
                onChange={(e) => updateBgSetting({ opacity: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: GitHub Repository */}
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