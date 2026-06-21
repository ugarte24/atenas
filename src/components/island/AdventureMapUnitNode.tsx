import { motion } from 'framer-motion';
import { Check, Crown, Lock } from 'lucide-react';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { AdventureMapNodeStars } from './AdventureMapNodeStars';
import { cn } from '../ui/cn';

type Props = {
  node: AdventureMapNode;
  selected: boolean;
  celebrate: boolean;
  onSelect: () => void;
  label: string;
  minimalOverlay?: boolean;
};

const WORLD_COLOR: Record<1 | 2 | 3, string> = {
  1: '#059669',
  2: '#0284c7',
  3: '#d97706',
};

const WORLD_DARK: Record<1 | 2 | 3, string> = {
  1: '#047857',
  2: '#0369a1',
  3: '#b45309',
};

const WORLD_RING: Record<1 | 2 | 3, string> = {
  1: 'ring-emerald-300',
  2: 'ring-sky-300',
  3: 'ring-amber-300',
};

export function AdventureMapUnitNode({
  node,
  selected,
  celebrate,
  onSelect,
  label,
  minimalOverlay = false,
}: Props) {
  const { reduceMotion } = useMotionSafe();
  const { status, worldId, unitNumber, stars } = node;
  const color = WORLD_COLOR[worldId];
  const dark = WORLD_DARK[worldId];
  const locked = status === 'locked';
  const isPerfect = status === 'perfect';
  const isCompleted = status === 'completed' || isPerfect;

  return (
    <motion.button
      type="button"
      data-node-id={node.id}
      onClick={locked ? undefined : onSelect}
      disabled={locked}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        'relative z-30 flex flex-col items-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2 rounded-full',
        locked && 'cursor-not-allowed opacity-85'
      )}
      style={{ touchAction: 'manipulation' }}
      animate={
        reduceMotion || locked || selected
          ? undefined
          : status === 'available'
            ? { y: [0, -5, 0] }
            : undefined
      }
      transition={
        reduceMotion ? undefined : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
      }
      whileTap={locked || reduceMotion ? undefined : { scale: 0.9 }}
      whileHover={locked || reduceMotion ? undefined : { scale: 1.05 }}
    >
      {celebrate && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-amber-300/50 blur-md"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.8 }}
          aria-hidden
        />
      )}

      {/* Sombra en el terreno */}
      <span
        className="absolute top-[3.2rem] sm:top-[3.8rem] w-14 h-3 sm:w-16 rounded-full bg-black/25 blur-[2px]"
        aria-hidden
      />

      {/* Base de piedra */}
      <span
        className="absolute top-[2.6rem] sm:top-[3rem] w-12 h-3 sm:w-14 rounded-[50%] border border-white/20"
        style={{
          background: locked
            ? 'linear-gradient(180deg, #94a3b8 0%, #64748b 100%)'
            : `linear-gradient(180deg, ${color}99 0%, ${dark} 100%)`,
        }}
        aria-hidden
      />

      <span
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'border-[3px] border-white/90 font-bold text-lg',
          'shadow-[0_6px_0_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.2)]',
          minimalOverlay ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-[3.4rem] w-[3.4rem] sm:h-16 sm:w-16',
          selected && `ring-4 ${WORLD_RING[worldId]}`,
          status === 'available' && !reduceMotion && 'shadow-[0_6px_0_rgba(0,0,0,0.15),0_0_24px_rgba(251,191,36,0.55)]'
        )}
        style={{
          background: locked
            ? 'linear-gradient(165deg, #cbd5e1 0%, #64748b 55%, #475569 100%)'
            : isCompleted
              ? 'linear-gradient(165deg, #fde047 0%, #f59e0b 55%, #d97706 100%)'
              : `linear-gradient(165deg, ${color} 0%, ${dark} 100%)`,
          color: locked ? 'white' : isCompleted ? '#002d62' : 'white',
        }}
      >
        {/* Brillo superior 3D */}
        <span
          className="absolute inset-1 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(180deg, white 0%, transparent 55%)',
          }}
          aria-hidden
        />

        {locked ? (
          <Lock className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} aria-hidden />
        ) : isCompleted ? (
          isPerfect ? (
            <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-800" aria-hidden />
          ) : (
            <Check className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} aria-hidden />
          )
        ) : (
          <span className="drop-shadow-sm">{unitNumber}</span>
        )}
      </span>

      {!locked && <AdventureMapNodeStars stars={stars} />}
    </motion.button>
  );
}
