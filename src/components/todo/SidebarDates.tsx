import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarBlank,
  LockKey,
  CalendarPlus,
  Calendar,
} from '@phosphor-icons/react';
import { getTodayString, getYesterdayString, getShortDayName, isPastDate } from '../../utils/date';

interface Props {
  dates: string[];
  selectedDate: string;
  unlockedDates: string[];
  onSelectDate: (date: string) => void;
  onAddCustomDate: () => void;
}

interface MonthGroup {
  year: string;
  month: string;
  monthIndex: number;
  dayList: string[];
}

export const SidebarDates: React.FC<Props> = ({
  dates,
  selectedDate,
  unlockedDates,
  onSelectDate,
  onAddCustomDate,
}) => {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Group dates cleanly: Month/Year -> Days (Sorted descending)
  const monthGroups = useMemo<MonthGroup[]>(() => {
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    const groupsMap = new Map<string, { year: string; month: string; monthIndex: number; dayList: string[] }>();

    const monthNamesList = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    sorted.forEach((d) => {
      const parts = d.split('-');
      if (parts.length >= 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const monthName = monthNamesList[monthNum - 1] || parts[1];
        const key = `${year}-${parts[1]}`;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            year,
            month: monthName,
            monthIndex: monthNum,
            dayList: [],
          });
        }
        groupsMap.get(key)!.dayList.push(d);
      }
    });

    return Array.from(groupsMap.values());
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
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <CalendarPlus size={16} />
        </button>
      </div>

      {/* Sleek Date List */}
      <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 text-xs">
        {monthGroups.map((group) => (
          <div key={`${group.year}-${group.month}`} className="flex flex-col gap-2">
            {/* Clean Month / Year Header */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-900/60 border border-white/[0.05] text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-400" />
                <span>{group.month} {group.year}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-normal">
                {group.dayList.length} d
              </span>
            </div>

            {/* Days in Month */}
            <div className="flex flex-col gap-1 pl-0.5">
              {group.dayList.map((dateStr) => {
                const dayNumber = dateStr.split('-')[2] || dateStr;
                const shortDayName = getShortDayName(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === today;
                const isYesterdayDate = dateStr === yesterday;
                const isPast = isPastDate(dateStr);
                const isUnlocked = unlockedDates.includes(dateStr);
                const isLocked = isPast && !isUnlocked;

                return (
                  <motion.button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group overflow-hidden ${
                      isSelected
                        ? 'text-white'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 bg-zinc-900/30 border border-white/[0.04]'
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

                    {/* Day Number + Short Day Name */}
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="font-mono text-sm font-black tracking-tight">
                        {dayNumber}
                      </span>
                      <span className={`text-[11px] font-medium uppercase font-mono ${
                        isSelected ? 'text-white/80' : 'text-zinc-400'
                      }`}>
                        {shortDayName}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="relative z-10 flex items-center gap-1.5">
                      {isToday ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          HOY
                        </span>
                      ) : isYesterdayDate ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          AYER
                        </span>
                      ) : isLocked ? (
                        <span title="Día archivado (solo lectura)" className={isSelected ? 'text-white/70' : 'text-zinc-500'}>
                          <LockKey size={13} />
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
    </aside>
  );
};