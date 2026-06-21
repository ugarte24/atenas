import type { AdventureMapNode, MapNodeStatus, UnitAdventureProgress } from './adventureMapTypes';

const CHEST_STORAGE_PREFIX = 'atenas-chest-';

export function getOpenedChestIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const ids = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CHEST_STORAGE_PREFIX) && localStorage.getItem(key) === '1') {
      ids.add(key.slice(CHEST_STORAGE_PREFIX.length));
    }
  }
  return ids;
}

export function markChestOpened(chestId: string): void {
  localStorage.setItem(`${CHEST_STORAGE_PREFIX}${chestId}`, '1');
}

export function starsFromProgress(progressPct: number, avgScore: number): 0 | 1 | 2 | 3 {
  if (progressPct <= 0) return 0;
  if (progressPct >= 100 && avgScore >= 90) return 3;
  if (progressPct >= 100) return 2;
  if (progressPct >= 50) return 1;
  return 1;
}

export function unitStatusFromProgress(
  progressPct: number,
  avgScore: number,
  unlocked: boolean
): MapNodeStatus {
  if (!unlocked) return 'locked';
  if (progressPct >= 100 && avgScore >= 90) return 'perfect';
  if (progressPct >= 100) return 'completed';
  return 'available';
}

function allUnitsInWorldCompleted(
  nodes: AdventureMapNode[],
  worldId: number,
  progressByUnit: Record<string, UnitAdventureProgress>
): boolean {
  const units = nodes.filter((n) => n.kind === 'unit' && n.worldId === worldId && n.unitId);
  if (units.length === 0) return false;
  return units.every((u) => (progressByUnit[u.unitId!]?.progressPct ?? 0) >= 100);
}

function precedingUnitCompleted(
  nodes: AdventureMapNode[],
  index: number,
  progressByUnit: Record<string, UnitAdventureProgress>
): boolean {
  for (let i = index - 1; i >= 0; i--) {
    const n = nodes[i]!;
    if (n.kind === 'unit' && n.unitId) {
      return (progressByUnit[n.unitId]?.progressPct ?? 0) >= 100;
    }
  }
  return true;
}

function isUnitUnlocked(
  nodes: AdventureMapNode[],
  index: number,
  progressByUnit: Record<string, UnitAdventureProgress>,
  previewAllOpen: boolean
): boolean {
  if (previewAllOpen) return true;
  const node = nodes[index]!;
  if (node.kind !== 'unit') return false;

  const firstUnitIndex = nodes.findIndex((n) => n.kind === 'unit');
  if (index === firstUnitIndex) return true;

  const prevWorldUnits = nodes.filter(
    (n, i) => i < index && n.kind === 'unit' && n.worldId === node.worldId
  );
  if (prevWorldUnits.length === 0) {
    const prevWorldId = (node.worldId - 1) as 0 | 1 | 2;
    if (prevWorldId >= 1) {
      return allUnitsInWorldCompleted(nodes, prevWorldId, progressByUnit);
    }
  }

  return precedingUnitCompleted(nodes, index, progressByUnit);
}

function isCheckpointUnlocked(
  nodes: AdventureMapNode[],
  index: number,
  progressByUnit: Record<string, UnitAdventureProgress>,
  previewAllOpen: boolean
): boolean {
  if (previewAllOpen) return true;
  const node = nodes[index]!;
  const nextWorldId = (node.worldId + 1) as 2 | 3 | 4;
  if (nextWorldId > 3) return allUnitsInWorldCompleted(nodes, node.worldId, progressByUnit);
  return allUnitsInWorldCompleted(nodes, node.worldId, progressByUnit);
}

function isChestUnlocked(
  nodes: AdventureMapNode[],
  index: number,
  progressByUnit: Record<string, UnitAdventureProgress>,
  previewAllOpen: boolean
): boolean {
  if (previewAllOpen) return true;
  return precedingUnitCompleted(nodes, index, progressByUnit);
}

export function applyAdventureMapState(
  nodes: AdventureMapNode[],
  progressByUnit: Record<string, UnitAdventureProgress>,
  openedChestIds: Set<string>,
  previewAllOpen: boolean
): AdventureMapNode[] {
  return nodes.map((node, index) => {
    if (node.kind === 'unit' && node.unitId) {
      const prog = progressByUnit[node.unitId] ?? { progressPct: 0, avgScore: 0 };
      const unlocked = isUnitUnlocked(nodes, index, progressByUnit, previewAllOpen);
      const status = unitStatusFromProgress(prog.progressPct, prog.avgScore, unlocked);
      const stars = unlocked ? starsFromProgress(prog.progressPct, prog.avgScore) : 0;
      return { ...node, status, stars, progressPct: prog.progressPct };
    }

    if (node.kind === 'checkpoint') {
      const unlocked = isCheckpointUnlocked(nodes, index, progressByUnit, previewAllOpen);
      const worldComplete = allUnitsInWorldCompleted(nodes, node.worldId, progressByUnit);
      const status: MapNodeStatus = !unlocked
        ? 'locked'
        : worldComplete
          ? 'completed'
          : 'available';
      return { ...node, status, stars: 0, progressPct: worldComplete ? 100 : 0 };
    }

    if (node.kind === 'chest') {
      const unlocked = isChestUnlocked(nodes, index, progressByUnit, previewAllOpen);
      const opened = openedChestIds.has(node.id);
      const status: MapNodeStatus = opened
        ? 'completed'
        : unlocked
          ? 'available'
          : 'locked';
      return { ...node, status, stars: 0, progressPct: opened ? 100 : 0 };
    }

    return node;
  });
}

export function totalStars(nodes: AdventureMapNode[]): number {
  return nodes.filter((n) => n.kind === 'unit').reduce((s, n) => s + n.stars, 0);
}

export function firstAvailableNodeId(nodes: AdventureMapNode[]): string | null {
  const n = nodes.find((node) => node.status === 'available');
  return n?.id ?? null;
}
