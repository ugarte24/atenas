import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useTemas } from '../../hooks/useTemas';
import { useEvaluaciones } from '../../hooks/useEvaluaciones';
import { supabase } from '../../lib/supabase';
import type { Evaluacion, PreguntaEvaluacion } from '../../types';
import { PLANTILLAS_EVALUACIONES } from '../../constants/plantillasEvaluaciones';
import { PREGUNTAS_EJEMPLO_EVALUACION } from '../../constants/preguntasEjemploEvaluacion';
import { DocentePreviewModal } from '../../components/docente/DocentePreviewModal';
import { DocenteDetalleIntentosModal } from '../../components/docente/DocenteDetalleIntentosModal';
import { Cuestionario } from '../../components/Cuestionario';

export default function DocenteEvaluaciones() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const { temas: temasUnidad, loading: loadingTemas } = useTemas(tema?.unidad_id ?? null);
  const { evaluaciones, loading, create, update, remove } = useEvaluaciones(temaId ?? null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [umbralAprobado, setUmbralAprobado] = useState(70);
  const [preguntasJson, setPreguntasJson] = useState(JSON.stringify(PREGUNTAS_EJEMPLO_EVALUACION, null, 2));
  const [plantillaEvalId, setPlantillaEvalId] = useState('');
  const [editing, setEditing] = useState<Evaluacion | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editUmbral, setEditUmbral] = useState(70);
  const [editPreguntasJson, setEditPreguntasJson] = useState('[]');
  const [editPlantillaId, setEditPlantillaId] = useState('');
  const [reordenando, setReordenando] = useState(false);
  const [moverEvaluacionId, setMoverEvaluacionId] = useState('');
  const [moverEvalTemaDestinoId, setMoverEvalTemaDestinoId] = useState('');
  const [moviendoEval, setMoviendoEval] = useState(false);
  const [previewEvaluacion, setPreviewEvaluacion] = useState<Evaluacion | null>(null);
  const [detalleEvaluacion, setDetalleEvaluacion] = useState<Evaluacion | null>(null);
  const [filtroPubEv, setFiltroPubEv] = useState<'todas' | 'publicada' | 'borrador'>('todas');
  const [busquedaEv, setBusquedaEv] = useState('');
  const [maxIntentos, setMaxIntentos] = useState('');
  const [modoExamen, setModoExamen] = useState(false);
  const [ocultarCorrecta, setOcultarCorrecta] = useState(false);
  const [editMaxIntentos, setEditMaxIntentos] = useState('');
  const [editModoExamen, setEditModoExamen] = useState(false);
  const [editOcultarCorrecta, setEditOcultarCorrecta] = useState(false);
  const [statsPorEvaluacion, setStatsPorEvaluacion] = useState<
    Record<string, { alumnos: number; aprobados: number; promedio: number | null }>
  >({});

  useEffect(() => {
    let cancelled = false;
    const ids = evaluaciones.map((e) => e.id);
    if (!ids.length) {
      setStatsPorEvaluacion({});
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('evaluacion_intentos')
        .select('evaluacion_id, puntuacion, aprobado, user_id')
        .in('evaluacion_id', ids);
      if (cancelled) return;
      if (error || !data) {
        setStatsPorEvaluacion({});
        return;
      }
      const rows = data as {
        evaluacion_id: string;
        puntuacion: number;
        aprobado: boolean;
        user_id: string;
      }[];
      type Acc = { users: Set<string>; pts: number[]; aprobadosPorUsuario: Set<string> };
      const porId: Record<string, Acc> = {};
      for (const r of rows) {
        if (!porId[r.evaluacion_id])
          porId[r.evaluacion_id] = { users: new Set(), pts: [], aprobadosPorUsuario: new Set() };
        const b = porId[r.evaluacion_id];
        b.users.add(r.user_id);
        b.pts.push(r.puntuacion);
        if (r.aprobado) b.aprobadosPorUsuario.add(r.user_id);
      }
      const next: Record<string, { alumnos: number; aprobados: number; promedio: number | null }> = {};
      for (const id of ids) {
        const x = porId[id];
        const alumnos = x?.users.size ?? 0;
        const aprobados = x?.aprobadosPorUsuario.size ?? 0;
        const promedio =
          x && x.pts.length > 0
            ? Math.round(x.pts.reduce((s, p) => s + p, 0) / x.pts.length)
            : null;
        next[id] = { alumnos, aprobados, promedio };
      }
      setStatsPorEvaluacion(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [evaluaciones]);

  const temasEvalDestino = useMemo(
    () => temasUnidad.filter((t) => t.id !== temaId),
    [temasUnidad, temaId]
  );

  const evaluacionesOrdenadas = useMemo(
    () => [...evaluaciones].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id)),
    [evaluaciones]
  );

  const evaluacionesFiltradas = useMemo(() => {
    const q = busquedaEv.trim().toLowerCase();
    return evaluacionesOrdenadas.filter((ev) => {
      if (filtroPubEv === 'publicada' && !ev.publicada) return false;
      if (filtroPubEv === 'borrador' && ev.publicada) return false;
      if (q && !ev.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [evaluacionesOrdenadas, filtroPubEv, busquedaEv]);

  async function moverEvaluacion(id: string, dir: 'up' | 'down') {
    const list = [...evaluaciones].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));
    const i = list.findIndex((x) => x.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length || reordenando) return;
    const arr = [...list];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setReordenando(true);
    try {
      for (let k = 0; k < arr.length; k++) {
        if (arr[k].orden !== k) await update(arr[k].id, { orden: k });
      }
    } catch (err) {
      console.error(err);
      alert('Error al reordenar');
    } finally {
      setReordenando(false);
    }
  }

  async function handleMoverEvaluacionAOtroTema() {
    if (!moverEvaluacionId || !moverEvalTemaDestinoId || moverEvalTemaDestinoId === temaId) return;
    if (
      !confirm(
        '¿Mover esta evaluación al tema seleccionado? Los intentos de los alumnos siguen ligados a la misma evaluación.'
      )
    ) {
      return;
    }
    setMoviendoEval(true);
    try {
      const { data: rows, error: e1 } = await supabase
        .from('evaluaciones')
        .select('orden')
        .eq('tema_id', moverEvalTemaDestinoId);
      if (e1) throw e1;
      const maxOrden = (rows ?? []).reduce((m, r: { orden: number }) => Math.max(m, r.orden), -1);
      await update(moverEvaluacionId, { tema_id: moverEvalTemaDestinoId, orden: maxOrden + 1 });
      if (editing?.id === moverEvaluacionId) setEditing(null);
      setMoverEvaluacionId('');
      setMoverEvalTemaDestinoId('');
    } catch (err) {
      console.error(err);
      alert('Error al mover la evaluación');
    } finally {
      setMoviendoEval(false);
    }
  }

  async function duplicarEvaluacion(ev: Evaluacion) {
    if (!temaId) return;
    const maxOrden = evaluaciones.reduce((m, x) => Math.max(m, x.orden), -1);
    try {
      await create({
        tema_id: temaId,
        title: `${ev.title} (copia)`,
        descripcion: ev.descripcion ?? undefined,
        umbral_aprobado: ev.umbral_aprobado,
        preguntas: JSON.parse(JSON.stringify(ev.preguntas)) as PreguntaEvaluacion[],
        publicada: false,
        orden: maxOrden + 1,
      });
    } catch (err) {
      console.error(err);
      alert('Error al duplicar la evaluación');
    }
  }

  function openEdit(ev: Evaluacion) {
    setAdding(false);
    setEditing(ev);
    setEditTitle(ev.title);
    setEditDescripcion(ev.descripcion ?? '');
    setEditUmbral(ev.umbral_aprobado);
    setEditPreguntasJson(JSON.stringify(ev.preguntas, null, 2));
    setEditPlantillaId('');
    setEditMaxIntentos(ev.max_intentos != null ? String(ev.max_intentos) : '');
    setEditModoExamen(ev.modo_examen === true);
    setEditOcultarCorrecta(ev.ocultar_respuesta_correcta === true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editTitle.trim()) return;
    try {
      let preguntas: PreguntaEvaluacion[];
      try {
        preguntas = JSON.parse(editPreguntasJson || '[]') as PreguntaEvaluacion[];
      } catch {
        alert('El JSON de preguntas no es válido.');
        return;
      }
      const m = editMaxIntentos.trim() ? parseInt(editMaxIntentos, 10) : null;
      await update(editing.id, {
        title: editTitle.trim(),
        descripcion: editDescripcion.trim() || null,
        umbral_aprobado: editUmbral,
        preguntas,
        max_intentos: m != null && !Number.isNaN(m) && m >= 1 ? m : null,
        modo_examen: editModoExamen,
        ocultar_respuesta_correcta: editOcultarCorrecta,
      });
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !title.trim()) return;
    try {
      let preguntas: PreguntaEvaluacion[];
      try {
        preguntas = JSON.parse(preguntasJson || '[]') as PreguntaEvaluacion[];
      } catch {
        alert('El JSON de preguntas no es válido.');
        return;
      }
      const m = maxIntentos.trim() ? parseInt(maxIntentos, 10) : null;
      await create({
        tema_id: temaId,
        title: title.trim(),
        descripcion: descripcion.trim() || undefined,
        umbral_aprobado: umbralAprobado,
        preguntas,
        orden: evaluaciones.length,
        max_intentos: m != null && !Number.isNaN(m) && m >= 1 ? m : null,
        modo_examen: modoExamen,
        ocultar_respuesta_correcta: ocultarCorrecta,
      });
      setTitle('');
      setDescripcion('');
      setUmbralAprobado(70);
      setMaxIntentos('');
      setModoExamen(false);
      setOcultarCorrecta(false);
      setPreguntasJson(JSON.stringify(PREGUNTAS_EJEMPLO_EVALUACION, null, 2));
      setPlantillaEvalId('');
      setAdding(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la evaluación');
    }
  }

  async function handleTogglePublicada(id: string, publicada: boolean) {
    try {
      await update(id, { publicada: !publicada });
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    try {
      await remove(id);
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  if (loadingTema || !tema) {
    return <p className="text-slate-600">Cargando...</p>;
  }

  const preguntasPreview = previewEvaluacion
    ? Array.isArray(previewEvaluacion.preguntas)
      ? previewEvaluacion.preguntas
      : []
    : [];

  return (
    <div>
      {detalleEvaluacion ? (
        <DocenteDetalleIntentosModal
          tipo="evaluacion"
          itemId={detalleEvaluacion.id}
          titulo={detalleEvaluacion.title}
          onClose={() => setDetalleEvaluacion(null)}
        />
      ) : null}
      {previewEvaluacion ? (
        <DocentePreviewModal
          title={`Vista previa: ${previewEvaluacion.title}`}
          onClose={() => setPreviewEvaluacion(null)}
        >
          <div className="mb-4">
            {previewEvaluacion.descripcion && (
              <p className="text-slate-600 text-sm mb-1">{previewEvaluacion.descripcion}</p>
            )}
            <p className="text-sm text-slate-500">
              Umbral para aprobar: {previewEvaluacion.umbral_aprobado}%
            </p>
          </div>
          <div className="card p-6" key={previewEvaluacion.id}>
            <Cuestionario
              preguntas={preguntasPreview}
              umbralAprobado={previewEvaluacion.umbral_aprobado}
              onSubmit={() => {}}
              feedback="completo"
            />
          </div>
        </DocentePreviewModal>
      ) : null}

      <button
        type="button"
        onClick={() => navigate(`/docente/unidades/${tema.unidad_id}`)}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 hover:bg-[#e6edf5]"
        style={{ color: '#003366' }}
      >
        ← Temas
      </button>
      <h2 className="text-xl font-bold text-slate-900 mb-4">{tema.title} — Evaluaciones</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar por título…"
          value={busquedaEv}
          onChange={(e) => setBusquedaEv(e.target.value)}
          className="input-field flex-1 max-w-md"
          aria-label="Buscar evaluaciones"
        />
        <select
          value={filtroPubEv}
          onChange={(e) => setFiltroPubEv(e.target.value as typeof filtroPubEv)}
          className="input-field max-w-[200px]"
          aria-label="Filtrar por publicación"
        >
          <option value="todas">Todas</option>
          <option value="publicada">Solo publicadas</option>
          <option value="borrador">Solo no publicadas</option>
        </select>
      </div>

      {editing ? (
        <form onSubmit={handleSaveEdit} className="mb-6 card p-5 space-y-4 max-w-2xl border-2 border-[#003366]/20">
          <p className="text-sm font-semibold text-slate-800">Editar evaluación</p>
          <label className="label">Sobrescribir con plantilla (opcional)</label>
          <select
            value={editPlantillaId}
            onChange={(e) => {
              const id = e.target.value;
              setEditPlantillaId(id);
              if (!id) return;
              const p = PLANTILLAS_EVALUACIONES.find((x) => x.id === id);
              if (p) {
                setEditTitle((t) => (t.trim() ? t : p.tituloSugerido));
                setEditDescripcion((d) => (d.trim() ? d : p.descripcionSugerida ?? ''));
                setEditUmbral(p.umbral);
                setEditPreguntasJson(JSON.stringify(p.preguntas, null, 2));
              }
            }}
            className="input-field"
          >
            <option value="">— Mantener preguntas actuales —</option>
            {PLANTILLAS_EVALUACIONES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título"
            className="input-field"
            required
          />
          <input
            value={editDescripcion}
            onChange={(e) => setEditDescripcion(e.target.value)}
            placeholder="Descripción (opcional)"
            className="input-field"
          />
          <label className="label">Umbral para aprobar (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={editUmbral}
            onChange={(e) => setEditUmbral(Number(e.target.value))}
            className="input-field max-w-[120px]"
          />
          <div>
            <label htmlFor="edit-max-int" className="label">
              Máx. intentos (vacío = ilimitado)
            </label>
            <input
              id="edit-max-int"
              type="number"
              min={1}
              value={editMaxIntentos}
              onChange={(e) => setEditMaxIntentos(e.target.value)}
              className="input-field max-w-[140px]"
            />
          </div>
          <label className="flex items-center gap-2 text-slate-800">
            <input
              type="checkbox"
              checked={editModoExamen}
              onChange={(e) => setEditModoExamen(e.target.checked)}
            />
            Modo examen (30 min, solo nota al terminar)
          </label>
          <label className="flex items-center gap-2 text-slate-800">
            <input
              type="checkbox"
              checked={editOcultarCorrecta}
              onChange={(e) => setEditOcultarCorrecta(e.target.checked)}
            />
            No mostrar la respuesta correcta si falla
          </label>
          <label className="label">Preguntas (JSON)</label>
          <textarea
            value={editPreguntasJson}
            onChange={(e) => setEditPreguntasJson(e.target.value)}
            className="input-field font-mono text-sm min-h-[240px]"
            rows={14}
          />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">Guardar cambios</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {adding ? (
        <form onSubmit={handleCreate} className="mb-6 card p-5 space-y-4 max-w-2xl">
          <label className="label">Plantilla rápida (opcional)</label>
          <select
            value={plantillaEvalId}
            onChange={(e) => {
              const id = e.target.value;
              setPlantillaEvalId(id);
              if (!id) return;
              const p = PLANTILLAS_EVALUACIONES.find((x) => x.id === id);
              if (p) {
                setTitle((t) => (t.trim() ? t : p.tituloSugerido));
                setDescripcion((d) => (d.trim() ? d : p.descripcionSugerida ?? ''));
                setUmbralAprobado(p.umbral);
                setPreguntasJson(JSON.stringify(p.preguntas, null, 2));
              }
            }}
            className="input-field"
          >
            <option value="">— Elegir plantilla o editar JSON abajo —</option>
            {PLANTILLAS_EVALUACIONES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la evaluación"
            className="input-field"
            required
          />
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción (opcional)"
            className="input-field"
          />
          <label className="label">Umbral para aprobar (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={umbralAprobado}
            onChange={(e) => setUmbralAprobado(Number(e.target.value))}
            className="input-field max-w-[120px]"
          />
          <div>
            <label htmlFor="new-max-int" className="label">
              Máx. intentos (vacío = ilimitado)
            </label>
            <input
              id="new-max-int"
              type="number"
              min={1}
              value={maxIntentos}
              onChange={(e) => setMaxIntentos(e.target.value)}
              className="input-field max-w-[140px]"
            />
          </div>
          <label className="flex items-center gap-2 text-slate-800">
            <input
              type="checkbox"
              checked={modoExamen}
              onChange={(e) => setModoExamen(e.target.checked)}
            />
            Modo examen
          </label>
          <label className="flex items-center gap-2 text-slate-800">
            <input
              type="checkbox"
              checked={ocultarCorrecta}
              onChange={(e) => setOcultarCorrecta(e.target.checked)}
            />
            Ocultar respuesta correcta
          </label>
          <label className="label">Preguntas (JSON)</label>
          <textarea
            value={preguntasJson}
            onChange={(e) => setPreguntasJson(e.target.value)}
            className="input-field font-mono text-sm min-h-[240px]"
            rows={14}
          />
          <p className="text-xs text-slate-500">
            Formato: array de {"{ enunciado, opciones: [ { texto, correcta } ] }"}
          </p>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Crear evaluación</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setPlantillaEvalId('');
            setAdding(true);
          }}
          className="btn-primary mb-6"
        >
          + Nueva evaluación
        </button>
      )}

      {loading ? (
        <p className="text-slate-600">Cargando evaluaciones...</p>
      ) : (
        <ul className="space-y-2">
          {evaluacionesFiltradas.map((ev) => {
            const realIdx = evaluacionesOrdenadas.findIndex((x) => x.id === ev.id);
            return (
            <li key={ev.id} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 card">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={reordenando || realIdx <= 0}
                  onClick={() => moverEvaluacion(ev.id, 'up')}
                  className="min-h-touch min-w-touch rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={reordenando || realIdx < 0 || realIdx >= evaluacionesOrdenadas.length - 1}
                  onClick={() => moverEvaluacion(ev.id, 'down')}
                  className="min-h-touch min-w-touch rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Bajar"
                >
                  ↓
                </button>
              </div>
              <div className="flex-1 min-w-[140px]">
                <span className="font-medium text-slate-900 block">{ev.title}</span>
                {statsPorEvaluacion[ev.id] && (
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    {statsPorEvaluacion[ev.id].alumnos === 0
                      ? 'Sin intentos aún'
                      : `${statsPorEvaluacion[ev.id].alumnos} alumno${statsPorEvaluacion[ev.id].alumnos !== 1 ? 's' : ''} · ${statsPorEvaluacion[ev.id].aprobados} aprobado${statsPorEvaluacion[ev.id].aprobados !== 1 ? 's' : ''}${
                          statsPorEvaluacion[ev.id].promedio != null
                            ? ` · Media ${statsPorEvaluacion[ev.id].promedio}%`
                            : ''
                        }`}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">Umbral: {ev.umbral_aprobado}%</span>
              <button
                type="button"
                onClick={() => handleTogglePublicada(ev.id, ev.publicada)}
                className={`badge ${ev.publicada ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
              >
                {ev.publicada ? 'Publicada' : 'No publicada'}
              </button>
              <button
                type="button"
                onClick={() => duplicarEvaluacion(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-slate-600"
                title="Duplicar como borrador no publicado"
              >
                Duplicar
              </button>
              <button
                type="button"
                onClick={() => openEdit(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1"
                style={{ color: '#003366' }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setPreviewEvaluacion(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-emerald-700"
              >
                Vista previa
              </button>
              <button
                type="button"
                onClick={() => setDetalleEvaluacion(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-violet-700"
              >
                Ver alumnos
              </button>
              <Link to={`/evaluaciones/${ev.id}`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }} target="_blank" rel="noopener noreferrer">
                Ver alumno
              </Link>
              <button type="button" onClick={() => handleRemove(ev.id)} className="text-sm text-red-600 hover:text-red-700">
                Eliminar
              </button>
            </li>
          );
          })}
        </ul>
      )}
      {evaluaciones.length === 0 && !adding && !editing && !loading && (
        <p className="text-slate-500 mt-4">No hay evaluaciones. Crea una con el botón anterior.</p>
      )}

      {!loading && !loadingTemas && evaluaciones.length > 0 && temasEvalDestino.length > 0 && (
        <section className="mt-8 card p-5 max-w-2xl space-y-3 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Mover evaluación a otro tema</h3>
          <p className="text-xs text-slate-500">
            Solo temas de la misma unidad. La evaluación se coloca al final del tema destino.
          </p>
          <label className="label mb-0">Evaluación</label>
          <select
            value={moverEvaluacionId}
            onChange={(e) => setMoverEvaluacionId(e.target.value)}
            className="input-field"
          >
            <option value="">— Elegir —</option>
            {evaluacionesOrdenadas.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          <label className="label mb-0">Tema destino</label>
          <select
            value={moverEvalTemaDestinoId}
            onChange={(e) => setMoverEvalTemaDestinoId(e.target.value)}
            className="input-field"
          >
            <option value="">— Elegir tema —</option>
            {temasEvalDestino.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={moviendoEval || !moverEvaluacionId || !moverEvalTemaDestinoId}
            onClick={handleMoverEvaluacionAOtroTema}
            className="btn-secondary"
          >
            {moviendoEval ? 'Moviendo…' : 'Mover al tema'}
          </button>
        </section>
      )}

      {!loading && !loadingTemas && evaluaciones.length > 0 && temasEvalDestino.length === 0 && (
        <p className="text-xs text-slate-500 mt-6 max-w-2xl">
          Para mover evaluaciones a otro tema, crea al menos un tema más en esta unidad.
        </p>
      )}
    </div>
  );
}
