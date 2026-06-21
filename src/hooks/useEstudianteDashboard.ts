import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { useMapRewards } from './useMapRewards';
import {
  xpDesdePuntuacionIntentos,
  nivelDesdeXp,
  diasConActividad,
  calcularRachaActual,
  hoyTieneActividad,
} from '../lib/gamificacion';

export type TemaProgresoRow = {
  temaId: string;
  titulo: string;
  totalItems: number;
  completados: number;
  porcentaje: number;
};

export type UnidadProgresoRow = {
  unidadId: string;
  titulo: string;
  orden: number;
  temas: TemaProgresoRow[];
  porcentaje: number;
};

export type TimelineItem = {
  id: string;
  tipo: 'actividad' | 'evaluacion';
  titulo: string;
  fechaIso: string;
  etiqueta: string;
};

export type EstudianteDashboard = {
  unidades: UnidadProgresoRow[];
  timeline: TimelineItem[];
  xp: number;
  nivel: ReturnType<typeof nivelDesdeXp>;
  racha: number;
  /** Racha ≥2 y aún no practicó hoy (recordatorio suave) */
  rachaEnRiesgo: boolean;
  loading: boolean;
  error: string | null;
};

export function useEstudianteDashboard(enabled: boolean): EstudianteDashboard {
  const { user } = useAuthContext();
  const { bonusXp } = useMapRewards(enabled);
  const [state, setState] = useState<
    Omit<EstudianteDashboard, 'nivel' | 'rachaEnRiesgo'> & {
      nivel: ReturnType<typeof nivelDesdeXp> | null;
      racha: number;
      rachaEnRiesgo: boolean;
    }
  >({
    unidades: [],
    timeline: [],
    xp: 0,
    nivel: null,
    racha: 0,
    rachaEnRiesgo: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !user) {
      setState((s) => ({
        ...s,
        unidades: [],
        timeline: [],
        xp: 0,
        nivel: null,
        racha: 0,
        rachaEnRiesgo: false,
        loading: false,
        error: null,
      }));
      return;
    }
    const userId = user.id;
    let cancelled = false;

    async function run() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [
          unRes,
          temasRes,
          actPubRes,
          evalPubRes,
          actUserRes,
          evalUserRes,
        ] = await Promise.all([
          supabase.from('unidades').select('id, title, orden').order('orden', { ascending: true }),
          supabase.from('temas').select('id, title, orden, unidad_id').order('orden', { ascending: true }),
          supabase.from('actividades').select('id, tema_id, title').eq('publicada', true),
          supabase.from('evaluaciones').select('id, tema_id, title').eq('publicada', true),
          supabase
            .from('actividad_intentos')
            .select('actividad_id, puntuacion, completado_at')
            .eq('user_id', userId),
          supabase
            .from('evaluacion_intentos')
            .select('evaluacion_id, puntuacion, aprobado, completado_at')
            .eq('user_id', userId),
        ]);
        if (cancelled) return;
        if (unRes.error) throw unRes.error;
        if (temasRes.error) throw temasRes.error;
        if (actPubRes.error) throw actPubRes.error;
        if (evalPubRes.error) throw evalPubRes.error;
        if (actUserRes.error) throw actUserRes.error;
        if (evalUserRes.error) throw evalUserRes.error;

        const actividadesPub = (actPubRes.data ?? []) as {
          id: string;
          tema_id: string;
          title: string;
        }[];
        const evalsPub = (evalPubRes.data ?? []) as {
          id: string;
          tema_id: string;
          title: string;
        }[];

        const actPorTema = new Map<string, { id: string; title: string }[]>();
        for (const a of actividadesPub) {
          if (!actPorTema.has(a.tema_id)) actPorTema.set(a.tema_id, []);
          actPorTema.get(a.tema_id)!.push({ id: a.id, title: a.title });
        }
        const evalPorTema = new Map<string, { id: string; title: string }[]>();
        for (const e of evalsPub) {
          if (!evalPorTema.has(e.tema_id)) evalPorTema.set(e.tema_id, []);
          evalPorTema.get(e.tema_id)!.push({ id: e.id, title: e.title });
        }

        const actHechas = new Set(
          (actUserRes.data ?? []).map((r: { actividad_id: string }) => r.actividad_id)
        );
        const evalHechas = new Set(
          (evalUserRes.data ?? []).map((r: { evaluacion_id: string }) => r.evaluacion_id)
        );

        const tituloAct = new Map(actividadesPub.map((a) => [a.id, a.title]));
        const tituloEval = new Map(evalsPub.map((e) => [e.id, e.title]));

        const unidadesRaw = (unRes.data ?? []) as { id: string; title: string; orden: number }[];
        const temasAll = (temasRes.data ?? []) as {
          id: string;
          title: string;
          orden: number;
          unidad_id: string;
        }[];
        const temasPorUnidad = new Map<string, typeof temasAll>();
        for (const t of temasAll) {
          if (!temasPorUnidad.has(t.unidad_id)) temasPorUnidad.set(t.unidad_id, []);
          temasPorUnidad.get(t.unidad_id)!.push(t);
        }
        const unidades: UnidadProgresoRow[] = [];

        for (const u of unidadesRaw) {
          const temasOrden = [...(temasPorUnidad.get(u.id) ?? [])].sort(
            (a, b) => a.orden - b.orden || a.id.localeCompare(b.id)
          );
          const temasProg: TemaProgresoRow[] = [];
          let uTot = 0;
          let uDone = 0;
          for (const t of temasOrden) {
            const acts = actPorTema.get(t.id) ?? [];
            const evs = evalPorTema.get(t.id) ?? [];
            const totalItems = acts.length + evs.length;
            let completados = 0;
            for (const a of acts) if (actHechas.has(a.id)) completados++;
            for (const e of evs) if (evalHechas.has(e.id)) completados++;
            uTot += totalItems;
            uDone += completados;
            const porcentaje =
              totalItems > 0 ? Math.round((completados / totalItems) * 100) : totalItems === 0 ? 100 : 0;
            temasProg.push({
              temaId: t.id,
              titulo: t.title,
              totalItems,
              completados,
              porcentaje,
            });
          }
          unidades.push({
            unidadId: u.id,
            titulo: u.title,
            orden: u.orden,
            temas: temasProg,
            porcentaje: uTot > 0 ? Math.round((uDone / uTot) * 100) : 100,
          });
        }

        const actRows = (actUserRes.data ?? []) as {
          actividad_id: string;
          puntuacion: number;
          completado_at: string;
        }[];
        const evalRows = (evalUserRes.data ?? []) as {
          evaluacion_id: string;
          puntuacion: number;
          aprobado: boolean;
          completado_at: string;
        }[];

        const timeline: TimelineItem[] = [];
        for (const r of actRows) {
          const t = tituloAct.get(r.actividad_id) ?? 'Actividad';
          timeline.push({
            id: `a-${r.actividad_id}-${r.completado_at}`,
            tipo: 'actividad',
            titulo: t,
            fechaIso: r.completado_at || new Date().toISOString(),
            etiqueta: `${r.puntuacion}%`,
          });
        }
        for (const r of evalRows) {
          const t = tituloEval.get(r.evaluacion_id) ?? 'Evaluación';
          timeline.push({
            id: `e-${r.evaluacion_id}-${r.completado_at}`,
            tipo: 'evaluacion',
            titulo: t,
            fechaIso: r.completado_at || new Date().toISOString(),
            etiqueta: r.aprobado ? `Aprobado ${r.puntuacion}%` : `${r.puntuacion}%`,
          });
        }
        timeline.sort((a, b) => (a.fechaIso < b.fechaIso ? 1 : -1));
        const timelineTop = timeline.slice(0, 25);

        const sumaAct = actRows.reduce((s, r) => s + r.puntuacion, 0);
        const sumaEval = evalRows.reduce((s, r) => s + r.puntuacion, 0);
        const xp = xpDesdePuntuacionIntentos(sumaAct, sumaEval) + bonusXp;
        const nivel = nivelDesdeXp(xp);

        const fechas = [
          ...actRows.map((r) => r.completado_at),
          ...evalRows.map((r) => r.completado_at),
        ].filter(Boolean);
        const dias = diasConActividad(fechas);
        const racha = calcularRachaActual(dias);

        const hoyOk = hoyTieneActividad(dias);
        const rachaEnRiesgo = racha >= 2 && !hoyOk;

        setState({
          unidades,
          timeline: timelineTop,
          xp,
          nivel,
          racha,
          rachaEnRiesgo,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            unidades: [],
            timeline: [],
            xp: 0,
            nivel: null,
            racha: 0,
            rachaEnRiesgo: false,
            loading: false,
            error: e instanceof Error ? e.message : 'Error al cargar',
          }));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, user?.id, bonusXp]);

  return {
    unidades: state.unidades,
    timeline: state.timeline,
    xp: state.xp,
    nivel: state.nivel ?? nivelDesdeXp(0),
    racha: state.racha,
    rachaEnRiesgo: state.rachaEnRiesgo,
    loading: state.loading,
    error: state.error,
  };
}
