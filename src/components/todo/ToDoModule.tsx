import React, { useState, useEffect, useMemo } from 'react';
import type { Task, Agenda, Priority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getTodayString, isPastDate, formatReadableDate, formatDisplayDate } from '../../utils/date';
import { HeaderAgendas } from './HeaderAgendas';
import { SidebarDates } from './SidebarDates';
import { TaskInputBar } from './TaskInputBar';
import { DualTaskBoard } from './DualTaskBoard';
import { FooterActions } from './FooterActions';
import { NewAgendaModal } from './NewAgendaModal';
import { NewDateModal } from './NewDateModal';
import { MarkdownEditorModal } from './MarkdownEditorModal';
import { Sparkle, CloudCheck, CalendarBlank, X } from '@phosphor-icons/react';

const LOCAL_STORAGE_KEY = 'app_todo_obsidian_v3';

export const ToDoModule: React.FC = () => {
  const { user } = useAuth();
  const today = getTodayString();

  const [agendas, setAgendas] = useState<Agenda[]>([
    { id: 'agenda_tesis', name: 'TESIS', createdAt: new Date().toISOString() },
    { id: 'agenda_trabajo', name: 'TRABAJO ENCARGADO CC', createdAt: new Date().toISOString() },
  ]);

  const [currentAgendaId, setCurrentAgendaId] = useState('agenda_tesis');
  const [selectedDate, setSelectedDate] = useState(today);
  const [unlockedDates, setUnlockedDates] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't_demo_1',
      agendaId: 'agenda_tesis',
      date: today,
      title: 'Redactar metodología y marco teórico',
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 't_demo_2',
      agendaId: 'agenda_tesis',
      date: today,
      title: 'Descargar 5 artículos científicos de referencia',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 't_demo_3',
      agendaId: 'agenda_tesis',
      date: today,
      title: 'Revisar formato y normas de citación APA',
      priority: 'low',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [syncedLogStatus, setSyncedLogStatus] = useState<string | null>(null);

  // Load from LocalStorage or Supabase
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.agendas) setAgendas(parsed.agendas);
        if (parsed.currentAgendaId) setCurrentAgendaId(parsed.currentAgendaId);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.unlockedDates) setUnlockedDates(parsed.unlockedDates);
      } catch (e) {
        console.error('Error loading todo state', e);
      }
    }
  }, []);

  // Persist locally
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ agendas, currentAgendaId, tasks, unlockedDates })
    );
  }, [agendas, currentAgendaId, tasks, unlockedDates]);

  // Sync Daily Log Markdown to Supabase when day changes or tasks change
  useEffect(() => {
    async function syncDailyLog() {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const activeAgenda = agendas.find((a) => a.id === currentAgendaId) || agendas[0];
      const dayTasks = tasks.filter((t) => t.agendaId === currentAgendaId && t.date === selectedDate);
      if (dayTasks.length === 0) return;

      const total = dayTasks.length;
      const completed = dayTasks.filter((t) => t.completed).length;
      const rate = Math.round((completed / total) * 100);

      let md = `# 📅 ${activeAgenda.name} — ${formatDisplayDate(selectedDate)}\n\n`;
      md += `> **Métricas:** ${completed} de ${total} completadas (${rate}%)\n\n`;
      md += `### 📝 Tareas Pendientes\n`;
      const pending = dayTasks.filter((t) => !t.completed);
      if (pending.length === 0) md += `*Sin tareas pendientes*\n`;
      else {
        pending.forEach((t) => {
          const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
          md += `- [ ] ${tag} ${t.title}\n`;
        });
      }

      md += `\n### ✅ Tareas Hechas\n`;
      const done = dayTasks.filter((t) => t.completed);
      if (done.length === 0) md += `*Sin tareas completadas*\n`;
      else {
        done.forEach((t) => {
          const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
          md += `- [x] ${tag} ${t.title}\n`;
        });
      }

      try {
        await supabase.from('todo_daily_logs').upsert(
          {
            user_id: user.id,
            date: selectedDate,
            agenda_id: currentAgendaId,
            agenda_name: activeAgenda.name,
            markdown_content: md,
            tasks_snapshot: dayTasks,
            total_tasks: total,
            completed_tasks: completed,
            completion_rate: rate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,date,agenda_id' }
        );
        setSyncedLogStatus('Bitácora guardada en Supabase');
        setTimeout(() => setSyncedLogStatus(null), 3000);
      } catch (err) {
        console.error('Error syncing daily log to Supabase:', err);
      }
    }

    const timer = setTimeout(syncDailyLog, 1500);
    return () => clearTimeout(timer);
  }, [tasks, selectedDate, currentAgendaId, user, agendas]);

  // Derived
  const allDates = useMemo(() => {
    const datesSet = new Set<string>();
    datesSet.add(today);
    tasks.forEach((t) => datesSet.add(t.date));
    datesSet.add(selectedDate);
    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  }, [tasks, selectedDate, today]);

  const currentAgenda = useMemo(() => {
    return agendas.find((a) => a.id === currentAgendaId) || agendas[0];
  }, [agendas, currentAgendaId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.agendaId === currentAgendaId && t.date === selectedDate);
  }, [tasks, currentAgendaId, selectedDate]);

  const pendingTasks = useMemo(() => filteredTasks.filter((t) => !t.completed), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.completed), [filteredTasks]);

  const isCurrentDateLocked = useMemo(() => {
    const isPast = isPastDate(selectedDate);
    const isUnlocked = unlockedDates.includes(selectedDate);
    return isPast && !isUnlocked;
  }, [selectedDate, unlockedDates]);

  // Copy yesterday's template / uncompleted tasks to today
  const handleCopyYesterdayPending = () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    const yesterdayPending = tasks.filter((t) => t.agendaId === currentAgendaId && t.date === yStr && !t.completed);
    if (yesterdayPending.length === 0) {
      alert('No se encontraron tareas pendientes del día de ayer para transferir.');
      return;
    }

    const copiedTasks: Task[] = yesterdayPending.map((t) => ({
      ...t,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      date: today,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...prev, ...copiedTasks]);
  };

  // Handlers
  const handleSelectAgenda = (agendaId: string) => setCurrentAgendaId(agendaId);

  const handleCreateAgenda = (name: string) => {
    const newId = `agenda_${Date.now()}`;
    const newAgenda = { id: newId, name, createdAt: new Date().toISOString() };
    setAgendas((prev) => [...prev, newAgenda]);
    setCurrentAgendaId(newId);
  };

  const handleDeleteAgenda = (agendaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (agendas.length <= 1) {
      alert('Debes mantener al menos una agenda activa.');
      return;
    }
    if (confirm('¿Eliminar esta agenda y todas sus tareas asociadas?')) {
      setAgendas((prev) => prev.filter((a) => a.id !== agendaId));
      setTasks((prev) => prev.filter((t) => t.agendaId !== agendaId));
      if (currentAgendaId === agendaId) {
        setCurrentAgendaId(agendas[0].id);
      }
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setIsMobileSidebarOpen(false);
  };

  const handleUnlockCurrentDate = () => {
    setUnlockedDates((prev) => [...prev, selectedDate]);
  };

  const handleAddTask = (title: string, priority: Priority) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      agendaId: currentAgendaId,
      date: selectedDate,
      title,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleClearCompleted = () => {
    if (confirm('¿Eliminar todas las tareas completadas de esta fecha?')) {
      setTasks((prev) =>
        prev.filter((t) => !(t.agendaId === currentAgendaId && t.date === selectedDate && t.completed))
      );
    }
  };

  // Replace active day tasks with imported Markdown tasks
  const handleSaveMarkdownTasks = (parsedTasks: Task[]) => {
    setTasks((prev) => {
      // Remove previous tasks for this agenda and date, and replace with parsed list
      const others = prev.filter((t) => !(t.agendaId === currentAgendaId && t.date === selectedDate));
      return [...others, ...parsedTasks];
    });
  };

  return (
    <div className="flex flex-col flex-1 antialiased w-full">
      {/* Header with Agendas */}
      <HeaderAgendas
        agendas={agendas}
        currentAgendaId={currentAgendaId}
        onSelectAgenda={handleSelectAgenda}
        onOpenNewAgendaModal={() => setIsAgendaModalOpen(true)}
        onDeleteAgenda={handleDeleteAgenda}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Sidebar: Dates */}
        <div className="hidden md:flex">
          <SidebarDates
            dates={allDates}
            selectedDate={selectedDate}
            unlockedDates={unlockedDates}
            onSelectDate={handleSelectDate}
            onAddCustomDate={() => setIsDateModalOpen(true)}
          />
        </div>

        {/* Mobile Dates Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <div className="relative z-50 w-64 bg-[#0f1117] h-full shadow-2xl flex flex-col">
              <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Historial de Fechas</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarDates
                  dates={allDates}
                  selectedDate={selectedDate}
                  unlockedDates={unlockedDates}
                  onSelectDate={handleSelectDate}
                  onAddCustomDate={() => {
                    setIsMobileSidebarOpen(false);
                    setIsDateModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 max-w-7xl mx-auto w-full">
          {/* Active Agenda Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1.5 text-xs font-medium"
              >
                <CalendarBlank size={16} />
                <span>Fechas</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Agenda Activa
                  </span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-zinc-400 capitalize">
                    {formatReadableDate(selectedDate)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {currentAgenda?.name || 'AGENDA'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {syncedLogStatus && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CloudCheck size={16} />
                  <span className="hidden sm:inline">{syncedLogStatus}</span>
                </div>
              )}

              {selectedDate === today && filteredTasks.length === 0 && (
                <button
                  onClick={handleCopyYesterdayPending}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkle size={14} className="text-amber-400" />
                  <span>Pendientes de ayer</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Task Bar */}
          <TaskInputBar
            isLocked={isCurrentDateLocked}
            onAddTask={handleAddTask}
            onUnlockDate={handleUnlockCurrentDate}
          />

          {/* Dual Columns Board (Tareas vs Hechas) */}
          <DualTaskBoard
            pendingTasks={pendingTasks}
            doneTasks={doneTasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />

          {/* Footer with Markdown Exporter & Stats */}
          <FooterActions
            currentAgenda={currentAgenda}
            selectedDate={selectedDate}
            tasks={filteredTasks}
            onClearCompleted={handleClearCompleted}
            onOpenMarkdownEditor={() => setIsMarkdownModalOpen(true)}
          />
        </main>
      </div>

      {/* Modals */}
      <NewAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        onSave={handleCreateAgenda}
      />

      <NewDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onSelectDate={handleSelectDate}
      />

      <MarkdownEditorModal
        isOpen={isMarkdownModalOpen}
        currentAgenda={currentAgenda}
        selectedDate={selectedDate}
        tasks={filteredTasks}
        onClose={() => setIsMarkdownModalOpen(false)}
        onSaveMarkdown={handleSaveMarkdownTasks}
      />
    </div>
  );
};