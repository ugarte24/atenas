import type { Unidad } from '../types';
import type { MundoIsla } from './mundoUnidadMap';

export type WorldId = 1 | 2 | 3;
export type MapNodeKind = 'unit' | 'chest' | 'checkpoint';
export type MapNodeStatus = 'locked' | 'available' | 'completed' | 'perfect';

export type UnitAdventureProgress = {
  progressPct: number;
  avgScore: number;
};

export type AdventureMapNode = {
  id: string;
  kind: MapNodeKind;
  worldId: WorldId;
  unitId?: string;
  unidad?: Unidad;
  listIndex?: number;
  isla?: MundoIsla;
  unitNumber?: number;
  unitLabel?: string;
  orderIndex: number;
  position: { x: number; y: number };
  status: MapNodeStatus;
  stars: 0 | 1 | 2 | 3;
  progressPct: number;
};

export type AdventureMapWorldZone = {
  worldId: WorldId;
  title: string;
  subtitle: string;
  yStart: number;
  yEnd: number;
  islandAnchor: { x: number; y: number };
};

export const ADVENTURE_SCENE = { width: 400, height: 980 } as const;

export const ADVENTURE_MAP_VIEWBOX = {
  width: ADVENTURE_SCENE.width,
  height: ADVENTURE_SCENE.height * 3,
} as const;
