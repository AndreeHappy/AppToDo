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
  FileCsv,
  CaretLeft,
  CaretRight,
  ClockCountdown,
  CheckCircle,
  X,
} from '@phosphor-icons/react';
import type { Transaction, TransactionType, FundType } from '../../types';
import { formatDisplayDate } from '../../utils/date';
import { CATEGORY_STYLES } from '../../constants/categories';

interface Props {
  transactions: Transaction[];
  pendingExpenses?: Transaction[];
  onDeleteTransaction: (id: string, e: React.MouseEvent) => void;
  onExecutePendingNow?: (id: string) => void;
  onCancelPending?: (id: string) => void;
}

export const TransactionHistory: React.FC<Props> = ({
  transactions,
  pendingExpenses = [],
  onDeleteTransaction,
  onExecutePendingNow,
  onCancelPending,
}) => {
  const [activeTab, setActiveTab] = useState<'executed' | 'pending'>('executed');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [fundFilter, setFundFilter] = useState<'all' | FundType>('all');
  const [pageSize, setPageSize] = useState<number | 'all'>(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExecutedList = useMemo(() => {
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

  // Pagination calculation
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredExecutedList.length / pageSize) || 1;

  const paginatedExecutedList = useMemo(() => {
    if (pageSize === 'all') return filteredExecutedList;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredExecutedList.slice(startIndex, startIndex + pageSize);
  }, [filteredExecutedList, currentPage, pageSize]);

  // Format scheduled datetime display (e.g. 28/08/2026 13:00)
  const formatScheduledDate = (dtStr?: string) => {
    if (!dtStr) return 'Próximamente';
    try {
      const d = new Date(dtStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} a las ${hours}:${minutes}`;
    } catch {
      return dtStr;
    }
  };

  // Export to Excel CSV with UTF-8 BOM
  const handleExportExcel = () => {
    const listToExport = activeTab === 'executed' ? filteredExecutedList : pendingExpenses;
    if (listToExport.length === 0) {
      alert('No hay movimientos para exportar.');
      return;
    }

    const headers = ['Fecha / Programación', 'Tipo', 'Categoría', 'Detalle/Concepto', 'Tipo de Fondo', 'Monto (S/.)', 'Notas'];
    const rows = listToExport.map((tx) => [
      `"${tx.scheduled_datetime || tx.date}"`,
      `"${tx.type === 'income' ? 'Ingreso' : tx.type === 'pending_expense' ? 'Gasto Pendiente' : 'Egreso'}"`,
      `"${tx.category}"`,
      `"${tx.counterparty_concept.replace(/"/g, '""')}"`,
      `"${tx.fund_type === 'digital' ? 'Digital / Bancos' : 'Efectivo / Físico'}"`,
      `"${tx.amount.toFixed(2)}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Movimientos_${activeTab === 'executed' ? 'Historial' : 'Pendientes'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col gap-5 shadow-xl">
      {/* Top Tabs: Historial vs Gastos Pendientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('executed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'executed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Receipt size={15} weight="bold" />
            <span>Historial ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ClockCountdown size={15} weight="bold" />
            <span>Gastos Pendientes</span>
            {pendingExpenses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-black font-extrabold font-mono">
                {pendingExpenses.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'executed' && (
            <>
              {/* Search bar */}
              <div className="relative flex items-center min-w-[150px] flex-1 sm:flex-initial">
                <span className="absolute left-3 text-zinc-500 pointer-events-none">
                  <MagnifyingGlass size={13} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar detalle..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none [color-scheme:dark] cursor-pointer"
              >
                <option value="all">Todos los Tipos</option>
                <option value="income">Solo Ingresos (+)</option>
                <option value="expense">Solo Egresos (-)</option>
              </select>

              {/* Fund Filter */}
              <select
                value={fundFilter}
                onChange={(e) => {
                  setFundFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none [color-scheme:dark] cursor-pointer"
              >
                <option value="all">Todos los Fondos</option>
                <option value="digital">Digital / Bancos</option>
                <option value="physical">Efectivo / Físico</option>
              </select>
            </>
          )}

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            title="Exportar a formato Excel (.csv)"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <FileCsv size={16} weight="bold" className="text-emerald-400" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HISTORIAL EJECUTADO */}
      {activeTab === 'executed' && (
        <>
          <div className={`flex flex-col divide-y divide-white/[0.05] ${pageSize === 'all' ? 'max-h-[500px] overflow-y-auto pr-1' : ''}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              {paginatedExecutedList.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/80 rounded-2xl my-2">
                  No se encontraron transacciones registradas con los filtros seleccionados.
                </div>
              ) : (
                paginatedExecutedList.map((tx) => {
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500">Mostrar:</span>
              <div className="flex items-center gap-1">
                {[5, 10, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      pageSize === size
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPageSize('all');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    pageSize === 'all'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Ver Todos
                </button>
              </div>
            </div>

            {pageSize !== 'all' && totalPages > 1 && (
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <CaretLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono border transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <CaretRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: GASTOS PENDIENTES PROGRAMADOS */}
      {activeTab === 'pending' && (
        <div className="flex flex-col divide-y divide-white/[0.05]">
          <AnimatePresence mode="popLayout" initial={false}>
            {pendingExpenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/80 rounded-2xl my-2 flex flex-col items-center gap-1.5">
                <ClockCountdown size={26} className="text-zinc-600 mb-1" />
                <p className="font-semibold text-zinc-400">No tienes gastos pendientes programados</p>
                <span>Cuando programes un gasto futuro, se descontará automáticamente cuando llegue su fecha y hora.</span>
              </div>
            ) : (
              pendingExpenses.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="py-4 px-2 flex items-center justify-between gap-4 hover:bg-amber-500/[0.03] rounded-xl transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <ClockCountdown size={18} weight="bold" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {tx.counterparty_concept}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {tx.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono mt-0.5">
                        <span className="inline-flex items-center gap-1"><ClockCountdown size={12} weight="bold" /> Se consumirá: {formatScheduledDate(tx.scheduled_datetime)}</span>
                        <span>•</span>
                        <span>{tx.fund_type === 'digital' ? 'Digital / Bancos' : 'Efectivo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-bold font-mono text-amber-400">
                      -S/. {Number(tx.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>

                    {onExecutePendingNow && (
                      <button
                        type="button"
                        onClick={() => onExecutePendingNow(tx.id)}
                        title="Consumir / Cobrar ahora"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={13} weight="bold" />
                        <span className="hidden sm:inline">Cobrar Ahora</span>
                      </button>
                    )}

                    {onCancelPending && (
                      <button
                        type="button"
                        onClick={() => onCancelPending(tx.id)}
                        title="Cancelar gasto pendiente"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};