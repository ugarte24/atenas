import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from './useMisiones';
import { useMapRewards } from './useMapRewards';
import {
  xpDesdePuntuacionIntentos,
  diasConActividad,
  calcularRachaActual,
} from '../lib/gamificacion';

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

export function useGamificacionEstudiante(): GamificacionEstudiante {
  const { user, profile } = useAuthContext();
  const { misiones, loading: loadingMisiones } = useMisionesAlumno();
  const isStudent = profile?.role === 'estudiante';
  const { bonusXp, loading: loadingRewards } = useMapRewards(isStudent);
  const [puntosBase, setPuntosBase] = useState(0);
  const [racha, setRacha] = useState(0);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPuntosYRacha() {
      if (!user || profile?.role !== 'estudiante') {
        setPuntosBase(0);
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
        const sumPts = xpDesdePuntuacionIntentos(
          rowsAct.reduce((s, r) => s + (r.puntuacion ?? 0), 0),
          rowsEval.reduce((s, r) => s + (r.puntuacion ?? 0), 0)
        );

        const fechas = [...rowsAct, ...rowsEval]
          .map((r) => r.completado_at)
          .filter(Boolean) as string[];
        setPuntosBase(sumPts);
        setRacha(calcularRachaActual(diasConActividad(fechas)));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error de gamificación');
          setPuntosBase(0);
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

  const energia = racha === 0 ? 5 : Math.min(5, racha);
  const loading = loadingMisiones || loadingExtra || loadingRewards;

  return {
    puntos: puntosBase + bonusXp,
    racha,
    porcentajeGlobal,
    energia,
    loading,
    error,
  };
}
