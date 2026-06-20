import type { WorldId } from './adventureMapTypes';
import { CONVIVENCIA_ISLAND, isConvivenciaWorld } from './convivenciaMapLayout';
import { TERRITORIO_ISLAND, isTerritorioWorld } from './territorioMapLayout';
import { HISTORIA_ISLAND, isHistoriaWorld } from './historiaMapLayout';

export type PaintedIslandConfig = {
  widthPct: number;
  anchorX: number;
  anchorY: number;
  paintedArt: true;
};

export function isPaintedWorld(worldId: WorldId): boolean {
  return isConvivenciaWorld(worldId) || isTerritorioWorld(worldId) || isHistoriaWorld(worldId);
}

export function getPaintedIslandConfig(worldId: WorldId): PaintedIslandConfig | null {
  if (isConvivenciaWorld(worldId)) return CONVIVENCIA_ISLAND;
  if (isTerritorioWorld(worldId)) return TERRITORIO_ISLAND;
  if (isHistoriaWorld(worldId)) return HISTORIA_ISLAND;
  return null;
}
