import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  LockKey,
  ShieldCheck,
  WarningCircle,
  DeviceMobile,
  Money,
  PencilSimple,
  ClockCountdown,
} from '@phosphor-icons/react';
import type { FinanceSummary } from '../../types';

interface Props {
  summary: FinanceSummary;
  baseReserve: number;
  onOpenReserveSettings: () => void;
}

export const BalanceCards: React.FC<Props> = ({
  summary,
  baseReserve,
  onOpenReserveSettings,
}) => {
  const isReserveIntact = summary.protectedReserve >= baseReserve;
  const reserveDeficit = baseReserve - summary.protectedReserve;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* CARD 1: SALDO TOTAL NETO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-6 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col justify-between shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Saldo Total Neto
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet size={18} weight="bold" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            S/. {summary.totalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Breakdown Físico vs Digital */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Money size={14} className="text-emerald-400" />
            <span>Físico: </span>
            <span className="text-zinc-200 font-semibold">
              S/. {summary.physicalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <DeviceMobile size={14} className="text-indigo-400" />
            <span>Digital: </span>
            <span className="text-zinc-200 font-semibold">
              S/. {summary.digitalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: FONDO DE AHORRO PROTEGIDO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
        className={`p-6 rounded-3xl border flex flex-col justify-between shadow-lg relative overflow-hidden ${
          isReserveIntact
            ? 'bg-[#14181a] border-amber-500/40 shadow-[0_4px_25px_rgba(245,158,11,0.08)]'
            : 'bg-[#1a1215] border-rose-500/40 shadow-[0_4px_25px_rgba(244,63,94,0.1)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <LockKey size={16} weight="fill" />
            <span>Fondo de Ahorro</span>
          </div>

          <button
            onClick={onOpenReserveSettings}
            title="Cambiar monto de reserva"
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
          >
            <span>Base S/. {baseReserve.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            <PencilSimple size={11} />
          </button>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-amber-300 font-mono tracking-tight">
            S/. {summary.protectedReserve.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          {isReserveIntact ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={15} weight="bold" />
              <span>Reserva 100% Intacta y Segura</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <WarningCircle size={15} weight="fill" />
              <span>Déficit de urgencia: -S/. {reserveDeficit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <button
            onClick={onOpenReserveSettings}
            className="text-[11px] text-amber-400/80 hover:text-amber-300 underline font-medium"
          >
            Ajustar
          </button>
        </div>
      </motion.div>

      {/* CARD 3: SALDO LIBRE PARA GASTOS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        className="p-6 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col justify-between shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Saldo Libre Para Gastos
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
            S/.
          </div>
        </div>

        <div className="my-2">
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            S/. {summary.freeSpendingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Subtitle if there are pending expenses scheduled */}
          {summary.pendingExpenseTotal > 0 ? (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <ClockCountdown size={13} weight="bold" />
              <span>
                Se gastarán S/. {summary.pendingExpenseTotal.toFixed(2)} en pendientes (Quedará S/. {summary.effectiveFreeBalance.toFixed(2)})
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500">
              Dinero disponible sin afectar tu ahorro
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
          <span>Base protegida: S/. {baseReserve.toLocaleString('es-PE')}</span>
          <span className="font-mono text-zinc-300">Total - S/. {baseReserve.toLocaleString('es-PE')}</span>
        </div>
      </motion.div>
    </div>
  );
};