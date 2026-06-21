import { describe, it, expect } from 'vitest';
import {
  parseMapSearchParams,
  buildUnidadesMapHref,
  getUnidadesViewPreference,
  setUnidadesViewPreference,
} from './adventureMapDeepLinks';

describe('adventureMapDeepLinks', () => {
  it('parsea view, world y node', () => {
    const p = parseMapSearchParams('?view=map&world=2&node=unit-3');
    expect(p.view).toBe('map');
    expect(p.world).toBe(2);
    expect(p.nodeId).toBe('unit-3');
  });

  it('construye href del mapa', () => {
    expect(buildUnidadesMapHref(3, 'chest-1')).toBe('/unidades?view=map&world=3&node=chest-1');
  });

  it('persiste preferencia de vista', () => {
    setUnidadesViewPreference('list');
    expect(getUnidadesViewPreference()).toBe('list');
    setUnidadesViewPreference('map');
  });
});
