import React, { useState } from 'react';
import { Plus, Flame, Lightning, CheckCircle, LockKeyOpen } from '@phosphor-icons/react';
import type { Priority } from '../types';

interface Props {
  isLocked: boolean;
  onAddTask: (title: string, priority: Priority) => void;
  onUnlockDate: () => void;
}

export const TaskInputBar: React.FC<Props> = ({
  isLocked,
  onAddTask,
  onUnlockDate,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('high');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onAddTask(cleanTitle, priority);
    setTitle('');
  };

  if (isLocked) {
    return (
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Día archivado:</span>
          <span>Esta fecha finalizó y está en modo solo lectura para proteger tu registro histórico.</span>
        </div>
        <button
          onClick={onUnlockDate}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-white font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          <LockKeyOpen size={14} />
          <span>Habilitar edición</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-2xl bg-[#12141d] border border-white/[0.08] flex items-center gap-3 flex-wrap shadow-sm"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Escribe tu quehacer o tarea aquí..."
        className="flex-1 min-w-[240px] px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-indigo-500/80 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
      />

      {/* Priority Picker */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
        <span className="text-[11px] font-semibold text-zinc-400 px-2 uppercase tracking-wider">
          Color:
        </span>

        <button
          type="button"
          title="🔴 Urgente / Prioridad Alta"
          onClick={() => setPriority('high')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            priority === 'high'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Flame size={14} weight={priority === 'high' ? 'fill' : 'regular'} className="text-rose-400" />
          <span>Rojo</span>
        </button>

        <button
          type="button"
          title="🟡 Importante / Prioridad Media"
          onClick={() => setPriority('medium')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            priority === 'medium'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Lightning size={14} weight={priority === 'medium' ? 'fill' : 'regular'} className="text-amber-400" />
          <span>Amarillo</span>
        </button>

        <button
          type="button"
          title="🟢 Rápida / Prioridad Baja"
          onClick={() => setPriority('low')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            priority === 'low'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CheckCircle size={14} weight={priority === 'low' ? 'fill' : 'regular'} className="text-emerald-400" />
          <span>Verde</span>
        </button>
      </div>

      <button
        type="submit"
        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
      >
        <Plus size={14} weight="bold" />
        <span>Agregar Tarea</span>
      </button>
    </form>
  );
};