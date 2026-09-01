import React, { useState, useEffect } from 'react';
import {
  Plus,
  ShieldWarning,
  Bank,
} from '@phosphor-icons/react';
import type {
  TransactionType,
  FundType,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { BalanceCards } from './BalanceCards';
import { TransactionHistory } from './TransactionHistory';
import { TransactionFormModal } from './TransactionFormModal';
import { EmergencyWithdrawalModal } from './EmergencyWithdrawalModal';
import { EmergencyLogModal } from './EmergencyLogModal';
import { ReserveSettingsModal } from './ReserveSettingsModal';

interface Props {
  onBackToHub?: () => void;
}

export const FinanceDashboard: React.FC<Props> = () => {
  const { updateProtectedReserve } = useAuth();
  const {
    transactions,
    pendingExpenses,
    emergencyLogs,
    summary,
    baseReserve,
    addTransaction,
    confirmEmergencyWithdrawal,
    executePendingNow,
    cancelPending,
    deleteTransaction,
  } = useFinance();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsFormModalOpen(true);
    window.addEventListener('app:open-transaction-modal', handleOpen);
    return () => window.removeEventListener('app:open-transaction-modal', handleOpen);
  }, []);

  const [pendingEmergencyData, setPendingEmergencyData] = useState<{
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    scheduledDatetime?: string;
    reserveImpact: number;
  } | null>(null);

  const handleRequestEmergencyApproval = (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    scheduledDatetime?: string;
    reserveImpact: number;
  }) => {
    setPendingEmergencyData(data);
    setIsFormModalOpen(false);
    setIsEmergencyModalOpen(true);
  };

  const handleConfirmEmergency = async (urgencyReason: string) => {
    if (!pendingEmergencyData) return;
    await confirmEmergencyWithdrawal(pendingEmergencyData, urgencyReason);
    setIsEmergencyModalOpen(false);
    setPendingEmergencyData(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta transacción del registro?')) {
      deleteTransaction(id);
    }
  };

  const handleSaveReserve = async (newBase: number) => {
    await updateProtectedReserve(newBase);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 sm:p-6 antialiased">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Bank size={15} />
            <span>Módulo de Finanzas Personales</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Flujo de Caja y Fondo de Reserva (S/.)
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {emergencyLogs.length > 0 && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShieldWarning size={15} weight="bold" />
              <span>Auditoría Urgencias ({emergencyLogs.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <BalanceCards
        summary={summary}
        baseReserve={baseReserve}
        onOpenReserveSettings={() => setIsReserveModalOpen(true)}
      />

      {/* Transaction Ledger & Pending Expenses */}
      <TransactionHistory
        transactions={transactions}
        pendingExpenses={pendingExpenses}
        onDeleteTransaction={handleDelete}
        onExecutePendingNow={executePendingNow}
        onCancelPending={cancelPending}
      />

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        freeSpendingBalance={summary.freeSpendingBalance}
        physicalBalance={summary.physicalBalance}
        digitalBalance={summary.digitalBalance}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={addTransaction}
        onRequestEmergencyApproval={handleRequestEmergencyApproval}
      />

      {pendingEmergencyData && (
        <EmergencyWithdrawalModal
          isOpen={isEmergencyModalOpen}
          amount={pendingEmergencyData.amount}
          freeSpendingBalance={summary.freeSpendingBalance}
          reserveImpact={pendingEmergencyData.reserveImpact}
          onClose={() => {
            setIsEmergencyModalOpen(false);
            setPendingEmergencyData(null);
          }}
          onConfirm={handleConfirmEmergency}
        />
      )}

      <EmergencyLogModal
        isOpen={isLogModalOpen}
        withdrawals={emergencyLogs}
        onClose={() => setIsLogModalOpen(false)}
      />

      <ReserveSettingsModal
        isOpen={isReserveModalOpen}
        currentBaseReserve={baseReserve}
        onClose={() => setIsReserveModalOpen(false)}
        onSave={handleSaveReserve}
      />
    </div>
  );
};