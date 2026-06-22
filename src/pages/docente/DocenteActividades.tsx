import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowRightLeft,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import { useTema } from '../../hooks/useTema';
import { useTemas } from '../../hooks/useTemas';
import { useActividades } from '../../hooks/useActividades';
import { supabase } from '../../lib/supabase';
import type { Actividad, ActividadTipo, ActividadConfig } from '../../types';
import { PLANTILLAS_ACTIVIDADES } from '../../constants/plantillasActividades';
import { EJEMPLO_CONFIG_ACTIVIDAD } from '../../constants/ejemploConfigActividad';
import { DocenteDetalleIntentosModal } from '../../components/docente/DocenteDetalleIntentosModal';
import { DocentePreviewModal } from '../../components/docente/DocentePreviewModal';
import {
  DocenteGestionItemCard,
  DocenteListToolbar,
  DocenteTemaSubpageShell,
  gestionActionIcons,
} from '../../components/docente/DocenteTemaSubpage';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { Form, FormBody, FormFooter } from '../../components/ui/Form';
import { FormModal } from '../../components/ui/FormModal';
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
  const [moverOpen, setMoverOpen] = useState(false);
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

  const resumen = useMemo(() => {
    const publicadas = actividades.filter((a) => a.publicada).length;
    const conIntentos = actividades.filter((a) => (statsPorActividad[a.id]?.alumnos ?? 0) > 0).length;
    return { total: actividades.length, publicadas, conIntentos };
  }, [actividades, statsPorActividad]);

  const TIPO_LABEL: Record<ActividadTipo, string> = {
    seleccion_multiple: 'Selección múltiple',
    relacion_conceptos: 'Relacionar columnas',
    memoria: 'Memoria',
    ordenar_secuencia: 'Ordenar secuencia',
    ubicar_en_mapa: 'Ubicar en mapa',
  };

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
      setMoverOpen(false);
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

  const formModalOpen = adding || editing !== null;

  function closeActividadForm() {
    setAdding(false);
    setEditing(null);
  }

  if (loadingTema || !tema) {
    return <SkeletonLines lines={6} />;
  }

  return (
    <>
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

      <DocenteTemaSubpageShell
        unidadId={tema.unidad_id}
        temaTitle={tema.title}
        sectionLabel="Actividades"
        sectionDescription="Diseña actividades interactivas para practicar los contenidos del tema."
        icon={<ClipboardList className="w-5 h-5" />}
        primaryAction={
          <Button
            type="button"
            className="inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
            onClick={() => {
              setEditing(null);
              setAdding(true);
              setPlantillaActividadId('');
              setConfigCreate(cfgPorTipo(tipo));
            }}
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nueva actividad
          </Button>
        }
        stats={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Actividades"
              value={resumen.total}
              icon={<ClipboardList className="w-5 h-5 text-atenas-blue" />}
            />
            <StatCard
              label="Publicadas"
              value={resumen.publicadas}
              hint="Visibles para alumnos"
              icon={<Eye className="w-5 h-5 text-atenas-success" />}
            />
            <StatCard
              label="Con intentos"
              value={resumen.conIntentos}
              hint="Al menos un alumno"
              icon={<Users className="w-5 h-5 text-violet-600" />}
            />
          </div>
        }
        toolbar={
          actividades.length > 0 ? (
            <DocenteListToolbar
              search={busqueda}
              onSearchChange={setBusqueda}
              searchPlaceholder="Buscar por título o tipo…"
              searchAriaLabel="Buscar actividades"
              filterValue={filtroPub}
              onFilterChange={(v) => setFiltroPub(v as typeof filtroPub)}
              filterAriaLabel="Filtrar por publicación"
              filterOptions={[
                { value: 'todas', label: 'Todas' },
                { value: 'publicada', label: 'Solo publicadas' },
                { value: 'borrador', label: 'Solo borradores' },
              ]}
            />
          ) : undefined
        }
        loading={loading}
        empty={
          actividades.length === 0 && !formModalOpen
            ? {
                title: 'Sin actividades todavía',
                description: 'Crea la primera actividad interactiva para que tus estudiantes practiquen.',
                icon: <ClipboardList className="w-7 h-7" />,
                action: (
                  <Button
                    type="button"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => {
                      setEditing(null);
                      setAdding(true);
                      setPlantillaActividadId('');
                      setConfigCreate(cfgPorTipo(tipo));
                    }}
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                    Crear actividad
                  </Button>
                ),
              }
            : undefined
        }
        footer={
          !loading && !loadingTemas && actividades.length > 0 && temasDestino.length > 0 ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                className="inline-flex items-center gap-1.5"
                onClick={() => setMoverOpen(true)}
              >
                <ArrowRightLeft className="w-4 h-4" aria-hidden />
                Mover actividad a otro tema
              </Button>
            </div>
          ) : !loading && !loadingTemas && actividades.length > 0 && temasDestino.length === 0 ? (
            <p className="text-xs text-atenas-muted max-w-2xl">
              Para mover actividades a otro tema, crea al menos un tema más en esta unidad.
            </p>
          ) : undefined
        }
      >
        {actividades.length > 0 && actividadesFiltradas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-atenas-mist-border bg-atenas-card px-4 py-8 text-center text-sm text-atenas-muted">
            Ninguna actividad coincide con la búsqueda o el filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {actividadesFiltradas.map((a) => {
              const realIdx = actividadesOrdenadas.findIndex((x) => x.id === a.id);
              const stats = statsPorActividad[a.id];
              const subtitle =
                stats && stats.alumnos > 0
                  ? `${stats.alumnos} alumno${stats.alumnos !== 1 ? 's' : ''}${
                      stats.promedio != null ? ` · Nota media ${stats.promedio}%` : ''
                    }`
                  : 'Sin intentos aún';

              return (
                <li key={a.id}>
                  <DocenteGestionItemCard
                    title={a.title}
                    subtitle={subtitle}
                    chips={<Badge tone="default">{TIPO_LABEL[a.tipo] ?? a.tipo}</Badge>}
                    order={{
                      disabled: reordenando,
                      canMoveUp: realIdx > 0,
                      canMoveDown: realIdx >= 0 && realIdx < actividadesOrdenadas.length - 1,
                      onUp: () => void moverActividad(a.id, 'up'),
                      onDown: () => void moverActividad(a.id, 'down'),
                    }}
                    published={{
                      value: a.publicada,
                      onToggle: () => void handleTogglePublicada(a.id, a.publicada),
                    }}
                    actions={[
                      {
                        key: 'dup',
                        label: 'Duplicar',
                        onClick: () => void duplicarActividad(a),
                        tone: 'muted',
                        icon: gestionActionIcons.duplicate,
                      },
                      {
                        key: 'edit',
                        label: 'Editar',
                        onClick: () => openEdit(a),
                        icon: gestionActionIcons.edit,
                      },
                      {
                        key: 'preview',
                        label: 'Vista previa',
                        onClick: () => setPreviewActividad(a),
                        tone: 'success',
                        icon: gestionActionIcons.preview,
                      },
                      {
                        key: 'students',
                        label: 'Ver alumnos',
                        onClick: () => setDetalleActividad(a),
                        tone: 'violet',
                        icon: gestionActionIcons.students,
                      },
                      {
                        key: 'student-view',
                        label: 'Vista alumno',
                        href: `/actividades/${a.id}`,
                        external: true,
                        icon: gestionActionIcons.external,
                      },
                      {
                        key: 'delete',
                        label: 'Eliminar',
                        onClick: () => void handleRemove(a.id),
                        tone: 'danger',
                        icon: gestionActionIcons.delete,
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </DocenteTemaSubpageShell>

      <FormModal
        open={formModalOpen}
        onClose={closeActividadForm}
        title={editing ? 'Editar actividad' : 'Nueva actividad'}
        description={
          editing
            ? 'Modifica el título, tipo o configuración de la actividad.'
            : 'Define el tipo de actividad y su contenido para los estudiantes.'
        }
        icon={editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      >
        <Form onSubmit={editing ? handleSaveEdit : handleCreate}>
          <FormBody className="space-y-4">
            <div>
              <label htmlFor="act-title" className="label">
                Título
              </label>
              <input
                id="act-title"
                value={editing ? editTitle : title}
                onChange={(e) => (editing ? setEditTitle(e.target.value) : setTitle(e.target.value))}
                placeholder="Título de la actividad"
                className="input-field"
                required
              />
            </div>
            <Select
              label="Sobrescribir con plantilla (opcional)"
              value={editing ? editPlantillaId : plantillaActividadId}
              onChange={(e) => {
                const id = e.target.value;
                if (editing) {
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
                } else {
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
                }
              }}
            >
              <option value="">
                {editing ? '— Mantener contenido actual —' : '— Elegir plantilla o editar abajo —'}
              </option>
              {PLANTILLAS_ACTIVIDADES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              label="Tipo de actividad"
              value={editing ? editTipo : tipo}
              onChange={(e) => {
                const t = e.target.value as ActividadTipo;
                if (editing) {
                  setEditTipo(t);
                  setEditPlantillaId('');
                  setConfigEdit(cfgPorTipo(t));
                } else {
                  setTipo(t);
                  setPlantillaActividadId('');
                  setConfigCreate(cfgPorTipo(t));
                }
              }}
            >
              <option value="seleccion_multiple">Selección múltiple</option>
              <option value="relacion_conceptos">Relacionar columnas</option>
              <option value="memoria">Juego de memoria</option>
              <option value="ordenar_secuencia">Arrastrar y soltar (ordenar)</option>
              <option value="ubicar_en_mapa">Ubicar en mapa</option>
            </Select>
            <ActividadConfigEditor
              tipo={editing ? editTipo : tipo}
              value={editing ? configEdit : configCreate}
              onChange={editing ? setConfigEdit : setConfigCreate}
              idPrefix={editing ? 'edit-act' : 'new-act'}
            />
            <ActividadConfigJsonToggle
              config={editing ? configEdit : configCreate}
              onApplyJson={editing ? setConfigEdit : setConfigCreate}
            />
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={closeActividadForm}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? 'Guardar cambios' : 'Crear actividad'}</Button>
          </FormFooter>
        </Form>
      </FormModal>

      <FormModal
        open={moverOpen}
        onClose={() => setMoverOpen(false)}
        title="Mover actividad"
        description="Solo aparecen temas de la misma unidad. La actividad se coloca al final del tema destino."
        icon={<ArrowRightLeft className="w-5 h-5" />}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            void handleMoverActividadAOtroTema();
          }}
        >
          <FormBody className="space-y-4">
            <Select
              label="Actividad"
              value={moverActividadId}
              onChange={(e) => setMoverActividadId(e.target.value)}
            >
              <option value="">— Elegir —</option>
              {actividadesOrdenadas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </Select>
            <Select
              label="Tema destino"
              value={moverTemaDestinoId}
              onChange={(e) => setMoverTemaDestinoId(e.target.value)}
            >
              <option value="">— Elegir tema —</option>
              {temasDestino.map((t) => (
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
              disabled={moviendo || !moverActividadId || !moverTemaDestinoId}
            >
              {moviendo ? 'Moviendo…' : 'Mover al tema'}
            </Button>
          </FormFooter>
        </Form>
      </FormModal>
    </>
  );
}
