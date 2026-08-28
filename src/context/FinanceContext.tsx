import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Transaction,
  EmergencyWithdrawal,
  FinanceSummary,
  TransactionType,
  FundType,
} from '../types';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface FinanceContextType {
  transactions: Transaction[];
  emergencyLogs: EmergencyWithdrawal[];
  summary: FinanceSummary;
  baseReserve: number;
  loading: boolean;
  addTransaction: (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
  }) => Promise<void>;
  confirmEmergencyWithdrawal: (
    data: {
      type: TransactionType;
      fundType: FundType;
      amount: number;
      category: string;
      counterpartyConcept: string;
      notes?: string;
      date: string;
      reserveImpact: number;
    },
    urgencyReason: string
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshFinanceData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'app_finance_transactions_v2';
const LOCAL_STORAGE_EMERGENCY_KEY = 'app_finance_emergency_v2';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const baseReserve = profile?.protected_reserve_base ?? 950.00;

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyWithdrawal[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_EMERGENCY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const fetchFinanceData = async () => {
    if (isSupabaseConfigured && supabase && user) {
      setLoading(true);
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (txData) {
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
        console.error('Error fetching finance data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    }
  }, [user]);

  // Persist locally
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EMERGENCY_KEY, JSON.stringify(emergencyLogs));
  }, [emergencyLogs]);

  // Financial summary calculations
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

  const addTransaction = async (data: {
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

  const confirmEmergencyWithdrawal = async (
    data: {
      type: TransactionType;
      fundType: FundType;
      amount: number;
      category: string;
      counterpartyConcept: string;
      notes?: string;
      date: string;
      reserveImpact: number;
    },
    urgencyReason: string
  ) => {
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

    const prevReserve = summary.protectedReserve;
    const newReserve = Math.max(0, prevReserve - data.reserveImpact);

    const newEmergencyLog: EmergencyWithdrawal = {
      id: 'emg_' + Date.now(),
      user_id: user?.id || 'usr_local',
      transaction_id: newTx.id,
      amount_withdrawn: data.reserveImpact,
      urgency_reason: urgencyReason,
      previous_reserve: prevReserve,
      new_reserve: newReserve,
      date: data.date,
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
              type: data.type,
              fund_type: data.fundType,
              amount: data.amount,
              category: data.category,
              counterparty_concept: data.counterpartyConcept,
              notes: data.notes,
              date: data.date,
            },
          ])
          .select()
          .single();

        await supabase.from('emergency_withdrawals').insert([
          {
            user_id: user.id,
            transaction_id: insertedTx?.id || null,
            amount_withdrawn: data.reserveImpact,
            urgency_reason: urgencyReason,
            previous_reserve: prevReserve,
            new_reserve: newReserve,
            date: data.date,
          },
        ]);
      } catch (err) {
        console.error('Error inserting emergency withdrawal in Supabase:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting transaction in Supabase:', err);
      }
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        emergencyLogs,
        summary,
        baseReserve,
        loading,
        addTransaction,
        confirmEmergencyWithdrawal,
        deleteTransaction,
        refreshFinanceData: fetchFinanceData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};