import { describe, expect, it } from 'vitest';
import { applyAdventureMapState, starsFromProgress, unitStatusFromProgress } from './adventureMapState';
import type { AdventureMapNode } from './adventureMapTypes';

const baseNodes: AdventureMapNode[] = [
  {
    id: 'unit-a',
    kind: 'unit',
    worldId: 1,
    unitId: 'a',
    orderIndex: 0,
    position: { x: 100, y: 100 },
    status: 'locked',
    stars: 0,
    progressPct: 0,
  },
  {
    id: 'unit-b',
    kind: 'unit',
    worldId: 1,
    unitId: 'b',
    orderIndex: 1,
    position: { x: 200, y: 200 },
    status: 'locked',
    stars: 0,
    progressPct: 0,
  },
];

describe('adventureMapState', () => {
  it('first unit is available when no progress', () => {
    const result = applyAdventureMapState(baseNodes, {}, new Set(), false);
    expect(result[0]?.status).toBe('available');
    expect(result[1]?.status).toBe('locked');
  });

  it('second unit unlocks when first completed', () => {
    const result = applyAdventureMapState(
      baseNodes,
      { a: { progressPct: 100, avgScore: 80 } },
      new Set(),
      false
    );
    expect(result[0]?.status).toBe('completed');
    expect(result[1]?.status).toBe('available');
  });

  it('stars reflect progress', () => {
    expect(starsFromProgress(0, 0)).toBe(0);
    expect(starsFromProgress(30, 0)).toBe(1);
    expect(starsFromProgress(60, 0)).toBe(2);
    expect(starsFromProgress(100, 85)).toBe(3);
    expect(starsFromProgress(100, 95)).toBe(3);
  });

  it('perfect status when high score', () => {
    expect(unitStatusFromProgress(100, 92, true)).toBe('perfect');
    expect(unitStatusFromProgress(100, 70, true)).toBe('completed');
  });

  it('preview mode opens all units', () => {
    const result = applyAdventureMapState(baseNodes, {}, new Set(), true);
    expect(result.every((n) => n.kind !== 'unit' || n.status === 'available')).toBe(true);
  });
});
