import React from 'react';
import { motion } from 'framer-motion';
import { CalendarBlank, LockKey, LockKeyOpen, CalendarPlus } from '@phosphor-icons/react';
import { formatDisplayDate, getTodayString, isPastDate } from '../utils/date';

interface Props {
  dates: string[];
  selectedDate: string;
  unlockedDates: string[];
  onSelectDate: (date: string) => void;
  onAddCustomDate: () => void;
}

export const SidebarDates: React.FC<Props> = ({
  dates,
  selectedDate,
  unlockedDates,
  onSelectDate,
  onAddCustomDate,
}) => {
  const today = getTodayString();

  return (
    <aside className="w-56 shrink-0 bg-[#0f1117] border-r border-white/[0.08] p-4 flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 tracking-wider uppercase">
          <CalendarBlank size={15} />
          <span>Fechas</span>
        </div>
        <button
          onClick={onAddCustomDate}
          title="Agregar otra fecha"
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
        >
          <CalendarPlus size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        {dates.map((dateStr) => {
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const isPast = isPastDate(dateStr);
          const isUnlocked = unlockedDates.includes(dateStr);
          const isLocked = isPast && !isUnlocked;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group active:scale-[0.98] ${
                isSelected
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-date-bg"
                  className="absolute inset-0 bg-zinc-800/90 border border-white/[0.1] rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <span className="relative z-10 font-mono tracking-tight">
                {formatDisplayDate(dateStr)}
              </span>

              <div className="relative z-10 flex items-center gap-1.5">
                {isToday ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Hoy
                  </span>
                ) : isLocked ? (
                  <span title="Día cerrado (solo lectura)" className="text-zinc-500 group-hover:text-zinc-400">
                    <LockKey size={13} />
                  </span>
                ) : isPast && isUnlocked ? (
                  <span title="Día desbloqueado para edición" className="text-amber-400">
                    <LockKeyOpen size={13} />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};