import type { MapNodeKind, WorldId } from './adventureMapTypes';

export type WorldNodeKey =
  | 'unit0'
  | 'unit1'
  | 'unit2'
  | 'checkpoint'
  | 'chest';

export type WorldLayoutConfig = {
  widthPct: number;
  anchorX: number;
  anchorY: number;
  paintedArt: true;
  pathD: string;
  nodes: Partial<Record<WorldNodeKey, { x: number; y: number }>>;
  /** Nodos más pequeños cuando el arte ya incluye portal/cofre pintado. */
  minimalOverlay?: Partial<Record<MapNodeKind, boolean>>;
  /** Posición de recorte sharp al exportar PNG apaisado → WebP vertical. */
  cropPosition?: 'centre' | 'left' | 'right' | 'bottom' | 'top';
};

export const WORLD_LAYOUT: Record<WorldId, WorldLayoutConfig> = {
  1: {
    widthPct: 1,
    anchorX: 200,
    anchorY: 580,
    paintedArt: true,
    cropPosition: 'centre',
    pathD: 'M 288 372 Q 228 438 152 510 Q 178 582 200 657 Q 252 692 304 715',
    nodes: {
      unit0: { x: 288, y: 372 },
      unit1: { x: 152, y: 510 },
      checkpoint: { x: 200, y: 657 },
      chest: { x: 304, y: 715 },
    },
    minimalOverlay: { checkpoint: true, chest: true },
  },
  2: {
    widthPct: 1,
    anchorX: 200,
    anchorY: 560,
    paintedArt: true,
    cropPosition: 'centre',
    pathD:
      'M 82 468 Q 98 532 118 598 Q 138 668 162 732 Q 184 738 206 742 Q 248 752 286 758',
    nodes: {
      unit0: { x: 82, y: 468 },
      unit1: { x: 118, y: 598 },
      unit2: { x: 162, y: 732 },
      checkpoint: { x: 206, y: 742 },
      chest: { x: 286, y: 758 },
    },
    minimalOverlay: { checkpoint: true, chest: true },
  },
  3: {
    widthPct: 1,
    anchorX: 200,
    anchorY: 560,
    paintedArt: true,
    cropPosition: 'centre',
    pathD: 'M 175 462 Q 170 525 172 590 Q 182 708 198 828',
    nodes: {
      unit0: { x: 175, y: 462 },
      unit1: { x: 172, y: 590 },
      chest: { x: 198, y: 828 },
    },
    minimalOverlay: { chest: true },
  },
};

export function getWorldLayout(worldId: WorldId): WorldLayoutConfig {
  return WORLD_LAYOUT[worldId];
}

export function isMinimalOverlayNode(worldId: WorldId, kind: MapNodeKind): boolean {
  return WORLD_LAYOUT[worldId].minimalOverlay?.[kind] ?? false;
}
