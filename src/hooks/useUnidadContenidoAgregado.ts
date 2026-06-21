import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type RecursoAgregado = {
  id: string;
  temaId: string;
  temaTitulo: string;
  tipo: string;
  title: string | null;
  url: string;
};

export type ActividadAgregada = {
  id: string;
  temaId: string;
  temaTitulo: string;
  title: string;
  completada: boolean;
  bloqueada: boolean;
};

export type EvaluacionAgregada = {
  id: string;
  temaId: string;
  temaTitulo: string;
  title: string;
  completada: boolean;
  bloqueada: boolean;
};

export function useUnidadContenidoAgregado(
  unidadId: string | null,
  temaIds: string[],
  temas: { id: string; title: string; prerequisito_tema_id: string | null }[],
  bloqueoTema: Record<string, boolean>,
  userId: string | undefined,
  isStudent: boolean
) {
  const [recursos, setRecursos] = useState<RecursoAgregado[]>([]);
  const [actividades, setActividades] = useState<ActividadAgregada[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAgregada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unidadId || temaIds.length === 0) {
      setRecursos([]);
      setActividades([]);
      setEvaluaciones([]);
      setLoading(false);
      return;
    }

    let cancel = false;
    void (async () => {
      setLoading(true);
      const temaMap = new Map(temas.map((t) => [t.id, t.title]));

      const [recRes, actRes, evalRes, actDoneRes, evalDoneRes] = await Promise.all([
        supabase.from('recursos').select('id, tema_id, tipo, title, url').in('tema_id', temaIds),
        supabase.from('actividades').select('id, tema_id, title').in('tema_id', temaIds).eq('publicada', true),
        supabase.from('evaluaciones').select('id, tema_id, title').in('tema_id', temaIds).eq('publicada', true),
        userId && isStudent
          ? supabase.from('actividad_intentos').select('actividad_id').eq('user_id', userId)
          : Promise.resolve({ data: [], error: null }),
        userId && isStudent
          ? supabase.from('evaluacion_intentos').select('evaluacion_id').eq('user_id', userId)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (cancel) return;

      const actHechas = new Set(
        ((actDoneRes.data ?? []) as { actividad_id: string }[]).map((r) => r.actividad_id)
      );
      const evalHechas = new Set(
        ((evalDoneRes.data ?? []) as { evaluacion_id: string }[]).map((r) => r.evaluacion_id)
      );

      setRecursos(
        ((recRes.data ?? []) as { id: string; tema_id: string; tipo: string; title: string | null; url: string }[]).map(
          (r) => ({
            id: r.id,
            temaId: r.tema_id,
            temaTitulo: temaMap.get(r.tema_id) ?? 'Tema',
            tipo: r.tipo,
            title: r.title,
            url: r.url,
          })
        )
      );

      setActividades(
        ((actRes.data ?? []) as { id: string; tema_id: string; title: string }[]).map((a) => ({
          id: a.id,
          temaId: a.tema_id,
          temaTitulo: temaMap.get(a.tema_id) ?? 'Tema',
          title: a.title,
          completada: actHechas.has(a.id),
          bloqueada: bloqueoTema[a.tema_id] === true,
        }))
      );

      setEvaluaciones(
        ((evalRes.data ?? []) as { id: string; tema_id: string; title: string }[]).map((e) => ({
          id: e.id,
          temaId: e.tema_id,
          temaTitulo: temaMap.get(e.tema_id) ?? 'Tema',
          title: e.title,
          completada: evalHechas.has(e.id),
          bloqueada: bloqueoTema[e.tema_id] === true,
        }))
      );

      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [unidadId, temaIds.join(','), temas, bloqueoTema, userId, isStudent]);

  return { recursos, actividades, evaluaciones, loading };
}
