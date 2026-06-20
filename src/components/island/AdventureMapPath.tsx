import { motion } from 'framer-motion';
import type { AdventureMapNode, AdventureMapWorldZone } from '../../lib/adventureMapTypes';
import { ADVENTURE_SCENE } from '../../lib/adventureMapTypes';
import { buildWorldPath } from '../../lib/adventureMapLayout';
import { isPaintedWorld } from '../../lib/paintedWorldLayout';
import { useMotionSafe } from '../../hooks/useMotionSafe';

type Props = {
  nodes: AdventureMapNode[];
  zone: AdventureMapWorldZone;
};

export function AdventureMapPath({ nodes, zone }: Props) {
  const { reduceMotion } = useMotionSafe();
  const sceneHeight = zone.yEnd - zone.yStart;
  const pathD = buildWorldPath(zone.worldId, nodes, zone);
  const integrated = isPaintedWorld(zone.worldId);

  const worldNodes = nodes.filter((n) => n.position.y >= zone.yStart && n.position.y < zone.yEnd);
  const activeIndex = worldNodes.findIndex((n) => n.status === 'available');
  const completedCount = worldNodes.filter(
    (n) => n.status === 'completed' || n.status === 'perfect'
  ).length;
  const progressRatio = completedCount / Math.max(worldNodes.length - 1, 1);

  return (
    <svg
      viewBox={`0 0 ${ADVENTURE_SCENE.width} ${sceneHeight}`}
      className="absolute inset-0 h-full w-full pointer-events-none z-10"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id={`path-shadow-${zone.worldId}`}>
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#451a03" floodOpacity="0.35" />
        </filter>
        <filter id={`path-glow-${zone.worldId}`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {!integrated && (
        <>
          <path
            d={pathD}
            stroke="#000"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.12"
            transform="translate(0 3)"
          />
          <motion.path
            d={pathD}
            stroke="#8b6914"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.45}
            filter={`url(#path-shadow-${zone.worldId})`}
          />
          <motion.path
            d={pathD}
            stroke="#d4b896"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Progreso — sutil sobre sendero integrado (Convivencia) o encima del camino (otros) */}
      <motion.path
        d={pathD}
        stroke={integrated ? '#4ade80' : '#86efac'}
        strokeWidth={integrated ? 6 : 8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={integrated ? 0.55 : 1}
        filter={integrated ? `url(#path-glow-${zone.worldId})` : undefined}
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: progressRatio }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
      />

      {!reduceMotion && activeIndex >= 0 && (
        <motion.path
          d={pathD}
          stroke="#fbbf24"
          strokeWidth={integrated ? 4 : 5}
          fill="none"
          strokeDasharray="10 14"
          strokeLinecap="round"
          opacity={integrated ? 0.75 : 1}
          animate={{ strokeDashoffset: [0, -24] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          style={{ pathLength: Math.min(progressRatio + 0.15, 1) }}
        />
      )}
    </svg>
  );
}
