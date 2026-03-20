import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

/** Fila opcional `progreso_tema` (tras migración 20260322). */
export function useProgresoTema(temaId: string | null) {
  const { user, profile } = useAuthContext();
  const [porcentaje, setPorcentaje] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || profile?.role !== 'estudiante' || !temaId) {
      setPorcentaje(null);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progreso_tema')
        .select('porcentaje')
        .eq('user_id', user.id)
        .eq('tema_id', temaId)
        .maybeSingle();
      if (error) {
        setPorcentaje(null);
        return;
      }
      setPorcentaje(data?.porcentaje ?? null);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, temaId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const guardar = useCallback(
    async (pct: number, completado: boolean) => {
      if (!user || profile?.role !== 'estudiante' || !temaId) return;
      const { error } = await supabase.from('progreso_tema').upsert(
        {
          user_id: user.id,
          tema_id: temaId,
          porcentaje: Math.min(100, Math.max(0, Math.round(pct))),
          completado,
        },
        { onConflict: 'user_id,tema_id' }
      );
      if (!error) await refresh();
    },
    [user, profile?.role, temaId, refresh]
  );

  return { porcentaje, loading, refresh, guardar };
}
