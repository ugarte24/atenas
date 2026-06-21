import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Eye,
  EyeOff,
  FolderOpen,
  Map,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { useUnidades } from '../../hooks/useUnidades';
import { useAuthContext } from '../../contexts/AuthContext';
import { isOptionalHexColor, isOptionalHttpUrl, resolveCoverImageUrl } from '../../lib/unidadVisual';
import { islaDesdeOrdenUnidadSafe } from '../../lib/mundoUnidadMap';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import type { Unidad } from '../../types';

const VISUAL_THEME_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Por defecto' },
  { value: 'abya_yala', label: 'Abya Yala' },
  { value: 'europa', label: 'Europa' },
  { value: 'historia', label: 'Historia' },
  { value: 'ciudadania', label: 'Convivencia / ciudadanía' },
];

type FiltroEstado = 'todas' | 'publicadas' | 'borradores';

type FormState = {
  title: string;
  description: string;
  certUmbral: string;
  coverImageUrl: string;
  coverVideoUrl: string;
  accentColor: string;
  introExtended: string;
  visualTheme: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  certUmbral: '',
  coverImageUrl: '',
  coverVideoUrl: '',
  accentColor: '',
  introExtended: '',
  visualTheme: '',
};

function formFromUnidad(u: Unidad): FormState {
  return {
    title: u.title,
    description: u.description ?? '',
    certUmbral: u.certificado_umbral_pct != null ? String(u.certificado_umbral_pct) : '',
    coverImageUrl: u.cover_image_url ?? '',
    coverVideoUrl: u.cover_video_url ?? '',
    accentColor: u.accent_color ?? '',
    introExtended: u.intro_extended ?? '',
    visualTheme: u.visual_theme ?? '',
  };
}

function parseCertUmbral(raw: string): number | null {
  const cert = raw.trim() ? parseInt(raw, 10) : null;
  if (cert == null || Number.isNaN(cert) || cert < 0 || cert > 100) return null;
  return cert;
}

type UnidadFormProps = {
  mode: 'create' | 'edit';
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

function UnidadForm({ mode, form, onChange, onSubmit, onCancel }: UnidadFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-atenas-ink">
            {mode === 'create' ? 'Nueva unidad' : 'Editar unidad'}
          </h2>
          <p className="text-sm text-atenas-muted mt-1">
            {mode === 'create'
              ? 'Completa los datos básicos. Los campos avanzados son opcionales.'
              : 'Actualiza la información visible para los estudiantes.'}
          </p>
        </div>
        <Button type="button" variant="secondary" className="shrink-0" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="u-title" className="label">
            Título
          </label>
          <input
            id="u-title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Ej. Convivencia en la escuela"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="u-desc" className="label">
            Descripción corta (opcional)
          </label>
          <textarea
            id="u-desc"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Resumen que verá el estudiante en la ficha de la unidad"
            className="input-field min-h-[80px] font-sans"
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="cert-umbral" className="label">
            Certificado automático (opcional)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="cert-umbral"
              type="number"
              min={0}
              max={100}
              value={form.certUmbral}
              onChange={(e) => onChange({ certUmbral: e.target.value })}
              placeholder="80"
              className="input-field max-w-[7rem]"
            />
            <span className="text-sm text-atenas-muted">% mínimo del tema para desbloquear certificado</span>
          </div>
        </div>
      </div>

      <details className="rounded-xl border border-atenas-mist-border bg-atenas-page/60 open:bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-atenas-ink [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
          Apariencia y media
          <span className="text-xs font-normal text-atenas-muted">Opcional</span>
        </summary>
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-atenas-mist-border">
          <div>
            <label htmlFor="u-cover-img" className="label">
              URL imagen de portada
            </label>
            <input
              id="u-cover-img"
              value={form.coverImageUrl}
              onChange={(e) => onChange({ coverImageUrl: e.target.value })}
              placeholder="https://…"
              className="input-field"
              type="url"
            />
          </div>
          <div>
            <label htmlFor="u-cover-vid" className="label">
              URL de vídeo (YouTube / Vimeo / .mp4)
            </label>
            <input
              id="u-cover-vid"
              value={form.coverVideoUrl}
              onChange={(e) => onChange({ coverVideoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
              className="input-field"
              type="url"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="u-accent" className="label">
                Color acento (hex)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="u-accent"
                  value={form.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  placeholder="#009975"
                  className="input-field flex-1 font-mono text-sm"
                />
                <input
                  type="color"
                  aria-label="Elegir color"
                  className="h-10 w-14 rounded border border-atenas-mist-border cursor-pointer"
                  value={/^#[0-9A-Fa-f]{6}$/.test(form.accentColor.trim()) ? form.accentColor.trim() : '#003366'}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="u-theme" className="label">
                Tema visual (sin imagen)
              </label>
              <select
                id="u-theme"
                value={form.visualTheme}
                onChange={(e) => onChange({ visualTheme: e.target.value })}
                className="input-field"
              >
                {VISUAL_THEME_OPTIONS.map((o) => (
                  <option key={o.value || 'default'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="u-intro-ext" className="label">
              Intro ampliada
            </label>
            <textarea
              id="u-intro-ext"
              value={form.introExtended}
              onChange={(e) => onChange({ introExtended: e.target.value })}
              placeholder="Texto largo en la ficha de la unidad…"
              className="input-field min-h-[120px] font-sans"
              rows={5}
            />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit">{mode === 'create' ? 'Crear unidad' : 'Guardar cambios'}</Button>
      </div>
    </form>
  );
}

type UnidadRowProps = {
  unidad: Unidad;
  index: number;
  editing: boolean;
  form: FormState;
  onFormChange: (patch: Partial<FormState>) => void;
  onSubmitEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onRemove: () => void;
  onTogglePublicada: () => void;
};

function UnidadRow({
  unidad,
  index,
  editing,
  form,
  onFormChange,
  onSubmitEdit,
  onCancelEdit,
  onStartEdit,
  onRemove,
  onTogglePublicada,
}: UnidadRowProps) {
  const isla = islaDesdeOrdenUnidadSafe(unidad.orden, index);
  const publicada = unidad.publicada !== false;
  const coverUrl = resolveCoverImageUrl(unidad, index);
  const titulo = tituloUnidadConOrden(unidad.orden ?? 0, unidad.title, index);

  if (editing) {
    return (
      <Card padding="md" className="border-atenas-blue/20 ring-1 ring-atenas-blue/10">
        <UnidadForm
          mode="edit"
          form={form}
          onChange={onFormChange}
          onSubmit={onSubmitEdit}
          onCancel={onCancelEdit}
        />
      </Card>
    );
  }

  return (
    <Card padding="none" hover className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-36 md:w-44 shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[120px] bg-atenas-mist">
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <Badge tone="gold" className="text-[10px] shadow-sm">
              {isla.shortLabel}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-atenas-ink leading-snug">{titulo}</h3>
            {unidad.description?.trim() ? (
              <p className="text-sm text-atenas-muted mt-1 line-clamp-2">{unidad.description}</p>
            ) : (
              <p className="text-sm text-atenas-muted/80 mt-1 italic">Sin descripción</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={publicada ? 'success' : 'muted'}>
              {publicada ? 'Publicada' : 'Borrador'}
            </Badge>
            {unidad.certificado_umbral_pct != null && (
              <Badge tone="default" className="inline-flex items-center gap-1">
                <Award className="w-3 h-3" aria-hidden />
                Cert. {unidad.certificado_umbral_pct}%
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 mt-auto">
            <Link
              to={`/docente/unidades/${unidad.id}`}
              className="btn-primary inline-flex items-center gap-1.5 text-sm min-h-touch px-4"
            >
              <BookOpen className="w-4 h-4" aria-hidden />
              Gestionar temas
            </Link>
            <button
              type="button"
              onClick={onTogglePublicada}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm min-h-touch px-3"
              aria-label={publicada ? 'Marcar como borrador' : 'Publicar unidad'}
            >
              {publicada ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
              {publicada ? 'Ocultar' : 'Publicar'}
            </button>
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
        </div>
      </div>
    </Card>
  );
}

export default function DocenteContenidos() {
  const { profile } = useAuthContext();
  const filtroDocente =
    profile?.role === 'docente'
      ? { docenteId: profile.id, aplicarFiltroAsignadas: true }
      : profile?.role === 'admin'
        ? null
        : null;
  const { unidades, loading, error, create, update, remove } = useUnidades(filtroDocente ?? undefined);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busquedaUnidad, setBusquedaUnidad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');

  const stats = useMemo(() => {
    const publicadas = unidades.filter((u) => u.publicada !== false).length;
    return {
      total: unidades.length,
      publicadas,
      borradores: unidades.length - publicadas,
    };
  }, [unidades]);

  const unidadesFiltradas = useMemo(() => {
    const q = busquedaUnidad.trim().toLowerCase();
    return unidades.filter((u) => {
      const matchEstado =
        filtroEstado === 'todas' ||
        (filtroEstado === 'publicadas' && u.publicada !== false) ||
        (filtroEstado === 'borradores' && u.publicada === false);
      if (!matchEstado) return false;
      if (!q) return true;
      return (
        u.title.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
      );
    });
  }, [unidades, busquedaUnidad, filtroEstado]);

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function patchForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function validateFormVisual(): boolean {
    if (!isOptionalHttpUrl(form.coverImageUrl) || !isOptionalHttpUrl(form.coverVideoUrl)) {
      alert('Las URLs de imagen o vídeo deben empezar por http:// o https://');
      return false;
    }
    if (!isOptionalHexColor(form.accentColor)) {
      alert('El color acento debe ser un hex de 6 dígitos, ej. #009975 (o vacío).');
      return false;
    }
    return true;
  }

  function buildPayload() {
    return {
      title: form.title,
      description: form.description.trim() || null,
      certificado_umbral_pct: parseCertUmbral(form.certUmbral),
      cover_image_url: form.coverImageUrl.trim() || null,
      cover_video_url: form.coverVideoUrl.trim() || null,
      accent_color: form.accentColor.trim() || null,
      intro_extended: form.introExtended.trim() || null,
      visual_theme: form.visualTheme.trim() || null,
    };
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFormVisual()) return;
    try {
      const payload = buildPayload();
      await create({
        title: form.title,
        description: form.description.trim() || undefined,
        orden: unidades.length,
        certificado_umbral_pct: payload.certificado_umbral_pct,
        cover_image_url: payload.cover_image_url,
        cover_video_url: payload.cover_video_url,
        accent_color: payload.accent_color,
        intro_extended: payload.intro_extended,
        visual_theme: payload.visual_theme,
      });
      resetForm();
      setCreating(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la unidad');
    }
  }

  async function handleUpdate(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!validateFormVisual()) return;
    try {
      await update(id, buildPayload());
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  function startEdit(u: Unidad) {
    setCreating(false);
    setEditingId(u.id);
    setForm(formFromUnidad(u));
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    resetForm();
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar esta unidad y todos sus temas?')) return;
    try {
      await remove(id);
      if (editingId === id) cancelForm();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  async function handleTogglePublicada(id: string, publicada: boolean) {
    try {
      await update(id, { publicada: !publicada });
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado de publicación');
    }
  }

  if (loading) return <SkeletonLines lines={6} />;
  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
        {error}
      </p>
    );
  }

  const showFormPanel = creating && !editingId;

  return (
    <div>
      <PageHeader
        title="Unidades"
        description="Organiza el curso por unidades, configura temas y publica cuando estén listas para tus estudiantes."
        actions={
          !creating && !editingId ? (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/unidades?view=map"
                className="btn-secondary inline-flex items-center gap-1.5 text-sm min-h-touch px-4"
              >
                <Map className="w-4 h-4" aria-hidden />
                Vista mapa alumno
              </Link>
              <Button
                type="button"
                className="inline-flex items-center gap-1.5"
                onClick={() => { resetForm(); setCreating(true); }}
              >
                <Plus className="w-4 h-4" aria-hidden />
                Nueva unidad
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<FolderOpen className="w-5 h-5 text-atenas-blue" />}
        />
        <StatCard
          label="Publicadas"
          value={stats.publicadas}
          hint="Visibles para estudiantes"
          icon={<Eye className="w-5 h-5 text-atenas-success" />}
        />
        <StatCard
          label="Borradores"
          value={stats.borradores}
          hint="Solo docentes"
          icon={<EyeOff className="w-5 h-5 text-atenas-muted" />}
        />
      </div>

      {showFormPanel && (
        <Card padding="md" className="mb-6 border-atenas-success/20 ring-1 ring-atenas-success/10">
          <UnidadForm
            mode="create"
            form={form}
            onChange={patchForm}
            onSubmit={handleCreate}
            onCancel={cancelForm}
          />
        </Card>
      )}

      {unidades.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atenas-muted pointer-events-none"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Buscar por título o descripción…"
              value={busquedaUnidad}
              onChange={(e) => setBusquedaUnidad(e.target.value)}
              aria-label="Buscar unidades"
              className="pl-9"
            />
          </div>

          <div
            className="flex gap-1 p-1 rounded-xl bg-atenas-mist border border-atenas-mist-border max-w-md"
            role="tablist"
            aria-label="Filtrar por estado"
          >
            {(
              [
                ['todas', 'Todas'],
                ['publicadas', 'Publicadas'],
                ['borradores', 'Borradores'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filtroEstado === key}
                className={`segment-tab ${filtroEstado === key ? 'segment-tab--active' : 'segment-tab--inactive'}`}
                onClick={() => setFiltroEstado(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {unidades.length === 0 && !creating ? (
        <EmptyState
          title="Aún no hay unidades"
          description="Crea la primera unidad del curso. Después podrás añadir temas, recursos y actividades."
          icon={<FolderOpen className="w-7 h-7 text-atenas-blue" />}
          action={
            <Button
              type="button"
              className="inline-flex items-center gap-1.5"
              onClick={() => { resetForm(); setCreating(true); }}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Crear primera unidad
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {unidadesFiltradas.map((u, i) => (
            <li key={u.id}>
              <UnidadRow
                unidad={u}
                index={i}
                editing={editingId === u.id}
                form={form}
                onFormChange={patchForm}
                onSubmitEdit={(e) => void handleUpdate(e, u.id)}
                onCancelEdit={cancelForm}
                onStartEdit={() => startEdit(u)}
                onRemove={() => void handleRemove(u.id)}
                onTogglePublicada={() => void handleTogglePublicada(u.id, u.publicada ?? true)}
              />
            </li>
          ))}
        </ul>
      )}

      {unidades.length > 0 && unidadesFiltradas.length === 0 && (
        <p className="text-atenas-muted mt-4 text-sm text-center py-8">
          Ninguna unidad coincide con la búsqueda o el filtro seleccionado.
        </p>
      )}
    </div>
  );
}
