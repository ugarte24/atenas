import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Unidad } from '../types';

export type FiltroUnidadesDocente = {
  docenteId: string;
  /** Si hay filas en docente_unidad, solo esas; si no hay ninguna asignación, todas */
  aplicarFiltroAsignadas: boolean;
};

export function useUnidades(filtroDocente?: FiltroUnidadesDocente | null) {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let unidadIds: string[] | null = null;
      if (filtroDocente?.aplicarFiltroAsignadas && filtroDocente.docenteId) {
        const { data: du, error: eDu } = await supabase
          .from('docente_unidad')
          .select('unidad_id')
          .eq('docente_id', filtroDocente.docenteId);
        if (eDu) throw eDu;
        const ids = (du ?? []).map((r: { unidad_id: string }) => r.unidad_id);
        if (ids.length > 0) unidadIds = ids;
      }

      let q = supabase.from('unidades').select('*').order('orden', { ascending: true });
      if (unidadIds && unidadIds.length > 0) {
        q = q.in('id', unidadIds);
      }
      const { data, error: e } = await q;
      if (e) throw e;
      setUnidades((data as Unidad[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setUnidades([]);
    } finally {
      setLoading(false);
    }
  }, [filtroDocente?.docenteId, filtroDocente?.aplicarFiltroAsignadas]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(values: {
    title: string;
    description?: string;
    orden?: number;
    certificado_umbral_pct?: number | null;
    cover_image_url?: string | null;
    cover_video_url?: string | null;
    accent_color?: string | null;
    intro_extended?: string | null;
    visual_theme?: string | null;
  }) {
    const { data, error: e } = await supabase
      .from('unidades')
      .insert({
        title: values.title,
        description: values.description ?? null,
        orden: values.orden ?? 0,
        certificado_umbral_pct: values.certificado_umbral_pct ?? null,
        cover_image_url: values.cover_image_url ?? null,
        cover_video_url: values.cover_video_url ?? null,
        accent_color: values.accent_color ?? null,
        intro_extended: values.intro_extended ?? null,
        visual_theme: values.visual_theme ?? null,
      })
      .select()
      .single();
    if (e) throw e;
    const row = data as Unidad;
    if (filtroDocente?.aplicarFiltroAsignadas && filtroDocente.docenteId) {
      await supabase.from('docente_unidad').insert({
        docente_id: filtroDocente.docenteId,
        unidad_id: row.id,
      });
    }
    setUnidades((prev) => [...prev, row].sort((a, b) => a.orden - b.orden));
    return row;
  }

  async function update(
    id: string,
    values: Partial<{
      title: string;
      description: string | null;
      orden: number;
      certificado_umbral_pct: number | null;
      cover_image_url: string | null;
      cover_video_url: string | null;
      accent_color: string | null;
      intro_extended: string | null;
      visual_theme: string | null;
    }>
  ) {
    const { data, error: e } = await supabase
      .from('unidades')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (e) throw e;
    const row = data as Unidad;
    setUnidades((prev) =>
      prev.map((u) => (u.id === id ? row : u)).sort((a, b) => a.orden - b.orden)
    );
    return row;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from('unidades').delete().eq('id', id);
    if (e) throw e;
    setUnidades((prev) => prev.filter((u) => u.id !== id));
  }

  return { unidades, loading, error, refetch: fetch, create, update, remove };
}
