/** Rutas de assets del Adventure Map (WebP con fallback SVG en componentes). */
import type { WorldId } from './adventureMapTypes';

const BASE = `${import.meta.env.BASE_URL}adventure`;

export const ADVENTURE_MAP_ASSETS = {
  islandWebp: (worldId: WorldId) => `${BASE}/world-${worldId}-island.webp`,
  farWebp: (worldId: WorldId) => `${BASE}/world-${worldId}-far.webp`,
  foregroundWebp: (worldId: WorldId) => `${BASE}/world-${worldId}-fg.webp`,
  chestSpriteWebp: `${BASE}/chest-sprite.webp`,
} as const;

export const CHEST_SPRITE = {
  frameWidth: 128,
  frameHeight: 128,
  frameCount: 3,
} as const;
