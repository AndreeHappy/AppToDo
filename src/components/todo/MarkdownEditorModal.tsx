import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FloppyDisk, FileText, ArrowClockwise, Check } from '@phosphor-icons/react';
import type { Task, Priority, Agenda } from '../../types';
import { formatDisplayDate } from '../../utils/date';

interface Props {
  isOpen: boolean;
  currentAgenda: Agenda;
  selectedDate: string;
  tasks: Task[];
  onClose: () => void;
  onSaveMarkdown: (newTasks: Task[]) => void;
}

export const MarkdownEditorModal: React.FC<Props> = ({
  isOpen,
  currentAgenda,
  selectedDate,
  tasks,
  onClose,
  onSaveMarkdown,
}) => {
  const [content, setContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generate Markdown representation from tasks
  const generateMarkdownFromTasks = (taskList: Task[]): string => {
    let md = `# 📅 ${currentAgenda.name} — ${formatDisplayDate(selectedDate)}\n\n`;
    md += `### 📝 Tareas Pendientes\n`;
    const pending = taskList.filter((t) => !t.completed);
    if (pending.length === 0) {
      md += `- [ ] [Verde] Escribe tu primera tarea aquí...\n`;
    } else {
      pending.forEach((t) => {
        const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
        md += `- [ ] ${tag} ${t.title}\n`;
      });
    }

    md += `\n### ✅ Tareas Hechas\n`;
    const done = taskList.filter((t) => t.completed);
    if (done.length > 0) {
      done.forEach((t) => {
        const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
        md += `- [x] ${tag} ${t.title}\n`;
      });
    }
    return md;
  };

  useEffect(() => {
    if (isOpen) {
      setContent(generateMarkdownFromTasks(tasks));
      setSavedSuccess(false);
    }
  }, [isOpen, tasks, currentAgenda, selectedDate]);

  // Parse Markdown lines back into Task objects
  const parseMarkdownToTasks = (mdText: string): Task[] => {
    const lines = mdText.split('\n');
    const parsed: Task[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      // Match task checkboxes: - [ ] or - [x] or * [ ] or * [x]
      const match = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
      if (match) {
        const isDone = match[1].toLowerCase() === 'x';
        let titleRaw = match[2].trim();
        if (!titleRaw) return;

        let priority: Priority = 'medium';

        // Detect priority tags
        if (titleRaw.includes('🔴') || /\[rojo\]/i.test(titleRaw) || /#urgente/i.test(titleRaw)) {
          priority = 'high';
          titleRaw = titleRaw.replace(/🔴|\[rojo\]|#urgente/gi, '').trim();
        } else if (titleRaw.includes('🟡') || /\[amarillo\]/i.test(titleRaw) || /#importante/i.test(titleRaw)) {
          priority = 'medium';
          titleRaw = titleRaw.replace(/🟡|\[amarillo\]|#importante/gi, '').trim();
        } else if (titleRaw.includes('🟢') || /\[verde\]/i.test(titleRaw) || /#rapida|#baja/i.test(titleRaw)) {
          priority = 'low';
          titleRaw = titleRaw.replace(/🟢|\[verde\]|#rapida|#baja/gi, '').trim();
        }

        if (titleRaw) {
          parsed.push({
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            agendaId: currentAgenda.id,
            date: selectedDate,
            title: titleRaw,
            priority,
            completed: isDone,
            createdAt: new Date().toISOString(),
            completedAt: isDone ? new Date().toISOString() : null,
          });
        }
      }
    });

    return parsed;
  };

  const handleSave = () => {
    const newTasks = parseMarkdownToTasks(content);
    onSaveMarkdown(newTasks);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetToCurrent = () => {
    setContent(generateMarkdownFromTasks(tasks));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#131520] border border-white/[0.1] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Editor e Importador Markdown
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Edita manualmente o pega tus listas de Obsidian / Notion
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Syntax Help Pill */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between gap-2 flex-wrap font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-300 font-bold">Sintaxis:</span>
                <span>`- [ ] [Rojo] Tarea urgente`</span>
                <span>`- [ ] [Amarillo] Tarea importante`</span>
                <span>`- [x] [Verde] Tarea lista`</span>
              </div>
              <button
                onClick={handleResetToCurrent}
                title="Restaurar al estado actual"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans font-semibold text-xs"
              >
                <ArrowClockwise size={13} />
                <span>Restablecer</span>
              </button>
            </div>

            {/* Markdown Textarea */}
            <div className="flex flex-col flex-1 min-h-[260px]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="- [ ] [Rojo] Escribe o pega tus tareas aquí..."
                rows={12}
                className="w-full h-full p-4 rounded-2xl bg-[#0d0e14] border border-zinc-800 focus:border-indigo-500/80 font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed transition-colors selection:bg-indigo-500/30"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Al guardar, se actualizarán las tareas del día en tu pantalla y en la base de datos.
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  {savedSuccess ? (
                    <>
                      <Check size={14} weight="bold" />
                      <span>¡Aplicado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={14} weight="bold" />
                      <span>Guardar y Aplicar Tareas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};