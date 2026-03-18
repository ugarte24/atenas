import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProgresoEstudiantes } from './useProgresoEstudiantes';

function thenable<T>(data: T) {
  const result = { data, error: null as null };
  return {
    then(onFulfilled: (v: typeof result) => unknown) {
      return Promise.resolve(result).then(onFulfilled);
    },
  };
}

const PROFILES = [
  { id: 'u1', full_name: 'Ana', email: 'ana@test.com' },
  { id: 'u2', full_name: 'Luis', email: 'luis@test.com' },
];

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

describe('useProgresoEstudiantes', () => {
  beforeEach(() => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => thenable(PROFILES),
          }),
        };
      }
      if (table === 'actividad_intentos') {
        return {
          select: () => thenable([
            { user_id: 'u1', puntuacion: 80 },
            { user_id: 'u1', puntuacion: 100 },
            { user_id: 'u2', puntuacion: 60 },
          ]),
        };
      }
      if (table === 'evaluacion_intentos') {
        return {
          select: () =>
            thenable([
              { user_id: 'u1', evaluacion_id: 'ev1', puntuacion: 70, aprobado: true },
              { user_id: 'u1', evaluacion_id: 'ev1', puntuacion: 90, aprobado: true },
              { user_id: 'u1', evaluacion_id: 'ev2', puntuacion: 50, aprobado: false },
              { user_id: 'u2', evaluacion_id: 'ev1', puntuacion: 75, aprobado: true },
            ]),
        };
      }
      return { select: () => thenable([]) };
    });
  });

  it('carga estudiantes con promedios: actividades (media de intentos) y evaluaciones (mejor por eval)', async () => {
    const { result } = renderHook(() => useProgresoEstudiantes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.estudiantes).toHaveLength(2);

    const ana = result.current.estudiantes.find((e) => e.user_id === 'u1');
    expect(ana).toBeDefined();
    expect(ana!.actividadesCompletadas).toBe(2);
    expect(ana!.promedioActividades).toBe(90);
    expect(ana!.evaluacionesCompletadas).toBe(2);
    const promEvalAna = Math.round((90 + 50) / 2);
    expect(ana!.promedioEvaluaciones).toBe(promEvalAna);

    const luis = result.current.estudiantes.find((e) => e.user_id === 'u2');
    expect(luis!.actividadesCompletadas).toBe(1);
    expect(luis!.promedioActividades).toBe(60);
    expect(luis!.evaluacionesCompletadas).toBe(1);
    expect(luis!.promedioEvaluaciones).toBe(75);
  });

  it('expone error si falla Supabase', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => Promise.reject(new Error('Sin conexión')),
          }),
        };
      }
      return {
        select: () => Promise.resolve({ data: [], error: null }),
      };
    });

    const { result } = renderHook(() => useProgresoEstudiantes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Sin conexión');
    expect(result.current.estudiantes).toEqual([]);
  });
});
