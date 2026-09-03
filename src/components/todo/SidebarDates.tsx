import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarBlank,
  LockKey,
  Calendar,
  Folder,
  CaretDown,
  CaretRight,
  X,
} from '@phosphor-icons/react';
import { getTodayString, getShortDayName, isPastDate } from '../../utils/date';

interface Props {
  dates: string[];
  selectedDate: string;
  unlockedDates: string[];
  onSelectDate: (date: string) => void;
  onClose?: () => void;
}

interface MonthItem {
  monthKey: string; // e.g. "2026-09"
  monthName: string;
  days: string[];
}

interface YearItem {
  year: string;
  months: MonthItem[];
}

export const SidebarDates: React.FC<Props> = ({
  dates,
  selectedDate,
  unlockedDates,
  onSelectDate,
  onClose,
}) => {
  const today = getTodayString();

  // Parse current year and month to have them expanded by default

  // State to track collapsed Years and Months
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  // Group dates hierarchically: Year -> Month -> Days (Sorted descending)
  const hierarchy = useMemo<YearItem[]>(() => {
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    const yearMap = new Map<string, Map<string, { monthName: string; days: string[] }>>();

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
        const monthKey = `${year}-${parts[1]}`;

        if (!yearMap.has(year)) {
          yearMap.set(year, new Map());
        }
        const mGroup = yearMap.get(year)!;
        if (!mGroup.has(monthKey)) {
          mGroup.set(monthKey, { monthName, days: [] });
        }
        mGroup.get(monthKey)!.days.push(d);
      }
    });

    const result: YearItem[] = [];
    yearMap.forEach((monthsMap, year) => {
      const months: MonthItem[] = [];
      monthsMap.forEach((data, monthKey) => {
        months.push({
          monthKey,
          monthName: data.monthName,
          days: data.days,
        });
      });
      result.push({ year, months });
    });

    return result;
  }, [dates]);

  const toggleYear = (year: string) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  return (
    <aside className="w-64 shrink-0 bg-[#07080d] border-r border-white/[0.08] p-3.5 flex flex-col gap-2.5 select-none transition-colors h-full">
      {/* Header: Clean, single line without overlapping borders or extra icons */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 tracking-wider uppercase">
          <CalendarBlank size={16} className="text-indigo-400" />
          <span>HISTORIAL DE FECHAS</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hierarchical Accordion: Year -> Month -> Days */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 text-xs">
        {hierarchy.map(({ year, months }) => {
          const isYearCollapsed = collapsedYears.has(year);

          return (
            <div key={year} className="flex flex-col gap-1.5">
              {/* Year Collapsible Bar */}
              <button
                type="button"
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/[0.06] text-xs font-black text-indigo-300 font-mono tracking-wider transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} weight="bold" className="text-indigo-400" />
                  <span>{year}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                  <span>{months.length} m</span>
                  {isYearCollapsed ? (
                    <CaretRight size={12} weight="bold" />
                  ) : (
                    <CaretDown size={12} weight="bold" />
                  )}
                </div>
              </button>

              {/* Months within Year */}
              <AnimatePresence initial={false}>
                {!isYearCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden flex flex-col gap-1.5 pl-1.5"
                  >
                    {months.map(({ monthKey, monthName, days }) => {
                      const isMonthCollapsed = collapsedMonths.has(monthKey);

                      return (
                        <div key={monthKey} className="flex flex-col gap-1">
                          {/* Month Collapsible Bar */}
                          <button
                            type="button"
                            onClick={() => toggleMonth(monthKey)}
                            className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-zinc-800/50 text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider transition-all"
                          >
                            <div className="flex items-center gap-1.5">
                              <Folder size={12} className="text-zinc-500" />
                              <span>{monthName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                              <span>{days.length} d</span>
                              {isMonthCollapsed ? (
                                <CaretRight size={11} />
                              ) : (
                                <CaretDown size={11} />
                              )}
                            </div>
                          </button>

                          {/* Days within Month */}
                          <AnimatePresence initial={false}>
                            {!isMonthCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                className="overflow-hidden flex flex-col gap-1 pl-1"
                              >
                                {days.map((dateStr) => {
                                  const dayNumber = dateStr.split('-')[2] || dateStr;
                                  const shortDayName = getShortDayName(dateStr);
                                  const isSelected = dateStr === selectedDate;
                                  const isToday = dateStr === today;
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
                                        <span
                                          className={`text-[11px] font-medium uppercase font-mono ${
                                            isSelected ? 'text-white/80' : 'text-zinc-400'
                                          }`}
                                        >
                                          {shortDayName}
                                        </span>
                                      </div>

                                      {/* Status Badges */}
                                      <div className="relative z-10 flex items-center gap-1.5">
                                        {isToday && (
                                          <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider transition-colors ${
                                              isSelected
                                                ? 'bg-white/25 text-white'
                                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                            }`}
                                          >
                                            HOY
                                          </span>
                                        )}
                                        {isLocked && (
                                          <span
                                            title="Día archivado (solo lectura)"
                                            className={isSelected ? 'text-white/70' : 'text-zinc-500'}
                                          >
                                            <LockKey size={13} />
                                          </span>
                                        )}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
};