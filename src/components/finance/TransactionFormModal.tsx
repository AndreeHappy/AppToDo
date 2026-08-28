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
} from '@phosphor-icons/react';
import type { TransactionType, FundType } from '../../types';
import { getTodayString } from '../../utils/date';

interface Props {
  isOpen: boolean;
  freeSpendingBalance: number;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
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
  }) => void;
}

const INCOME_CATEGORIES = ['Honorarios', 'Salario', 'Freelance', 'Venta', 'Beca / Subvención', 'Rendimientos', 'Otros Ingresos'];
const EXPENSE_CATEGORIES = ['Alimentación', 'Transporte', 'Tesis / Estudio', 'Servicios Básicos', 'Alquiler', 'Salud / Farmacia', 'Equipamiento', 'Otros Gastos'];

export const TransactionFormModal: React.FC<Props> = ({
  isOpen,
  freeSpendingBalance,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCounterpartyConcept('');
      setNotes('');
      setDate(getTodayString());
      setErrorMsg(null);
      setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [isOpen, type]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setErrorMsg(null);
  };

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
      setErrorMsg(
        type === 'income'
          ? 'Por favor especifica de qué o de quién provino el ingreso.'
          : 'Por favor especifica para qué o a quién se realizó el egreso.'
      );
      return;
    }

    // Check emergency reserve impact for expenses
    if (type === 'expense' && numAmount > freeSpendingBalance) {
      const reserveImpact = numAmount - Math.max(0, freeSpendingBalance);
      onRequestEmergencyApproval({
        type,
        fundType,
        amount: numAmount,
        category,
        counterpartyConcept: cleanConcept,
        notes: notes.trim() || undefined,
        date,
        reserveImpact,
      });
      return;
    }

    onSubmit({
      type,
      fundType,
      amount: numAmount,
      category,
      counterpartyConcept: cleanConcept,
      notes: notes.trim() || undefined,
      date,
    });
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
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#13151f] border border-white/[0.1] p-6 shadow-2xl flex flex-col gap-5 text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">
                Registrar Movimiento Financiero
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type Selector (Ingreso vs Egreso) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 relative">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`relative py-2 text-xs font-bold transition-colors z-10 flex items-center justify-center gap-1.5 ${
                  type === 'income' ? 'text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'income' && (
                  <motion.div
                    layoutId="tx-type-pill"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/40 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Plus size={14} weight="bold" />
                <span>Ingreso</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`relative py-2 text-xs font-bold transition-colors z-10 flex items-center justify-center gap-1.5 ${
                  type === 'expense' ? 'text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type === 'expense' && (
                  <motion.div
                    layoutId="tx-type-pill"
                    className="absolute inset-0 bg-rose-500/15 border border-rose-500/40 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Minus size={14} weight="bold" />
                <span>Egreso / Gasto</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Fund Type (Físico vs Digital) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Tipo de Fondo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundType('digital')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      fundType === 'digital'
                        ? 'bg-indigo-500/15 border-indigo-500/60 text-indigo-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <DeviceMobile size={15} />
                    <span>Digital / Bancos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundType('physical')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      fundType === 'physical'
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Money size={15} />
                    <span>Efectivo / Físico</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Monto (S/.)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-zinc-500 font-mono text-xs">S/.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 font-mono text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Fecha
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Concept / Counterparty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={13} />
                  <span>
                    {type === 'income' ? '¿De qué o de quién? (Origen)' : '¿Para qué o a quién? (Destino)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={counterpartyConcept}
                  onChange={(e) => setCounterpartyConcept(e.target.value)}
                  placeholder={type === 'income' ? 'Ej: Cliente Juan Pérez / Beca' : 'Ej: Supermercado / Empaste de Tesis'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={13} />
                  <span>Categoría</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white outline-none [color-scheme:dark]"
                >
                  {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ChatCircleText size={13} />
                  <span>Detalles / Notas (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional del comprobante..."
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
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {type === 'income' ? '+ Registrar Ingreso' : '- Registrar Egreso'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};