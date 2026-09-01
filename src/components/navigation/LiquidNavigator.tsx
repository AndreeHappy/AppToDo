import React from 'react';
import { motion } from 'framer-motion';
import {
  House,
  ListChecks,
  TrendUp,
  Plus,
  User,
  Gear,
} from '@phosphor-icons/react';
import type { ActiveModule } from '../../types';

interface Props {
  activeModule: ActiveModule;
  onSelectModule: (mod: ActiveModule) => void;
  onQuickAction: () => void;
}

export const LiquidNavigator: React.FC<Props> = ({
  activeModule,
  onSelectModule,
  onQuickAction,
}) => {
  const isModuleActive = activeModule === 'todo' || activeModule === 'finance';

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none">
      <div className="pointer-events-auto relative w-full max-w-md bg-[#11131a] border border-white/[0.12] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] px-3 py-2 flex items-center justify-around transition-colors">
        {/* Item 1: Hub */}
        <button
          onClick={() => onSelectModule('hub')}
          className="relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all group"
        >
          {activeModule === 'hub' ? (
            <motion.div
              layoutId="liquid-active-bubble"
              className="absolute -top-4 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-[0_6px_20px_rgba(99,102,241,0.45)] flex items-center justify-center border-2 border-[#11131a]"
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <House size={20} weight="fill" />
            </motion.div>
          ) : (
            <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
              <House size={20} />
            </div>
          )}
          <span className={`text-[10px] font-bold tracking-tight mt-auto ${activeModule === 'hub' ? 'text-indigo-400' : 'text-zinc-400'}`}>
            Hub
          </span>
        </button>

        {/* Item 2: Alternar Módulos (To-Do / Finanzas) */}
        <button
          onClick={() => onSelectModule(activeModule === 'todo' ? 'finance' : 'todo')}
          className="relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all group"
        >
          {activeModule === 'todo' ? (
            <motion.div
              layoutId="liquid-active-bubble"
              className="absolute -top-4 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-[0_6px_20px_rgba(99,102,241,0.45)] flex items-center justify-center border-2 border-[#11131a]"
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <ListChecks size={20} weight="bold" />
            </motion.div>
          ) : activeModule === 'finance' ? (
            <motion.div
              layoutId="liquid-active-bubble"
              className="absolute -top-4 w-11 h-11 rounded-full bg-emerald-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.45)] flex items-center justify-center border-2 border-[#11131a]"
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <TrendUp size={20} weight="bold" />
            </motion.div>
          ) : (
            <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
              <ListChecks size={20} />
            </div>
          )}
          <span className={`text-[10px] font-bold tracking-tight mt-auto ${
            activeModule === 'todo'
              ? 'text-indigo-400'
              : activeModule === 'finance'
              ? 'text-emerald-400'
              : 'text-zinc-400'
          }`}>
            {activeModule === 'todo' ? 'To-Do' : activeModule === 'finance' ? 'Finanzas' : 'Módulos'}
          </span>
        </button>

        {/* Item 3: Acción Central Prominente (+) — SÓLO en módulos de trabajo */}
        {isModuleActive && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onQuickAction}
            title={activeModule === 'finance' ? 'Registrar Movimiento' : 'Agregar Tarea'}
            className="relative -top-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-[0_8px_20px_rgba(99,102,241,0.4)] flex items-center justify-center transition-transform active:scale-95 group border-2 border-[#11131a]"
          >
            <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-200" />
          </motion.button>
        )}

        {/* Item 4: Perfil */}
        <button
          onClick={() => onSelectModule('profile')}
          className="relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all group"
        >
          {activeModule === 'profile' ? (
            <motion.div
              layoutId="liquid-active-bubble"
              className="absolute -top-4 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-[0_6px_20px_rgba(99,102,241,0.45)] flex items-center justify-center border-2 border-[#11131a]"
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <User size={20} weight="bold" />
            </motion.div>
          ) : (
            <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
              <User size={20} />
            </div>
          )}
          <span className={`text-[10px] font-bold tracking-tight mt-auto ${activeModule === 'profile' ? 'text-indigo-400' : 'text-zinc-400'}`}>
            Perfil
          </span>
        </button>

        {/* Item 5: Ajustes */}
        <button
          onClick={() => onSelectModule('settings')}
          className="relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all group"
        >
          {activeModule === 'settings' ? (
            <motion.div
              layoutId="liquid-active-bubble"
              className="absolute -top-4 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-[0_6px_20px_rgba(99,102,241,0.45)] flex items-center justify-center border-2 border-[#11131a]"
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <Gear size={20} weight="bold" />
            </motion.div>
          ) : (
            <div className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
              <Gear size={20} />
            </div>
          )}
          <span className={`text-[10px] font-bold tracking-tight mt-auto ${activeModule === 'settings' ? 'text-indigo-400' : 'text-zinc-400'}`}>
            Ajustes
          </span>
        </button>
      </div>
    </div>
  );
};