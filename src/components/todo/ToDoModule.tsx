import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTodo } from '../../context/TodoContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getTodayString, isPastDate, formatDisplayDate } from '../../utils/date';
import { HeaderAgendas } from './HeaderAgendas';
import { SidebarDates } from './SidebarDates';
import { TaskFormModal } from './TaskFormModal';
import { DualTaskBoard } from './DualTaskBoard';
import { FooterActions } from './FooterActions';
import { NewAgendaModal } from './NewAgendaModal';
import { NewDateModal } from './NewDateModal';
import { MarkdownEditorModal } from './MarkdownEditorModal';
import { CloudCheck, CalendarBlank, X, CaretDown, Plus } from '@phosphor-icons/react';

export const ToDoModule: React.FC = () => {
  const { user } = useAuth();
  const {
    agendas,
    currentAgendaId,
    selectedDate,
    unlockedDates,
    tasks,
    setCurrentAgendaId,
    setSelectedDate,
    createAgenda,
    deleteAgenda,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    saveMarkdownTasks,
    unlockDate,
  } = useTodo();

  const today = getTodayString();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [syncedLogStatus, setSyncedLogStatus] = useState<string | null>(null);

  // Listen for global central '+' action button from Liquid Navigator
  useEffect(() => {
    const handleOpenTaskModal = () => setIsTaskModalOpen(true);
    window.addEventListener('app:open-task-modal', handleOpenTaskModal);
    window.addEventListener('app:focus-task-input', handleOpenTaskModal);
    return () => {
      window.removeEventListener('app:open-task-modal', handleOpenTaskModal);
      window.removeEventListener('app:focus-task-input', handleOpenTaskModal);
    };
  }, []);

  // Sync Daily Log Markdown to Supabase
  useEffect(() => {
    async function syncDailyLog() {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const activeAgenda = agendas.find((a) => a.id === currentAgendaId) || agendas[0];
      const dayTasks = tasks.filter((t) => t.agendaId === currentAgendaId && t.date === selectedDate);
      if (dayTasks.length === 0) return;

      const total = dayTasks.length;
      const completed = dayTasks.filter((t) => t.completed).length;
      const rate = Math.round((completed / total) * 100);

      let md = `# 📅 ${activeAgenda?.name || 'AGENDA'} — ${formatDisplayDate(selectedDate)}\n\n`;
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
            agenda_name: activeAgenda?.name || 'AGENDA',
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

  // Derived dates
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

  // Filter tasks for current agenda and date (including universal rollover of past pending tasks when viewing today)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.agendaId !== currentAgendaId) return false;
      if (selectedDate === today) {
        return t.date === today || (t.date < today && !t.completed);
      }
      return t.date === selectedDate;
    });
  }, [tasks, currentAgendaId, selectedDate, today]);

  const pendingTasks = useMemo(() => filteredTasks.filter((t) => !t.completed), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.completed), [filteredTasks]);

  const isCurrentDateLocked = useMemo(() => {
    const isPast = isPastDate(selectedDate);
    const isUnlocked = unlockedDates.includes(selectedDate);
    return isPast && !isUnlocked;
  }, [selectedDate, unlockedDates]);

  const handleDeleteAgendaClick = (agendaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (agendas.length <= 1) {
      alert('Debes mantener al menos una agenda activa.');
      return;
    }
    if (confirm('¿Eliminar esta agenda y todas sus tareas asociadas?')) {
      deleteAgenda(agendaId);
    }
  };


  return (
    <div className="flex flex-col flex-1 antialiased w-full">
      {/* Header with Agendas */}
      <HeaderAgendas
        agendas={agendas}
        currentAgendaId={currentAgendaId}
        onSelectAgenda={setCurrentAgendaId}
        onOpenNewAgendaModal={() => setIsAgendaModalOpen(true)}
        onDeleteAgenda={handleDeleteAgendaClick}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Sidebar: Dates */}
        <div className="hidden md:flex">
          <SidebarDates
            dates={allDates}
            selectedDate={selectedDate}
            unlockedDates={unlockedDates}
            onSelectDate={setSelectedDate}
            onAddCustomDate={() => setIsDateModalOpen(true)}
          />
        </div>

        {/* Mobile Dates Drawer with Spring Physics Animation */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden flex select-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                className="relative z-50 w-72 bg-[#0f1117] h-full shadow-2xl flex flex-col border-r border-white/[0.08]"
              >
                <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Historial de Fechas</span>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SidebarDates
                    dates={allDates}
                    selectedDate={selectedDate}
                    unlockedDates={unlockedDates}
                    onSelectDate={(d) => {
                      setSelectedDate(d);
                      setIsMobileSidebarOpen(false);
                    }}
                    onAddCustomDate={() => {
                      setIsMobileSidebarOpen(false);
                      setIsDateModalOpen(true);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full">
          {/* Subheader: Agenda Name & Intuitive Mobile Date Picker */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {currentAgenda?.name || 'AGENDA'}
              </h2>

              {/* Intuitive Date Picker Button on Mobile & Desktop */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                title="Cambiar fecha de trabajo"
                className="px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition-colors font-mono"
              >
                <CalendarBlank size={14} className="text-indigo-400" />
                <span>{formatDisplayDate(selectedDate)}</span>
                {selectedDate === today && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                    Hoy
                  </span>
                )}
                <CaretDown size={12} className="text-zinc-500 md:hidden" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {syncedLogStatus && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CloudCheck size={16} />
                  <span className="hidden sm:inline">{syncedLogStatus}</span>
                </div>
              )}

              {/* Desktop Quick Add Task Button */}
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                <Plus size={14} weight="bold" />
                <span>Nueva Tarea</span>
              </button>
            </div>
          </div>

          {/* Archived notice if day is past and locked */}
          {isCurrentDateLocked && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
              <span>
                Día archivado: Esta fecha finalizó y está en modo solo lectura para proteger tu registro histórico.
              </span>
              <button
                onClick={() => unlockDate(selectedDate)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors shrink-0"
              >
                Habilitar edición
              </button>
            </div>
          )}

          {/* Dual Board: Pending & Completed Tasks with Smooth Animated Transition */}
          <motion.div
            key={`${currentAgendaId}_${selectedDate}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            <DualTaskBoard
              pendingTasks={pendingTasks}
              doneTasks={doneTasks}
              onToggleTask={toggleTask}
              onDeleteTask={(id) => deleteTask(id)}
            />
          </motion.div>

          {/* Footer stats & Markdown Log Tools */}
          <FooterActions
            currentAgenda={currentAgenda}
            selectedDate={selectedDate}
            tasks={filteredTasks}
            onClearCompleted={clearCompleted}
            onOpenMarkdownEditor={() => setIsMarkdownModalOpen(true)}
          />
        </main>
      </div>

      {/* Task Form Modal (Pop up for creating tasks on mobile & desktop) */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        selectedDate={selectedDate}
        agendaName={currentAgenda?.name || 'Agenda'}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={addTask}
      />

      {/* Modals */}
      <NewAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        onSave={createAgenda}
      />

      <NewDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
          setIsDateModalOpen(false);
        }}
      />

      <MarkdownEditorModal
        isOpen={isMarkdownModalOpen}
        currentAgenda={currentAgenda}
        selectedDate={selectedDate}
        tasks={filteredTasks}
        onClose={() => setIsMarkdownModalOpen(false)}
        onSaveMarkdown={saveMarkdownTasks}
      />
    </div>
  );
};