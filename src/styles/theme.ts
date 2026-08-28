/**
 * UI / UX Design System Tokens & Classes
 * Refined Obsidian Dark Palette with subtle glassmorphism and refraction borders.
 */

export const THEME = {
  colors: {
    bg: {
      app: 'bg-[#090a0f]',
      surface: 'bg-[#11131a]',
      surfaceElevated: 'bg-[#141622]',
      surfaceHover: 'hover:bg-zinc-800/40',
      input: 'bg-zinc-900/80',
    },
    borders: {
      subtle: 'border-white/[0.08]',
      highlight: 'border-indigo-500/40',
      emerald: 'border-emerald-500/40',
      rose: 'border-rose-500/40',
      amber: 'border-amber-500/40',
    },
  },
  components: {
    card: 'rounded-3xl bg-[#11131a] border border-white/[0.08] p-6 shadow-xl transition-all',
    cardInteractive: 'rounded-3xl bg-[#11131a] border border-white/[0.08] hover:border-indigo-500/50 p-6 shadow-xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] transition-all cursor-pointer',
    input: 'w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors',
    select: 'w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs sm:text-sm text-white outline-none [color-scheme:dark] transition-colors',
    buttonPrimary: 'px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5',
    buttonEmerald: 'px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5',
    buttonGhost: 'px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors',
  },
  animations: {
    springModal: { type: 'spring', stiffness: 340, damping: 26 },
    springCard: { type: 'spring', stiffness: 280, damping: 24 },
    springTab: { type: 'spring', stiffness: 350, damping: 28 },
  },
};