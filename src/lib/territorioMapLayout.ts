import type { WorldId } from './adventureMapTypes';

/** Layout visual premium — Mundo 2 Territorio (coords locales escena 400×980) */
export const TERRITORIO_ISLAND = {
  widthPct: 1,
  anchorX: 200,
  anchorY: 560,
  paintedArt: true as const,
} as const;

/** Sendero: puente → plaza → molino → portal → cofre */
export const TERRITORIO_PATH_D =
  'M 120 220 Q 210 290 300 360 Q 230 430 155 510 Q 175 590 200 670 Q 255 710 310 740';

export const TERRITORIO_NODE_LOCAL = {
  unit0: { x: 120, y: 220 },
  unit1: { x: 300, y: 360 },
  unit2: { x: 155, y: 510 },
  checkpoint: { x: 200, y: 670 },
  chest: { x: 310, y: 740 },
} as const;

export function isTerritorioWorld(worldId: WorldId): worldId is 2 {
  return worldId === 2;
}
