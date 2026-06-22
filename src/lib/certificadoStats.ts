import { supabase } from './supabase';
import { progresoPorcentajeUnidad } from './progresoUnidad';
import { generarCertificadoId } from './certificadoId';
import type { CertificadoParams } from './certificadoPrintHtml';

export type CertificadoStats = {
  actividadesCompletadas: number;
  actividadesTotal: number;
  evaluacionesAprobadas: number;
  evaluacionesTotal: number;
  tiempoEstudioSegundos: number;
};

export async function fetchCertificadoStats(
  userId: string,
  unidadId: string
): Promise<CertificadoStats> {
  const { data: temas, error: e1 } = await supabase
    .from('temas')
    .select('id')
    .eq('unidad_id', unidadId);
  if (e1 || !temas?.length) {
    return {
      actividadesCompletadas: 0,
      actividadesTotal: 0,
      evaluacionesAprobadas: 0,
      evaluacionesTotal: 0,
      tiempoEstudioSegundos: 0,
    };
  }

  const temaIds = temas.map((t: { id: string }) => t.id);

  const [acts, evals, progresoRes] = await Promise.all([
    supabase.from('actividades').select('id').in('tema_id', temaIds).eq('publicada', true),
    supabase.from('evaluaciones').select('id').in('tema_id', temaIds).eq('publicada', true),
    supabase
      .from('progreso_tema')
      .select('tema_id, tiempo_estudio_segundos')
      .eq('user_id', userId)
      .in('tema_id', temaIds),
  ]);

  const actIds = (acts.data ?? []).map((a: { id: string }) => a.id);
  const evalIds = (evals.data ?? []).map((e: { id: string }) => e.id);

  let tiempoEstudioSegundos = 0;
  for (const row of (progresoRes.data ?? []) as {
    tiempo_estudio_segundos?: number;
  }[]) {
    tiempoEstudioSegundos += row.tiempo_estudio_segundos ?? 0;
  }

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
          .select('evaluacion_id, aprobado')
          .eq('user_id', userId)
          .in('evaluacion_id', evalIds)
      : Promise.resolve({ data: [] as { evaluacion_id: string; aprobado: boolean }[] }),
  ]);

  const doneAct = new Set((ia.data ?? []).map((r) => r.actividad_id));
  const approvedEval = new Set<string>();
  for (const row of (ie.data ?? []) as { evaluacion_id: string; aprobado: boolean }[]) {
    if (row.aprobado) approvedEval.add(row.evaluacion_id);
  }

  return {
    actividadesCompletadas: actIds.filter((id) => doneAct.has(id)).length,
    actividadesTotal: actIds.length,
    evaluacionesAprobadas: evalIds.filter((id) => approvedEval.has(id)).length,
    evaluacionesTotal: evalIds.length,
    tiempoEstudioSegundos,
  };
}

export async function buildCertificadoParams(
  userId: string,
  unidadId: string,
  base: {
    nombreEstudiante: string;
    tituloUnidad: string;
    umbralCertificado: number;
    porcentajeUnidad?: number;
  }
): Promise<CertificadoParams> {
  const [pct, stats] = await Promise.all([
    base.porcentajeUnidad != null
      ? Promise.resolve(base.porcentajeUnidad)
      : progresoPorcentajeUnidad(userId, unidadId),
    fetchCertificadoStats(userId, unidadId),
  ]);

  return {
    nombreEstudiante: base.nombreEstudiante,
    tituloUnidad: base.tituloUnidad,
    porcentajeUnidad: pct,
    umbralCertificado: base.umbralCertificado,
    ...stats,
    certificadoId: generarCertificadoId(userId, unidadId),
  };
}
