import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldWarning,
  ShieldCheck,
  PiggyBank,
  DeviceMobile,
  Money,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import type { FundType } from '../../types';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useFinance } from '../../context/FinanceContext';

export type SavingsModalMode = 'withdraw' | 'replenish' | 'increase';

interface Props {
  isOpen: boolean;
  initialMode?: SavingsModalMode;
  onClose: () => void;
}

export const SavingsManagementModal: React.FC<Props> = ({
  isOpen,
  initialMode = 'withdraw',
  onClose,
}) => {
  const {
    summary,
    baseReserve,
    withdrawFromSavings,
    replenishSavings,
    increaseSavingsBase,
  } = useFinance();

  const [mode, setMode] = useState<SavingsModalMode>(initialMode);
  const [amount, setAmount] = useState('');
  const [fundType, setFundType] = useState<FundType>('digital');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setReason('');
      if (initialMode === 'replenish') {
        setAmount(summary.reserveDeficit > 0 ? summary.reserveDeficit.toFixed(2) : '');
      } else {
        setAmount('');
      }
    }
  }, [isOpen, initialMode, summary.reserveDeficit]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (mode === 'withdraw') {
      if (numAmount > summary.currentReserve) {
        setErrorMsg(`No puedes retirar más del fondo de ahorro disponible (S/. ${summary.currentReserve.toLocaleString('es-PE', { minimumFractionDigits: 2 })}).`);
        return;
      }
      const cleanReason = reason.trim();
      if (!cleanReason) {
        setErrorMsg('Por favor especifica el motivo o urgencia de este retiro.');
        return;
      }

      setIsSubmitting(true);
      try {
        await withdrawFromSavings(numAmount, fundType, cleanReason);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al procesar el retiro.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'replenish') {
      const availableInFund = fundType === 'digital' ? summary.digitalBalance : summary.physicalBalance;
      if (numAmount > availableInFund) {
        setErrorMsg(`Saldo insuficiente en ${fundType === 'digital' ? 'Digital' : 'Efectivo'} (tienes S/. ${availableInFund.toLocaleString('es-PE', { minimumFractionDigits: 2 })}).`);
        return;
      }

      setIsSubmitting(true);
      try {
        await replenishSavings(numAmount, fundType);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al procesar la reposición.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'increase') {
      const availableInFund = fundType === 'digital' ? summary.digitalBalance : summary.physicalBalance;
      if (numAmount > availableInFund) {
        setErrorMsg(`Saldo insuficiente en ${fundType === 'digital' ? 'Digital' : 'Efectivo'} (tienes S/. ${availableInFund.toLocaleString('es-PE', { minimumFractionDigits: 2 })}).`);
        return;
      }

      setIsSubmitting(true);
      try {
        await increaseSavingsBase(numAmount, fundType);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al aumentar la bolsa de ahorro.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-[#12141c] border border-white/[0.12] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col gap-5 text-zinc-100"
        >
          {/* Top Bar with Mode Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                mode === 'withdraw'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : mode === 'replenish'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              }`}>
                {mode === 'withdraw' && <ShieldWarning size={20} weight="bold" />}
                {mode === 'replenish' && <ShieldCheck size={20} weight="bold" />}
                {mode === 'increase' && <PiggyBank size={20} weight="bold" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">
                  {mode === 'withdraw' && 'Sacar Monto de Ahorro'}
                  {mode === 'replenish' && 'Reponer Fondo de Ahorro'}
                  {mode === 'increase' && 'Aumentar Bolsa de Ahorro'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Fondo Base: S/. {baseReserve.toLocaleString('es-PE')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('withdraw');
                setErrorMsg(null);
                setAmount('');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'withdraw'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldWarning size={13} weight="bold" />
              <span>Sacar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('replenish');
                setErrorMsg(null);
                setAmount(summary.reserveDeficit > 0 ? summary.reserveDeficit.toFixed(2) : '');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'replenish'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={13} weight="bold" />
              <span>Reponer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('increase');
                setErrorMsg(null);
                setAmount('');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'increase'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkle size={13} weight="bold" />
              <span>Aumentar</span>
            </button>
          </div>

          {/* Current Status Box */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Ahorro Actual</span>
              <span className={`text-sm font-black ${summary.isReserveDeficit ? 'text-amber-400' : 'text-emerald-400'}`}>
                S/. {summary.currentReserve.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {summary.isReserveDeficit ? (
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-amber-500 uppercase font-bold">Faltante por Reponer</span>
                <span className="text-sm font-black text-amber-400">
                  -S/. {summary.reserveDeficit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-emerald-500 uppercase font-bold">Estado</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} weight="fill" />
                  100% Protegido
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Notice if trying to withdraw with zero reserve */}
            {mode === 'withdraw' && summary.currentReserve <= 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold leading-relaxed">
                Actualmente tu cuenta no tiene dinero acumulado en reserva para retirar (Ahorro actual: S/. 0.00). Primero debes ingresar saldo a tu cuenta.
              </div>
            )}

            {/* Amount Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>
                  {mode === 'withdraw' && 'Monto a Sacar del Ahorro'}
                  {mode === 'replenish' && 'Monto a Reponer al Ahorro'}
                  {mode === 'increase' && 'Monto a Sumar a la Bolsa de Ahorro'}
                </span>
                {mode === 'replenish' && summary.reserveDeficit > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(summary.reserveDeficit.toFixed(2))}
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    Reponer total (S/. {summary.reserveDeficit.toFixed(2)})
                  </button>
                )}
              </label>

              <CurrencyInput
                value={amount}
                onChange={setAmount}
                placeholder="0.00"
                className="w-full text-xl font-bold font-mono py-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500"
              />
            </div>

            {/* Fund Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {mode === 'withdraw'
                  ? '¿A dónde se transfiere el dinero retirado?'
                  : '¿De dónde saldrá el dinero para el ahorro?'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFundType('digital')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    fundType === 'digital'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <DeviceMobile size={18} />
                  <div className="flex flex-col text-left">
                    <span>Digital / Banco</span>
                    <span className="text-[10px] font-mono text-zinc-400 font-normal">
                      Disp: S/. {summary.digitalBalance.toFixed(2)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFundType('physical')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    fundType === 'physical'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Money size={18} />
                  <div className="flex flex-col text-left">
                    <span>Efectivo</span>
                    <span className="text-[10px] font-mono text-zinc-400 font-normal">
                      Disp: S/. {summary.physicalBalance.toFixed(2)}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Reason field (required for withdrawal) */}
            {mode === 'withdraw' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Motivo o Justificación del Retiro</span>
                  <span className="text-[10px] text-amber-400 font-normal">Auditoría obligatoria</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Urgencia médica, pago imprevisto..."
                  className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-amber-500"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (mode === 'withdraw' && summary.currentReserve <= 0)}
              className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                mode === 'withdraw'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : mode === 'replenish'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'Procesando...'
                  : mode === 'withdraw'
                  ? 'Confirmar Retiro de Ahorro'
                  : mode === 'replenish'
                  ? 'Confirmar Reposición'
                  : 'Confirmar Aumento de Bolsa'}
              </span>
              <ArrowRight size={15} weight="bold" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};