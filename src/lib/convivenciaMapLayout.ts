import type { WorldId } from './adventureMapTypes';

/** Layout visual premium — Mundo 1 Convivencia (coords locales escena 400×980) */
export const CONVIVENCIA_ISLAND = {
  /** Ilustración pintada a pantalla completa en la escena */
  widthPct: 1,
  anchorX: 200,
  anchorY: 580,
  /** Asset pintado incluye cielo — no duplicar AdventureMapSceneSky */
  paintedArt: true,
} as const;

/**
 * Sendero alineado a la ilustración pintada (chozas → fogata → portal → cofre).
 * Coords viewBox 400×980.
 */
export const CONVIVENCIA_PATH_D =
  'M 288 372 Q 228 438 152 510 Q 178 582 200 657 Q 252 692 304 715';

export const CONVIVENCIA_NODE_LOCAL = {
  unit0: { x: 288, y: 372 },
  unit1: { x: 152, y: 510 },
  checkpoint: { x: 200, y: 657 },
  chest: { x: 304, y: 715 },
} as const;

export function isConvivenciaWorld(worldId: WorldId): worldId is 1 {
  return worldId === 1;
}
