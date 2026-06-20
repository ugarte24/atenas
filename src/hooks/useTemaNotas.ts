import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTemaNotas(temaId: string | null, userId: string | null | undefined) {
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!temaId || !userId) {
      setContenido('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      const { data, error: e } = await supabase
        .from('tema_notas')
        .select('contenido')
        .eq('user_id', userId)
        .eq('tema_id', temaId)
        .maybeSingle();
      if (cancelled) return;
      if (e) {
        setError('No se pudieron cargar tus notas.');
        setContenido('');
      } else {
        setContenido((data as { contenido?: string } | null)?.contenido ?? '');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [temaId, userId]);

  const guardar = useCallback(
    async (texto: string) => {
      if (!temaId || !userId) return false;
      setSaving(true);
      setError(null);
      const { error: e } = await supabase.from('tema_notas').upsert(
        {
          user_id: userId,
          tema_id: temaId,
          contenido: texto,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tema_id' }
      );
      setSaving(false);
      if (e) {
        setError('No se pudieron guardar las notas.');
        return false;
      }
      return true;
    },
    [temaId, userId]
  );

  return { contenido, setContenido, loading, saving, error, guardar };
}
