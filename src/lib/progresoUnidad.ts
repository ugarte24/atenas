import { supabase } from './supabase';

export async function progresoPorcentajeUnidad(
  userId: string,
  unidadId: string
): Promise<number> {
  const { data: temas, error: e1 } = await supabase
    .from('temas')
    .select('id')
    .eq('unidad_id', unidadId);
  if (e1 || !temas?.length) return 0;
  const temaIds = temas.map((t: { id: string }) => t.id);
  const [acts, evals] = await Promise.all([
    supabase.from('actividades').select('id').in('tema_id', temaIds).eq('publicada', true),
    supabase.from('evaluaciones').select('id').in('tema_id', temaIds).eq('publicada', true),
  ]);
  const actIds = (acts.data ?? []).map((a: { id: string }) => a.id);
  const evalIds = (evals.data ?? []).map((e: { id: string }) => e.id);
  const total = actIds.length + evalIds.length;
  if (total === 0) return 100;
  const [ia, ie] = await Promise.all([
    actIds.length
      ? supabase.from('actividad_intentos').select('actividad_id').eq('user_id', userId).in('actividad_id', actIds)
      : Promise.resolve({ data: [] as { actividad_id: string }[] }),
    evalIds.length
      ? supabase
          .from('evaluacion_intentos')
          .select('evaluacion_id')
          .eq('user_id', userId)
          .in('evaluacion_id', evalIds)
      : Promise.resolve({ data: [] as { evaluacion_id: string }[] }),
  ]);
  const doneAct = new Set((ia.data ?? []).map((r) => r.actividad_id));
  const doneEval = new Set((ie.data ?? []).map((r) => r.evaluacion_id));
  let done = 0;
  for (const id of actIds) if (doneAct.has(id)) done++;
  for (const id of evalIds) if (doneEval.has(id)) done++;
  return Math.round((done / total) * 100);
}
