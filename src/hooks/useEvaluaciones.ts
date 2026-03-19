import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Evaluacion } from '../types';

export function useEvaluaciones(temaId: string | null) {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    if (!temaId) {
      setEvaluaciones([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('tema_id', temaId)
      .order('orden', { ascending: true });
    if (e) {
      setError(e.message);
      setEvaluaciones([]);
    } else {
      setEvaluaciones((data as Evaluacion[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [temaId]);

  async function create(values: {
    tema_id: string;
    title: string;
    descripcion?: string;
    umbral_aprobado?: number;
    preguntas: Evaluacion['preguntas'];
    publicada?: boolean;
    orden?: number;
    max_intentos?: number | null;
    modo_examen?: boolean;
    ocultar_respuesta_correcta?: boolean;
    es_micro_quiz?: boolean;
    micro_ubicacion?: string;
  }) {
    const { data, error: e } = await supabase
      .from('evaluaciones')
      .insert({
        tema_id: values.tema_id,
        title: values.title,
        descripcion: values.descripcion ?? null,
        umbral_aprobado: values.umbral_aprobado ?? 70,
        preguntas: values.preguntas,
        publicada: values.publicada ?? false,
        orden: values.orden ?? 0,
        max_intentos: values.max_intentos ?? null,
        modo_examen: values.modo_examen ?? false,
        ocultar_respuesta_correcta: values.ocultar_respuesta_correcta ?? false,
        es_micro_quiz: values.es_micro_quiz ?? false,
        micro_ubicacion: values.micro_ubicacion ?? 'post_contenido',
      })
      .select()
      .single();
    if (e) throw e;
    setEvaluaciones((prev) => [...prev, data as Evaluacion].sort((a, b) => a.orden - b.orden));
    return data as Evaluacion;
  }

  async function update(
    id: string,
    values: Partial<{
      title: string;
      descripcion: string | null;
      umbral_aprobado: number;
      preguntas: Evaluacion['preguntas'];
      publicada: boolean;
      orden: number;
      tema_id: string;
      max_intentos: number | null;
      modo_examen: boolean;
      ocultar_respuesta_correcta: boolean;
      es_micro_quiz: boolean;
      micro_ubicacion: string;
    }>
  ) {
    const { data, error: e } = await supabase
      .from('evaluaciones')
      .update(values)
      .eq('id', id)
      .select()
      .single();
    if (e) throw e;
    const row = data as Evaluacion;
    setEvaluaciones((prev) => {
      if (temaId && row.tema_id !== temaId) {
        return prev.filter((ev) => ev.id !== id);
      }
      return prev.map((ev) => (ev.id === id ? row : ev)).sort((a, b) => a.orden - b.orden);
    });
    return row;
  }

  async function remove(id: string) {
    const { error: e } = await supabase.from('evaluaciones').delete().eq('id', id);
    if (e) throw e;
    setEvaluaciones((prev) => prev.filter((ev) => ev.id !== id));
  }

  return { evaluaciones, loading, error, refetch: fetch, create, update, remove };
}
