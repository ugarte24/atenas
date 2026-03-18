import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Evaluacion } from '../types';

export function useEvaluacion(evaluacionId: string | null) {
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluacionId) {
      setEvaluacion(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('evaluaciones')
      .select('*')
      .eq('id', evaluacionId)
      .single()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setEvaluacion(null);
        } else {
          setEvaluacion(data as Evaluacion);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [evaluacionId]);

  return { evaluacion, loading, error };
}
