export type Priority = 'high' | 'medium' | 'low';
export type FundType = 'physical' | 'digital';
export type TransactionType = 'income' | 'expense' | 'pending_expense';
export type ActiveModule = 'hub' | 'todo' | 'finance';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  protected_reserve_base: number; // default S/. 950.00
  created_at: string;
}

export interface Task {
  id: string;
  agendaId: string;
  date: string; // ISO "YYYY-MM-DD"
  title: string;
  details?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface Agenda {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppState {
  agendas: Agenda[];
  currentAgendaId: string;
  selectedDate: string;
  unlockedDates: string[];
  tasks: Task[];
}

export interface TodoDailyLog {
  id: string;
  user_id: string;
  date: string;
  agenda_id: string;
  agenda_name: string;
  markdown_content: string;
  tasks_snapshot: Task[];
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  fund_type: FundType;
  amount: number;
  category: string;
  counterparty_concept: string;
  notes?: string;
  date: string; // "YYYY-MM-DD"
  scheduled_datetime?: string; // "YYYY-MM-DDTHH:mm"
  status?: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface EmergencyWithdrawal {
  id: string;
  user_id: string;
  transaction_id?: string;
  amount_withdrawn: number;
  urgency_reason: string;
  previous_reserve: number;
  new_reserve: number;
  date: string;
  created_at: string;
}

export interface FinanceSummary {
  totalBalance: number;
  physicalBalance: number;
  digitalBalance: number;
  protectedReserve: number;
  freeSpendingBalance: number;
  freePhysicalBalance: number;
  freeDigitalBalance: number;
  pendingExpenseTotal: number;
  pendingPhysicalTotal: number;
  pendingDigitalTotal: number;
  effectiveFreeBalance: number;
  pendingExpensesCount: number;
  totalIncome: number;
  totalExpense: number;
  emergencyCount: number;
}