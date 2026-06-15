import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface IntentoActividad {
  id: string;
  user_id: string;
  actividad_id: string;
  puntuacion: number;
  completado_at: string;
}

export interface IntentoEvaluacion {
  id: string;
  user_id: string;
  evaluacion_id: string;
  puntuacion: number;
  aprobado: boolean;
  completado_at: string;
  tiempo_segundos?: number | null;
}

export interface ProgresoEstudiante {
  user_id: string;
  full_name: string;
  email: string;
  actividadesCompletadas: number;
  evaluacionesCompletadas: number;
  promedioActividades: number;
  promedioEvaluaciones: number;
  logrosEstimados: number;
  tiempoEstudioSegundos: number;
}

export function useProgresoEstudiantes() {
  const [estudiantes, setEstudiantes] = useState<ProgresoEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [profilesRes, actividadesRes, evaluacionesRes, progresoRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email').eq('role', 'estudiante'),
          supabase.from('actividad_intentos').select('user_id, puntuacion'),
          supabase
            .from('evaluacion_intentos')
            .select('user_id, evaluacion_id, puntuacion, aprobado, tiempo_segundos'),
          supabase.from('progreso_tema').select('user_id, tiempo_estudio_segundos'),
        ]);

        if (cancelled) return;

        if (profilesRes.error) throw profilesRes.error;
        if (actividadesRes.error) throw actividadesRes.error;
        if (evaluacionesRes.error) throw evaluacionesRes.error;
        if (progresoRes.error) throw progresoRes.error;

        const profiles = (profilesRes.data ?? []) as { id: string; full_name: string; email: string }[];
        const intentosAct = (actividadesRes.data ?? []) as IntentoActividad[];
        const intentosEval = (evaluacionesRes.data ?? []) as IntentoEvaluacion[];
        const progresoTemas = (progresoRes.data ?? []) as {
          user_id: string;
          tiempo_estudio_segundos?: number;
        }[];

        const tiempoPorUsuario = new Map<string, number>();
        for (const row of progresoTemas) {
          tiempoPorUsuario.set(
            row.user_id,
            (tiempoPorUsuario.get(row.user_id) ?? 0) + (row.tiempo_estudio_segundos ?? 0)
          );
        }
        for (const row of intentosEval) {
          if (row.tiempo_segundos && row.tiempo_segundos > 0) {
            tiempoPorUsuario.set(
              row.user_id,
              (tiempoPorUsuario.get(row.user_id) ?? 0) + row.tiempo_segundos
            );
          }
        }

        const byUser = new Map<string, { act: number[]; evalPorEval: Map<string, number[]> }>();
        profiles.forEach((p) => byUser.set(p.id, { act: [], evalPorEval: new Map() }));
        intentosAct.forEach((i) => {
          const d = byUser.get(i.user_id);
          if (d) d.act.push(i.puntuacion);
        });
        intentosEval.forEach((i) => {
          const d = byUser.get(i.user_id);
          if (!d) return;
          if (!d.evalPorEval.has(i.evaluacion_id)) d.evalPorEval.set(i.evaluacion_id, []);
          d.evalPorEval.get(i.evaluacion_id)!.push(i.puntuacion);
        });

        const list: ProgresoEstudiante[] = profiles.map((p) => {
          const d = byUser.get(p.id) ?? { act: [], evalPorEval: new Map() };
          const act = d.act;
          const evalPorEval = d.evalPorEval;
          const promAct = act.length ? Math.round(act.reduce((a, b) => a + b, 0) / act.length) : 0;
          const mejoresEval = [...evalPorEval.values()].map((pts) => Math.max(...pts));
          const promEval = mejoresEval.length
            ? Math.round(mejoresEval.reduce((a, b) => a + b, 0) / mejoresEval.length)
            : 0;
          let logrosEstimados = 0;
          if (act.length >= 5) logrosEstimados += 1;
          if (evalPorEval.size >= 3) logrosEstimados += 1;
          if (promEval >= 80) logrosEstimados += 1;

          return {
            user_id: p.id,
            full_name: p.full_name,
            email: p.email,
            actividadesCompletadas: act.length,
            evaluacionesCompletadas: evalPorEval.size,
            promedioActividades: promAct,
            promedioEvaluaciones: promEval,
            logrosEstimados,
            tiempoEstudioSegundos: tiempoPorUsuario.get(p.id) ?? 0,
          };
        });

        setEstudiantes(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar');
        setEstudiantes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return { estudiantes, loading, error };
}
