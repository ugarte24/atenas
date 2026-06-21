import { motion } from 'framer-motion';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { AdventureMapChestSprite } from './AdventureMapChestSprite';
import { cn } from '../ui/cn';

type Props = {
  node: AdventureMapNode;
  selected: boolean;
  opening?: boolean;
  onOpenComplete?: () => void;
  onSelect: () => void;
  minimalOverlay?: boolean;
};

export function AdventureMapChest({
  node,
  selected,
  opening,
  onOpenComplete,
  onSelect,
  minimalOverlay = false,
}: Props) {
  const { reduceMotion } = useMotionSafe();
  const locked = node.status === 'locked';
  const opened = node.status === 'completed';

  return (
    <motion.button
      type="button"
      data-node-id={node.id}
      onClick={locked ? undefined : onSelect}
      disabled={locked}
      aria-label={opened ? 'Cofre abierto' : locked ? 'Cofre bloqueado' : 'Cofre disponible'}
      aria-pressed={selected}
      className={cn(
        'relative z-30 flex flex-col items-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl',
        locked && 'cursor-not-allowed',
        minimalOverlay && locked && 'opacity-75'
      )}
      animate={
        reduceMotion || locked || opened || opening
          ? undefined
          : node.status === 'available'
            ? { rotate: [0, -3, 3, -3, 0], scale: [1, 1.04, 1] }
            : undefined
      }
      transition={
        reduceMotion ? undefined : { duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }
      }
      whileTap={locked ? undefined : { scale: 0.92 }}
    >
      {!locked && node.status === 'available' && !reduceMotion && !opening && (
        <motion.span
          className="absolute -inset-2 rounded-full bg-amber-300/40 blur-md"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden
        />
      )}

      <AdventureMapChestSprite
        closed={!opened && !opening}
        playOpen={opening}
        onOpenComplete={onOpenComplete}
        className={cn(
          selected && 'ring-2 ring-amber-300 rounded-lg',
          minimalOverlay && 'scale-75'
        )}
      />

      {!(minimalOverlay && locked) && (
        <span className="mt-0.5 text-[9px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase tracking-wide">
          {opened ? 'Abierto' : locked ? 'Bloqueado' : opening ? 'Abriendo…' : 'Cofre'}
        </span>
      )}
    </motion.button>
  );
}
