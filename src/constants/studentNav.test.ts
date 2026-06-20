import { describe, it, expect } from 'vitest';
import { STUDENT_NAV_ITEMS } from '../constants/studentNav';

describe('studentNav', () => {
  it('incluye aula en vivo accesible sin badge Próximamente', () => {
    const aula = STUDENT_NAV_ITEMS.find((i) => i.id === 'aula-en-vivo');
    expect(aula).toBeDefined();
    expect(aula?.comingSoon).toBeFalsy();
    expect(aula?.homeQuickLink).toBe(true);
  });

  it('bottom nav móvil tiene como máximo 5 ítems primarios', () => {
    const primary = STUDENT_NAV_ITEMS.filter((i) => i.mobilePrimary);
    expect(primary.length).toBeLessThanOrEqual(5);
  });
});
