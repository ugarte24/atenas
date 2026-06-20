import { motion } from 'framer-motion';
import type { WorldId } from '../../lib/adventureMapTypes';
import { useMotionSafe } from '../../hooks/useMotionSafe';

type Props = { worldId: WorldId };

const SKY: Record<WorldId, [string, string, string]> = {
  1: ['#7dd3fc', '#bae6fd', '#ecfdf5'],
  2: ['#93c5fd', '#dbeafe', '#ecfccb'],
  3: ['#fb923c', '#fde047', '#c084fc'],
};

export function AdventureMapSceneSky({ worldId }: Props) {
  const { reduceMotion } = useMotionSafe();
  const [top, mid, bottom] = SKY[worldId];

  return (
    <svg
      viewBox="0 0 400 980"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sky-${worldId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="45%" stopColor={mid} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`sun-${worldId}`} cx="75%" cy="12%" r="35%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="980" fill={`url(#sky-${worldId})`} />
      <ellipse cx="300" cy="100" rx="90" ry="90" fill={`url(#sun-${worldId})`} />

      {/* Montañas lejanas */}
      {worldId === 2 && (
        <path
          d="M 0 320 L 80 180 L 160 260 L 240 140 L 320 220 L 400 160 L 400 380 L 0 380 Z"
          fill="#64748b"
          opacity="0.35"
        />
      )}
      {worldId === 3 && (
        <>
          <path
            d="M 0 300 L 100 200 L 200 280 L 300 180 L 400 240 L 400 360 L 0 360 Z"
            fill="#7c2d12"
            opacity="0.25"
          />
          <rect width="400" height="980" fill="url(#sun-3)" opacity="0.15" />
        </>
      )}

      {/* Nubes */}
      {[
        { cx: 70, cy: 80, rx: 48, ry: 18, delay: 0 },
        { cx: 260, cy: 130, rx: 56, ry: 20, delay: 1.2 },
        { cx: 160, cy: 200, rx: 40, ry: 14, delay: 0.6 },
        { cx: 330, cy: 60, rx: 36, ry: 12, delay: 2 },
      ].map((c, i) => (
        <motion.g
          key={i}
          animate={reduceMotion ? undefined : { x: [0, i % 2 ? 12 : -12, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 8 + c.delay, repeat: Infinity, ease: 'easeInOut', delay: c.delay }
          }
        >
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="white" opacity="0.55" />
          <ellipse cx={c.cx - 20} cy={c.cy + 4} rx={c.rx * 0.55} ry={c.ry * 0.8} fill="white" opacity="0.45" />
          <ellipse cx={c.cx + 22} cy={c.cy + 2} rx={c.rx * 0.5} ry={c.ry * 0.75} fill="white" opacity="0.5" />
        </motion.g>
      ))}
    </svg>
  );
}
