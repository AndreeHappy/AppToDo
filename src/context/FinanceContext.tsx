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
  withdrawFromSavings: (amount: number, fundType: FundType, reason: string) => Promise<void>;
  replenishSavings: (amount: number, fundType: FundType) => Promise<void>;
  increaseSavingsBase: (amount: number, fundType: FundType) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'app_finance_transactions_v6';
const LOCAL_STORAGE_EMERGENCY_KEY = 'app_finance_emergency_v6';

// Generates RFC4122 compliant UUID v4 to satisfy Supabase uuid primary keys
const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, updateProtectedReserve } = useAuth();
  const baseReserve = profile?.protected_reserve_base ?? 950.00;

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_TX_KEY) ||
      localStorage.getItem('app_finance_transactions_v5') ||
      localStorage.getItem('app_finance_transactions_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyWithdrawal[]>(() => {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_EMERGENCY_KEY) ||
      localStorage.getItem('app_finance_emergency_v5') ||
      localStorage.getItem('app_finance_emergency_v4');
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
          const parsedList: Transaction[] = (txData as any[]).map((row) => {
            let type: TransactionType = row.type;
            let sched = row.scheduled_datetime;
            let cleanNotes = row.notes;

            // Detect and unpack pending tag from notes for cross-platform compatibility
            if (row.notes && typeof row.notes === 'string' && row.notes.startsWith('[PENDING:') && row.notes.includes(']')) {
              const tagEnd = row.notes.indexOf(']');
              sched = row.notes.slice(9, tagEnd);
              cleanNotes = row.notes.slice(tagEnd + 1).trim() || undefined;
              type = 'pending_expense';
            } else if (type === 'pending_expense') {
              sched = row.scheduled_datetime || sched;
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

          setTransactions(parsedList);
          localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(parsedList));
        }

        const { data: emData } = await supabase
          .from('emergency_withdrawals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (emData) {
          setEmergencyLogs(emData as EmergencyWithdrawal[]);
          localStorage.setItem(LOCAL_STORAGE_EMERGENCY_KEY, JSON.stringify(emData));
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

      // Realtime cross-device synchronization (PC <-> Mobile)
      if (isSupabaseConfigured && supabase) {
        const channel = supabase
          .channel('realtime_transactions_' + user.id)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'transactions',
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchFinanceData();
            }
          )
          .subscribe();


  return () => {
          if (supabase) supabase.removeChannel(channel);
        };
      }
    }
  }, [user]);

  // Persist locally on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EMERGENCY_KEY, JSON.stringify(emergencyLogs));
  }, [emergencyLogs]);

  // Routine: Auto-execute pending expenses strictly when scheduled datetime arrives
  useEffect(() => {
    const checkScheduledExpenses = async () => {
      const nowMs = Date.now();
      let hasUpdates = false;

      const updated = await Promise.all(
        transactions.map(async (tx) => {
          if (tx.type === 'pending_expense' && tx.scheduled_datetime) {
            const schedMs = new Date(tx.scheduled_datetime).getTime();
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
                    .update({
                      type: 'expense',
                      date: todayStr,
                      notes: tx.notes || null,
                    })
                    .eq('id', tx.id);
                } catch (e) {
                  console.error('Error auto-executing scheduled expense in Supabase:', e);
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
    const interval = setInterval(checkScheduledExpenses, 15000);

  return () => clearInterval(interval);
  }, [transactions, user]);

  const pendingExpenses = useMemo(() => {
    return transactions.filter((t) => t.type === 'pending_expense');
  }, [transactions]);

  const executedTransactions = useMemo(() => {
    return transactions.filter((t) => t.type !== 'pending_expense');
  }, [transactions]);

  // Summary calculations
  const summary: FinanceSummary = useMemo(() => {
    let incPhysical = 0;
    let incDigital = 0;
    let expPhysical = 0;
    let expDigital = 0;
    let pendingPhysicalTotal = 0;
    let pendingDigitalTotal = 0;

    // Calculate total withdrawn from savings and total replenished
    let totalWithdrawnFromReserve = 0;
    let totalReplenishedToReserve = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const lowerConcept = (tx.counterparty_concept || '').toLowerCase();
      const notes = tx.notes || '';

      const isWithdrawal =
        tx.category === 'Retiro de Ahorro' ||
        notes.includes('[RETIRO_AHORRO]') ||
        lowerConcept.includes('retiro de bolsa de ahorro');

      const isReplenish =
        tx.category === 'Reposición de Ahorro' ||
        notes.includes('[REPOSICION_AHORRO]') ||
        lowerConcept.includes('reposición al fondo de ahorro');

      const isIncrease =
        tx.category === 'Aumento de Ahorro' ||
        notes.includes('[AUMENTO_AHORRO]') ||
        lowerConcept.includes('aumento de bolsa de ahorro');

      // Savings operations are internal movements between protected reserve and free spending.
      // They do NOT alter total net income or total net expense from external sources.
      if (isWithdrawal) {
        totalWithdrawnFromReserve += amt;
        // If money was withdrawn to physical cash from digital reserve:
        if (tx.fund_type === 'physical') {
          expDigital += amt;
          incPhysical += amt;
        }
        return;
      }

      if (isReplenish) {
        totalReplenishedToReserve += amt;
        // If replenished into digital reserve using physical cash:
        if (tx.fund_type === 'physical') {
          expPhysical += amt;
          incDigital += amt;
        }
        return;
      }

      if (isIncrease) {
        // If user increased reserve using physical cash:
        if (tx.fund_type === 'physical') {
          expPhysical += amt;
          incDigital += amt;
        }
        return;
      }

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

    const reserveDeficit = Math.max(0, totalWithdrawnFromReserve - totalReplenishedToReserve);
    const currentReserve = Math.max(0, baseReserve - reserveDeficit);
    const isReserveDeficit = reserveDeficit > 0;

    const protectedReserve = currentReserve;
    const freeSpendingBalance = Math.max(0, totalBalance - currentReserve);

    const freePhysicalBalance = physicalBalance;
    const freeDigitalBalance = digitalBalance - protectedReserve;

    const pendingExpenseTotal = pendingPhysicalTotal + pendingDigitalTotal;
    const effectiveFreeBalance = Math.max(0, freeSpendingBalance - pendingExpenseTotal);

    return {
      totalBalance,
      physicalBalance,
      digitalBalance,
      protectedReserve,
      currentReserve,
      reserveDeficit,
      isReserveDeficit,
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
    const newId = generateUuid();

    const newTx: Transaction = {
      id: newId,
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
        const notesToSave =
          data.type === 'pending_expense' && data.scheduledDatetime
            ? `[PENDING:${data.scheduledDatetime}] ${data.notes || ''}`.trim()
            : data.notes;

        // Try inserting with standard columns
        const { error: insertErr } = await supabase.from('transactions').insert([
          {
            id: newId,
            user_id: user.id,
            type: data.type === 'pending_expense' ? 'expense' : data.type,
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
          console.error('Supabase insert error, attempting fallback:', insertErr);
          // Fallback without specifying id (let DB generate uuid)
          await supabase.from('transactions').insert([
            {
              user_id: user.id,
              type: data.type === 'pending_expense' ? 'expense' : data.type,
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
    const newId = generateUuid();

    const newTx: Transaction = {
      id: newId,
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
      id: generateUuid(),
      user_id: user?.id || 'usr_local',
      transaction_id: newId,
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
        await supabase.from('transactions').insert([
          {
            id: newId,
            user_id: user.id,
            type: data.type === 'pending_expense' ? 'expense' : data.type,
            fund_type: data.fundType,
            amount: data.amount,
            category: data.category,
            counterparty_concept: data.counterpartyConcept,
            notes: data.notes,
            date: data.date,
            created_at: nowIso,
          },
        ]);

        await supabase.from('emergency_withdrawals').insert([
          {
            id: newEmergencyLog.id,
            user_id: user.id,
            transaction_id: newId,
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
          ? { ...t, type: 'expense', date: todayStr, status: 'completed', scheduled_datetime: undefined }
          : t
      )
    );

    if (isSupabaseConfigured && supabase && user) {
      try {
        const current = transactions.find((t) => t.id === id);
        await supabase
          .from('transactions')
          .update({
            type: 'expense',
            date: todayStr,
            notes: current?.notes || null,
          })
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

  const withdrawFromSavings = async (amount: number, fundType: FundType, reason: string) => {
    const todayStr = getTodayString();
    await addTransaction({
      type: 'income',
      fundType,
      amount,
      category: 'Retiro de Ahorro',
      counterpartyConcept: `Retiro de Bolsa de Ahorro – ${reason}`,
      notes: `[RETIRO_AHORRO] ${reason}`,
      date: todayStr,
    });
  };

  const replenishSavings = async (amount: number, fundType: FundType) => {
    const todayStr = getTodayString();
    await addTransaction({
      type: 'expense',
      fundType,
      amount,
      category: 'Reposición de Ahorro',
      counterpartyConcept: 'Reposición al Fondo de Ahorro Protegido',
      notes: '[REPOSICION_AHORRO] Reposición al fondo protegido',
      date: todayStr,
    });
  };

  const increaseSavingsBase = async (amount: number, fundType: FundType) => {
    const todayStr = getTodayString();
    const newBase = baseReserve + amount;
    await updateProtectedReserve(newBase);
    await addTransaction({
      type: 'expense',
      fundType,
      amount,
      category: 'Aumento de Ahorro',
      counterpartyConcept: `Aumento de Bolsa de Ahorro (Nueva base: S/. ${newBase.toLocaleString('es-PE')})`,
      notes: `[AUMENTO_AHORRO] Incremento permanente de la bolsa de ahorro`,
      date: todayStr,
    });
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
        withdrawFromSavings,
        replenishSavings,
        increaseSavingsBase,
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