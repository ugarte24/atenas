import { motion } from 'framer-motion';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { ADVENTURE_WORLD_ZONES } from '../../lib/adventureMapLayout';
import { ADVENTURE_MAP_VIEWBOX } from '../../lib/adventureMapTypes';

const WORLD_GRADIENTS: Record<1 | 2 | 3, [string, string]> = {
  1: ['#0c4a6e', '#059669'],
  2: ['#0369a1', '#0284c7'],
  3: ['#b45309', '#f59e0b'],
};

export function AdventureMapBackdrop() {
  const { reduceMotion } = useMotionSafe();
  const { width, height } = ADVENTURE_MAP_VIEWBOX;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        {ADVENTURE_WORLD_ZONES.map((z) => (
          <linearGradient key={z.worldId} id={`world-bg-${z.worldId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={WORLD_GRADIENTS[z.worldId][0]} />
            <stop offset="100%" stopColor={WORLD_GRADIENTS[z.worldId][1]} stopOpacity="0.85" />
          </linearGradient>
        ))}
      </defs>

      {ADVENTURE_WORLD_ZONES.map((z) => (
        <rect
          key={z.worldId}
          x={0}
          y={z.yStart}
          width={width}
          height={z.yEnd - z.yStart}
          fill={`url(#world-bg-${z.worldId})`}
        />
      ))}

      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M 0 ${2600 + i * 80} Q 100 ${2560 + i * 60} 200 ${2610 + i * 80} T 400 ${2580 + i * 80} V ${height} H 0 Z`}
          fill={`rgba(255,255,255,${0.12 - i * 0.03})`}
          animate={reduceMotion ? undefined : { x: [0, i % 2 ? -8 : 8, 0] }}
          transition={
            reduceMotion ? undefined : { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ))}

      {[80, 200, 320].map((cx, i) => (
        <ellipse key={cx} cx={cx} cy={120 + i * 900} rx={60} ry={18} fill="white" opacity={0.15} />
      ))}
    </svg>
  );
}
