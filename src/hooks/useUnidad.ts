import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Unidad } from '../types';

export function useUnidad(unidadId: string | null) {
  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unidadId) {
      setUnidad(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('unidades')
      .select('*')
      .eq('id', unidadId)
      .single()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setUnidad(null);
        } else {
          setUnidad(data as Unidad);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [unidadId]);

  return { unidad, loading, error };
}
