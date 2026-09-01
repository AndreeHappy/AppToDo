import React, { useState, useEffect, useRef } from 'react';

interface Props {
  value: string; // e.g. "15.00" or ""
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  required?: boolean;
}

export const CurrencyInput: React.FC<Props> = ({
  value,
  onChange,
  className = '',
  autoFocus = false,
  id,
  required = false,
}) => {
  // Convert initial string to integer cents (e.g. "15.00" -> 1500)
  const parseToCents = (valStr: string): number => {
    if (!valStr) return 0;
    const clean = valStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  };

  const [cents, setCents] = useState<number>(() => parseToCents(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsed = parseToCents(value);
    if (parsed !== cents) {
      setCents(parsed);
    }
  }, [value]);

  const formatDisplay = (centsVal: number): string => {
    return (centsVal / 100).toFixed(2);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const digit = parseInt(e.key, 10);
      // Limit to 999,999.99 (99,999,999 cents)
      if (cents < 99999999) {
        const nextCents = cents * 10 + digit;
        setCents(nextCents);
        onChange((nextCents / 100).toFixed(2));
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const nextCents = Math.floor(cents / 10);
      setCents(nextCents);
      onChange(nextCents === 0 ? '' : (nextCents / 100).toFixed(2));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      setCents(0);
      onChange('');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab' || e.key === 'Enter') {
      // allow default browser navigation
    } else {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const clean = text.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num) && num >= 0) {
      const nextCents = Math.min(99999999, Math.round(num * 100));
      setCents(nextCents);
      onChange((nextCents / 100).toFixed(2));
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <span className="absolute left-3.5 text-zinc-500 font-mono text-xs select-none pointer-events-none">
        S/.
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={formatDisplay(cents)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={() => {}} // Controlled by onKeyDown for exact right-to-left ATM behavior
        autoFocus={autoFocus}
        required={required}
        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 font-mono text-sm text-white outline-none transition-colors select-all ${className}`}
      />
    </div>
  );
};