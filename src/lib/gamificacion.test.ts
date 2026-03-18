import { describe, it, expect } from 'vitest';
import {
  calcularXp,
  nivelDesdeXp,
  calcularRachaActual,
  diasConActividad,
  construirLogros,
} from './gamificacion';

describe('calcularXp', () => {
  it('suma actividades, evaluaciones y notas', () => {
    expect(calcularXp({ actividadesCompletadas: 0, evaluacionesCompletadas: 0, sumaPuntuacionAct: 0, sumaPuntuacionEval: 0 })).toBe(0);
    const x = calcularXp({
      actividadesCompletadas: 2,
      evaluacionesCompletadas: 1,
      sumaPuntuacionAct: 100,
      sumaPuntuacionEval: 80,
    });
    expect(x).toBe(2 * 18 + 1 * 45 + 40 + 48);
  });
});

describe('nivelDesdeXp', () => {
  it('nivel 1 con poco XP', () => {
    const n = nivelDesdeXp(0);
    expect(n.nivel).toBe(1);
    expect(n.nombre).toBeTruthy();
  });
  it('sube de nivel con más XP', () => {
    const n = nivelDesdeXp(500);
    expect(n.nivel).toBeGreaterThan(1);
  });
});

describe('calcularRachaActual', () => {
  it('0 sin días', () => {
    expect(calcularRachaActual(new Set(), new Date('2025-03-17'))).toBe(0);
  });
  it('cuenta hoy', () => {
    const d = new Date('2025-03-17T12:00:00');
    expect(calcularRachaActual(new Set(['2025-03-17']), d)).toBe(1);
  });
  it('cadena de días', () => {
    const d = new Date(2025, 2, 17);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const hoy = `${y}-${m}-${da}`;
    const ay = new Date(d);
    ay.setDate(ay.getDate() - 1);
    const ayStr = `${ay.getFullYear()}-${String(ay.getMonth() + 1).padStart(2, '0')}-${String(ay.getDate()).padStart(2, '0')}`;
    const aa = new Date(ay);
    aa.setDate(aa.getDate() - 1);
    const aaStr = `${aa.getFullYear()}-${String(aa.getMonth() + 1).padStart(2, '0')}-${String(aa.getDate()).padStart(2, '0')}`;
    const dias = new Set([hoy, ayStr, aaStr]);
    expect(calcularRachaActual(dias, d)).toBe(3);
  });
});

describe('construirLogros', () => {
  it('incluye primera evaluación aprobada', () => {
    const l = construirLogros({
      actividadesCompletadas: 0,
      evaluacionesCompletadas: 1,
      aprobadas: 1,
      maxEval: 70,
      primeraEvalAprobada: true,
      diasDistintosUltimos7: 1,
      racha: 0,
    });
    expect(l.some((x) => x.id === 'primera_eval_aprobada')).toBe(true);
  });
});

describe('diasConActividad', () => {
  it('extrae fechas', () => {
    const s = diasConActividad(['2025-01-01T10:00:00Z', '2025-01-02T11:00:00Z']);
    expect(s.has('2025-01-01')).toBe(true);
    expect(s.has('2025-01-02')).toBe(true);
  });
});
