import { supabase } from './supabase';
import { progresoPorcentajeUnidad } from './progresoUnidad';
import type { UnitAdventureProgress } from './adventureMapTypes';

export async function fetchAdventureProgressForUnit(
  userId: string,
  unidadId: string
): Promise<UnitAdventureProgress> {
  const progressPct = await progresoPorcentajeUnidad(userId, unidadId);

  const { data: temas } = await supabase.from('temas').select('id').eq('unidad_id', unidadId);
  if (!temas?.length) return { progressPct, avgScore: progressPct >= 100 ? 100 : 0 };

  const temaIds = temas.map((t: { id: string }) => t.id);
  const [acts, evals] = await Promise.all([
    supabase.from('actividades').select('id').in('tema_id', temaIds).eq('publicada', true),
    supabase.from('evaluaciones').select('id').in('tema_id', temaIds).eq('publicada', true),
  ]);

  const actIds = (acts.data ?? []).map((a: { id: string }) => a.id);
  const evalIds = (evals.data ?? []).map((e: { id: string }) => e.id);

  if (actIds.length === 0 && evalIds.length === 0) {
    return { progressPct, avgScore: progressPct >= 100 ? 100 : 0 };
  }

  const [ia, ie] = await Promise.all([
    actIds.length
      ? supabase
          .from('actividad_intentos')
          .select('puntuacion')
          .eq('user_id', userId)
          .in('actividad_id', actIds)
      : Promise.resolve({ data: [] as { puntuacion: number }[] }),
    evalIds.length
      ? supabase
          .from('evaluacion_intentos')
          .select('puntuacion')
          .eq('user_id', userId)
          .in('evaluacion_id', evalIds)
      : Promise.resolve({ data: [] as { puntuacion: number }[] }),
  ]);

  const scores = [
    ...(ia.data ?? []).map((r) => r.puntuacion ?? 0),
    ...(ie.data ?? []).map((r) => r.puntuacion ?? 0),
  ];

  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return { progressPct, avgScore };
}

export async function fetchAdventureProgressForUnits(
  userId: string,
  unidadIds: string[]
): Promise<Record<string, UnitAdventureProgress>> {
  const entries = await Promise.all(
    unidadIds.map(async (id) => {
      const p = await fetchAdventureProgressForUnit(userId, id);
      return [id, p] as const;
    })
  );
  return Object.fromEntries(entries);
}

export const EMPTY_PROGRESS: UnitAdventureProgress = { progressPct: 0, avgScore: 0 };
