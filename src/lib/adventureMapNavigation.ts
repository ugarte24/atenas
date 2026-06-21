import type { Unidad } from '../types';
import type { AdventureMapNode, UnitAdventureProgress, WorldId } from './adventureMapTypes';
import { buildAdventureMapGraph } from './adventureMapLayout';
import { firstAvailableNodeId } from './adventureMapState';
import { getOpenedChestIds } from './adventureMapState';

export type AdventureMapNavigation = {
  activeNode: AdventureMapNode | null;
  activeWorldId: WorldId | null;
  nextUnit: Unidad | null;
  nextUnitId: string | null;
};

export function resolveAdventureMapNavigation(
  unidades: Unidad[],
  progressByUnit: Record<string, UnitAdventureProgress>,
  previewAllOpen = false
): AdventureMapNavigation {
  const nodes = buildAdventureMapGraph(
    unidades,
    progressByUnit,
    getOpenedChestIds(),
    previewAllOpen
  );
  const activeId = firstAvailableNodeId(nodes);
  const activeNode = nodes.find((n) => n.id === activeId) ?? null;

  const nextUnitNode = nodes.find(
    (n) => n.kind === 'unit' && n.status === 'available' && n.unidad
  );
  const nextUnit = nextUnitNode?.unidad ?? null;

  return {
    activeNode,
    activeWorldId: activeNode?.worldId ?? null,
    nextUnit,
    nextUnitId: nextUnit?.id ?? null,
  };
}
