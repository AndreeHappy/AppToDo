import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldWarning } from '@phosphor-icons/react';
import type { EmergencyWithdrawal } from '../../types';
import { formatDisplayDate } from '../../utils/date';

interface Props {
  isOpen: boolean;
  withdrawals: EmergencyWithdrawal[];
  onClose: () => void;
}

export const EmergencyLogModal: React.FC<Props> = ({
  isOpen,
  withdrawals,
  onClose,
}) => {
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
            className="relative z-10 w-full max-w-xl rounded-3xl bg-[#141520] border border-rose-500/30 p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldWarning size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Auditoría de Retiros de Urgencia
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Historial de afectación al Fondo de Reserva Protegido
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

            {/* List */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 my-1">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                  No se han registrado retiros de emergencia. Tu fondo de reserva se mantiene intacto.
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-rose-500/20 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-400 font-mono">
                          -S/. {w.amount_withdrawn.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formatDisplayDate(w.date)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Reserva: S/. {w.previous_reserve.toFixed(2)} → S/. {w.new_reserve.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0d0e14] border border-white/[0.04] text-xs text-zinc-300">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-0.5">
                        Motivo Justificado:
                      </span>
                      <p className="italic text-zinc-200">"{w.urgency_reason}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};