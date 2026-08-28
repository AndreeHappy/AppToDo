import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Trash,
  DeviceMobile,
  Money,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from '@phosphor-icons/react';
import type { Transaction, TransactionType, FundType } from '../../types';
import { formatDisplayDate } from '../../utils/date';
import { CATEGORY_STYLES } from '../../constants/categories';

interface Props {
  transactions: Transaction[];
  onDeleteTransaction: (id: string, e: React.MouseEvent) => void;
}

export const TransactionHistory: React.FC<Props> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [fundFilter, setFundFilter] = useState<'all' | FundType>('all');

  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.counterparty_concept.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchFund = fundFilter === 'all' || tx.fund_type === fundFilter;

      return matchSearch && matchType && matchFund;
    });
  }, [transactions, search, typeFilter, fundFilter]);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col gap-5 shadow-xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Receipt size={17} weight="bold" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Historial de Movimientos
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {filteredList.length} de {transactions.length} registros
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search bar */}
          <div className="relative flex items-center min-w-[170px] flex-1 sm:flex-initial">
            <span className="absolute left-3 text-zinc-500 pointer-events-none">
              <MagnifyingGlass size={13} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar concepto..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none [color-scheme:dark] cursor-pointer"
          >
            <option value="all">Todos los Tipos</option>
            <option value="income">Solo Ingresos (+)</option>
            <option value="expense">Solo Egresos (-)</option>
          </select>

          {/* Fund Filter */}
          <select
            value={fundFilter}
            onChange={(e) => setFundFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none [color-scheme:dark] cursor-pointer"
          >
            <option value="all">Todos los Fondos</option>
            <option value="digital">Digital / Bancos</option>
            <option value="physical">Efectivo / Físico</option>
          </select>
        </div>
      </div>

      {/* Table / Ledger list */}
      <div className="flex flex-col divide-y divide-white/[0.05] overflow-x-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/80 rounded-2xl my-2">
              No se encontraron transacciones registradas con los filtros seleccionados.
            </div>
          ) : (
            filteredList.map((tx) => {
              const isIncome = tx.type === 'income';
              const catStyle = CATEGORY_STYLES[tx.category] || {
                color: 'text-zinc-300',
                bg: 'bg-zinc-800',
                border: 'border-zinc-700',
              };

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 25 }}
                  className="py-3.5 px-2 flex items-center justify-between gap-4 hover:bg-zinc-800/30 rounded-xl transition-colors group"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border ${
                        isIncome
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft size={18} weight="bold" />
                      ) : (
                        <ArrowUpRight size={18} weight="bold" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white tracking-tight truncate">
                          {tx.counterparty_concept}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${catStyle.bg} ${catStyle.color} ${catStyle.border}`}
                        >
                          {tx.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                        <span>{formatDisplayDate(tx.date)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          {tx.fund_type === 'digital' ? (
                            <>
                              <DeviceMobile size={12} className="text-indigo-400" />
                              <span>Digital</span>
                            </>
                          ) : (
                            <>
                              <Money size={12} className="text-emerald-400" />
                              <span>Efectivo</span>
                            </>
                          )}
                        </span>
                        {tx.notes && tx.notes.toLowerCase() !== tx.counterparty_concept.toLowerCase() && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs italic text-zinc-400">
                              "{tx.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Delete button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}S/. {Number(tx.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransaction(tx.id, e);
                      }}
                      title="Eliminar movimiento"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};