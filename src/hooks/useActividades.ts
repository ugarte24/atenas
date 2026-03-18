import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Actividad } from '../types';

export function useActividades(temaId: string | null) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    if (!temaId) {
      setActividades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('actividades')
      .select('*')
      .eq('tema_id', temaId)
      .order('orden', { ascending: true });
    if (e) {
      setError(e.message);
      setActividades([]);
    } else {
      setActividades((data as Actividad[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [temaId]);

  async function create(values: {
    tema_id: string;
    tipo: Actividad['tipo'];
    title: string;
    config: Actividad['config'];
    publicada?: boolean;
    orden?: number;
  }) {
    const { data, error: e } = await supabase
      .from('actividades')
      .insert({
        tema_id: values.tema_id,
        tipo: values.tipo,
        title: values.title,
        config: values.config,
        publicada: values.publicada ?? false,
        orden: values.orden ?? 0,
      })
      .select()
      .single();
    if (e) throw e;
    setActividades((prev) => [...prev, data as Actividad].sort((a, b) => a.orden - b.orden));
    return data as Actividad;
  }

  async function update(
    id: string,
    values: Partial<{
      title: string;
      tipo: Actividad['tipo'];
      config: Actividad['config'];
      publicada: boolean;
      orden: number;
      tema_id: string;
    }>
  ) {
    const { data, error: e } = await supabase
      .from('actividades')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (e) throw e;
    const row = data as Actividad;
    setActividades((prev) => {
      if (temaId && row.tema_id !== temaId) {
        return prev.filter((a) => a.id !== id);
      }
      return prev.map((a) => (a.id === id ? row : a)).sort((a, b) => a.orden - b.orden);
    });
    return row;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from('actividades').delete().eq('id', id);
    if (e) throw e;
    setActividades((prev) => prev.filter((a) => a.id !== id));
  }

  return { actividades, loading, error, refetch: fetch, create, update, remove };
}
