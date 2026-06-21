import type { WorldId } from './adventureMapTypes';
import { WORLD_LAYOUT } from './worldLayout';

/** @deprecated Usar WORLD_LAYOUT[1] */
export const CONVIVENCIA_ISLAND = {
  widthPct: WORLD_LAYOUT[1].widthPct,
  anchorX: WORLD_LAYOUT[1].anchorX,
  anchorY: WORLD_LAYOUT[1].anchorY,
  paintedArt: true as const,
};

export const CONVIVENCIA_PATH_D = WORLD_LAYOUT[1].pathD;
export const CONVIVENCIA_NODE_LOCAL = WORLD_LAYOUT[1].nodes as {
  unit0: { x: number; y: number };
  unit1: { x: number; y: number };
  checkpoint: { x: number; y: number };
  chest: { x: number; y: number };
};

export function isConvivenciaWorld(worldId: WorldId): worldId is 1 {
  return worldId === 1;
}
