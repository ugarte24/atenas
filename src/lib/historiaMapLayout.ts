import type { WorldId } from './adventureMapTypes';
import { WORLD_LAYOUT } from './worldLayout';

export const HISTORIA_ISLAND = {
  widthPct: WORLD_LAYOUT[3].widthPct,
  anchorX: WORLD_LAYOUT[3].anchorX,
  anchorY: WORLD_LAYOUT[3].anchorY,
  paintedArt: true as const,
};

export const HISTORIA_PATH_D = WORLD_LAYOUT[3].pathD;
export const HISTORIA_NODE_LOCAL = WORLD_LAYOUT[3].nodes as {
  unit0: { x: number; y: number };
  unit1: { x: number; y: number };
  chest: { x: number; y: number };
};

export function isHistoriaWorld(worldId: WorldId): worldId is 3 {
  return worldId === 3;
}
