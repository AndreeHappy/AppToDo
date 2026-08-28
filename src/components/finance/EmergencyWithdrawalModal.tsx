import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WarningCircle, LockKey, X, ShieldWarning, ArrowRight } from '@phosphor-icons/react';

interface Props {
  isOpen: boolean;
  amount: number;
  freeSpendingBalance: number;
  reserveImpact: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const EmergencyWithdrawalModal: React.FC<Props> = ({
  isOpen,
  amount,
  freeSpendingBalance,
  reserveImpact,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason || cleanReason.length < 6) {
      setErrorMsg('Debes ingresar una justificación detallada de urgencia (mínimo 6 caracteres).');
      return;
    }
    setErrorMsg(null);
    onConfirm(cleanReason);
    setReason('');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-[#141217] border-2 border-rose-500/60 p-7 shadow-[0_25px_60px_rgba(244,63,94,0.25)] flex flex-col gap-5 text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldWarning size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Protocolo de Retiro de Urgencia
                  </h3>
                  <p className="text-xs text-rose-300 font-medium">
                    Afectación al Fondo de Reserva Protegido
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider text-[11px]">
                <WarningCircle size={15} weight="fill" />
                <span>Advertencia de Seguridad Financiera</span>
              </div>
              <p className="leading-relaxed">
                El egreso de <strong className="text-white font-mono font-bold">S/. {amount.toFixed(2)}</strong> excede tu Saldo Libre (S/. {freeSpendingBalance.toFixed(2)}) y descontará <strong className="text-rose-300 font-mono font-bold">S/. {reserveImpact.toFixed(2)}</strong> de tu fondo de ahorro protegido.
              </p>
            </div>

            {/* Reason Form */}
            <form onSubmit={handleConfirm} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>MOTIVO / EXCUSA DE URGENCIA <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-zinc-500">Registro inmutable de auditoría</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Explica detalladamente por qué es indispensable usar el fondo de ahorro protegido (ej: Reparación urgente de equipo, emergencia de salud, pago de matrícula impostergable)..."
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-rose-500/80 text-xs text-white placeholder-zinc-500 outline-none resize-none transition-colors"
                />
                {errorMsg && (
                  <span className="text-[11px] text-rose-400 font-medium">
                    {errorMsg}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar Operación
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <LockKey size={14} weight="bold" />
                  <span>Autorizar Retiro de Urgencia</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};