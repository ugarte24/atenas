import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export type Mision = {
  id: string;
  titulo: string;
  descripcion: string | null;
  /** Orden curricular de la unidad (coincide con `unidades.orden`) */
  orden: number;
  totalPasos: number;
  pasosCompletados: number;
};

type EstadoMisiones = {
  misiones: Mision[];
  loading: boolean;
  error: string | null;
};

export function useMisionesAlumno(): EstadoMisiones {
  const { user } = useAuthContext();
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMisiones() {
      if (!user) {
        setMisiones([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Una misión por unidad: pasos = temas de la unidad
        const [unidadesRes, temasRes, actRes, evalRes] = await Promise.all([
          supabase
            .from('unidades')
            .select('id, title, description, orden')
            .order('orden', { ascending: true }),
          supabase.from('temas').select('id, unidad_id'),
          supabase
            .from('actividad_intentos')
            .select('actividad_id')
            .eq('user_id', user.id),
          supabase
            .from('evaluacion_intentos')
            .select('evaluacion_id')
            .eq('user_id', user.id),
        ]);
        if (cancelled) return;
        if (unidadesRes.error) throw unidadesRes.error;
        if (temasRes.error) throw temasRes.error;
        if (actRes.error) throw actRes.error;
        if (evalRes.error) throw evalRes.error;

        const unidades = (unidadesRes.data ?? []) as {
          id: string;
          title: string;
          description: string | null;
          orden: number | null;
        }[];
        const temas = (temasRes.data ?? []) as { id: string; unidad_id: string }[];

        // Para estimar pasos completados por unidad,
        // contamos cuántos temas tienen al menos una actividad o evaluación completada.
        const temasPorUnidad = new Map<string, string[]>();
        temas.forEach((t) => {
          if (!temasPorUnidad.has(t.unidad_id)) temasPorUnidad.set(t.unidad_id, []);
          temasPorUnidad.get(t.unidad_id)!.push(t.id);
        });

        const actIds = new Set(
          ((actRes.data ?? []) as { actividad_id: string }[]).map((i) => i.actividad_id)
        );
        const evalIds = new Set(
          ((evalRes.data ?? []) as { evaluacion_id: string }[]).map((i) => i.evaluacion_id)
        );

        // Obtenemos actividades y evaluaciones para saber a qué tema pertenecen
        const [actsDetalleRes, evalsDetalleRes] = await Promise.all([
          supabase.from('actividades').select('id, tema_id'),
          supabase.from('evaluaciones').select('id, tema_id'),
        ]);
        if (cancelled) return;
        if (actsDetalleRes.error) throw actsDetalleRes.error;
        if (evalsDetalleRes.error) throw evalsDetalleRes.error;

        const actsDetalle = (actsDetalleRes.data ?? []) as { id: string; tema_id: string }[];
        const evalsDetalle = (evalsDetalleRes.data ?? []) as { id: string; tema_id: string }[];

        const temasConProgreso = new Set<string>();
        actsDetalle.forEach((a) => {
          if (actIds.has(a.id)) temasConProgreso.add(a.tema_id);
        });
        evalsDetalle.forEach((e) => {
          if (evalIds.has(e.id)) temasConProgreso.add(e.tema_id);
        });

        const misionesCalculadas: Mision[] = unidades.map((u) => {
          const temasUnidad = temasPorUnidad.get(u.id) ?? [];
          const totalPasos = temasUnidad.length;
          let pasosCompletados = 0;
          temasUnidad.forEach((temaId) => {
            if (temasConProgreso.has(temaId)) pasosCompletados += 1;
          });
          return {
            id: u.id,
            titulo: u.title,
            descripcion: u.description,
            orden: u.orden ?? 0,
            totalPasos,
            pasosCompletados,
          };
        });

        setMisiones(misionesCalculadas);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar las misiones');
        setMisiones([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMisiones();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { misiones, loading, error };
}

