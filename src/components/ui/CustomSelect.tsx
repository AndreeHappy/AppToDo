import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

interface Props {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  icon,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative select-none ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'border-indigo-500 shadow-sm shadow-indigo-500/20' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <span className="text-white font-medium truncate flex items-center gap-1.5">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </div>
        <CaretDown
          size={14}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-[#0e1017] border border-white/[0.12] shadow-2xl p-1 z-50 flex flex-col gap-0.5 backdrop-blur-2xl"
          >
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                    {option.subtitle && (
                      <span className="text-[10px] text-zinc-500 font-normal">
                        ({option.subtitle})
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} weight="bold" className="text-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};