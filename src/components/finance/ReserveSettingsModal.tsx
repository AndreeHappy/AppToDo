import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LockKey, Check, ShieldCheck } from '@phosphor-icons/react';

interface Props {
  isOpen: boolean;
  currentBaseReserve: number;
  onClose: () => void;
  onSave: (newBase: number) => void;
}

const PRESET_AMOUNTS = [500, 950, 1000, 1500, 2000, 3000];

export const ReserveSettingsModal: React.FC<Props> = ({
  isOpen,
  currentBaseReserve,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(currentBaseReserve.toString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBaseReserve.toString());
      setErrorMsg(null);
    }
  }, [isOpen, currentBaseReserve]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      setErrorMsg('Por favor ingresa un monto válido igual o mayor a S/. 0.00');
      return;
    }
    onSave(num);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#131520] border border-amber-500/30 p-6 shadow-2xl flex flex-col gap-5 text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <LockKey size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Configurar Fondo de Ahorro
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Establece tu meta de reserva intocable en Soles
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck size={20} weight="fill" className="shrink-0 text-amber-400 mt-0.5" />
              <span>
                Este monto representa tu ahorro blindado. Todo gasto que intente reducir tu saldo por debajo de esta cantidad activará el protocolo de confirmación de urgencia.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Monto Base de Reserva (S/.)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-zinc-400 font-mono font-bold text-sm">
                    S/.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="950.00"
                    required
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 font-mono text-sm text-white outline-none transition-colors"
                  />
                </div>
                {errorMsg && (
                  <span className="text-[11px] text-rose-400 font-medium">{errorMsg}</span>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Montos sugeridos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p.toString())}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        parseFloat(amount) === p
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      S/. {p.toLocaleString('es-PE')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Check size={14} weight="bold" />
                  <span>Guardar Monto de Reserva</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};