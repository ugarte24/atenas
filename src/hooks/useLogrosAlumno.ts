import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import {
  construirLogros,
  diasConActividad,
  calcularRachaActual,
  type LogroGamificacion,
} from '../lib/gamificacion';

export type Logro = LogroGamificacion;

type EstadoLogros = {
  logros: Logro[];
  loading: boolean;
  error: string | null;
};

/** Misma lógica que el panel de perfil (gamificación); útil si se usa fuera del dashboard. */
export function useLogrosAlumno(): EstadoLogros {
  const { user } = useAuthContext();
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogros() {
      if (!user) {
        setLogros([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [actRes, evalRes] = await Promise.all([
          supabase
            .from('actividad_intentos')
            .select('puntuacion, completado_at')
            .eq('user_id', user.id),
          supabase
            .from('evaluacion_intentos')
            .select('evaluacion_id, puntuacion, aprobado, completado_at')
            .eq('user_id', user.id),
        ]);
        if (cancelled) return;
        if (actRes.error) throw actRes.error;
        if (evalRes.error) throw evalRes.error;

        const actos = (actRes.data ?? []) as { puntuacion: number; completado_at: string }[];
        const evals = (evalRes.data ?? []) as {
          evaluacion_id: string;
          puntuacion: number;
          aprobado: boolean;
          completado_at: string;
        }[];

        const fechas = [
          ...actos.map((a) => a.completado_at),
          ...evals.map((e) => e.completado_at),
        ].filter(Boolean);
        const dias = diasConActividad(fechas);
        const racha = calcularRachaActual(dias);

        let dias7 = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const da = String(d.getDate()).padStart(2, '0');
          if (dias.has(`${y}-${m}-${da}`)) dias7++;
        }

        const evalIds = new Set(evals.map((e) => e.evaluacion_id));
        const aprobEvalIds = new Set(
          evals.filter((e) => e.aprobado).map((e) => e.evaluacion_id)
        );
        setLogros(
          construirLogros({
            actividadesCompletadas: actos.length,
            evaluacionesCompletadas: evalIds.size,
            aprobadas: aprobEvalIds.size,
            maxEval: evals.length ? Math.max(...evals.map((e) => e.puntuacion)) : 0,
            primeraEvalAprobada: aprobEvalIds.size > 0,
            diasDistintosUltimos7: dias7,
            racha,
          })
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los logros');
        setLogros([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLogros();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { logros, loading, error };
}
