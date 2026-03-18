import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tema } from '../types';

export function useTema(temaId: string | null) {
  const [tema, setTema] = useState<Tema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!temaId) {
      setTema(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('temas')
      .select('*')
      .eq('id', temaId)
      .single()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setTema(null);
        } else {
          setTema(data as Tema);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [temaId]);

  return { tema, loading, error };
}
