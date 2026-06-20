import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type EvaluacionResumenAlumno = {
  intentos: number;
  mejorPuntuacion: number | null;
  aprobadoAlguna: boolean;
};

export function formatMaxIntentos(max: number | null | undefined): string {
  if (max == null || max <= 0) return 'Ilimitados';
  return String(max);
}

export function useResumenEvaluacionesUsuario(
  evaluacionIds: string[],
  userId: string | null | undefined
) {
  const [porId, setPorId] = useState<Record<string, EvaluacionResumenAlumno>>({});
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const idsKey = evaluacionIds.join(',');

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setRefresh((n) => n + 1);
    };
    window.addEventListener('pageshow', onVisible);
    window.addEventListener('popstate', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('pageshow', onVisible);
      window.removeEventListener('popstate', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    if (!userId || evaluacionIds.length === 0) {
      setPorId({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const { data, error } = await supabase
        .from('evaluacion_intentos')
        .select('evaluacion_id, puntuacion, aprobado')
        .eq('user_id', userId)
        .in('evaluacion_id', evaluacionIds);
      if (cancelled) return;
      if (error) {
        setPorId({});
        setLoading(false);
        return;
      }
      const acc: Record<string, EvaluacionResumenAlumno> = {};
      for (const row of (data ?? []) as {
        evaluacion_id: string;
        puntuacion: number;
        aprobado: boolean;
      }[]) {
        const prev = acc[row.evaluacion_id] ?? {
          intentos: 0,
          mejorPuntuacion: null,
          aprobadoAlguna: false,
        };
        acc[row.evaluacion_id] = {
          intentos: prev.intentos + 1,
          mejorPuntuacion:
            prev.mejorPuntuacion == null
              ? row.puntuacion
              : Math.max(prev.mejorPuntuacion, row.puntuacion),
          aprobadoAlguna: prev.aprobadoAlguna || row.aprobado,
        };
      }
      setPorId(acc);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, idsKey, evaluacionIds, refresh]);

  return { porId, loading };
}
