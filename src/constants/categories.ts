export interface CategoryOption {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const INCOME_CATEGORIES: string[] = [
  'Salario',
  'Servicios',
  'Honorarios',
  'Bonos',
  'Venta',
  'Otros Ingresos',
];

export const EXPENSE_CATEGORIES: string[] = [
  'Pasajes',
  'Comida',
  'Servicios',
  'Educación / Tesis',
  'Salud / Farmacia',
  'Otros Gastos',
];

export const ALL_CATEGORIES: string[] = [
  'Salario',
  'Servicios',
  'Honorarios',
  'Bonos',
  'Venta',
  'Otros Ingresos',
  'Pasajes',
  'Comida',
  'Educación / Tesis',
  'Salud / Farmacia',
  'Otros Gastos',
];

export const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  // Incomes & Shared
  'Salario': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'Servicios': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'Honorarios': { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  'Bonos': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Venta': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  'Otros Ingresos': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },

  // Expenses
  'Pasajes': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'Comida': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Educación / Tesis': { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  'Salud / Farmacia': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'Otros Gastos': { color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' },
};