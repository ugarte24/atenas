import type { WorldId } from './adventureMapTypes';

export type UnidadesViewMode = 'map' | 'list';

const VIEW_KEY = 'atenas-unidades-view';

export function getUnidadesViewPreference(): UnidadesViewMode {
  if (typeof window === 'undefined') return 'map';
  const v = localStorage.getItem(VIEW_KEY);
  return v === 'list' ? 'list' : 'map';
}

export function setUnidadesViewPreference(mode: UnidadesViewMode): void {
  localStorage.setItem(VIEW_KEY, mode);
}

export function parseMapSearchParams(search: string): {
  view: UnidadesViewMode | null;
  world: WorldId | null;
  nodeId: string | null;
} {
  const params = new URLSearchParams(search);
  const viewRaw = params.get('view');
  const view = viewRaw === 'map' || viewRaw === 'list' ? viewRaw : null;
  const worldRaw = Number.parseInt(params.get('world') ?? '', 10);
  const world = worldRaw === 1 || worldRaw === 2 || worldRaw === 3 ? (worldRaw as WorldId) : null;
  const nodeId = params.get('node');
  return { view, world, nodeId: nodeId || null };
}

export function buildUnidadesMapHref(world?: WorldId | null, nodeId?: string | null): string {
  const params = new URLSearchParams({ view: 'map' });
  if (world) params.set('world', String(world));
  if (nodeId) params.set('node', nodeId);
  return `/unidades?${params.toString()}`;
}
