import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Task, Agenda, Priority } from '../types';
import { getTodayString } from '../utils/date';

interface TodoContextType {
  agendas: Agenda[];
  currentAgendaId: string;
  selectedDate: string;
  unlockedDates: string[];
  tasks: Task[];
  todayPendingCount: number;
  setCurrentAgendaId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  createAgenda: (name: string) => void;
  deleteAgenda: (id: string) => void;
  addTask: (title: string, priority: Priority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  saveMarkdownTasks: (parsedTasks: Task[]) => void;
  unlockDate: (date: string) => void;
  copyYesterdayPending: () => boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'app_todo_obsidian_v4';

const INITIAL_AGENDAS: Agenda[] = [
  { id: 'agenda_tesis', name: 'TESIS', createdAt: new Date().toISOString() },
  { id: 'agenda_trabajo', name: 'TRABAJO ENCARGADO CC', createdAt: new Date().toISOString() },
];

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = getTodayString();

  const [agendas, setAgendas] = useState<Agenda[]>(INITIAL_AGENDAS);
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

  // Automatic rollover: ensure any uncompleted task from previous dates is carried forward to today
  const rolloverPendingTasks = useCallback((taskList: Task[]): Task[] => {
    const todayStr = getTodayString();
    return taskList.map((t) => {
      // If a task is pending and was assigned to a past date, advance it to today
      if (t.date < todayStr && !t.completed) {
        return {
          ...t,
          date: todayStr,
        };
      }
      return t;
    });
  }, []);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.agendas && parsed.agendas.length > 0) setAgendas(parsed.agendas);
        if (parsed.currentAgendaId) setCurrentAgendaId(parsed.currentAgendaId);
        if (parsed.unlockedDates) setUnlockedDates(parsed.unlockedDates);
        if (parsed.tasks) {
          const rolled = rolloverPendingTasks(parsed.tasks);
          setTasks(rolled);
        }
      } catch (e) {
        console.error('Error loading todo state from localStorage:', e);
      }
    }
  }, [rolloverPendingTasks]);

  // 2. Sync to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ agendas, currentAgendaId, tasks, unlockedDates })
    );
  }, [agendas, currentAgendaId, tasks, unlockedDates]);

  // Real pending task count for today across all agendas
  const todayPendingCount = useMemo(() => {
    return tasks.filter((t) => (t.date === today || t.date < today) && !t.completed).length;
  }, [tasks, today]);

  const createAgenda = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const newId = `agenda_${Date.now()}`;
    const newAgenda = { id: newId, name: cleanName, createdAt: new Date().toISOString() };
    setAgendas((prev) => [...prev, newAgenda]);
    setCurrentAgendaId(newId);
  };

  const deleteAgenda = (agendaId: string) => {
    setAgendas((prev) => prev.filter((a) => a.id !== agendaId));
    setTasks((prev) => prev.filter((t) => t.agendaId !== agendaId));
    if (currentAgendaId === agendaId) {
      setCurrentAgendaId(agendas.find((a) => a.id !== agendaId)?.id || 'agenda_tesis');
    }
  };

  const addTask = (title: string, priority: Priority) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      agendaId: currentAgendaId,
      date: selectedDate,
      title: title.trim(),
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (taskId: string) => {
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

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const clearCompleted = () => {
    setTasks((prev) =>
      prev.filter((t) => !(t.agendaId === currentAgendaId && t.date === selectedDate && t.completed))
    );
  };

  const saveMarkdownTasks = (parsedTasks: Task[]) => {
    setTasks((prev) => {
      const others = prev.filter((t) => !(t.agendaId === currentAgendaId && t.date === selectedDate));
      return [...others, ...parsedTasks];
    });
  };

  const unlockDate = (date: string) => {
    setUnlockedDates((prev) => (prev.includes(date) ? prev : [...prev, date]));
  };

  const copyYesterdayPending = (): boolean => {
    const pastPending = tasks.filter(
      (t) => t.agendaId === currentAgendaId && t.date < today && !t.completed
    );
    if (pastPending.length === 0) return false;

    setTasks((prev) => {
      return prev.map((t) => {
        if (t.agendaId === currentAgendaId && t.date < today && !t.completed) {
          return { ...t, date: today };
        }
        return t;
      });
    });

    return true;
  };

  return (
    <TodoContext.Provider
      value={{
        agendas,
        currentAgendaId,
        selectedDate,
        unlockedDates,
        tasks,
        todayPendingCount,
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
        copyYesterdayPending,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};