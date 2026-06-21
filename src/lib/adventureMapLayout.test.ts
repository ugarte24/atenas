import { describe, it, expect } from 'vitest';
import { buildAdventureMapGraph } from './adventureMapLayout';
import type { Unidad } from '../types';

function unidad(id: string, orden: number, title: string): Unidad {
  return {
    id,
    title,
    orden,
    description: null,
    created_at: '',
    updated_at: '',
    publicada: true,
  };
}

describe('buildAdventureMapGraph', () => {
  it('genera nodos para unidades extra (>7) en mundo Historia', () => {
    const unidades = Array.from({ length: 9 }, (_, i) =>
      unidad(`u${i}`, i + 1, `Unidad ${i + 1}`)
    );
    const nodes = buildAdventureMapGraph(unidades, {}, new Set(), false);
    const unitNodes = nodes.filter((n) => n.kind === 'unit' && n.unitId);
    expect(unitNodes.length).toBe(9);
    expect(unitNodes.find((n) => n.unitId === 'u7')?.worldId).toBe(3);
    expect(unitNodes.find((n) => n.unitId === 'u8')?.worldId).toBe(3);
  });

  it('mantiene 7 nodos de unidad con currículo piloto', () => {
    const unidades = Array.from({ length: 7 }, (_, i) =>
      unidad(`u${i}`, i + 1, `Unidad ${i + 1}`)
    );
    const nodes = buildAdventureMapGraph(unidades, {}, new Set(), false);
    const unitNodes = nodes.filter((n) => n.kind === 'unit' && n.unitId);
    expect(unitNodes.length).toBe(7);
  });
});
