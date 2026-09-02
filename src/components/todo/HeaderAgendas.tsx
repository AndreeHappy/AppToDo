import React from 'react';
import { Plus, Trash, ListChecks, FolderSimple } from '@phosphor-icons/react';
import type { Agenda } from '../../types';

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
  return (
    <header className="bg-[#11131a] border-b border-white/[0.08] px-4 sm:px-6 py-3 flex flex-col gap-3 select-none transition-colors">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ListChecks size={18} weight="bold" />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
            Gestor de Tareas
          </h1>
        </div>

        {/* Create new agenda button */}
        <button
          onClick={onOpenNewAgendaModal}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Plus size={13} weight="bold" />
          <span>Nueva Agenda</span>
        </button>
      </div>

      {/* Agendas Tabs (Horizontal scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {agendas.map((agenda) => {
          const isActive = agenda.id === currentAgendaId;

          return (
            <button
              key={agenda.id}
              onClick={() => onSelectAgenda(agenda.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FolderSimple size={14} weight={isActive ? 'fill' : 'regular'} />
              <span>{agenda.name}</span>

              {agendas.length > 1 && (
                <span
                  onClick={(e) => onDeleteAgenda(agenda.id, e)}
                  title="Eliminar agenda"
                  className={`ml-1 p-0.5 rounded hover:bg-black/30 transition-colors ${
                    isActive ? 'text-indigo-200 hover:text-white' : 'text-zinc-500 hover:text-rose-400'
                  }`}
                >
                  <Trash size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};