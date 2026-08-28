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
import { getTodayString } from '../utils/date';

interface FinanceContextType {
  transactions: Transaction[];
  pendingExpenses: Transaction[];
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
    scheduledDatetime?: string;
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
      scheduledDatetime?: string;
    },
    urgencyReason: string
  ) => Promise<void>;
  executePendingNow: (id: string) => Promise<void>;
  cancelPending: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshFinanceData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'app_finance_transactions_v5';
const LOCAL_STORAGE_EMERGENCY_KEY = 'app_finance_emergency_v5';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const baseReserve = profile?.protected_reserve_base ?? 950.00;

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_TX_KEY) ||
      localStorage.getItem('app_finance_transactions_v4') ||
      localStorage.getItem('app_finance_transactions_v3') ||
      localStorage.getItem('app_finance_transactions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyWithdrawal[]>(() => {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_EMERGENCY_KEY) ||
      localStorage.getItem('app_finance_emergency_v4') ||
      localStorage.getItem('app_finance_emergency_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const fetchFinanceData = async () => {
    if (isSupabaseConfigured && supabase && user) {
      setLoading(true);
      try {
        const { data: txData, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txData && !error) {
          // Parse remote transactions
          const remoteList: Transaction[] = (txData as any[]).map((row) => {
            // If notes contains [PENDING:...] tag, reconstruct pending status
            let type: TransactionType = row.type;
            let sched = row.scheduled_datetime;
            let cleanNotes = row.notes;

            if (row.notes && row.notes.startsWith('[PENDING:') && row.notes.includes(']')) {
              const tagEnd = row.notes.indexOf(']');
              sched = row.notes.slice(9, tagEnd);
              cleanNotes = row.notes.slice(tagEnd + 1).trim() || undefined;
              type = 'pending_expense';
            }

            return {
              id: row.id,
              user_id: row.user_id,
              type: type,
              fund_type: row.fund_type,
              amount: Number(row.amount),
              category: row.category,
              counterparty_concept: row.counterparty_concept,
              notes: cleanNotes,
              date: row.date,
              scheduled_datetime: sched,
              status: type === 'pending_expense' ? 'pending' : 'completed',
              created_at: row.created_at || new Date().toISOString(),
            };
          });

          // Retain any local pending transactions that haven't synced yet
          setTransactions((prevLocal) => {
            const localPending = prevLocal.filter((t) => t.type === 'pending_expense');
            const mergedMap = new Map<string, Transaction>();

            remoteList.forEach((t) => mergedMap.set(t.id, t));
            localPending.forEach((t) => {
              if (!mergedMap.has(t.id)) {
                mergedMap.set(t.id, t);
              }
            });

            const merged = Array.from(mergedMap.values()).sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            });

            return merged;
          });
        }

        const { data: emData } = await supabase
          .from('emergency_withdrawals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

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

  // Persist locally on every change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EMERGENCY_KEY, JSON.stringify(emergencyLogs));
  }, [emergencyLogs]);

  // Routine: Auto-execute pending expenses strictly when scheduled datetime has arrived
  useEffect(() => {
    const checkScheduledExpenses = async () => {
      const nowMs = Date.now();
      let hasUpdates = false;

      const updated = await Promise.all(
        transactions.map(async (tx) => {
          if (tx.type === 'pending_expense' && tx.scheduled_datetime) {
            const schedMs = new Date(tx.scheduled_datetime).getTime();
            // Execute only if timestamp is valid and in the past
            if (!isNaN(schedMs) && schedMs <= nowMs) {
              hasUpdates = true;
              const todayStr = getTodayString();
              const completedTx: Transaction = {
                ...tx,
                type: 'expense',
                date: todayStr,
                status: 'completed',
              };

              if (isSupabaseConfigured && supabase && user) {
                try {
                  await supabase
                    .from('transactions')
                    .update({ type: 'expense', date: todayStr, notes: tx.notes })
                    .eq('id', tx.id);
                } catch (e) {
                  console.error('Error updating scheduled expense in Supabase:', e);
                }
              }
              return completedTx;
            }
          }
          return tx;
        })
      );

      if (hasUpdates) {
        setTransactions(updated);
      }
    };

    checkScheduledExpenses();
    const interval = setInterval(checkScheduledExpenses, 20000);
    return () => clearInterval(interval);
  }, [transactions, user]);

  // Separate active pending expenses from executed movements
  const pendingExpenses = useMemo(() => {
    return transactions.filter((t) => t.type === 'pending_expense');
  }, [transactions]);

  const executedTransactions = useMemo(() => {
    return transactions.filter((t) => t.type !== 'pending_expense');
  }, [transactions]);

  // Financial summary calculations
  const summary: FinanceSummary = useMemo(() => {
    let incPhysical = 0;
    let incDigital = 0;
    let expPhysical = 0;
    let expDigital = 0;
    let pendingPhysicalTotal = 0;
    let pendingDigitalTotal = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        if (tx.fund_type === 'physical') incPhysical += amt;
        else incDigital += amt;
      } else if (tx.type === 'expense') {
        if (tx.fund_type === 'physical') expPhysical += amt;
        else expDigital += amt;
      } else if (tx.type === 'pending_expense') {
        if (tx.fund_type === 'physical') pendingPhysicalTotal += amt;
        else pendingDigitalTotal += amt;
      }
    });

    const totalIncome = incPhysical + incDigital;
    const totalExpense = expPhysical + expDigital;
    const totalBalance = totalIncome - totalExpense;
    const physicalBalance = incPhysical - expPhysical;
    const digitalBalance = incDigital - expDigital;

    const protectedReserve = Math.max(0, Math.min(totalBalance, baseReserve));
    const freeSpendingBalance = Math.max(0, totalBalance - baseReserve);

    // Free balance per fund
    const freePhysicalBalance = physicalBalance;
    const freeDigitalBalance = digitalBalance - protectedReserve;

    const pendingExpenseTotal = pendingPhysicalTotal + pendingDigitalTotal;
    const effectiveFreeBalance = Math.max(0, freeSpendingBalance - pendingExpenseTotal);

    return {
      totalBalance,
      physicalBalance,
      digitalBalance,
      protectedReserve,
      freeSpendingBalance,
      freePhysicalBalance,
      freeDigitalBalance,
      pendingExpenseTotal,
      pendingPhysicalTotal,
      pendingDigitalTotal,
      effectiveFreeBalance,
      pendingExpensesCount: pendingExpenses.length,
      totalIncome,
      totalExpense,
      emergencyCount: emergencyLogs.length,
    };
  }, [transactions, emergencyLogs, baseReserve, pendingExpenses]);

  const addTransaction = async (data: {
    type: TransactionType;
    fundType: FundType;
    amount: number;
    category: string;
    counterpartyConcept: string;
    notes?: string;
    date: string;
    scheduledDatetime?: string;
  }) => {
    const nowIso = new Date().toISOString();
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
      scheduled_datetime: data.scheduledDatetime,
      status: data.type === 'pending_expense' ? 'pending' : 'completed',
      created_at: nowIso,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        // Tag pending in notes for 100% compatibility with any Supabase schema constraints
        const notesToSave =
          data.type === 'pending_expense' && data.scheduledDatetime
            ? `[PENDING:${data.scheduledDatetime}] ${data.notes || ''}`.trim()
            : data.notes;

        // Try inserting as pending_expense, fallback to expense if enum check restricts it
        const { error: insertErr } = await supabase.from('transactions').insert([
          {
            id: newTx.id,
            user_id: user.id,
            type: data.type,
            fund_type: data.fundType,
            amount: data.amount,
            category: data.category,
            counterparty_concept: data.counterpartyConcept,
            notes: notesToSave,
            date: data.date,
            created_at: nowIso,
          },
        ]);

        if (insertErr) {
          // Fallback insert with type: 'expense' and [PENDING] note tag
          await supabase.from('transactions').insert([
            {
              id: newTx.id,
              user_id: user.id,
              type: 'expense',
              fund_type: data.fundType,
              amount: data.amount,
              category: data.category,
              counterparty_concept: data.counterpartyConcept,
              notes: notesToSave,
              date: data.date,
              created_at: nowIso,
            },
          ]);
        }
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
      scheduledDatetime?: string;
    },
    urgencyReason: string
  ) => {
    const nowIso = new Date().toISOString();
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
      scheduled_datetime: data.scheduledDatetime,
      status: data.type === 'pending_expense' ? 'pending' : 'completed',
      created_at: nowIso,
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
      created_at: nowIso,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setEmergencyLogs((prev) => [newEmergencyLog, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data: insertedTx } = await supabase
          .from('transactions')
          .insert([
            {
              id: newTx.id,
              user_id: user.id,
              type: data.type,
              fund_type: data.fundType,
              amount: data.amount,
              category: data.category,
              counterparty_concept: data.counterpartyConcept,
              notes: data.notes,
              date: data.date,
              created_at: nowIso,
            },
          ])
          .select()
          .single();

        await supabase.from('emergency_withdrawals').insert([
          {
            user_id: user.id,
            transaction_id: insertedTx?.id || newTx.id,
            amount_withdrawn: data.reserveImpact,
            urgency_reason: urgencyReason,
            previous_reserve: prevReserve,
            new_reserve: newReserve,
            date: data.date,
            created_at: nowIso,
          },
        ]);
      } catch (err) {
        console.error('Error inserting emergency withdrawal in Supabase:', err);
      }
    }
  };

  const executePendingNow = async (id: string) => {
    const todayStr = getTodayString();
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, type: 'expense', date: todayStr, status: 'completed' }
          : t
      )
    );

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase
          .from('transactions')
          .update({ type: 'expense', date: todayStr })
          .eq('id', id);
      } catch (e) {
        console.error('Error executing pending expense in Supabase:', e);
      }
    }
  };

  const cancelPending = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (e) {
        console.error('Error deleting pending expense in Supabase:', e);
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
        transactions: executedTransactions,
        pendingExpenses,
        emergencyLogs,
        summary,
        baseReserve,
        loading,
        addTransaction,
        confirmEmergencyWithdrawal,
        executePendingNow,
        cancelPending,
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