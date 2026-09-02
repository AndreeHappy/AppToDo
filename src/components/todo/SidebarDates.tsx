import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarBlank, LockKey, LockKeyOpen, CalendarPlus, Calendar, Folder } from '@phosphor-icons/react';
import { getTodayString, isPastDate } from '../../utils/date';

interface Props {
  dates: string[];
  selectedDate: string;
  unlockedDates: string[];
  onSelectDate: (date: string) => void;
  onAddCustomDate: () => void;
}

interface DateHierarchy {
  [year: string]: {
    [month: string]: string[];
  };
}

export const SidebarDates: React.FC<Props> = ({
  dates,
  selectedDate,
  unlockedDates,
  onSelectDate,
  onAddCustomDate,
}) => {
  const today = getTodayString();

  // Group dates hierarchically: Year -> Month -> Days
  const hierarchy = useMemo<DateHierarchy>(() => {
    const tree: DateHierarchy = {};

    // Sort dates descending
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));

    sorted.forEach((d) => {
      const parts = d.split('-');
      if (parts.length >= 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const monthNamesList = [
          'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
          'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
        ];
        const monthName = monthNamesList[monthNum - 1] || parts[1];

        if (!tree[year]) tree[year] = {};
        if (!tree[year][monthName]) tree[year][monthName] = [];
        tree[year][monthName].push(d);
      }
    });

    return tree;
  }, [dates]);

  return (
    <aside className="w-60 shrink-0 bg-[#0f1117] border-r border-white/[0.08] p-3.5 flex flex-col gap-3.5 select-none transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 tracking-wider uppercase">
          <CalendarBlank size={16} className="text-indigo-400" />
          <span>HISTORIAL DE FECHAS</span>
        </div>
        <button
          onClick={onAddCustomDate}
          title="Agregar otra fecha"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <CalendarPlus size={16} />
        </button>
      </div>

      {/* Hierarchical Date Tree with Animated Feedback */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1 text-xs">
        {Object.entries(hierarchy).map(([year, months]) => (
          <div key={year} className="flex flex-col gap-2.5">
            {/* Year Box Header */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-black text-indigo-400 font-mono tracking-wider shadow-xs">
              <Calendar size={15} weight="bold" />
              <span>{year}</span>
            </div>

            {/* Months within Year */}
            <div className="flex flex-col gap-2.5 pl-1.5">
              {Object.entries(months).map(([month, dayList]) => (
                <div key={month} className="flex flex-col gap-1.5">
                  {/* Month Subtitle */}
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    <Folder size={12} className="text-zinc-600" />
                    <span>{month}</span>
                  </div>

                  {/* Day Buttons with Smooth Spring Animations */}
                  <div className="flex flex-col gap-1 pl-1">
                    {dayList.map((dateStr) => {
                      const dayNumber = dateStr.split('-')[2] || dateStr;
                      const isSelected = dateStr === selectedDate;
                      const isToday = dateStr === today;
                      const isPast = isPastDate(dateStr);
                      const isUnlocked = unlockedDates.includes(dateStr);
                      const isLocked = isPast && !isUnlocked;

                      return (
                        <motion.button
                          key={dateStr}
                          onClick={() => onSelectDate(dateStr)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          className={`relative w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between group overflow-hidden ${
                            isSelected
                              ? 'text-white'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70 bg-zinc-900/40 border border-transparent hover:border-zinc-800'
                          }`}
                        >
                          {/* Animated Active Pill Indicator */}
                          {isSelected && (
                            <motion.div
                              layoutId="active-date-highlight"
                              className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 z-0"
                              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                            />
                          )}

                          {/* Day Number Only */}
                          <span className="relative z-10 font-mono text-sm tracking-tight font-black">
                            {dayNumber}
                          </span>

                          <div className="relative z-10 flex items-center gap-1.5">
                            {isToday ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider transition-colors ${
                                isSelected
                                  ? 'bg-white/25 text-white'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              }`}>
                                HOY
                              </span>
                            ) : isLocked ? (
                              <span title="Día archivado (solo lectura)" className={isSelected ? 'text-white/70' : 'text-zinc-500'}>
                                <LockKey size={13} />
                              </span>
                            ) : isPast && isUnlocked ? (
                              <span title="Día habilitado para edición" className={isSelected ? 'text-amber-200' : 'text-amber-400'}>
                                <LockKeyOpen size={13} />
                              </span>
                            ) : null}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};