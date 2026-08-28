import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Broom, FileCode } from '@phosphor-icons/react';
import type { Task, Agenda } from '../../types';
import { formatDisplayDate } from '../../utils/date';

interface Props {
  currentAgenda: Agenda;
  selectedDate: string;
  tasks: Task[];
  onClearCompleted: () => void;
  onOpenMarkdownEditor: () => void;
}

export const FooterActions: React.FC<Props> = ({
  currentAgenda,
  selectedDate,
  tasks,
  onClearCompleted,
  onOpenMarkdownEditor,
}) => {
  const [copied, setCopied] = useState(false);

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const copyMarkdown = () => {
    let md = `# 📅 ${currentAgenda.name} — ${formatDisplayDate(selectedDate)}\n\n`;
    md += `### 📝 Tareas Pendientes\n`;
    const pending = tasks.filter((t) => !t.completed);
    if (pending.length === 0) {
      md += `*Sin tareas pendientes*\n`;
    } else {
      pending.forEach((t) => {
        const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
        md += `- [ ] ${tag} ${t.title}\n`;
      });
    }

    md += `\n### ✅ Tareas Hechas\n`;
    const done = tasks.filter((t) => t.completed);
    if (done.length === 0) {
      md += `*Sin tareas completadas*\n`;
    } else {
      done.forEach((t) => {
        const tag = t.priority === 'high' ? '[Rojo]' : t.priority === 'medium' ? '[Amarillo]' : '[Verde]';
        md += `- [x] ${tag} ${t.title}\n`;
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <footer className="mt-auto pt-4 pb-2 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap select-none">
      {/* Progress */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="w-24 sm:w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {pct}% ({doneCount}/{total})
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {doneCount > 0 && (
          <button
            onClick={onClearCompleted}
            title="Eliminar solo las tareas hechas de este día"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-colors flex items-center gap-1"
          >
            <Broom size={13} />
            <span className="hidden sm:inline">Limpiar hechas</span>
          </button>
        )}

        <button
          onClick={onOpenMarkdownEditor}
          title="Editar o pegar tareas directamente en formato Markdown"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-zinc-700 hover:border-indigo-500/50 transition-all flex items-center gap-1.5 active:scale-[0.98]"
        >
          <FileCode size={14} weight="bold" />
          <span>Editar / Importar MD</span>
        </button>

        <button
          onClick={copyMarkdown}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 active:scale-[0.98] ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
          }`}
        >
          {copied ? (
            <>
              <Check size={14} weight="bold" className="text-emerald-400" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar MD</span>
            </>
          )}
        </button>
      </div>
    </footer>
  );
};