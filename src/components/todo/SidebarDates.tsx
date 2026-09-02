import React, { useMemo } from 'react';
import { CalendarBlank, LockKey, LockKeyOpen, CalendarPlus, Calendar, Folder } from '@phosphor-icons/react';
import { formatDisplayDate, getTodayString, isPastDate } from '../../utils/date';

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

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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
        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthName = MONTH_NAMES[monthIndex] || parts[1];

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
      <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 tracking-wider uppercase">
          <CalendarBlank size={16} className="text-indigo-400" />
          <span>Historial de Fechas</span>
        </div>
        <button
          onClick={onAddCustomDate}
          title="Agregar otra fecha"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <CalendarPlus size={16} />
        </button>
      </div>

      {/* Hierarchical Date Tree */}
      <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 text-xs">
        {Object.entries(hierarchy).map(([year, months]) => (
          <div key={year} className="flex flex-col gap-2">
            {/* Year Header */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-[11px] font-black text-indigo-400 tracking-wider font-mono">
              <Calendar size={13} weight="bold" />
              <span>AÑO {year}</span>
            </div>

            {/* Months within Year */}
            <div className="flex flex-col gap-2 pl-2">
              {Object.entries(months).map(([month, dayList]) => (
                <div key={month} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 px-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <Folder size={11} className="text-zinc-600" />
                    <span>{month}</span>
                  </div>

                  {/* Days within Month */}
                  <div className="flex flex-col gap-1 pl-1">
                    {dayList.map((dateStr) => {
                      const isSelected = dateStr === selectedDate;
                      const isToday = dateStr === today;
                      const isPast = isPastDate(dateStr);
                      const isUnlocked = unlockedDates.includes(dateStr);
                      const isLocked = isPast && !isUnlocked;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => onSelectDate(dateStr)}
                          className={`relative w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group active:scale-[0.98] ${
                            isSelected
                              ? 'text-white font-semibold bg-indigo-600 shadow-sm shadow-indigo-600/25'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 bg-zinc-900/40 border border-transparent hover:border-zinc-800'
                          }`}
                        >
                          <span className="relative z-10 font-mono tracking-tight">
                            {formatDisplayDate(dateStr)}
                          </span>

                          <div className="relative z-10 flex items-center gap-1.5">
                            {isToday ? (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                Hoy
                              </span>
                            ) : isLocked ? (
                              <span title="Día archivado (solo lectura)" className={isSelected ? 'text-white/70' : 'text-zinc-500'}>
                                <LockKey size={12} />
                              </span>
                            ) : isPast && isUnlocked ? (
                              <span title="Día habilitado para edición" className={isSelected ? 'text-amber-200' : 'text-amber-400'}>
                                <LockKeyOpen size={12} />
                              </span>
                            ) : null}
                          </div>
                        </button>
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