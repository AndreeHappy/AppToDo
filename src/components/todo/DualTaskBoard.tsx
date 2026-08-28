import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ListBullets, CheckCircle, Sparkle } from '@phosphor-icons/react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';

interface Props {
  pendingTasks: Task[];
  doneTasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
}

export const DualTaskBoard: React.FC<Props> = ({
  pendingTasks,
  doneTasks,
  onToggleTask,
  onDeleteTask,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 items-start">
      {/* COLUMN 1: TAREAS (Pendientes) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col gap-3.5 shadow-xl">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ListBullets size={18} weight="bold" className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Tareas Pendientes
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 font-mono">
            {pendingTasks.length} {pendingTasks.length === 1 ? 'nota' : 'notas'}
          </span>
        </div>

        {/* Task List with Internal Scroll */}
        <div className="flex flex-col gap-2.5 max-h-[calc(100vh-330px)] min-h-[280px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800/80 rounded-2xl my-auto text-zinc-500">
                <Sparkle size={24} className="mb-2 text-zinc-600" />
                <p className="text-xs font-medium">No hay tareas pendientes en esta fecha.</p>
                <span className="text-[11px] text-zinc-600 mt-1">¡Añade tus quehaceres arriba!</span>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COLUMN 2: HECHAS (Completadas) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#11131a] border border-white/[0.08] flex flex-col gap-3.5 shadow-xl">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} weight="bold" className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Tareas Hechas
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 font-mono">
            {doneTasks.length} {doneTasks.length === 1 ? 'completada' : 'completadas'}
          </span>
        </div>

        {/* Task List with Internal Scroll */}
        <div className="flex flex-col gap-2.5 max-h-[calc(100vh-330px)] min-h-[280px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {doneTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800/80 rounded-2xl my-auto text-zinc-500">
                <CheckCircle size={24} className="mb-2 text-zinc-600" />
                <p className="text-xs font-medium">Las tareas marcadas aparecerán aquí.</p>
                <span className="text-[11px] text-zinc-600 mt-1">Haz clic en una nota para completarla</span>
              </div>
            ) : (
              doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};