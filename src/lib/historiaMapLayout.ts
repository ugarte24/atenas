import type { WorldId } from './adventureMapTypes';

/** Layout visual premium — Mundo 3 Historia (coords locales escena 400×980) */
export const HISTORIA_ISLAND = {
  widthPct: 1,
  anchorX: 200,
  anchorY: 560,
  paintedArt: true as const,
} as const;

/** Sendero: ruinas → patio → cofre en acantilado */
export const HISTORIA_PATH_D =
  'M 285 300 Q 210 380 175 470 Q 185 580 200 720';

export const HISTORIA_NODE_LOCAL = {
  unit0: { x: 285, y: 300 },
  unit1: { x: 175, y: 470 },
  chest: { x: 200, y: 720 },
} as const;

export function isHistoriaWorld(worldId: WorldId): worldId is 3 {
  return worldId === 3;
}
