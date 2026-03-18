import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tema } from '../types';

export function useTemas(unidadId: string | null) {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    if (!unidadId) {
      setTemas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('temas')
      .select('*')
      .eq('unidad_id', unidadId)
      .order('orden', { ascending: true });
    if (e) {
      setError(e.message);
      setTemas([]);
    } else {
      setTemas((data as Tema[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [unidadId]);

  async function create(values: {
    unidad_id: string;
    title: string;
    content?: string;
    orden?: number;
    prerequisito_tema_id?: string | null;
  }) {
    const { data, error: e } = await supabase
      .from('temas')
      .insert({
        unidad_id: values.unidad_id,
        title: values.title,
        content: values.content ?? null,
        orden: values.orden ?? 0,
        prerequisito_tema_id: values.prerequisito_tema_id ?? null,
      })
      .select()
      .single();
    if (e) throw e;
    if (values.unidad_id === unidadId) {
      setTemas((prev) => [...prev, data as Tema].sort((a, b) => a.orden - b.orden));
    }
    return data as Tema;
  }

  async function update(
    id: string,
    values: Partial<{ title: string; content: string; orden: number; prerequisito_tema_id: string | null }>
  ) {
    const { data, error: e } = await supabase
      .from('temas')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (e) throw e;
    setTemas((prev) =>
      prev.map((t) => (t.id === id ? (data as Tema) : t)).sort((a, b) => a.orden - b.orden)
    );
    return data as Tema;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from('temas').delete().eq('id', id);
    if (e) throw e;
    setTemas((prev) => prev.filter((t) => t.id !== id));
  }

  return { temas, loading, error, refetch: fetch, create, update, remove };
}
