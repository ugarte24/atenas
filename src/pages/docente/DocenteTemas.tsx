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
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Form, FormBody, FormFooter, FormSection } from '../../components/ui/Form';
import { FormModal } from '../../components/ui/FormModal';
import { useUnidad } from '../../hooks/useUnidad';
import { useTemas } from '../../hooks/useTemas';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import { temaContentPreview, temaContentToPlainText } from '../../lib/temaContent';
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
    content: temaContentToPlainText(t.content),
    prereq: t.prerequisito_tema_id ?? '',
  };
}

type TemaFormFieldsProps = {
  form: FormState;
  temas: Tema[];
  editingId?: string | null;
  onChange: (patch: Partial<FormState>) => void;
};

function TemaFormFields({ form, temas, editingId, onChange }: TemaFormFieldsProps) {
  const prereqOptions = temas.filter((x) => x.id !== editingId);
  const previewText = form.content.trim();

  return (
    <>
      <FormSection title="Información básica">
        <Input
          id="tema-title"
          label="Título"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ej. T1.1 · La forma de la Tierra y sus movimientos"
          required
        />
      </FormSection>

      <FormSection
        title="Introducción para tus estudiantes"
        description="Escribe con tus propias palabras. Es el texto que verán al abrir la lección, antes de los recursos y actividades."
      >
        <Textarea
          id="tema-content"
          label="Texto de introducción"
          hint="Puedes usar varios párrafos. Deja una línea en blanco entre párrafos."
          value={form.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={
            'Ej. En esta lección descubrirás cómo se mueve la Tierra y por qué tenemos día y noche.\n\nPresta atención a las imágenes y actividades que vienen a continuación.'
          }
          rows={7}
        />
        {previewText && (
          <div className="rounded-2xl border border-atenas-mist-border bg-atenas-page px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-atenas-muted mb-2">
              Así lo verán tus estudiantes
            </p>
            <div className="whitespace-pre-wrap text-sm text-atenas-muted-strong leading-relaxed">
              {previewText}
            </div>
          </div>
        )}
      </FormSection>

      <FormSection
        boxed
        title="Prerequisito"
        description="Opcional · el estudiante debe completar el tema seleccionado antes de acceder a este."
      >
        <Select
          id="tema-prereq"
          value={form.prereq}
          onChange={(e) => onChange({ prereq: e.target.value })}
          aria-label="Tema que debe completarse antes"
        >
          <option value="">Sin prerequisito — acceso libre</option>
          {prereqOptions.map((x) => (
            <option key={x.id} value={x.id}>
              {x.title}
            </option>
          ))}
        </Select>
      </FormSection>
    </>
  );
}

type TemaRowProps = {
  tema: Tema;
  index: number;
  prereqTitle: string | null;
  onStartEdit: () => void;
  onRemove: () => void;
};

function TemaRow({ tema, index, prereqTitle, onStartEdit, onRemove }: TemaRowProps) {
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

  const formModalOpen = creating || editingId !== null;
  const editingIndex = editingId ? temas.findIndex((t) => t.id === editingId) : -1;

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
          <Button
            type="button"
            className="inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
            onClick={() => {
              resetForm();
              setEditingId(null);
              setCreating(true);
            }}
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nuevo tema
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      <FormModal
        open={formModalOpen}
        onClose={cancelForm}
        title={editingId ? 'Editar tema' : 'Nuevo tema'}
        description={
          editingId
            ? 'Los recursos, actividades y evaluaciones asociados se conservan.'
            : 'Define el título y el contenido que verán tus estudiantes al abrir el tema.'
        }
        icon={editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      >
        <Form
          onSubmit={(e) => {
            if (editingId) void handleUpdate(e, editingId);
            else void handleCreate(e);
          }}
        >
          <FormBody>
            {editingId && editingIndex >= 0 && (
              <div className="mb-4">
                <Badge tone="default" className="tabular-nums">
                  Tema {editingIndex + 1}
                </Badge>
              </div>
            )}
            <TemaFormFields
              form={form}
              temas={temas}
              editingId={editingId}
              onChange={patchForm}
            />
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" className="w-full sm:w-auto min-h-touch" onClick={cancelForm}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto min-h-touch">
              {editingId ? 'Guardar cambios' : 'Crear tema'}
            </Button>
          </FormFooter>
        </Form>
      </FormModal>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <SkeletonLines lines={4} />
      ) : temas.length === 0 && !formModalOpen ? (
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
