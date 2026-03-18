import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Actividad } from '../types';

export function useActividad(actividadId: string | null) {
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actividadId) {
      setActividad(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('actividades')
      .select('*')
      .eq('id', actividadId)
      .single()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setActividad(null);
        } else {
          setActividad(data as Actividad);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actividadId]);

  return { actividad, loading, error };
}
