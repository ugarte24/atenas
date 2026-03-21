import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUnidades } from '../../hooks/useUnidades';
import { useAuthContext } from '../../contexts/AuthContext';
import { isOptionalHexColor, isOptionalHttpUrl } from '../../lib/unidadVisual';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import type { Unidad } from '../../types';

const VISUAL_THEME_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Por defecto' },
  { value: 'abya_yala', label: 'Abya Yala' },
  { value: 'europa', label: 'Europa' },
  { value: 'historia', label: 'Historia' },
  { value: 'ciudadania', label: 'Convivencia / ciudadanía' },
];

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
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCertUmbral, setFormCertUmbral] = useState('');
  const [formCoverImageUrl, setFormCoverImageUrl] = useState('');
  const [formCoverVideoUrl, setFormCoverVideoUrl] = useState('');
  const [formAccentColor, setFormAccentColor] = useState('');
  const [formIntroExtended, setFormIntroExtended] = useState('');
  const [formVisualTheme, setFormVisualTheme] = useState('');
  const [busquedaUnidad, setBusquedaUnidad] = useState('');

  const unidadesFiltradas = useMemo(() => {
    const q = busquedaUnidad.trim().toLowerCase();
    if (!q) return unidades;
    return unidades.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
    );
  }, [unidades, busquedaUnidad]);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormCertUmbral('');
    setFormCoverImageUrl('');
    setFormCoverVideoUrl('');
    setFormAccentColor('');
    setFormIntroExtended('');
    setFormVisualTheme('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isOptionalHttpUrl(formCoverImageUrl) || !isOptionalHttpUrl(formCoverVideoUrl)) {
      alert('Las URLs de imagen o vídeo deben empezar por http:// o https://');
      return;
    }
    if (!isOptionalHexColor(formAccentColor)) {
      alert('El color acento debe ser un hex de 6 dígitos, ej. #009975 (o vacío).');
      return;
    }
    try {
      const cert = formCertUmbral.trim() ? parseInt(formCertUmbral, 10) : null;
      await create({
        title: formTitle,
        description: formDescription || undefined,
        orden: unidades.length,
        certificado_umbral_pct:
          cert != null && !Number.isNaN(cert) && cert >= 0 && cert <= 100 ? cert : null,
        cover_image_url: formCoverImageUrl.trim() || null,
        cover_video_url: formCoverVideoUrl.trim() || null,
        accent_color: formAccentColor.trim() || null,
        intro_extended: formIntroExtended.trim() || null,
        visual_theme: formVisualTheme.trim() || null,
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
    if (!isOptionalHttpUrl(formCoverImageUrl) || !isOptionalHttpUrl(formCoverVideoUrl)) {
      alert('Las URLs de imagen o vídeo deben empezar por http:// o https://');
      return;
    }
    if (!isOptionalHexColor(formAccentColor)) {
      alert('El color acento debe ser un hex de 6 dígitos, ej. #009975 (o vacío).');
      return;
    }
    try {
      const cert = formCertUmbral.trim() ? parseInt(formCertUmbral, 10) : null;
      await update(id, {
        title: formTitle,
        description: formDescription.trim() || null,
        certificado_umbral_pct:
          cert != null && !Number.isNaN(cert) && cert >= 0 && cert <= 100 ? cert : null,
        cover_image_url: formCoverImageUrl.trim() || null,
        cover_video_url: formCoverVideoUrl.trim() || null,
        accent_color: formAccentColor.trim() || null,
        intro_extended: formIntroExtended.trim() || null,
        visual_theme: formVisualTheme.trim() || null,
      });
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  function startEdit(u: Unidad) {
    setEditingId(u.id);
    setFormTitle(u.title);
    setFormDescription(u.description ?? '');
    setFormCertUmbral(
      u.certificado_umbral_pct != null ? String(u.certificado_umbral_pct) : ''
    );
    setFormCoverImageUrl(u.cover_image_url ?? '');
    setFormCoverVideoUrl(u.cover_video_url ?? '');
    setFormAccentColor(u.accent_color ?? '');
    setFormIntroExtended(u.intro_extended ?? '');
    setFormVisualTheme(u.visual_theme ?? '');
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar esta unidad y todos sus temas?')) return;
    try {
      await remove(id);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  const formCamposVisuales = (
    <>
      <div>
        <label htmlFor="u-cover-img" className="label">
          URL imagen de portada (opcional)
        </label>
        <input
          id="u-cover-img"
          value={formCoverImageUrl}
          onChange={(e) => setFormCoverImageUrl(e.target.value)}
          placeholder="https://…"
          className="input-field"
          type="url"
        />
      </div>
      <div>
        <label htmlFor="u-cover-vid" className="label">
          URL de vídeo (opcional, YouTube / Vimeo / .mp4)
        </label>
        <input
          id="u-cover-vid"
          value={formCoverVideoUrl}
          onChange={(e) => setFormCoverVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className="input-field"
          type="url"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="u-accent" className="label">
            Color acento (hex, opcional)
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="u-accent"
              value={formAccentColor}
              onChange={(e) => setFormAccentColor(e.target.value)}
              placeholder="#009975"
              className="input-field flex-1 font-mono text-sm"
            />
            <input
              type="color"
              aria-label="Elegir color"
              className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
              value={/^#[0-9A-Fa-f]{6}$/.test(formAccentColor.trim()) ? formAccentColor.trim() : '#003366'}
              onChange={(e) => setFormAccentColor(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="u-theme" className="label">
            Tema visual (fallback si no hay imagen)
          </label>
          <select
            id="u-theme"
            value={formVisualTheme}
            onChange={(e) => setFormVisualTheme(e.target.value)}
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
          Intro ampliada (opcional)
        </label>
        <textarea
          id="u-intro-ext"
          value={formIntroExtended}
          onChange={(e) => setFormIntroExtended(e.target.value)}
          placeholder="Texto largo que verá el estudiante en la ficha de la unidad…"
          className="input-field min-h-[120px] font-sans"
          rows={5}
        />
      </div>
    </>
  );

  if (loading) return <p className="text-slate-600">Cargando unidades...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Unidades</h2>
      <input
        type="search"
        placeholder="Buscar unidad…"
        value={busquedaUnidad}
        onChange={(e) => setBusquedaUnidad(e.target.value)}
        className="input-field max-w-md mb-4"
        aria-label="Buscar unidades"
      />
      {creating ? (
        <form onSubmit={handleCreate} className="mb-6 card p-5 space-y-3 max-w-2xl">
          <p className="text-sm font-semibold text-slate-800">Nueva unidad</p>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Título de la unidad"
            className="input-field"
            required
          />
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Descripción corta (opcional)"
            className="input-field min-h-[80px]"
            rows={2}
          />
          <div>
            <label htmlFor="cert-umbral" className="label">
              Certificado: umbral % del tema (opcional, ej. 80)
            </label>
            <input
              id="cert-umbral"
              type="number"
              min={0}
              max={100}
              value={formCertUmbral}
              onChange={(e) => setFormCertUmbral(e.target.value)}
              placeholder="Vacío = sin certificado automático"
              className="input-field max-w-xs"
            />
          </div>
          {formCamposVisuales}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setCreating(true);
          }}
          className="btn-primary mb-6"
        >
          + Nueva unidad
        </button>
      )}

      <ul className="space-y-2 list-none m-0 p-0">
        {unidadesFiltradas.map((u, i) => (
          <li key={u.id} className="card p-4">
            {editingId === u.id ? (
              <form onSubmit={(e) => handleUpdate(e, u.id)} className="space-y-3 max-w-2xl">
                <p className="text-sm font-semibold text-slate-800">Editar unidad</p>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field"
                  required
                />
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descripción corta"
                  className="input-field min-h-[72px]"
                  rows={2}
                />
                <div>
                  <label className="label">Certificado %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formCertUmbral}
                    onChange={(e) => setFormCertUmbral(e.target.value)}
                    className="input-field max-w-xs"
                  />
                </div>
                {formCamposVisuales}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="submit" className="btn-primary">
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1 min-w-[140px] font-medium text-atenas-ink">
                  {tituloUnidadConOrden(u.orden ?? 0, u.title, i)}
                </span>
                <Link
                  to={`/docente/unidades/${u.id}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#003366' }}
                >
                  Temas
                </Link>
                <button
                  type="button"
                  onClick={() => startEdit(u)}
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(u.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {unidades.length === 0 && !creating && (
        <p className="text-slate-500 mt-4">No hay unidades. Crea una para empezar.</p>
      )}
      {unidades.length > 0 && unidadesFiltradas.length === 0 && (
        <p className="text-slate-500 mt-4 text-sm">Ninguna unidad coincide con la búsqueda.</p>
      )}
    </div>
  );
}
