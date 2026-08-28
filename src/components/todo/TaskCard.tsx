import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash, Flame, Lightning, CheckCircle } from '@phosphor-icons/react';
import type { Task, Priority } from '../../types';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const priorityConfig: Record<Priority, { label: string; border: string; bg: string; text: string; icon: React.ReactNode }> = {
  high: {
    label: 'Urgente',
    border: 'border-rose-500/80 hover:border-rose-400',
    bg: 'bg-rose-500/[0.04]',
    text: 'text-rose-400',
    icon: <Flame size={13} weight="fill" className="text-rose-400" />
  },
  medium: {
    label: 'Importante',
    border: 'border-amber-500/80 hover:border-amber-400',
    bg: 'bg-amber-500/[0.04]',
    text: 'text-amber-400',
    icon: <Lightning size={13} weight="fill" className="text-amber-400" />
  },
  low: {
    label: 'Rápida',
    border: 'border-emerald-500/80 hover:border-emerald-400',
    bg: 'bg-emerald-500/[0.04]',
    text: 'text-emerald-400',
    icon: <CheckCircle size={13} weight="fill" className="text-emerald-400" />
  }
};

export const TaskCard: React.FC<Props> = ({ task, onToggle, onDelete }) => {
  const config = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      onClick={() => onToggle(task.id)}
      className={`group relative p-3.5 rounded-xl border-2 ${config.border} ${config.bg} bg-[#13151f] shadow-sm hover:shadow-md transition-all cursor-pointer select-none flex items-start gap-3`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 text-transparent'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: task.completed ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Check size={12} weight="bold" />
        </motion.div>
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug break-words transition-all ${
            task.completed
              ? 'text-zinc-500 line-through'
              : 'text-zinc-100 group-hover:text-white'
          }`}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border border-current/20 ${config.text} ${config.bg}`}
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
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
      >
        <Trash size={14} />
      </button>
    </motion.div>
  );
};