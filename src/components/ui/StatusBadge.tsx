import React from 'react';

interface Props {
  isMockMode: boolean;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ isMockMode, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/60 border border-white/[0.08] backdrop-blur-md text-zinc-300 shadow-xs ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isMockMode ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isMockMode ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
      </span>
      <span className="text-[11px] font-medium tracking-wide text-zinc-300">
        {isMockMode ? 'Modo Local' : 'En Línea / Sincronizado'}
      </span>
    </div>
  );
};