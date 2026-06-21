import type { WorldId } from '../../lib/adventureMapTypes';
import { ADVENTURE_SCENE } from '../../lib/adventureMapTypes';
import { SCENE_PRESERVE_ASPECT } from '../../lib/adventureMapCoords';
import { getWorldLayout } from '../../lib/worldLayout';
import { cn } from '../ui/cn';

type Props = {
  worldId: WorldId;
  className?: string;
};

/** Fallback SVG alineado a WORLD_LAYOUT (mismo viewBox que WebP y nodos). */
export function AdventureMapWorldLayoutFallback({ worldId, className }: Props) {
  const layout = getWorldLayout(worldId);
  const nodeEntries = Object.entries(layout.nodes);

  const sky =
    worldId === 1
      ? ['#7dd3fc', '#38bdf8']
      : worldId === 2
        ? ['#bae6fd', '#7dd3fc']
        : ['#fed7aa', '#fdba74'];

  return (
    <svg
      viewBox={`0 0 ${ADVENTURE_SCENE.width} ${ADVENTURE_SCENE.height}`}
      className={cn('h-full w-full', className)}
      preserveAspectRatio={SCENE_PRESERVE_ASPECT}
      aria-hidden
    >
      <defs>
        <linearGradient id={`fallback-sky-${worldId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="100%" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width={ADVENTURE_SCENE.width} height={ADVENTURE_SCENE.height} fill={`url(#fallback-sky-${worldId})`} />
      <ellipse
        cx={layout.anchorX}
        cy={layout.anchorY}
        rx={ADVENTURE_SCENE.width * 0.42}
        ry={ADVENTURE_SCENE.height * 0.28}
        fill={worldId === 1 ? '#16a34a' : worldId === 2 ? '#64748b' : '#ea580c'}
        opacity={0.85}
      />
      <path
        d={layout.pathD}
        fill="none"
        stroke="#78716c"
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.55}
      />
      {nodeEntries.map(([key, pos]) =>
        pos ? (
          <circle
            key={key}
            cx={pos.x}
            cy={pos.y}
            r={key === 'chest' ? 10 : 12}
            fill={key === 'checkpoint' ? '#6366f1' : key === 'chest' ? '#f59e0b' : '#059669'}
            stroke="white"
            strokeWidth={2}
            opacity={0.9}
          />
        ) : null
      )}
    </svg>
  );
}
