import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useTemas } from '../../hooks/useTemas';
import { useActividades } from '../../hooks/useActividades';
import { supabase } from '../../lib/supabase';
import type { Actividad, ActividadTipo, ActividadConfig } from '../../types';
import { PLANTILLAS_ACTIVIDADES } from '../../constants/plantillasActividades';
import { EJEMPLO_CONFIG_ACTIVIDAD } from '../../constants/ejemploConfigActividad';
import { DocenteDetalleIntentosModal } from '../../components/docente/DocenteDetalleIntentosModal';
import { DocentePreviewModal } from '../../components/docente/DocentePreviewModal';
import { ActividadPreviewBody } from '../../components/docente/ActividadPreviewBody';
import {
  ActividadConfigEditor,
  ActividadConfigJsonToggle,
} from '../../components/docente/ActividadConfigEditor';

function cfgPorTipo(t: ActividadTipo): ActividadConfig {
  try {
    return JSON.parse(EJEMPLO_CONFIG_ACTIVIDAD[t]) as ActividadConfig;
  } catch {
    return { pregunta: '', opciones: [] } as ActividadConfig;
  }
}

export default function DocenteActividades() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const { temas: temasUnidad, loading: loadingTemas } = useTemas(tema?.unidad_id ?? null);
  const { actividades, loading, create, update, remove } = useActividades(temaId ?? null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Actividad | null>(null);
  const [tipo, setTipo] = useState<ActividadTipo>('seleccion_multiple');
  const [title, setTitle] = useState('');
  const [configCreate, setConfigCreate] = useState<ActividadConfig>(() => cfgPorTipo('seleccion_multiple'));
  const [plantillaActividadId, setPlantillaActividadId] = useState('');
  const [editTipo, setEditTipo] = useState<ActividadTipo>('seleccion_multiple');
  const [editTitle, setEditTitle] = useState('');
  const [configEdit, setConfigEdit] = useState<ActividadConfig>(() => cfgPorTipo('seleccion_multiple'));
  const [editPlantillaId, setEditPlantillaId] = useState('');
  const [reordenando, setReordenando] = useState(false);
  const [moverActividadId, setMoverActividadId] = useState('');
  const [moverTemaDestinoId, setMoverTemaDestinoId] = useState('');
  const [moviendo, setMoviendo] = useState(false);
  const [previewActividad, setPreviewActividad] = useState<Actividad | null>(null);
  const [detalleActividad, setDetalleActividad] = useState<Actividad | null>(null);
  const [filtroPub, setFiltroPub] = useState<'todas' | 'publicada' | 'borrador'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [statsPorActividad, setStatsPorActividad] = useState<
    Record<string, { alumnos: number; promedio: number | null }>
  >({});

  useEffect(() => {
    let cancelled = false;
    const ids = actividades.map((a) => a.id);
    if (!ids.length) {
      setStatsPorActividad({});
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('actividad_intentos')
        .select('actividad_id, puntuacion')
        .in('actividad_id', ids);
      if (cancelled) return;
      if (error || !data) {
        setStatsPorActividad({});
        return;
      }
      const porId: Record<string, number[]> = {};
      for (const row of data as { actividad_id: string; puntuacion: number }[]) {
        if (!porId[row.actividad_id]) porId[row.actividad_id] = [];
        porId[row.actividad_id].push(row.puntuacion);
      }
      const next: Record<string, { alumnos: number; promedio: number | null }> = {};
      for (const id of ids) {
        const pts = porId[id] ?? [];
        const alumnos = pts.length;
        const promedio =
          alumnos > 0 ? Math.round(pts.reduce((s, p) => s + p, 0) / alumnos) : null;
        next[id] = { alumnos, promedio };
      }
      setStatsPorActividad(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [actividades]);

  const temasDestino = useMemo(
    () => temasUnidad.filter((t) => t.id !== temaId),
    [temasUnidad, temaId]
  );

  const actividadesOrdenadas = useMemo(
    () => [...actividades].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id)),
    [actividades]
  );

  const actividadesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return actividadesOrdenadas.filter((a) => {
      if (filtroPub === 'publicada' && !a.publicada) return false;
      if (filtroPub === 'borrador' && a.publicada) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.tipo.includes(q)) return false;
      return true;
    });
  }, [actividadesOrdenadas, filtroPub, busqueda]);

  async function moverActividad(id: string, dir: 'up' | 'down') {
    const list = [...actividades].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));
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

  async function handleMoverActividadAOtroTema() {
    if (!moverActividadId || !moverTemaDestinoId || moverTemaDestinoId === temaId) return;
    if (
      !confirm(
        '¿Mover esta actividad al tema seleccionado? Los intentos de los alumnos siguen ligados a la misma actividad.'
      )
    ) {
      return;
    }
    setMoviendo(true);
    try {
      const { data: rows, error: e1 } = await supabase
        .from('actividades')
        .select('orden')
        .eq('tema_id', moverTemaDestinoId);
      if (e1) throw e1;
      const maxOrden = (rows ?? []).reduce((m, r: { orden: number }) => Math.max(m, r.orden), -1);
      await update(moverActividadId, { tema_id: moverTemaDestinoId, orden: maxOrden + 1 });
      if (editing?.id === moverActividadId) setEditing(null);
      setMoverActividadId('');
      setMoverTemaDestinoId('');
    } catch (err) {
      console.error(err);
      alert('Error al mover la actividad');
    } finally {
      setMoviendo(false);
    }
  }

  async function duplicarActividad(a: Actividad) {
    if (!temaId) return;
    const maxOrden = actividades.reduce((m, x) => Math.max(m, x.orden), -1);
    try {
      await create({
        tema_id: temaId,
        tipo: a.tipo,
        title: `${a.title} (copia)`,
        config: JSON.parse(JSON.stringify(a.config)) as ActividadConfig,
        publicada: false,
        orden: maxOrden + 1,
      });
    } catch (err) {
      console.error(err);
      alert('Error al duplicar la actividad');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !title.trim()) return;
    try {
      await create({ tema_id: temaId, tipo, title: title.trim(), config: configCreate });
      setTitle('');
      setConfigCreate(cfgPorTipo(tipo));
      setPlantillaActividadId('');
      setAdding(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la actividad');
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
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await remove(id);
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  function openEdit(a: Actividad) {
    setAdding(false);
    setEditing(a);
    setEditTipo(a.tipo);
    setEditTitle(a.title);
    setConfigEdit(JSON.parse(JSON.stringify(a.config)) as ActividadConfig);
    setEditPlantillaId('');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editTitle.trim()) return;
    try {
      await update(editing.id, {
        title: editTitle.trim(),
        tipo: editTipo,
        config: configEdit,
      });
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios');
    }
  }

  if (loadingTema || !tema) {
    return <p className="text-slate-600">Cargando...</p>;
  }

  return (
    <div>
      {detalleActividad ? (
        <DocenteDetalleIntentosModal
          tipo="actividad"
          itemId={detalleActividad.id}
          titulo={detalleActividad.title}
          onClose={() => setDetalleActividad(null)}
        />
      ) : null}
      {previewActividad ? (
        <DocentePreviewModal
          title={`Vista previa: ${previewActividad.title}`}
          onClose={() => setPreviewActividad(null)}
        >
          <div className="card p-6" key={previewActividad.id}>
            <ActividadPreviewBody actividad={previewActividad} />
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
      <h2 className="text-xl font-bold text-slate-900 mb-4">{tema.title} — Actividades</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar por título o tipo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field flex-1 max-w-md"
          aria-label="Buscar actividades"
        />
        <select
          value={filtroPub}
          onChange={(e) => setFiltroPub(e.target.value as typeof filtroPub)}
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
          <p className="text-sm font-semibold text-slate-800">Editar actividad</p>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título de la actividad"
            className="input-field"
            required
          />
          <label className="label">Sobrescribir con plantilla (opcional)</label>
          <select
            value={editPlantillaId}
            onChange={(e) => {
              const id = e.target.value;
              setEditPlantillaId(id);
              if (!id) return;
              const p = PLANTILLAS_ACTIVIDADES.find((x) => x.id === id);
              if (p) {
                setEditTipo(p.tipo);
                try {
                  setConfigEdit(JSON.parse(p.configJson) as ActividadConfig);
                } catch {
                  setConfigEdit(cfgPorTipo(p.tipo));
                }
                setEditTitle((t) => (t.trim() ? t : p.tituloSugerido));
              }
            }}
            className="input-field"
          >
            <option value="">— Mantener contenido actual —</option>
            {PLANTILLAS_ACTIVIDADES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={editTipo}
            onChange={(e) => {
              const t = e.target.value as ActividadTipo;
              setEditTipo(t);
              setEditPlantillaId('');
              setConfigEdit(cfgPorTipo(t));
            }}
            className="input-field"
          >
            <option value="seleccion_multiple">Selección múltiple</option>
            <option value="relacion_conceptos">Relación de conceptos</option>
            <option value="memoria">Memoria (parejas)</option>
            <option value="ordenar_secuencia">Ordenar secuencia</option>
            <option value="ubicar_en_mapa">Ubicar en mapa</option>
          </select>
          <ActividadConfigEditor
            tipo={editTipo}
            value={configEdit}
            onChange={setConfigEdit}
            idPrefix="edit-act"
          />
          <ActividadConfigJsonToggle config={configEdit} onApplyJson={setConfigEdit} />
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
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la actividad"
            className="input-field"
            required
          />
          <label className="label">Plantilla rápida (opcional)</label>
          <select
            value={plantillaActividadId}
            onChange={(e) => {
              const id = e.target.value;
              setPlantillaActividadId(id);
              if (!id) return;
              const p = PLANTILLAS_ACTIVIDADES.find((x) => x.id === id);
              if (p) {
                setTipo(p.tipo);
                try {
                  setConfigCreate(JSON.parse(p.configJson) as ActividadConfig);
                } catch {
                  setConfigCreate(cfgPorTipo(p.tipo));
                }
                setTitle((t) => (t.trim() ? t : p.tituloSugerido));
              }
            }}
            className="input-field"
          >
            <option value="">— Elegir plantilla o editar JSON abajo —</option>
            {PLANTILLAS_ACTIVIDADES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={tipo}
            onChange={(e) => {
              const t = e.target.value as ActividadTipo;
              setTipo(t);
              setPlantillaActividadId('');
              setConfigCreate(cfgPorTipo(t));
            }}
            className="input-field"
          >
            <option value="seleccion_multiple">Selección múltiple</option>
            <option value="relacion_conceptos">Relación de conceptos</option>
            <option value="memoria">Memoria (parejas)</option>
            <option value="ordenar_secuencia">Ordenar secuencia</option>
            <option value="ubicar_en_mapa">Ubicar en mapa</option>
          </select>
          <ActividadConfigEditor
            tipo={tipo}
            value={configCreate}
            onChange={setConfigCreate}
            idPrefix="new-act"
          />
          <ActividadConfigJsonToggle config={configCreate} onApplyJson={setConfigCreate} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Crear actividad</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setAdding(true);
            setPlantillaActividadId('');
            setConfigCreate(cfgPorTipo(tipo));
          }}
          className="btn-primary mb-6"
        >
          + Nueva actividad
        </button>
      )}

      {loading ? (
        <p className="text-slate-600">Cargando actividades...</p>
      ) : (
        <ul className="space-y-2">
          {actividadesFiltradas.map((a) => {
            const realIdx = actividadesOrdenadas.findIndex((x) => x.id === a.id);
            return (
            <li key={a.id} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 card">
              <div className="flex items-center gap-1 shrink-0" title="Orden en el tema">
                <button
                  type="button"
                  disabled={reordenando || realIdx <= 0}
                  onClick={() => moverActividad(a.id, 'up')}
                  className="min-h-touch min-w-touch rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={reordenando || realIdx < 0 || realIdx >= actividadesOrdenadas.length - 1}
                  onClick={() => moverActividad(a.id, 'down')}
                  className="min-h-touch min-w-touch rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  aria-label="Bajar"
                >
                  ↓
                </button>
              </div>
              <div className="flex-1 min-w-[140px]">
                <span className="font-medium text-slate-900 block">{a.title}</span>
                {statsPorActividad[a.id] && (
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    {statsPorActividad[a.id].alumnos === 0
                      ? 'Sin intentos aún'
                      : `${statsPorActividad[a.id].alumnos} alumno${statsPorActividad[a.id].alumnos !== 1 ? 's' : ''}${
                          statsPorActividad[a.id].promedio != null
                            ? ` · Nota media ${statsPorActividad[a.id].promedio}%`
                            : ''
                        }`}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500 capitalize">{a.tipo.replace(/_/g, ' ')}</span>
              <button
                type="button"
                onClick={() => handleTogglePublicada(a.id, a.publicada)}
                className={`badge ${a.publicada ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
              >
                {a.publicada ? 'Publicada' : 'No publicada'}
              </button>
              <button
                type="button"
                onClick={() => duplicarActividad(a)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-slate-600"
                title="Duplicar como borrador no publicado"
              >
                Duplicar
              </button>
              <button
                type="button"
                onClick={() => openEdit(a)}
                className="text-sm font-medium hover:underline min-h-touch px-1"
                style={{ color: '#003366' }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setPreviewActividad(a)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-emerald-700"
              >
                Vista previa
              </button>
              <button
                type="button"
                onClick={() => setDetalleActividad(a)}
                className="text-sm font-medium hover:underline min-h-touch px-1 text-violet-700"
              >
                Ver alumnos
              </button>
              <Link to={`/actividades/${a.id}`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }} target="_blank" rel="noopener noreferrer">
                Ver alumno
              </Link>
              <button type="button" onClick={() => handleRemove(a.id)} className="text-sm text-red-600 hover:text-red-700">
                Eliminar
              </button>
            </li>
          );
          })}
        </ul>
      )}
      {actividades.length === 0 && !adding && !editing && !loading && (
        <p className="text-slate-500 mt-4">No hay actividades. Crea una con el botón anterior.</p>
      )}

      {!loading && !loadingTemas && actividades.length > 0 && temasDestino.length > 0 && (
        <section className="mt-8 card p-5 max-w-2xl space-y-3 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Mover actividad a otro tema</h3>
          <p className="text-xs text-slate-500">
            Solo aparecen temas de la misma unidad. La actividad se coloca al final del tema destino.
          </p>
          <label className="label mb-0">Actividad</label>
          <select
            value={moverActividadId}
            onChange={(e) => setMoverActividadId(e.target.value)}
            className="input-field"
          >
            <option value="">— Elegir —</option>
            {actividadesOrdenadas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <label className="label mb-0">Tema destino</label>
          <select
            value={moverTemaDestinoId}
            onChange={(e) => setMoverTemaDestinoId(e.target.value)}
            className="input-field"
          >
            <option value="">— Elegir tema —</option>
            {temasDestino.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={moviendo || !moverActividadId || !moverTemaDestinoId}
            onClick={handleMoverActividadAOtroTema}
            className="btn-secondary"
          >
            {moviendo ? 'Moviendo…' : 'Mover al tema'}
          </button>
        </section>
      )}

      {!loading && !loadingTemas && actividades.length > 0 && temasDestino.length === 0 && (
        <p className="text-xs text-slate-500 mt-6 max-w-2xl">
          Para mover actividades a otro tema, crea al menos un tema más en esta unidad.
        </p>
      )}
    </div>
  );
}
