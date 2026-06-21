import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export type ActividadReciente = {
  id: string;
  tipo: 'actividad' | 'evaluacion';
  titulo: string;
  puntuacion: number;
  fecha: string;
};

export function useActividadReciente(limit = 8) {
  const { user, profile } = useAuthContext();
  const [items, setItems] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante') {
      setItems([]);
      setLoading(false);
      return;
    }
    let c = false;
    void (async () => {
      setLoading(true);
      const [actRes, evalRes] = await Promise.all([
        supabase
          .from('actividad_intentos')
          .select('actividad_id, puntuacion, completado_at, actividades(title)')
          .eq('user_id', user.id)
          .order('completado_at', { ascending: false })
          .limit(limit),
        supabase
          .from('evaluacion_intentos')
          .select('evaluacion_id, puntuacion, completado_at, evaluaciones(title)')
          .eq('user_id', user.id)
          .order('completado_at', { ascending: false })
          .limit(limit),
      ]);
      if (c) return;
      const merged: ActividadReciente[] = [];
      for (const row of actRes.data ?? []) {
        const r = row as unknown as {
          actividad_id: string;
          puntuacion: number;
          completado_at: string | null;
          actividades: { title: string } | { title: string }[] | null;
        };
        if (!r.completado_at) continue;
        const act = Array.isArray(r.actividades) ? r.actividades[0] : r.actividades;
        if (!act?.title) continue;
        merged.push({
          id: r.actividad_id,
          tipo: 'actividad',
          titulo: act.title,
          puntuacion: r.puntuacion,
          fecha: r.completado_at,
        });
      }
      for (const row of evalRes.data ?? []) {
        const r = row as unknown as {
          evaluacion_id: string;
          puntuacion: number;
          completado_at: string | null;
          evaluaciones: { title: string } | { title: string }[] | null;
        };
        if (!r.completado_at) continue;
        const ev = Array.isArray(r.evaluaciones) ? r.evaluaciones[0] : r.evaluaciones;
        if (!ev?.title) continue;
        merged.push({
          id: r.evaluacion_id,
          tipo: 'evaluacion',
          titulo: ev.title,
          puntuacion: r.puntuacion,
          fecha: r.completado_at,
        });
      }
      merged.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      // Un solo registro por actividad/evaluación (el intento más reciente)
      const seen = new Set<string>();
      const deduped = merged.filter((item) => {
        const key = `${item.tipo}:${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setItems(deduped.slice(0, limit));
      setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [user, profile?.role, limit]);

  return { items, loading };
}
