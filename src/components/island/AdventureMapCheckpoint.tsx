import { motion } from 'framer-motion';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { IsometricPortal } from './AdventureMapIslandIllustration';
import { cn } from '../ui/cn';

type Props = {
  node: AdventureMapNode;
  selected: boolean;
  onSelect: () => void;
};

export function AdventureMapCheckpoint({ node, selected, onSelect }: Props) {
  const { reduceMotion } = useMotionSafe();
  const locked = node.status === 'locked';
  const done = node.status === 'completed';

  return (
    <motion.button
      type="button"
      data-node-id={node.id}
      onClick={onSelect}
      aria-label={locked ? 'Checkpoint bloqueado' : done ? 'Checkpoint superado' : 'Checkpoint disponible'}
      aria-pressed={selected}
      className={cn(
        'relative z-30 flex flex-col items-center -translate-x-1/2 -translate-y-1/2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded-xl'
      )}
      whileTap={{ scale: 0.94 }}
      animate={reduceMotion || locked ? undefined : { scale: done ? 1 : [1, 1.03, 1] }}
      transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity }}
    >
      {!locked && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: done ? 'rgba(52,211,153,0.3)' : 'rgba(167,139,250,0.35)' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          aria-hidden
        />
      )}

      <svg
        viewBox="-36 -32 72 80"
        className={cn(
          'w-[4.5rem] h-[5rem] sm:w-20 sm:h-[5.5rem] drop-shadow-xl',
          selected && 'ring-2 ring-violet-200 rounded-lg'
        )}
      >
        <IsometricPortal locked={locked} />
      </svg>

      <span className="mt-0.5 text-[9px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase tracking-wide">
        {locked ? 'Portal' : done ? 'Superado' : 'Portal'}
      </span>
    </motion.button>
  );
}
