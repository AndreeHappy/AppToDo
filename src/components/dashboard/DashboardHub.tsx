import React from 'react';
import { motion } from 'framer-motion';
import {
  ListChecks,
  TrendUp,
  CalendarCheck,
  LockKey,
  Wallet,
  ArrowRight,
  Flame,
  Lightning,
  CheckCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTodo } from '../../context/TodoContext';
import type { ActiveModule } from '../../types';

interface Props {
  onSelectModule: (module: ActiveModule) => void;
}

export const DashboardHub: React.FC<Props> = ({
  onSelectModule,
}) => {
  const { user, profile } = useAuth();
  const { summary, baseReserve } = useFinance();
  const { todayPendingCount } = useTodo();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Happy';

  return (
    <div className="flex-1 flex flex-col justify-between antialiased selection:bg-indigo-500/30 transition-colors">


      {/* Main Hub Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8 flex flex-col justify-center gap-7 sm:gap-8 my-auto">
        <div className="flex flex-col gap-1.5 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Espacio de Trabajo Personal</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Bienvenido, {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            Seleccione su módulo de trabajo
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: TO-DO MODULE */}
          <motion.div
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            onClick={() => onSelectModule('todo')}
            className="group relative rounded-3xl bg-[#11131a] border border-white/[0.08] hover:border-indigo-500/60 p-6 sm:p-7 shadow-xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] flex flex-col justify-between cursor-pointer transition-all overflow-hidden"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <ListChecks size={26} weight="bold" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                  {todayPendingCount} pendientes hoy
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  Módulo de Tareas (To-Do)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Organiza tus tareas diarias
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <Flame size={12} weight="fill" /> Prioridad 3 Niveles
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-800 text-zinc-300">
                  <CalendarCheck size={12} /> Bloqueo de Días
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle size={12} weight="fill" /> Bitácoras Markdown
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Abrir Tablero de Tareas</span>
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* CARD 2: FINANCE MODULE */}
          <motion.div
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            onClick={() => onSelectModule('finance')}
            className="group relative rounded-3xl bg-[#11131a] border border-white/[0.08] hover:border-emerald-500/60 p-6 sm:p-7 shadow-xl hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] flex flex-col justify-between cursor-pointer transition-all overflow-hidden"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendUp size={26} weight="bold" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  <LockKey size={13} weight="bold" />
                  <span>Reserva: S/. {baseReserve.toLocaleString('es-PE')}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  Finanzas Personales
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestiona tus gastos diarios
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  <LockKey size={12} weight="fill" /> Ahorro Blindado
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-800 text-zinc-300">
                  <Wallet size={12} /> Físico y Digital
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <Lightning size={12} weight="fill" /> Retiro de Urgencia
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>
                Gestionar Finanzas (S/. {summary.totalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })})
              </span>
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};