import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Flame, Lightning, CheckCircle, CalendarBlank, Tag } from '@phosphor-icons/react';
import type { Priority } from '../../types';
import { formatDisplayDate } from '../../utils/date';

interface Props {
  isOpen: boolean;
  selectedDate: string;
  agendaName: string;
  onClose: () => void;
  onAddTask: (title: string, priority: Priority) => void;
}

export const TaskFormModal: React.FC<Props> = ({
  isOpen,
  selectedDate,
  agendaName,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPriority('high');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Por favor escribe el nombre de la tarea.');
      return;
    }

    onAddTask(cleanTitle, priority);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-[#11131a] border border-white/[0.1] p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Plus size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Nueva Tarea
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                <Tag size={12} className="text-indigo-400" />
                <span className="truncate max-w-[120px] font-semibold">{agendaName}</span>
                <span>•</span>
                <CalendarBlank size={12} className="text-zinc-500" />
                <span className="font-mono">{formatDisplayDate(selectedDate)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Título / Descripción de la Tarea
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Redactar avance de informe..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          {/* Priority Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Nivel de Prioridad:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'high'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Flame size={14} weight="fill" className="text-rose-400" />
                <span>Rojo / Alta</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Lightning size={14} weight="fill" className="text-amber-400" />
                <span>Amarillo</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'low'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                <span>Verde / Baja</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Plus size={15} weight="bold" />
              <span>Agregar Tarea</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};