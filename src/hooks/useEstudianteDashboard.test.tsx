import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEstudianteDashboard } from './useEstudianteDashboard';
import { calcularXp, nivelDesdeXp } from '../lib/gamificacion';

const UNIDADES = [{ id: 'u1', title: 'Unidad 1', orden: 1 }];
const TEMAS = [{ id: 't1', title: 'Tema 1', orden: 1, unidad_id: 'u1' }];
const ACTS_PUB = [
  { id: 'a1', tema_id: 't1', title: 'Act 1' },
  { id: 'a2', tema_id: 't1', title: 'Act 2' },
];
const EVALS_PUB = [{ id: 'e1', tema_id: 't1', title: 'Eval 1' }];
const ACT_USER = [
  { actividad_id: 'a1', puntuacion: 100, completado_at: '2025-03-01T10:00:00Z' },
];
const EVAL_USER = [
  { evaluacion_id: 'e1', puntuacion: 85, aprobado: true, completado_at: '2025-03-02T10:00:00Z' },
];

function thenable<T>(data: T) {
  const result = { data, error: null as null };
  return {
    then(onFulfilled: (v: typeof result) => unknown) {
      return Promise.resolve(result).then(onFulfilled);
    },
  };
}

function fromForTable(table: string, evalUserRows: typeof EVAL_USER) {
  if (table === 'unidades') {
    return { select: () => ({ order: () => thenable(UNIDADES) }) };
  }
  if (table === 'temas') {
    return { select: () => ({ order: () => thenable(TEMAS) }) };
  }
  if (table === 'actividades') {
    return { select: () => ({ eq: () => thenable(ACTS_PUB) }) };
  }
  if (table === 'evaluaciones') {
    return { select: () => ({ eq: () => thenable(EVALS_PUB) }) };
  }
  if (table === 'actividad_intentos') {
    return { select: () => ({ eq: () => thenable(ACT_USER) }) };
  }
  if (table === 'evaluacion_intentos') {
    return { select: () => ({ eq: () => thenable(evalUserRows) }) };
  }
  return { select: () => ({ eq: () => thenable([]), order: () => thenable([]) }) };
}

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn((table: string) => fromForTable(table, EVAL_USER)),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'student-1', email: 's@test.com' } }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

describe('useEstudianteDashboard', () => {
  beforeEach(() => {
    fromMock.mockImplementation((table: string) => fromForTable(table, EVAL_USER));
  });

  it('con enabled=false no carga y deja loading false', async () => {
    const { result } = renderHook(() => useEstudianteDashboard(false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unidades).toEqual([]);
    expect(result.current.xp).toBe(0);
  });

  it('agrega progreso por tema (2 act + 1 eval; 1 act y 1 eval hechas)', async () => {
    const { result } = renderHook(() => useEstudianteDashboard(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    const tema = result.current.unidades[0]?.temas[0];
    expect(tema).toBeDefined();
    expect(tema!.totalItems).toBe(3);
    expect(tema!.completados).toBe(2);
    expect(tema!.porcentaje).toBe(67);
    expect(result.current.unidades[0].porcentaje).toBe(67);
  });

  it('XP usa la mejor nota por evaluación, no la suma de intentos', async () => {
    const dosIntentos = [
      { evaluacion_id: 'e1', puntuacion: 40, aprobado: false, completado_at: '2025-01-01' },
      { evaluacion_id: 'e1', puntuacion: 90, aprobado: true, completado_at: '2025-01-02' },
    ];
    fromMock.mockImplementation((table: string) => fromForTable(table, dosIntentos));

    const { result } = renderHook(() => useEstudianteDashboard(true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const esperado = calcularXp({
      actividadesCompletadas: 1,
      evaluacionesCompletadas: 1,
      sumaPuntuacionAct: 100,
      sumaPuntuacionEval: 90,
    });
    expect(result.current.xp).toBe(esperado);

    const malSiSuma = calcularXp({
      actividadesCompletadas: 1,
      evaluacionesCompletadas: 1,
      sumaPuntuacionAct: 100,
      sumaPuntuacionEval: 130,
    });
    expect(result.current.xp).not.toBe(malSiSuma);
    expect(result.current.nivel).toEqual(nivelDesdeXp(esperado));
  });
});
