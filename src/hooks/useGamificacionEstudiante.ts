import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from './useMisiones';

export type GamificacionEstudiante = {
  puntos: number;
  /** Días consecutivos con al menos una actividad o evaluación completada */
  racha: number;
  /** 0–100: promedio de avance por unidad (misiones con al menos un tema) */
  porcentajeGlobal: number;
  /** “Energía” gamificada: 1–5 según racha (tope 5) */
  energia: number;
  loading: boolean;
  error: string | null;
};

function startOfDayUtc(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Calcula racha actual a partir de fechas UTC (día calendario) */
export function calcularRachaDias(fechasCompletado: Date[]): number {
  if (fechasCompletado.length === 0) return 0;
  const days = new Set(
    fechasCompletado.map((d) => startOfDayUtc(d))
  );
  const today = startOfDayUtc(new Date());
  const oneDay = 86400000;
  let streak = 0;
  let cursor = today;
  // Si hoy no hay actividad, empezar desde ayer (racha “viva” hasta ayer)
  if (!days.has(today)) {
    cursor = today - oneDay;
  }
  while (days.has(cursor)) {
    streak += 1;
    cursor -= oneDay;
  }
  return streak;
}

export function useGamificacionEstudiante(): GamificacionEstudiante {
  const { user, profile } = useAuthContext();
  const { misiones, loading: loadingMisiones } = useMisionesAlumno();
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPuntosYRacha() {
      if (!user || profile?.role !== 'estudiante') {
        setPuntos(0);
        setRacha(0);
        setLoadingExtra(false);
        return;
      }
      setLoadingExtra(true);
      setError(null);
      try {
        const [actRes, evalRes] = await Promise.all([
          supabase
            .from('actividad_intentos')
            .select('puntuacion, completado_at')
            .eq('user_id', user.id),
          supabase
            .from('evaluacion_intentos')
            .select('puntuacion, completado_at')
            .eq('user_id', user.id),
        ]);
        if (cancelled) return;
        if (actRes.error) throw actRes.error;
        if (evalRes.error) throw evalRes.error;

        const rowsAct = (actRes.data ?? []) as { puntuacion: number; completado_at: string | null }[];
        const rowsEval = (evalRes.data ?? []) as { puntuacion: number; completado_at: string | null }[];
        const sumPts =
          rowsAct.reduce((s, r) => s + (r.puntuacion ?? 0), 0) +
          rowsEval.reduce((s, r) => s + (r.puntuacion ?? 0), 0);

        const fechas: Date[] = [];
        [...rowsAct, ...rowsEval].forEach((r) => {
          if (r.completado_at) fechas.push(new Date(r.completado_at));
        });
        setPuntos(sumPts);
        setRacha(calcularRachaDias(fechas));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error de gamificación');
          setPuntos(0);
          setRacha(0);
        }
      } finally {
        if (!cancelled) setLoadingExtra(false);
      }
    }
    void fetchPuntosYRacha();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role]);

  const porcentajeGlobal = useMemo(() => {
    const conTemas = misiones.filter((m) => m.totalPasos > 0);
    if (conTemas.length === 0) return 0;
    const sum = conTemas.reduce((acc, m) => {
      const pct = Math.min(100, Math.round((m.pasosCompletados / m.totalPasos) * 100));
      return acc + pct;
    }, 0);
    return Math.round(sum / conTemas.length);
  }, [misiones]);

  /** Con racha 0 mostramos batería “llena” (5/5); con racha > 0 refleja impulso diario (tope 5). */
  const energia = racha === 0 ? 5 : Math.min(5, racha);

  const loading = loadingMisiones || loadingExtra;

  return {
    puntos,
    racha,
    porcentajeGlobal,
    energia,
    loading,
    error,
  };
}
