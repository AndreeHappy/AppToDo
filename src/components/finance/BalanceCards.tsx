import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  WarningCircle,
  DeviceMobile,
  Money,
  PencilSimple,
  ClockCountdown,
  LockKey,
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
  const isPhysicalNegative = summary.physicalBalance <= 0;
  const isDigitalNegative = summary.digitalBalance < 0;
  const isFreeZero = summary.freeSpendingBalance <= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* TARJETA 1: SALDO TOTAL NETO Y AHORRO BASE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-6 sm:p-7 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col justify-between shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Saldo Total Neto
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet size={20} weight="bold" />
          </div>
        </div>

        <div className="my-4">
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
            S/. {summary.totalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Desglose de Fondos Totales */}
          <div className="flex items-center gap-4 mt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Money size={15} className={isPhysicalNegative ? 'text-rose-400' : 'text-emerald-400'} />
              <span className="text-zinc-400">Efectivo:</span>
              <span className={`font-bold ${isPhysicalNegative ? 'text-rose-400' : 'text-zinc-200'}`}>
                S/. {summary.physicalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <span className="text-zinc-600">•</span>

            <div className="flex items-center gap-1.5">
              <DeviceMobile size={15} className={isDigitalNegative ? 'text-rose-400' : 'text-indigo-400'} />
              <span className="text-zinc-400">Digital:</span>
              <span className={`font-bold ${isDigitalNegative ? 'text-rose-400' : 'text-zinc-200'}`}>
                S/. {summary.digitalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Pie con Estado del Fondo de Ahorro */}
        <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <LockKey size={12} weight="bold" />
            </div>
            <span className="text-zinc-400">
              Fondo de Ahorro: <strong className="text-white font-mono font-bold">S/. {summary.protectedReserve.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>

          <button
            onClick={onOpenReserveSettings}
            title="Ajustar fondo de reserva"
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Base S/. {baseReserve.toLocaleString('es-PE')}</span>
            <PencilSimple size={12} />
          </button>
        </div>
      </motion.div>

      {/* TARJETA 2: SALDO LIBRE PARA GASTOS (CON DESGLOSE FÍSICO Y DIGITAL) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
        className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between shadow-xl ${
          isFreeZero
            ? 'bg-[#151218] border-rose-500/30'
            : 'bg-[#11131a] border-white/[0.08]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Saldo Libre Para Gastos
            </span>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm font-mono border ${
            isFreeZero
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            S/.
          </div>
        </div>

        <div className="my-4">
          <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
            isFreeZero ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            S/. {summary.freeSpendingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Desglose de Dinero Libre por Tipo de Fondo */}
          <div className="flex items-center gap-4 mt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Money size={15} className={summary.freePhysicalBalance <= 0 ? 'text-rose-400' : 'text-emerald-400'} />
              <span className="text-zinc-400">Libre Físico:</span>
              <span className={`font-bold ${summary.freePhysicalBalance <= 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                S/. {summary.freePhysicalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <span className="text-zinc-600">•</span>

            <div className="flex items-center gap-1.5">
              <DeviceMobile size={15} className={summary.freeDigitalBalance <= 0 ? 'text-rose-400' : 'text-indigo-400'} />
              <span className="text-zinc-400">Libre Digital:</span>
              <span className={`font-bold ${summary.freeDigitalBalance <= 0 ? 'text-rose-400' : 'text-indigo-300'}`}>
                S/. {summary.freeDigitalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Aviso si hay deficit */}
          {(summary.freePhysicalBalance <= 0 || summary.freeDigitalBalance <= 0) && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-lg">
              <WarningCircle size={14} weight="fill" className="shrink-0" />
              <span>
                {summary.freePhysicalBalance <= 0 && summary.freeDigitalBalance <= 0
                  ? 'No dispones de saldo libre. Requiere nuevo ingreso para realizar gastos.'
                  : summary.freePhysicalBalance <= 0
                  ? 'Efectivo agotado. Solo puedes gastar desde fondo Digital.'
                  : 'Fondo Digital agotado. Solo puedes gastar en Efectivo.'}
              </span>
            </div>
          )}

          {/* Aviso si hay gastos pendientes programados */}
          {summary.pendingExpenseTotal > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <ClockCountdown size={14} weight="bold" className="shrink-0" />
              <span>
                Se gastarán S/. {summary.pendingExpenseTotal.toFixed(2)} en pendientes (Quedará S/. {summary.effectiveFreeBalance.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* Pie explicativo */}
        <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
          <span>Dinero disponible sin afectar tu ahorro base</span>
          <span className="font-mono text-zinc-300">
            {isReserveIntact ? 'Ahorro 100% Protegido' : 'Déficit en Ahorro'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};