import type { AppState } from '../types';
import { getTodayString } from './date';

const STORAGE_KEY = 'app_todo_obsidian_v2';

export const initialDefaultState: AppState = {
  agendas: [
    { id: 'agenda_tesis', name: 'TESIS', createdAt: new Date().toISOString() },
    { id: 'agenda_trabajo', name: 'TRABAJO ENCARGADO CC', createdAt: new Date().toISOString() }
  ],
  currentAgendaId: 'agenda_tesis',
  selectedDate: getTodayString(),
  unlockedDates: [],
  tasks: [
    {
      id: 't_demo_1',
      agendaId: 'agenda_tesis',
      date: getTodayString(),
      title: 'Redactar introducción y planteamiento del problema',
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 't_demo_2',
      agendaId: 'agenda_tesis',
      date: getTodayString(),
      title: 'Descargar 5 artículos científicos de referencia (2024-2026)',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 't_demo_3',
      agendaId: 'agenda_tesis',
      date: getTodayString(),
      title: 'Revisar formato y normas de citación APA',
      priority: 'low',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ]
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialDefaultState;
    const parsed: AppState = JSON.parse(raw);
    const today = getTodayString();
    if (!parsed.selectedDate) parsed.selectedDate = today;
    return parsed;
  } catch {
    return initialDefaultState;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state', err);
  }
}