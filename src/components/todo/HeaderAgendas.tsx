import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash, ListChecks, FolderSimple } from '@phosphor-icons/react';
import type { Agenda } from '../../types';
import { getTodayString, formatDisplayDate } from '../../utils/date';

interface Props {
  agendas: Agenda[];
  currentAgendaId: string;
  onSelectAgenda: (id: string) => void;
  onOpenNewAgendaModal: () => void;
  onDeleteAgenda: (id: string, e: React.MouseEvent) => void;
}

export const HeaderAgendas: React.FC<Props> = ({
  agendas,
  currentAgendaId,
  onSelectAgenda,
  onOpenNewAgendaModal,
  onDeleteAgenda,
}) => {
  const todayStr = getTodayString();

  return (
    <header className="bg-[#11131a] border-b border-white/[0.08] px-6 py-4 flex flex-col gap-3.5 select-none">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ListChecks size={20} weight="bold" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              AppToDo
            </h1>
            <span className="text-xs text-zinc-400 font-medium">
              Gestor de Tareas y Agendas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hoy: {formatDisplayDate(todayStr)}</span>
        </div>
      </div>

      {/* Agendas Pills Bar */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mr-1">
          AGENDAS:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {agendas.map((agenda) => {
            const isActive = agenda.id === currentAgendaId;

            return (
              <button
                key={agenda.id}
                onClick={() => onSelectAgenda(agenda.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 active:scale-[0.98] ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 bg-zinc-900/50 border border-white/[0.05]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-agenda-pill"
                    className="absolute inset-0 bg-indigo-600/20 border-2 border-indigo-500/80 rounded-full shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <FolderSimple size={14} weight={isActive ? 'fill' : 'regular'} />
                  {agenda.name}
                </span>

                {agendas.length > 1 && (
                  <span
                    role="button"
                    title="Eliminar agenda"
                    onClick={(e) => onDeleteAgenda(agenda.id, e)}
                    className="relative z-10 p-0.5 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash size={12} />
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onOpenNewAgendaModal}
            className="px-3.5 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white border border-dashed border-zinc-700 hover:border-indigo-400 bg-transparent hover:bg-zinc-800/40 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Plus size={13} weight="bold" />
            <span>AGREGAR AGENDA</span>
          </button>
        </div>
      </div>
    </header>
  );
};