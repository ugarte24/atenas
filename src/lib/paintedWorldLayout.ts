import type { WorldId } from './adventureMapTypes';
import { WORLD_LAYOUT } from './worldLayout';

export type PaintedIslandConfig = {
  widthPct: number;
  anchorX: number;
  anchorY: number;
  paintedArt: true;
};

export function isPaintedWorld(worldId: WorldId): boolean {
  return WORLD_LAYOUT[worldId].paintedArt;
}

export function getPaintedIslandConfig(worldId: WorldId): PaintedIslandConfig | null {
  const layout = WORLD_LAYOUT[worldId];
  if (!layout.paintedArt) return null;
  return {
    widthPct: layout.widthPct,
    anchorX: layout.anchorX,
    anchorY: layout.anchorY,
    paintedArt: true,
  };
}

export { isMinimalOverlayNode } from './worldLayout';
