import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileCheck,
  GitBranch,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { useUnidad } from '../../hooks/useUnidad';
import { useTemas } from '../../hooks/useTemas';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import { temaContentPreview } from '../../lib/temaContent';
import type { Tema } from '../../types';

type FormState = {
  title: string;
  content: string;
  prereq: string;
};

const EMPTY_FORM: FormState = { title: '', content: '', prereq: '' };

function formFromTema(t: Tema): FormState {
  return {
    title: t.title,
    content: t.content ?? '',
    prereq: t.prerequisito_tema_id ?? '',
  };
}

type TemaFormProps = {
  mode: 'create' | 'edit';
  form: FormState;
  temas: Tema[];
  editingId?: string | null;
  onChange: (patch: Partial<FormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

function TemaForm({ mode, form, temas, editingId, onChange, onSubmit, onCancel }: TemaFormProps) {
  const prereqOptions = temas.filter((x) => x.id !== editingId);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-atenas-ink">
            {mode === 'create' ? 'Nuevo tema' : 'Editar tema'}
          </h2>
          <p className="text-sm text-atenas-muted mt-1">
            {mode === 'create'
              ? 'Define el título y, si quieres, un texto introductorio para los estudiantes.'
              : 'Actualiza la información del tema. Los recursos y actividades no se pierden.'}
          </p>
        </div>
        <Button type="button" variant="secondary" className="shrink-0" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="tema-title" className="label">
            Título
          </label>
          <input
            id="tema-title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Ej. T1.1 · La forma de la Tierra y sus movimientos"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="tema-content" className="label">
            Contenido introductorio <span className="text-atenas-muted font-normal">(opcional)</span>
          </label>
          <textarea
            id="tema-content"
            value={form.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Breve descripción o contexto que verán los estudiantes al abrir el tema…"
            className="input-field min-h-[100px] font-sans"
            rows={4}
          />
        </div>
        <div>
          <label htmlFor="tema-prereq" className="label">
            Prerequisito <span className="text-atenas-muted font-normal">(opcional)</span>
          </label>
          <select
            id="tema-prereq"
            value={form.prereq}
            onChange={(e) => onChange({ prereq: e.target.value })}
            className="input-field"
          >
            <option value="">— Ninguno —</option>
            {prereqOptions.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-atenas-muted mt-1.5">
            El estudiante deberá completar el tema seleccionado antes de acceder a este.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit">{mode === 'create' ? 'Crear tema' : 'Guardar cambios'}</Button>
      </div>
    </form>
  );
}

type TemaRowProps = {
  tema: Tema;
  index: number;
  prereqTitle: string | null;
  editing: boolean;
  form: FormState;
  temas: Tema[];
  onFormChange: (patch: Partial<FormState>) => void;
  onSubmitEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onRemove: () => void;
};

function TemaRow({
  tema,
  index,
  prereqTitle,
  editing,
  form,
  temas,
  onFormChange,
  onSubmitEdit,
  onCancelEdit,
  onStartEdit,
  onRemove,
}: TemaRowProps) {
  if (editing) {
    return (
      <Card padding="md" className="border-atenas-blue/20 ring-1 ring-atenas-blue/10">
        <TemaForm
          mode="edit"
          form={form}
          temas={temas}
          editingId={tema.id}
          onChange={onFormChange}
          onSubmit={onSubmitEdit}
          onCancel={onCancelEdit}
        />
      </Card>
    );
  }

  return (
    <Card padding="md" hover className="flex flex-col gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-atenas-blue/10 text-atenas-blue flex items-center justify-center text-sm font-bold tabular-nums"
          aria-hidden
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-atenas-ink leading-snug break-words">{tema.title}</h3>
          {tema.content?.trim() ? (
            <p className="text-sm text-atenas-muted mt-1.5 line-clamp-2 whitespace-pre-line">
              {temaContentPreview(tema.content)}
            </p>
          ) : (
            <p className="text-sm text-atenas-muted/80 mt-1.5 italic">Sin contenido introductorio</p>
          )}
          {prereqTitle && (
            <div className="mt-2.5">
              <Badge tone="warning" className="inline-flex items-center gap-1 max-w-full">
                <GitBranch className="w-3 h-3 shrink-0" aria-hidden />
                <span className="truncate">Requiere: {prereqTitle}</span>
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link
          to={`/docente/temas/${tema.id}`}
          className="btn-primary inline-flex items-center justify-center gap-1.5 text-sm min-h-touch px-4 w-full sm:w-auto"
        >
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
          Recursos
        </Link>
        <Link
          to={`/docente/temas/${tema.id}/actividades`}
          className="btn-secondary inline-flex items-center justify-center gap-1.5 text-sm min-h-touch px-4 w-full sm:w-auto"
        >
          <ClipboardList className="w-4 h-4 shrink-0" aria-hidden />
          Actividades
        </Link>
        <Link
          to={`/docente/temas/${tema.id}/evaluaciones`}
          className="btn-secondary inline-flex items-center justify-center gap-1.5 text-sm min-h-touch px-4 w-full sm:w-auto"
        >
          <FileCheck className="w-4 h-4 shrink-0" aria-hidden />
          Evaluaciones
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-atenas-mist-border">
        <button
          type="button"
          onClick={onStartEdit}
          className="btn-secondary inline-flex items-center gap-1.5 text-sm min-h-touch px-3"
        >
          <Pencil className="w-4 h-4" aria-hidden />
          Editar
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-sm min-h-touch px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden />
          Eliminar
        </button>
      </div>
    </Card>
  );
}

export default function DocenteTemas() {
  const { unidadId } = useParams<{ unidadId: string }>();
  const { unidad, loading: loadingUnidad, error: errorUnidad } = useUnidad(unidadId ?? null);
  const { temas, loading, error, create, update, remove } = useTemas(unidadId ?? null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const temaMap = useMemo(() => new Map(temas.map((t) => [t.id, t.title])), [temas]);

  const stats = useMemo(() => {
    const conContenido = temas.filter((t) => t.content?.trim()).length;
    const conPrereq = temas.filter((t) => t.prerequisito_tema_id).length;
    return { total: temas.length, conContenido, conPrereq };
  }, [temas]);

  const unidadTitulo = unidad
    ? tituloUnidadConOrden(unidad.orden ?? 0, unidad.title)
    : '';

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function patchForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    resetForm();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!unidadId) return;
    try {
      await create({
        unidad_id: unidadId,
        title: form.title.trim(),
        content: form.content.trim() || undefined,
        orden: temas.length,
        prerequisito_tema_id: form.prereq || null,
      });
      resetForm();
      setCreating(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear el tema');
    }
  }

  async function handleUpdate(e: React.FormEvent, id: string) {
    e.preventDefault();
    try {
      await update(id, {
        title: form.title.trim(),
        content: form.content.trim() || undefined,
        prerequisito_tema_id: form.prereq || null,
      });
      cancelForm();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  function startEdit(t: Tema) {
    setCreating(false);
    setEditingId(t.id);
    setForm(formFromTema(t));
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar este tema y sus recursos, actividades y evaluaciones?')) return;
    try {
      await remove(id);
      if (editingId === id) cancelForm();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  if (loadingUnidad) return <SkeletonLines lines={6} />;

  if (errorUnidad || !unidad) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
        {errorUnidad ?? 'No se encontró la unidad.'}
      </p>
    );
  }

  const showFormPanel = creating && !editingId;

  return (
    <div className="flex flex-col gap-6 pb-20 lg:pb-0">
      <Link
        to="/docente/contenidos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-atenas-muted hover:text-atenas-ink min-h-touch w-fit rounded-lg px-2 -ml-2 hover:bg-atenas-mist transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
        Volver a unidades
      </Link>

      <PageHeader
        title={unidadTitulo}
        description={
          unidad.description?.trim()
            ? unidad.description
            : 'Gestiona los temas de esta unidad: recursos, actividades y evaluaciones.'
        }
        actions={
          !creating && !editingId ? (
            <Button
              type="button"
              className="inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
              onClick={() => {
                resetForm();
                setCreating(true);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Nuevo tema
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Temas"
          value={stats.total}
          icon={<Layers className="w-5 h-5 text-atenas-blue" />}
        />
        <StatCard
          label="Con texto"
          value={stats.conContenido}
          hint="Intro visible"
          icon={<BookOpen className="w-5 h-5 text-atenas-success" />}
        />
        <StatCard
          label="Encadenados"
          value={stats.conPrereq}
          hint="Con prerequisito"
          icon={<GitBranch className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {showFormPanel && (
        <Card padding="md" className="border-atenas-success/20 ring-1 ring-atenas-success/10">
          <TemaForm
            mode="create"
            form={form}
            temas={temas}
            onChange={patchForm}
            onSubmit={handleCreate}
            onCancel={cancelForm}
          />
        </Card>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <SkeletonLines lines={4} />
      ) : temas.length === 0 && !creating ? (
        <EmptyState
          title="Sin temas todavía"
          description="Crea el primer tema para empezar a añadir recursos, actividades y evaluaciones."
          icon={<Layers className="w-7 h-7" />}
          action={
            <Button
              type="button"
              className="inline-flex items-center gap-1.5"
              onClick={() => {
                resetForm();
                setCreating(true);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Crear primer tema
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4 list-none p-0 m-0">
          {temas.map((t, index) => (
            <li key={t.id}>
              <TemaRow
                tema={t}
                index={index}
                prereqTitle={
                  t.prerequisito_tema_id ? (temaMap.get(t.prerequisito_tema_id) ?? null) : null
                }
                editing={editingId === t.id}
                form={form}
                temas={temas}
                onFormChange={patchForm}
                onSubmitEdit={(e) => handleUpdate(e, t.id)}
                onCancelEdit={cancelForm}
                onStartEdit={() => startEdit(t)}
                onRemove={() => handleRemove(t.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
