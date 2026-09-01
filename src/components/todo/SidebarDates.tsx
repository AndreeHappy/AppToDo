import React, { useMemo } from 'react';
import { CalendarBlank, LockKey, LockKeyOpen, CalendarPlus, Folder } from '@phosphor-icons/react';
import { formatDisplayDate, getTodayString, isPastDate } from '../../utils/date';

interface Props {
  dates: string[];
  selectedDate: string;
  unlockedDates: string[];
  onSelectDate: (date: string) => void;
  onAddCustomDate: () => void;
}

const formatMonthYear = (dateStr: string): string => {
  try {
    const [year, month] = dateStr.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex] || month} ${year}`;
  } catch {
    return 'Otras Fechas';
  }
};

export const SidebarDates: React.FC<Props> = ({
  dates,
  selectedDate,
  unlockedDates,
  onSelectDate,
  onAddCustomDate,
}) => {
  const today = getTodayString();

  // Group dates chronologically by Month and Year
  const groupedDates = useMemo(() => {
    const map: { [key: string]: string[] } = {};
    dates.forEach((d) => {
      const key = formatMonthYear(d);
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [dates]);

  return (
    <aside className="w-56 shrink-0 bg-[#0f1117] border-r border-white/[0.08] p-3.5 flex flex-col gap-3.5 select-none transition-colors">
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

      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {Object.entries(groupedDates).map(([monthYear, dateList]) => (
          <div key={monthYear} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <Folder size={11} className="text-zinc-600" />
              <span>{monthYear}</span>
            </div>

            <div className="flex flex-col gap-1">
              {dateList.map((dateStr) => {
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
                        ? 'text-white font-semibold bg-indigo-600 shadow-sm shadow-indigo-600/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 bg-zinc-900/40 border border-transparent hover:border-zinc-800/80'
                    }`}
                  >
                    <span className="relative z-10 font-mono tracking-tight">
                      {formatDisplayDate(dateStr)}
                    </span>

                    <div className="relative z-10 flex items-center gap-1.5">
                      {isToday ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          Hoy
                        </span>
                      ) : isLocked ? (
                        <span title="Día cerrado (solo lectura)" className={isSelected ? 'text-white/70' : 'text-zinc-500'}>
                          <LockKey size={13} />
                        </span>
                      ) : isPast && isUnlocked ? (
                        <span title="Día desbloqueado para edición" className={isSelected ? 'text-amber-200' : 'text-amber-400'}>
                          <LockKeyOpen size={13} />
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
    </aside>
  );
};