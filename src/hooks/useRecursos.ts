import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Recurso } from '../types';

const BUCKET = 'recursos';

export function useRecursos(temaId: string | null) {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    if (!temaId) {
      setRecursos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('recursos')
      .select('*')
      .eq('tema_id', temaId)
      .order('created_at', { ascending: true });
    if (e) {
      setError(e.message);
      setRecursos([]);
    } else {
      setRecursos((data as Recurso[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [temaId]);

  async function addFromUrl(temaId: string, tipo: 'imagen' | 'mapa' | 'video', url: string, title?: string) {
    const { data, error: e } = await supabase
      .from('recursos')
      .insert({ tema_id: temaId, tipo, url, title: title ?? null })
      .select()
      .single();
    if (e) throw e;
    setRecursos((prev) => [...prev, data as Recurso]);
    return data as Recurso;
  }

  async function addFromFile(
    temaId: string,
    tipo: 'imagen' | 'mapa' | 'video',
    file: File,
    title?: string
  ) {
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `${temaId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { data, error: e } = await supabase
      .from('recursos')
      .insert({ tema_id: temaId, tipo, url: urlData.publicUrl, title: title ?? null })
      .select()
      .single();
    if (e) throw e;
    setRecursos((prev) => [...prev, data as Recurso]);
    return data as Recurso;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from('recursos').delete().eq('id', id);
    if (e) throw e;
    setRecursos((prev) => prev.filter((r) => r.id !== id));
  }

  return { recursos, loading, error, refetch: fetch, addFromUrl, addFromFile, remove };
}
