import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ProgresoUnidadAgregado = {
  unidadId: string;
  label: string;
  porcentajePromedio: number;
};

export function useProgresoUnidadesAgregado(unidadIds: string[]) {
  const [items, setItems] = useState<ProgresoUnidadAgregado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unidadIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const [profilesRes, temasRes, actPubRes, evalPubRes, actIntRes, evalIntRes] =
          await Promise.all([
            supabase.from('profiles').select('id').eq('role', 'estudiante'),
            supabase.from('temas').select('id, unidad_id').in('unidad_id', unidadIds),
            supabase.from('actividades').select('id, tema_id').eq('publicada', true),
            supabase.from('evaluaciones').select('id, tema_id').eq('publicada', true),
            supabase.from('actividad_intentos').select('user_id, actividad_id'),
            supabase.from('evaluacion_intentos').select('user_id, evaluacion_id'),
          ]);

        if (cancelled) return;
        const estudiantes = (profilesRes.data ?? []) as { id: string }[];
        const temas = (temasRes.data ?? []) as { id: string; unidad_id: string }[];
        const acts = (actPubRes.data ?? []) as { id: string; tema_id: string }[];
        const evals = (evalPubRes.data ?? []) as { id: string; tema_id: string }[];
        const actDone = new Set(
          (actIntRes.data ?? []).map((r: { user_id: string; actividad_id: string }) => `${r.user_id}:${r.actividad_id}`)
        );
        const evalDone = new Set(
          (evalIntRes.data ?? []).map((r: { user_id: string; evaluacion_id: string }) => `${r.user_id}:${r.evaluacion_id}`)
        );

        const temasPorUnidad = new Map<string, string[]>();
        for (const t of temas) {
          if (!temasPorUnidad.has(t.unidad_id)) temasPorUnidad.set(t.unidad_id, []);
          temasPorUnidad.get(t.unidad_id)!.push(t.id);
        }

        const itemsOut: ProgresoUnidadAgregado[] = unidadIds.map((unidadId, i) => {
          const temaIds = temasPorUnidad.get(unidadId) ?? [];
          const actIds = acts.filter((a) => temaIds.includes(a.tema_id)).map((a) => a.id);
          const evalIds = evals.filter((e) => temaIds.includes(e.tema_id)).map((e) => e.id);
          const totalItems = actIds.length + evalIds.length;

          if (estudiantes.length === 0 || totalItems === 0) {
            return { unidadId, label: `U${i + 1}`, porcentajePromedio: 0 };
          }

          let sumPct = 0;
          for (const est of estudiantes) {
            let done = 0;
            for (const id of actIds) if (actDone.has(`${est.id}:${id}`)) done++;
            for (const id of evalIds) if (evalDone.has(`${est.id}:${id}`)) done++;
            sumPct += Math.round((done / totalItems) * 100);
          }
          return {
            unidadId,
            label: `U${i + 1}`,
            porcentajePromedio: Math.round(sumPct / estudiantes.length),
          };
        });

        if (!cancelled) setItems(itemsOut);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [unidadIds.join('|')]);

  return { items, loading };
}
