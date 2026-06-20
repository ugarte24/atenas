import { describe, it, expect, vi, beforeEach } from 'vitest';
import { progresoPorcentajeUnidad } from './progresoUnidad';

const fromMock = vi.fn();

vi.mock('./supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

function mockChain(result: { data: unknown; error: null }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    then: (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

describe('progresoPorcentajeUnidad', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('devuelve 0 si no hay temas', async () => {
    fromMock.mockReturnValueOnce(mockChain({ data: [], error: null }));
    expect(await progresoPorcentajeUnidad('u1', 'un1')).toBe(0);
  });

  it('devuelve 100 si no hay actividades ni evaluaciones publicadas', async () => {
    fromMock
      .mockReturnValueOnce(mockChain({ data: [{ id: 't1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }));
    expect(await progresoPorcentajeUnidad('u1', 'un1')).toBe(100);
  });

  it('calcula porcentaje según intentos completados', async () => {
    fromMock
      .mockReturnValueOnce(mockChain({ data: [{ id: 't1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ id: 'a1' }, { id: 'a2' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ id: 'e1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ actividad_id: 'a1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }));
    expect(await progresoPorcentajeUnidad('u1', 'un1')).toBe(33);
  });
});
