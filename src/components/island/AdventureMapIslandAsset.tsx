import type { WorldId } from '../../lib/adventureMapTypes';
import { ADVENTURE_MAP_ASSETS } from '../../lib/adventureMapAssets';
import { isPaintedWorld } from '../../lib/paintedWorldLayout';
import { AdventureMapPaintedIsland } from './painted/AdventureMapPaintedIsland';
import { AdventureMapIslandIllustration } from './AdventureMapIslandIllustration';
import { useState } from 'react';
import { cn } from '../ui/cn';

type Props = {
  worldId: WorldId;
  className?: string;
  layer?: 'full' | 'far' | 'foreground';
};

/**
 * Carga WebP rasterizado con fallback SVG.
 * Convivencia (mundo 1): asset premium dedicado; otros mundos sin cambio.
 */
export function AdventureMapIslandAsset({ worldId, className, layer = 'full' }: Props) {
  const [failed, setFailed] = useState(false);

  if (layer === 'full' && isPaintedWorld(worldId)) {
    return <AdventureMapPaintedIsland worldId={worldId} className={className} />;
  }

  if (layer === 'full') {
    return <AdventureMapIslandIllustration worldId={worldId} className={className} />;
  }

  if (isPaintedWorld(worldId)) {
    return null;
  }

  const webpSrc =
    layer === 'far'
      ? ADVENTURE_MAP_ASSETS.farWebp(worldId)
      : ADVENTURE_MAP_ASSETS.foregroundWebp(worldId);

  if (failed) {
    if (layer === 'far') {
      return <AdventureMapSceneFarFallback worldId={worldId} className={className} />;
    }
    return <AdventureMapIslandForeground worldId={worldId} className={className} />;
  }

  return (
    <img
      src={webpSrc}
      alt=""
      aria-hidden
      draggable={false}
      decoding="async"
      className={cn('absolute inset-0 h-full w-full object-cover object-center', className)}
      onError={() => setFailed(true)}
    />
  );
}

/** Siluetas lejanas (capa parallax 2) — fallback SVG */
export function AdventureMapSceneFarFallback({ worldId, className }: { worldId: WorldId; className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden preserveAspectRatio="none">
      {worldId === 1 && (
        <path
          d="M 0 380 L 60 320 L 140 350 L 220 300 L 300 340 L 400 310 L 400 420 L 0 420 Z"
          fill="#047857"
          opacity="0.2"
        />
      )}
      {worldId === 2 && (
        <path
          d="M 0 320 L 80 180 L 160 260 L 240 140 L 320 220 L 400 160 L 400 380 L 0 380 Z"
          fill="#64748b"
          opacity="0.35"
        />
      )}
      {worldId === 3 && (
        <path
          d="M 0 300 L 100 200 L 200 280 L 300 180 L 400 240 L 400 360 L 0 360 Z"
          fill="#7c2d12"
          opacity="0.25"
        />
      )}
    </svg>
  );
}

/** Props en primer plano (capa parallax 4) — fallback SVG */
export function AdventureMapIslandForeground({ worldId, className }: { worldId: WorldId; className?: string }) {
  if (worldId === 1) return <ForegroundOne className={className} />;
  if (worldId === 2) return <ForegroundTwo className={className} />;
  return <ForegroundThree className={className} />;
}

function ForegroundOne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden preserveAspectRatio="none">
      <Palm x={340} y={620} scale={1.15} />
      <Palm x={55} y={640} scale={1} />
      <g transform="translate(60 700) rotate(-8)">
        <ellipse cx="0" cy="0" rx="28" ry="8" fill="#92400e" />
        <ellipse cx="0" cy="-2" rx="24" ry="5" fill="#b45309" />
      </g>
      <Rock x={175} y={640} />
    </svg>
  );
}

function ForegroundTwo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden preserveAspectRatio="none">
      <Pine x={70} y={520} />
      <Pine x={350} y={500} scale={0.95} />
    </svg>
  );
}

function ForegroundThree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 980" className={className} aria-hidden preserveAspectRatio="none">
      <Palm x={60} y={620} scale={0.75} />
      <Rock x={90} y={620} color="#d97706" scale={1.1} />
    </svg>
  );
}

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2.5" y="0" width="5" height="24" rx="1" fill="#78350f" />
      <path d="M 0 0 Q -16 6 -14 18 Q -7 9 0 0" fill="#166534" />
      <path d="M 0 0 Q 16 6 14 18 Q 7 9 0 0" fill="#15803d" />
      <path d="M 0 0 Q -3 -16 0 -22 Q 3 -16 0 0" fill="#22c55e" />
    </g>
  );
}

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-2" y="8" width="4" height="14" fill="#78350f" />
      <path d="M 0 -8 L -14 10 L 14 10 Z" fill="#15803d" />
      <path d="M 0 -2 L -11 12 L 11 12 Z" fill="#16a34a" />
    </g>
  );
}

function Rock({ x, y, scale = 1, color = '#78716c' }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -10 6 L -6 -4 L 4 -6 L 10 2 L 6 8 Z" fill={color} stroke="#57534e" strokeWidth="0.8" />
    </g>
  );
}
