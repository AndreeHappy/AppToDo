import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Money,
  DeviceMobile,
  Tag,
  ChatCircleText,
  User,
  WarningCircle,
  ClockCountdown,
} from '@phosphor-icons/react';
import type { TransactionType, FundType } from '../../types';
import { getTodayString } from '../../utils/date';
import { CurrencyInput } from '../ui/CurrencyInput';
import { CustomSelect } from '../ui/CustomSelect';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants/categories';

interface Props {
  isOpen: boolean;
  freeSpendingBalance: number;
  freePhysicalBalance?: number;
  freeDigitalBalance?: number;
  physicalBalance?: number;
  digitalBalance?: number;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    scheduledDatetime?: string;
    urgencyReason?: string;
  }) => void;
  onRequestEmergencyApproval: (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    reserveImpact: number;
    scheduledDatetime?: string;
  }) => void;
}

export const TransactionFormModal: React.FC<Props> = ({
  isOpen,
  freeSpendingBalance,
  freePhysicalBalance,
  freeDigitalBalance,
  physicalBalance = 0,
  digitalBalance = 0,
  onClose,
  onSubmit,
  onRequestEmergencyApproval,
}) => {
  const [type, setType] = useState<TransactionType>('income');
  const [fundType, setFundType] = useState<FundType>('digital');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [counterpartyConcept, setCounterpartyConcept] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [scheduledDatetime, setScheduledDatetime] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default future time: current time + 2 hours
  const getDefaultScheduledDatetime = () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const hours = String(future.getHours()).padStart(2, '0');
    const minutes = String(future.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDatetime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCounterpartyConcept('');
      setNotes('');
      setDate(getTodayString());
      setScheduledDatetime(getDefaultScheduledDatetime());
      setErrorMsg(null);
      setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [isOpen, type]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setErrorMsg(null);
  };

  const currentAvailableFund = fundType === 'physical'
    ? (freePhysicalBalance !== undefined ? freePhysicalBalance : physicalBalance)
    : (freeDigitalBalance !== undefined ? freeDigitalBalance : digitalBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a S/. 0.00');
      return;
    }

    const cleanConcept = counterpartyConcept.trim();
    if (!cleanConcept) {
      setErrorMsg('Por favor ingresa el detalle o concepto del movimiento.');
      return;
    }

    // Validation for Pending Expense
    if (type === 'pending_expense') {
      if (!scheduledDatetime) {
        setErrorMsg('Por favor selecciona la fecha y hora futura en la que se consumirá el gasto.');
        return;
      }

      const scheduledTime = new Date(scheduledDatetime).getTime();
      const currentTime = Date.now();

      if (scheduledTime <= currentTime) {
        setErrorMsg('La fecha y hora del gasto pendiente debe ser posterior a la hora actual.');
        return;
      }
    }

    // Fund deficit check for immediate expenses
    if (type === 'expense') {
      if (currentAvailableFund <= 0) {
        setErrorMsg(
          `No tienes saldo disponible en ${
            fundType === 'physical' ? 'Efectivo/Físico' : 'Digital/Bancos'
          } (Disponible: S/. ${currentAvailableFund.toFixed(2)}). Realiza un ingreso primero.`
        );
        return;
      }

      if (numAmount > freeSpendingBalance) {
        const reserveImpact = numAmount - Math.max(0, freeSpendingBalance);
        onRequestEmergencyApproval({
          type,
          fundType,
          amount: numAmount,
          category,
          counterpartyConcept: cleanConcept,
          notes: notes.trim() || undefined,
          date,
          scheduledDatetime: undefined,
          reserveImpact,
        });
        return;
      }
    }

    onSubmit({
      type,
      fundType,
      amount: numAmount,
      category,
      counterpartyConcept: cleanConcept,
      notes: notes.trim() || undefined,
      date: type === 'pending_expense' ? scheduledDatetime.split('T')[0] : date,
      scheduledDatetime: type === 'pending_expense' ? scheduledDatetime : undefined,
    });
    onClose();
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#12141e] border border-white/[0.1] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Registrar Movimiento Financiero
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3-Type Selector (Ingreso vs Egreso vs Pendiente) */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-900 border border-zinc-800 relative">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`relative py-2 text-[11px] font-bold transition-colors z-10 flex items-center justify-center gap-1 ${
                  type === 'income' ? 'text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'income' && (
                  <motion.div
                    layoutId="tx-type-pill"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/40 rounded-lg shadow-xs"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Plus size={13} weight="bold" />
                <span>Ingreso</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`relative py-2 text-[11px] font-bold transition-colors z-10 flex items-center justify-center gap-1 ${
                  type === 'expense' ? 'text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'expense' && (
                  <motion.div
                    layoutId="tx-type-pill"
                    className="absolute inset-0 bg-rose-500/15 border border-rose-500/40 rounded-lg shadow-xs"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Minus size={13} weight="bold" />
                <span>Egreso</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('pending_expense')}
                className={`relative py-2 text-[11px] font-bold transition-colors z-10 flex items-center justify-center gap-1 ${
                  type === 'pending_expense' ? 'text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'pending_expense' && (
                  <motion.div
                    layoutId="tx-type-pill"
                    className="absolute inset-0 bg-amber-500/15 border border-amber-500/40 rounded-lg shadow-xs"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <ClockCountdown size={13} weight="bold" />
                <span>Pendiente</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Fund Type (Físico vs Digital) with available balance indicator */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Tipo de Fondo
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Libre p/ Gasto: <strong className={currentAvailableFund <= 0 ? 'text-rose-400' : fundType === 'digital' ? 'text-blue-400' : 'text-emerald-400'}>
                      S/. {currentAvailableFund.toFixed(2)}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundType('digital')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      fundType === 'digital'
                        ? 'bg-blue-500/15 border-blue-500/60 text-blue-400 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <DeviceMobile size={16} className="text-blue-400" />
                    <span>Digital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundType('physical')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      fundType === 'physical'
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Money size={16} className="text-emerald-400" />
                    <span>Efectivo</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date / DateTime row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Monto:
                  </label>
                  <CurrencyInput
                    value={amount}
                    onChange={setAmount}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    {type === 'pending_expense' ? 'Fecha y Hora Futura' : 'Fecha'}
                  </label>
                  {type === 'pending_expense' ? (
                    <input
                      type="datetime-local"
                      value={scheduledDatetime}
                      min={getMinDatetime()}
                      onChange={(e) => setScheduledDatetime(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-[11px] font-mono text-white outline-none [color-scheme:dark]"
                    />
                  ) : (
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white outline-none [color-scheme:dark]"
                    />
                  )}
                </div>
              </div>

              {/* Pending Expense Alert */}
              {type === 'pending_expense' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
                  <ClockCountdown size={16} weight="bold" className="shrink-0 text-amber-400" />
                  <span className="text-[11px] leading-tight">
                    Este gasto se cobrará/descontará automáticamente cuando llegue la fecha y hora seleccionada.
                  </span>
                </div>
              )}

              {/* Detalle / Concepto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={13} />
                  <span>Detalle / Concepto</span>
                </label>
                <input
                  type="text"
                  value={counterpartyConcept}
                  onChange={(e) => setCounterpartyConcept(e.target.value)}
                  placeholder={
                    type === 'income'
                      ? 'Ej: Salario mensual / Venta / Bono'
                      : type === 'pending_expense'
                      ? 'Ej: Pago de cuota / Alquiler de fin de mes / Cena'
                      : 'Ej: Pasaje a Ilo / Almuerzo / Supermercado'
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={13} />
                  <span>Categoría</span>
                </label>
                <CustomSelect
                  options={currentCategories}
                  value={category}
                  onChange={setCategory}
                  icon={<Tag size={15} />}
                />
              </div>

              {/* Notes (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ChatCircleText size={13} />
                  <span>Detalles / Comentarios (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional del movimiento..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <WarningCircle size={15} weight="fill" className="shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] ${
                    type === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : type === 'pending_expense'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {type === 'income'
                    ? 'Registrar Ingreso'
                    : type === 'pending_expense'
                    ? 'Programar Gasto Pendiente'
                    : 'Registrar Egreso'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};