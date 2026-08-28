import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash, Flame, Lightning, CheckCircle } from '@phosphor-icons/react';
import type { Task, Priority } from '../../types';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const priorityConfig: Record<
  Priority,
  { label: string; leftBorder: string; badgeColor: string; icon: React.ReactNode }
> = {
  high: {
    label: 'Urgente',
    leftBorder: 'border-l-rose-500',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    icon: <Flame size={12} weight="fill" className="text-rose-400" />,
  },
  medium: {
    label: 'Importante',
    leftBorder: 'border-l-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    icon: <Lightning size={12} weight="fill" className="text-amber-400" />,
  },
  low: {
    label: 'Rápida',
    leftBorder: 'border-l-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    icon: <CheckCircle size={12} weight="fill" className="text-emerald-400" />,
  },
};

export const TaskCard: React.FC<Props> = ({ task, onToggle, onDelete }) => {
  const config = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      onClick={() => onToggle(task.id)}
      className={`group relative p-3.5 rounded-2xl border-y border-r border-l-4 ${config.leftBorder} border-white/[0.07] bg-[#141620] shadow-[0_2px_10px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none flex items-start gap-3`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
            : 'border-zinc-600 hover:border-zinc-400 bg-zinc-900/80 text-transparent'
        }`}
      >
        {task.completed && <Check size={12} weight="bold" />}
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm font-medium leading-snug break-words transition-all ${
            task.completed
              ? 'text-zinc-500 line-through opacity-70'
              : 'text-zinc-100 group-hover:text-white'
          }`}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border ${config.badgeColor}`}
          >
            {config.icon}
            <span>{config.label}</span>
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        title="Eliminar tarea"
        onClick={(e) => onDelete(task.id, e)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
      >
        <Trash size={14} />
      </button>
    </motion.div>
  );
};