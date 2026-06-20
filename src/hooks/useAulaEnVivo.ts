import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

export type AulaMensaje = {
  id: string;
  cuerpo: string;
  created_at: string;
  user_id: string;
  authorName: string;
};

export function useAulaEnVivo() {
  const { user } = useAuthContext();
  const [mensajes, setMensajes] = useState<AulaMensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('aula_mensajes')
      .select('id, cuerpo, created_at, user_id')
      .order('created_at', { ascending: true })
      .limit(100);
    if (e) {
      setError('No se pudo cargar el chat. Aplica la migración aula_mensajes en Supabase.');
      setMensajes([]);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as { id: string; cuerpo: string; created_at: string; user_id: string }[];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profs } = ids.length
      ? await supabase.from('profiles').select('id, full_name').in('id', ids)
      : { data: [] };
    const map = new Map((profs ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
    setMensajes(
      rows.map((r) => ({
        ...r,
        authorName: map.get(r.user_id) ?? 'Usuario',
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void cargar();
    const channel = supabase
      .channel('aula-mensajes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'aula_mensajes' },
        () => {
          void cargar();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [cargar]);

  async function enviar(cuerpo: string) {
    if (!user || !cuerpo.trim()) return false;
    setEnviando(true);
    setError(null);
    const { error: e } = await supabase.from('aula_mensajes').insert({
      user_id: user.id,
      cuerpo: cuerpo.trim(),
    });
    setEnviando(false);
    if (e) {
      setError('No se pudo enviar el mensaje.');
      return false;
    }
    return true;
  }

  return { mensajes, loading, error, enviando, enviar, recargar: cargar };
}
