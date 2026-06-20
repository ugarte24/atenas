import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usuarioCumplePrerequisitoTema } from './prerequisitoTema';

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

describe('usuarioCumplePrerequisitoTema', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('permite acceso sin prerequisito', async () => {
    expect(await usuarioCumplePrerequisitoTema('u1', null)).toBe(true);
    expect(await usuarioCumplePrerequisitoTema('u1', undefined)).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('permite si el tema prerequisito no tiene items publicados', async () => {
    fromMock
      .mockReturnValueOnce(mockChain({ data: [], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }));
    expect(await usuarioCumplePrerequisitoTema('u1', 't-pre')).toBe(true);
  });

  it('bloquea si falta un intento de actividad', async () => {
    fromMock
      .mockReturnValueOnce(mockChain({ data: [{ id: 'a1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }))
      .mockReturnValueOnce(mockChain({ data: [], error: null }));
    expect(await usuarioCumplePrerequisitoTema('u1', 't-pre')).toBe(false);
  });

  it('permite cuando todas las actividades y evaluaciones están hechas', async () => {
    fromMock
      .mockReturnValueOnce(mockChain({ data: [{ id: 'a1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ id: 'e1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ actividad_id: 'a1' }], error: null }))
      .mockReturnValueOnce(mockChain({ data: [{ evaluacion_id: 'e1' }], error: null }));
    expect(await usuarioCumplePrerequisitoTema('u1', 't-pre')).toBe(true);
  });
});
