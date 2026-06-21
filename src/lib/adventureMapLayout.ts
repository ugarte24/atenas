import type { Unidad } from '../types';
import { islaDesdeOrdenUnidadSafe, MUNDOS } from './mundoUnidadMap';
import type { AdventureMapNode, AdventureMapWorldZone, MapNodeKind, WorldId } from './adventureMapTypes';
import { ADVENTURE_MAP_VIEWBOX, ADVENTURE_SCENE } from './adventureMapTypes';
import { applyAdventureMapState } from './adventureMapState';
import { CONVIVENCIA_NODE_LOCAL } from './convivenciaMapLayout';
import { TERRITORIO_NODE_LOCAL } from './territorioMapLayout';
import { HISTORIA_NODE_LOCAL } from './historiaMapLayout';
import { WORLD_LAYOUT } from './worldLayout';

type NodeTemplate = {
  id: string;
  kind: MapNodeKind;
  worldId: WorldId;
  unitSlot?: number;
  /** Posición local dentro de la escena del mundo (0–980 en Y) */
  localPosition: { x: number; y: number };
};

/** Camino de tierra por mundo — coords locales a la escena (400×980) */
export const WORLD_PATH_D: Record<WorldId, string> = {
  1: WORLD_LAYOUT[1].pathD,
  2: WORLD_LAYOUT[2].pathD,
  3: WORLD_LAYOUT[3].pathD,
};

/** Plantilla de nodos con posiciones locales integradas al camino de cada isla */
const NODE_TEMPLATES: NodeTemplate[] = [
  { id: 'unit-slot-0', kind: 'unit', worldId: 1, unitSlot: 0, localPosition: CONVIVENCIA_NODE_LOCAL.unit0 },
  { id: 'unit-slot-1', kind: 'unit', worldId: 1, unitSlot: 1, localPosition: CONVIVENCIA_NODE_LOCAL.unit1 },
  { id: 'checkpoint-w1-w2', kind: 'checkpoint', worldId: 1, localPosition: CONVIVENCIA_NODE_LOCAL.checkpoint },
  { id: 'chest-w1', kind: 'chest', worldId: 1, localPosition: CONVIVENCIA_NODE_LOCAL.chest },
  { id: 'unit-slot-2', kind: 'unit', worldId: 2, unitSlot: 2, localPosition: TERRITORIO_NODE_LOCAL.unit0 },
  { id: 'unit-slot-3', kind: 'unit', worldId: 2, unitSlot: 3, localPosition: TERRITORIO_NODE_LOCAL.unit1 },
  { id: 'unit-slot-4', kind: 'unit', worldId: 2, unitSlot: 4, localPosition: TERRITORIO_NODE_LOCAL.unit2 },
  { id: 'checkpoint-w2-w3', kind: 'checkpoint', worldId: 2, localPosition: TERRITORIO_NODE_LOCAL.checkpoint },
  { id: 'chest-w2', kind: 'chest', worldId: 2, localPosition: TERRITORIO_NODE_LOCAL.chest },
  { id: 'unit-slot-5', kind: 'unit', worldId: 3, unitSlot: 5, localPosition: HISTORIA_NODE_LOCAL.unit0 },
  { id: 'unit-slot-6', kind: 'unit', worldId: 3, unitSlot: 6, localPosition: HISTORIA_NODE_LOCAL.unit1 },
  { id: 'chest-w3', kind: 'chest', worldId: 3, localPosition: HISTORIA_NODE_LOCAL.chest },
];

function sceneYOffset(worldId: WorldId): number {
  return (worldId - 1) * ADVENTURE_SCENE.height;
}

export function localToGlobalPosition(worldId: WorldId, local: { x: number; y: number }) {
  return { x: local.x, y: sceneYOffset(worldId) + local.y };
}

export function nodeLocalPosition(
  node: Pick<AdventureMapNode, 'position'>,
  zone: AdventureMapWorldZone
) {
  return { x: node.position.x, y: node.position.y - zone.yStart };
}

export const ADVENTURE_WORLD_ZONES: AdventureMapWorldZone[] = [
  {
    worldId: 1,
    title: 'Convivencia',
    subtitle: 'Principios y convivencia',
    yStart: 0,
    yEnd: ADVENTURE_SCENE.height,
    islandAnchor: { x: 200, y: 580 },
  },
  {
    worldId: 2,
    title: 'Territorio',
    subtitle: 'Organización y territorio',
    yStart: ADVENTURE_SCENE.height,
    yEnd: ADVENTURE_SCENE.height * 2,
    islandAnchor: { x: 200, y: ADVENTURE_SCENE.height + 520 },
  },
  {
    worldId: 3,
    title: 'Historia',
    subtitle: 'Contacto e historia reciente',
    yStart: ADVENTURE_SCENE.height * 2,
    yEnd: ADVENTURE_SCENE.height * 3,
    islandAnchor: { x: 200, y: ADVENTURE_SCENE.height * 2 + 520 },
  },
];

export function unidadNombreCorto(
  _orden: number | null | undefined,
  titulo: string,
  _listIndex: number
): string {
  const stripped = titulo.replace(/^\s*Unidad\s+\d+\s*[·•.-]\s*/i, '').trim();
  const text = stripped || titulo;
  if (text.length <= 28) return text;
  return `${text.slice(0, 26).trim()}…`;
}

export function buildSerpentinePath(nodes: Pick<AdventureMapNode, 'position'>[]): string {
  if (nodes.length === 0) return '';
  const first = nodes[0]!.position;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1]!.position;
    const curr = nodes[i]!.position;
    const cpx = (prev.x + curr.x) / 2;
    const cpy = (prev.y + curr.y) / 2 + (i % 2 === 0 ? -40 : 40);
    d += ` Q ${cpx} ${cpy} ${curr.x} ${curr.y}`;
  }
  return d;
}

export function buildWorldPath(
  worldId: WorldId,
  _nodes: Pick<AdventureMapNode, 'position' | 'orderIndex'>[],
  _zone: AdventureMapWorldZone
): string {
  return WORLD_PATH_D[worldId];
}

export function nodePositionToPercent(pos: { x: number; y: number }) {
  const { width, height } = ADVENTURE_MAP_VIEWBOX;
  return {
    left: `${(pos.x / width) * 100}%`,
    top: `${(pos.y / height) * 100}%`,
  };
}

export function nodePositionInScene(
  node: Pick<AdventureMapNode, 'position'>,
  zone: AdventureMapWorldZone
) {
  const local = nodeLocalPosition(node, zone);
  const sceneHeight = zone.yEnd - zone.yStart;
  return {
    left: `${(local.x / ADVENTURE_SCENE.width) * 100}%`,
    top: `${(local.y / sceneHeight) * 100}%`,
  };
}

export { WORLD_LAYOUT, getWorldLayout } from './worldLayout';

export function buildAdventureMapGraph(
  unidades: Unidad[],
  progressByUnit: Record<string, { progressPct: number; avgScore: number }>,
  openedChestIds: Set<string>,
  previewAllOpen: boolean
): AdventureMapNode[] {
  const sorted = [...unidades].sort((a, b) => {
    const oa = a.orden ?? 999;
    const ob = b.orden ?? 999;
    return oa - ob || a.id.localeCompare(b.id);
  });

  const rawNodes: AdventureMapNode[] = NODE_TEMPLATES.map((tpl, orderIndex) => {
    const position = localToGlobalPosition(tpl.worldId, tpl.localPosition);

    if (tpl.kind === 'unit' && tpl.unitSlot != null) {
      const item = sorted[tpl.unitSlot];
      if (!item) {
        return {
          id: tpl.id,
          kind: 'unit' as const,
          worldId: tpl.worldId,
          orderIndex,
          position,
          status: 'locked' as const,
          stars: 0 as const,
          progressPct: 0,
        };
      }
      const listIndex = unidades.findIndex((u) => u.id === item.id);
      const isla = islaDesdeOrdenUnidadSafe(item.orden, listIndex);
      const unitNumber =
        typeof item.orden === 'number' && item.orden > 0 ? item.orden : listIndex + 1;
      const prog = progressByUnit[item.id] ?? { progressPct: 0, avgScore: 0 };
      return {
        id: `unit-${item.id}`,
        kind: 'unit' as const,
        worldId: tpl.worldId,
        unitId: item.id,
        unidad: item,
        listIndex,
        isla,
        unitNumber,
        unitLabel: unidadNombreCorto(item.orden, item.title, listIndex),
        orderIndex,
        position,
        status: 'locked' as const,
        stars: 0 as const,
        progressPct: prog.progressPct,
      };
    }

    return {
      id: tpl.id,
      kind: tpl.kind,
      worldId: tpl.worldId,
      orderIndex,
      position,
      status: 'locked' as const,
      stars: 0 as const,
      progressPct: 0,
    };
  });

  return applyAdventureMapState(rawNodes, progressByUnit, openedChestIds, previewAllOpen);
}

export { MUNDOS };
export { ADVENTURE_MAP_VIEWBOX, ADVENTURE_SCENE } from './adventureMapTypes';
