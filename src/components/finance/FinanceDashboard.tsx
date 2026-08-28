import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ShieldWarning,
  Bank,
  Gear,
} from '@phosphor-icons/react';
import type {
  Transaction,
  EmergencyWithdrawal,
  FinanceSummary,
  TransactionType,
  FundType,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { BalanceCards } from './BalanceCards';
import { TransactionHistory } from './TransactionHistory';
import { TransactionFormModal } from './TransactionFormModal';
import { EmergencyWithdrawalModal } from './EmergencyWithdrawalModal';
import { EmergencyLogModal } from './EmergencyLogModal';
import { ReserveSettingsModal } from './ReserveSettingsModal';

interface Props {
  onBackToHub?: () => void;
}

const LOCAL_STORAGE_TX_KEY = 'app_finance_transactions_v2';
const LOCAL_STORAGE_EMERGENCY_KEY = 'app_finance_emergency_v2';

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_init_1',
    user_id: 'usr_demo',
    type: 'income',
    fund_type: 'digital',
    amount: 1500.00,
    category: 'Honorarios',
    counterparty_concept: 'Pago Proyecto Desarrollo Web',
    notes: 'Transferencia bancaria directa',
    date: '2026-08-25',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx_init_2',
    user_id: 'usr_demo',
    type: 'income',
    fund_type: 'physical',
    amount: 300.00,
    category: 'Venta',
    counterparty_concept: 'Venta equipo usado en efectivo',
    date: '2026-08-26',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx_init_3',
    user_id: 'usr_demo',
    type: 'expense',
    fund_type: 'digital',
    amount: 120.00,
    category: 'Servicios Básicos',
    counterparty_concept: 'Pago de Internet y Fibra',
    date: '2026-08-26',
    created_at: new Date().toISOString(),
  },
];

export const FinanceDashboard: React.FC<Props> = () => {
  const { user, profile, updateProtectedReserve } = useAuth();
  const baseReserve = profile?.protected_reserve_base ?? 950.00;

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DEMO_TRANSACTIONS;
  });

  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyWithdrawal[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_EMERGENCY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  const [pendingEmergencyData, setPendingEmergencyData] = useState<{
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    reserveImpact: number;
  } | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadSupabaseData() {
      if (isSupabaseConfigured && supabase && user) {
        try {
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (txData && txData.length > 0) {
            setTransactions(txData as Transaction[]);
          }

          const { data: emData } = await supabase
            .from('emergency_withdrawals')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (emData) {
            setEmergencyLogs(emData as EmergencyWithdrawal[]);
          }
        } catch (err) {
          console.error('Error loading finance data from Supabase:', err);
        }
      }
    }
    loadSupabaseData();
  }, [user]);

  // Persist locally
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EMERGENCY_KEY, JSON.stringify(emergencyLogs));
  }, [emergencyLogs]);

  // Financial calculations
  const summary: FinanceSummary = useMemo(() => {
    let incPhysical = 0;
    let incDigital = 0;
    let expPhysical = 0;
    let expDigital = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        if (tx.fund_type === 'physical') incPhysical += amt;
        else incDigital += amt;
      } else {
        if (tx.fund_type === 'physical') expPhysical += amt;
        else expDigital += amt;
      }
    });

    const totalIncome = incPhysical + incDigital;
    const totalExpense = expPhysical + expDigital;
    const totalBalance = totalIncome - totalExpense;
    const physicalBalance = incPhysical - expPhysical;
    const digitalBalance = incDigital - expDigital;

    const protectedReserve = Math.max(0, Math.min(totalBalance, baseReserve));
    const freeSpendingBalance = Math.max(0, totalBalance - baseReserve);

    return {
      totalBalance,
      physicalBalance,
      digitalBalance,
      protectedReserve,
      freeSpendingBalance,
      totalIncome,
      totalExpense,
      emergencyCount: emergencyLogs.length,
    };
  }, [transactions, emergencyLogs, baseReserve]);

  // Handlers
  const handleAddTransaction = async (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      user_id: user?.id || 'usr_local',
      type: data.type,
      fund_type: data.fundType,
      amount: data.amount,
      category: data.category,
      counterparty_concept: data.counterpartyConcept,
      notes: data.notes,
      date: data.date,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('transactions').insert([
          {
            user_id: user.id,
            type: data.type,
            fund_type: data.fundType,
            amount: data.amount,
            category: data.category,
            counterparty_concept: data.counterpartyConcept,
            notes: data.notes,
            date: data.date,
          },
        ]);
      } catch (err) {
        console.error('Error inserting transaction in Supabase:', err);
      }
    }
  };

  const handleRequestEmergencyApproval = (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    reserveImpact: number;
  }) => {
    setPendingEmergencyData(data);
    setIsFormModalOpen(false);
    setIsEmergencyModalOpen(true);
  };

  const handleConfirmEmergencyWithdrawal = async (urgencyReason: string) => {
    if (!pendingEmergencyData) return;

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      user_id: user?.id || 'usr_local',
      type: pendingEmergencyData.type,
      fund_type: pendingEmergencyData.fundType,
      amount: pendingEmergencyData.amount,
      category: pendingEmergencyData.category,
      counterparty_concept: pendingEmergencyData.counterpartyConcept,
      notes: pendingEmergencyData.notes,
      date: pendingEmergencyData.date,
      created_at: new Date().toISOString(),
    };

    const prevReserve = summary.protectedReserve;
    const newReserve = Math.max(0, prevReserve - pendingEmergencyData.reserveImpact);

    const newEmergencyLog: EmergencyWithdrawal = {
      id: 'emg_' + Date.now(),
      user_id: user?.id || 'usr_local',
      transaction_id: newTx.id,
      amount_withdrawn: pendingEmergencyData.reserveImpact,
      urgency_reason: urgencyReason,
      previous_reserve: prevReserve,
      new_reserve: newReserve,
      date: pendingEmergencyData.date,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setEmergencyLogs((prev) => [newEmergencyLog, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data: insertedTx } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: pendingEmergencyData.type,
              fund_type: pendingEmergencyData.fundType,
              amount: pendingEmergencyData.amount,
              category: pendingEmergencyData.category,
              counterparty_concept: pendingEmergencyData.counterpartyConcept,
              notes: pendingEmergencyData.notes,
              date: pendingEmergencyData.date,
            },
          ])
          .select()
          .single();

        await supabase.from('emergency_withdrawals').insert([
          {
            user_id: user.id,
            transaction_id: insertedTx?.id || null,
            amount_withdrawn: pendingEmergencyData.reserveImpact,
            urgency_reason: urgencyReason,
            previous_reserve: prevReserve,
            new_reserve: newReserve,
            date: pendingEmergencyData.date,
          },
        ]);
      } catch (err) {
        console.error('Error inserting emergency withdrawal in Supabase:', err);
      }
    }

    setIsEmergencyModalOpen(false);
    setPendingEmergencyData(null);
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta transacción del registro?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (isSupabaseConfigured && supabase && user) {
        await supabase.from('transactions').delete().eq('id', id);
      }
    }
  };

  const handleSaveReserve = async (newBase: number) => {
    await updateProtectedReserve(newBase);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-6 antialiased">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Bank size={15} />
            <span>Módulo de Finanzas Personales</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
            Flujo de Caja y Fondo de Reserva (S/.)
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsReserveModalOpen(true)}
            title="Modificar monto de reserva protegida"
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Gear size={14} />
            <span>Ajustar Reserva (S/. {baseReserve.toLocaleString('es-PE')})</span>
          </button>

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
            <span>+ Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <BalanceCards
        summary={summary}
        baseReserve={baseReserve}
        onOpenReserveSettings={() => setIsReserveModalOpen(true)}
      />

      {/* Transaction Ledger */}
      <TransactionHistory
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        freeSpendingBalance={summary.freeSpendingBalance}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleAddTransaction}
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
          onConfirm={handleConfirmEmergencyWithdrawal}
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