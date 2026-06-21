import type { WorldId } from './adventureMapTypes';
import { WORLD_LAYOUT } from './worldLayout';

export const TERRITORIO_ISLAND = {
  widthPct: WORLD_LAYOUT[2].widthPct,
  anchorX: WORLD_LAYOUT[2].anchorX,
  anchorY: WORLD_LAYOUT[2].anchorY,
  paintedArt: true as const,
};

export const TERRITORIO_PATH_D = WORLD_LAYOUT[2].pathD;
export const TERRITORIO_NODE_LOCAL = WORLD_LAYOUT[2].nodes as {
  unit0: { x: number; y: number };
  unit1: { x: number; y: number };
  unit2: { x: number; y: number };
  checkpoint: { x: number; y: number };
  chest: { x: number; y: number };
};

export function isTerritorioWorld(worldId: WorldId): worldId is 2 {
  return worldId === 2;
}
