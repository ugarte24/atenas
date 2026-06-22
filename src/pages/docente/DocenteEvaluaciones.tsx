import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Pencil, Plus } from 'lucide-react';
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
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Form, FormBody, FormFooter } from '../../components/ui/Form';
import { FormModal } from '../../components/ui/FormModal';

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
  const [moverOpen, setMoverOpen] = useState(false);
  const [previewEvaluacion, setPreviewEvaluacion] = useState<Evaluacion | null>(null);
  const [detalleEvaluacion, setDetalleEvaluacion] = useState<Evaluacion | null>(null);
  const [filtroPubEv, setFiltroPubEv] = useState<'todas' | 'publicada' | 'borrador'>('todas');
  const [busquedaEv, setBusquedaEv] = useState('');
  const [maxIntentos, setMaxIntentos] = useState('');
  const [modoExamen, setModoExamen] = useState(false);
  const [minutosLimite, setMinutosLimite] = useState('30');
  const [ocultarCorrecta, setOcultarCorrecta] = useState(false);
  const [editMaxIntentos, setEditMaxIntentos] = useState('');
  const [editModoExamen, setEditModoExamen] = useState(false);
  const [editMinutosLimite, setEditMinutosLimite] = useState('30');
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
      setMoverOpen(false);
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
    setEditMinutosLimite(ev.minutos_limite != null ? String(ev.minutos_limite) : '30');
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
      const ml = editMinutosLimite.trim() ? parseInt(editMinutosLimite, 10) : null;
      await update(editing.id, {
        title: editTitle.trim(),
        descripcion: editDescripcion.trim() || null,
        umbral_aprobado: editUmbral,
        preguntas,
        max_intentos: m != null && !Number.isNaN(m) && m >= 1 ? m : null,
        modo_examen: editModoExamen,
        minutos_limite:
          editModoExamen && ml != null && !Number.isNaN(ml) && ml >= 1 ? ml : null,
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
      const ml = minutosLimite.trim() ? parseInt(minutosLimite, 10) : null;
      await create({
        tema_id: temaId,
        title: title.trim(),
        descripcion: descripcion.trim() || undefined,
        umbral_aprobado: umbralAprobado,
        preguntas,
        orden: evaluaciones.length,
        max_intentos: m != null && !Number.isNaN(m) && m >= 1 ? m : null,
        modo_examen: modoExamen,
        minutos_limite: modoExamen && ml != null && !Number.isNaN(ml) && ml >= 1 ? ml : null,
        ocultar_respuesta_correcta: ocultarCorrecta,
      });
      setTitle('');
      setDescripcion('');
      setUmbralAprobado(70);
      setMaxIntentos('');
      setModoExamen(false);
      setMinutosLimite('30');
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

  const formModalOpen = adding || editing !== null;

  function closeEvaluacionForm() {
    setAdding(false);
    setEditing(null);
  }

  if (loadingTema || !tema) {
    return <p className="text-atenas-muted">Cargando...</p>;
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
              <p className="text-atenas-muted text-sm mb-1">{previewEvaluacion.descripcion}</p>
            )}
            <p className="text-sm text-atenas-muted">
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
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 hover:bg-atenas-mist"
        
      >
        ← Temas
      </button>
      <h2 className="text-xl font-bold text-atenas-ink mb-4">{tema.title} — Evaluaciones</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar por título…"
          value={busquedaEv}
          onChange={(e) => setBusquedaEv(e.target.value)}
          className="input-field flex-1 max-w-md"
          aria-label="Buscar evaluaciones"
        />
        <Select
          value={filtroPubEv}
          onChange={(e) => setFiltroPubEv(e.target.value as typeof filtroPubEv)}
          className="max-w-[200px]"
          aria-label="Filtrar por publicación"
        >
          <option value="todas">Todas</option>
          <option value="publicada">Solo publicadas</option>
          <option value="borrador">Solo no publicadas</option>
        </Select>
      </div>

      <Button
        type="button"
        className="mb-6 inline-flex items-center gap-1.5"
        onClick={() => {
          setEditing(null);
          setPlantillaEvalId('');
          setAdding(true);
        }}
      >
        <Plus className="w-4 h-4" aria-hidden />
        Nueva evaluación
      </Button>

      <FormModal
        open={formModalOpen}
        onClose={closeEvaluacionForm}
        title={editing ? 'Editar evaluación' : 'Nueva evaluación'}
        description={
          editing
            ? 'Modifica título, umbral, opciones de examen y preguntas.'
            : 'Configura la evaluación y las preguntas en formato JSON.'
        }
        icon={editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      >
        <Form onSubmit={editing ? handleSaveEdit : handleCreate}>
          <FormBody className="space-y-4">
            <Select
              label="Plantilla (opcional)"
              value={editing ? editPlantillaId : plantillaEvalId}
              onChange={(e) => {
                const id = e.target.value;
                if (editing) {
                  setEditPlantillaId(id);
                  if (!id) return;
                  const p = PLANTILLAS_EVALUACIONES.find((x) => x.id === id);
                  if (p) {
                    setEditTitle((t) => (t.trim() ? t : p.tituloSugerido));
                    setEditDescripcion((d) => (d.trim() ? d : p.descripcionSugerida ?? ''));
                    setEditUmbral(p.umbral);
                    setEditPreguntasJson(JSON.stringify(p.preguntas, null, 2));
                  }
                } else {
                  setPlantillaEvalId(id);
                  if (!id) return;
                  const p = PLANTILLAS_EVALUACIONES.find((x) => x.id === id);
                  if (p) {
                    setTitle((t) => (t.trim() ? t : p.tituloSugerido));
                    setDescripcion((d) => (d.trim() ? d : p.descripcionSugerida ?? ''));
                    setUmbralAprobado(p.umbral);
                    setPreguntasJson(JSON.stringify(p.preguntas, null, 2));
                  }
                }
              }}
            >
              <option value="">
                {editing ? '— Mantener preguntas actuales —' : '— Elegir plantilla o editar JSON —'}
              </option>
              {PLANTILLAS_EVALUACIONES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
            <div>
              <label htmlFor="eval-title" className="label">
                Título
              </label>
              <input
                id="eval-title"
                value={editing ? editTitle : title}
                onChange={(e) => (editing ? setEditTitle(e.target.value) : setTitle(e.target.value))}
                placeholder="Título de la evaluación"
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="eval-desc" className="label">
                Descripción (opcional)
              </label>
              <input
                id="eval-desc"
                value={editing ? editDescripcion : descripcion}
                onChange={(e) =>
                  editing ? setEditDescripcion(e.target.value) : setDescripcion(e.target.value)
                }
                placeholder="Descripción breve"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="eval-umbral" className="label">
                Umbral para aprobar (%)
              </label>
              <input
                id="eval-umbral"
                type="number"
                min={0}
                max={100}
                value={editing ? editUmbral : umbralAprobado}
                onChange={(e) =>
                  editing
                    ? setEditUmbral(Number(e.target.value))
                    : setUmbralAprobado(Number(e.target.value))
                }
                className="input-field max-w-[120px]"
              />
            </div>
            <div>
              <label htmlFor="eval-max-int" className="label">
                Máx. intentos (vacío = ilimitado)
              </label>
              <input
                id="eval-max-int"
                type="number"
                min={1}
                value={editing ? editMaxIntentos : maxIntentos}
                onChange={(e) =>
                  editing ? setEditMaxIntentos(e.target.value) : setMaxIntentos(e.target.value)
                }
                className="input-field max-w-[140px]"
              />
            </div>
            <label className="flex items-center gap-2 text-atenas-ink">
              <input
                type="checkbox"
                checked={editing ? editModoExamen : modoExamen}
                onChange={(e) =>
                  editing ? setEditModoExamen(e.target.checked) : setModoExamen(e.target.checked)
                }
              />
              Modo examen (tiempo limitado, solo nota al terminar)
            </label>
            {(editing ? editModoExamen : modoExamen) ? (
              <div>
                <label htmlFor="eval-min-lim" className="label">
                  Minutos límite
                </label>
                <input
                  id="eval-min-lim"
                  type="number"
                  min={1}
                  value={editing ? editMinutosLimite : minutosLimite}
                  onChange={(e) =>
                    editing ? setEditMinutosLimite(e.target.value) : setMinutosLimite(e.target.value)
                  }
                  className="input-field max-w-[140px]"
                />
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-atenas-ink">
              <input
                type="checkbox"
                checked={editing ? editOcultarCorrecta : ocultarCorrecta}
                onChange={(e) =>
                  editing
                    ? setEditOcultarCorrecta(e.target.checked)
                    : setOcultarCorrecta(e.target.checked)
                }
              />
              {editing ? 'No mostrar la respuesta correcta si falla' : 'Ocultar respuesta correcta'}
            </label>
            <div>
              <label htmlFor="eval-preguntas" className="label">
                Preguntas (JSON)
              </label>
              <textarea
                id="eval-preguntas"
                value={editing ? editPreguntasJson : preguntasJson}
                onChange={(e) =>
                  editing ? setEditPreguntasJson(e.target.value) : setPreguntasJson(e.target.value)
                }
                className="input-field font-mono text-sm min-h-[200px]"
                rows={12}
              />
              {!editing && (
                <p className="text-xs text-atenas-muted mt-1">
                  Formato: array de {'{ enunciado, opciones: [ { texto, correcta } ] }'}
                </p>
              )}
            </div>
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={closeEvaluacionForm}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? 'Guardar cambios' : 'Crear evaluación'}</Button>
          </FormFooter>
        </Form>
      </FormModal>

      <FormModal
        open={moverOpen}
        onClose={() => setMoverOpen(false)}
        title="Mover evaluación"
        description="Solo temas de la misma unidad. La evaluación se coloca al final del tema destino."
        icon={<ArrowRightLeft className="w-5 h-5" />}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            void handleMoverEvaluacionAOtroTema();
          }}
        >
          <FormBody className="space-y-4">
            <Select
              label="Evaluación"
              value={moverEvaluacionId}
              onChange={(e) => setMoverEvaluacionId(e.target.value)}
            >
              <option value="">— Elegir —</option>
              {evaluacionesOrdenadas.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </Select>
            <Select
              label="Tema destino"
              value={moverEvalTemaDestinoId}
              onChange={(e) => setMoverEvalTemaDestinoId(e.target.value)}
            >
              <option value="">— Elegir tema —</option>
              {temasEvalDestino.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={() => setMoverOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={moviendoEval || !moverEvaluacionId || !moverEvalTemaDestinoId}
            >
              {moviendoEval ? 'Moviendo…' : 'Mover al tema'}
            </Button>
          </FormFooter>
        </Form>
      </FormModal>

      {loading ? (
        <p className="text-atenas-muted">Cargando evaluaciones...</p>
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
                  className="min-h-touch min-w-touch rounded-lg border border-atenas-mist-border text-atenas-muted hover:bg-atenas-page disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={reordenando || realIdx < 0 || realIdx >= evaluacionesOrdenadas.length - 1}
                  onClick={() => moverEvaluacion(ev.id, 'down')}
                  className="min-h-touch min-w-touch rounded-lg border border-atenas-mist-border text-atenas-muted hover:bg-atenas-page disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Bajar"
                >
                  ↓
                </button>
              </div>
              <div className="flex-1 min-w-[140px]">
                <span className="font-medium text-atenas-ink block">{ev.title}</span>
                {statsPorEvaluacion[ev.id] && (
                  <span className="text-xs text-atenas-muted mt-0.5 block">
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
              <span className="text-sm text-atenas-muted">Umbral: {ev.umbral_aprobado}%</span>
              <button
                type="button"
                onClick={() => handleTogglePublicada(ev.id, ev.publicada)}
                className={`badge ${ev.publicada ? 'bg-emerald-100 text-emerald-800' : 'bg-atenas-mist text-atenas-muted'}`}
              >
                {ev.publicada ? 'Publicada' : 'No publicada'}
              </button>
              <button
                type="button"
                onClick={() => duplicarEvaluacion(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-atenas-muted"
                title="Duplicar como borrador no publicado"
              >
                Duplicar
              </button>
              <button
                type="button"
                onClick={() => openEdit(ev)}
                className="text-sm font-medium hover:underline min-h-touch px-1"
                
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
              <Link to={`/evaluaciones/${ev.id}`} className="text-sm font-medium hover:underline"  target="_blank" rel="noopener noreferrer">
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
      {evaluaciones.length === 0 && !formModalOpen && !loading && (
        <p className="text-atenas-muted mt-4">No hay evaluaciones. Crea una con el botón anterior.</p>
      )}

      {!loading && !loadingTemas && evaluaciones.length > 0 && temasEvalDestino.length > 0 && (
        <div className="mt-8">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex items-center gap-1.5"
            onClick={() => setMoverOpen(true)}
          >
            <ArrowRightLeft className="w-4 h-4" aria-hidden />
            Mover evaluación a otro tema
          </Button>
        </div>
      )}

      {!loading && !loadingTemas && evaluaciones.length > 0 && temasEvalDestino.length === 0 && (
        <p className="text-xs text-atenas-muted mt-6 max-w-2xl">
          Para mover evaluaciones a otro tema, crea al menos un tema más en esta unidad.
        </p>
      )}
    </div>
  );
}
