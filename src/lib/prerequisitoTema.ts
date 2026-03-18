import { supabase } from './supabase';

/** El estudiante completó todas las actividades y evaluaciones publicadas del tema prerequisito */
export async function usuarioCumplePrerequisitoTema(
  userId: string,
  temaPrerequisitoId: string | null | undefined
): Promise<boolean> {
  if (!temaPrerequisitoId || !userId) return true;
  const [actsRes, evalsRes] = await Promise.all([
    supabase.from('actividades').select('id').eq('tema_id', temaPrerequisitoId).eq('publicada', true),
    supabase.from('evaluaciones').select('id').eq('tema_id', temaPrerequisitoId).eq('publicada', true),
  ]);
  if (actsRes.error || evalsRes.error) return false;
  const actIds = (actsRes.data ?? []).map((a: { id: string }) => a.id);
  const evalIds = (evalsRes.data ?? []).map((e: { id: string }) => e.id);
  if (actIds.length === 0 && evalIds.length === 0) return true;
  const [ia, ie] = await Promise.all([
    actIds.length
      ? supabase
          .from('actividad_intentos')
          .select('actividad_id')
          .eq('user_id', userId)
          .in('actividad_id', actIds)
      : Promise.resolve({ data: [] as { actividad_id: string }[] }),
    evalIds.length
      ? supabase
          .from('evaluacion_intentos')
          .select('evaluacion_id')
          .eq('user_id', userId)
          .in('evaluacion_id', evalIds)
      : Promise.resolve({ data: [] as { evaluacion_id: string }[] }),
  ]);
  const hechasAct = new Set((ia.data ?? []).map((r) => r.actividad_id));
  const hechasEval = new Set((ie.data ?? []).map((r) => r.evaluacion_id));
  for (const id of actIds) if (!hechasAct.has(id)) return false;
  for (const id of evalIds) if (!hechasEval.has(id)) return false;
  return true;
}
