import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUnidades } from '../../hooks/useUnidades';
import { useAuthContext } from '../../contexts/AuthContext';

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const cert = formCertUmbral.trim() ? parseInt(formCertUmbral, 10) : null;
      await create({
        title: formTitle,
        description: formDescription || undefined,
        orden: unidades.length,
        certificado_umbral_pct:
          cert != null && !Number.isNaN(cert) && cert >= 0 && cert <= 100 ? cert : null,
      });
      setFormTitle('');
      setFormDescription('');
      setFormCertUmbral('');
      setCreating(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la unidad');
    }
  }

  async function handleUpdate(e: React.FormEvent, id: string) {
    e.preventDefault();
    try {
      const cert = formCertUmbral.trim() ? parseInt(formCertUmbral, 10) : null;
      await update(id, {
        title: formTitle,
        description: formDescription || undefined,
        certificado_umbral_pct:
          cert != null && !Number.isNaN(cert) && cert >= 0 && cert <= 100 ? cert : null,
      });
      setEditingId(null);
      setFormTitle('');
      setFormDescription('');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  function startEdit(u: {
    id: string;
    title: string;
    description: string | null;
    certificado_umbral_pct?: number | null;
  }) {
    setEditingId(u.id);
    setFormTitle(u.title);
    setFormDescription(u.description ?? '');
    setFormCertUmbral(
      u.certificado_umbral_pct != null ? String(u.certificado_umbral_pct) : ''
    );
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
        <form onSubmit={handleCreate} className="mb-6 card p-5 space-y-3 max-w-md">
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
            placeholder="Descripción (opcional)"
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
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-primary mb-6"
        >
          + Nueva unidad
        </button>
      )}

      <ul className="space-y-2">
        {unidadesFiltradas.map((u) => (
          <li key={u.id} className="flex items-center gap-3 p-4 card">
            {editingId === u.id ? (
              <form onSubmit={(e) => handleUpdate(e, u.id)} className="flex-1 flex gap-2 items-center flex-wrap">
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field py-2 flex-1 min-w-[120px]"
                  required
                />
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descripción"
                  className="input-field py-2 flex-1 min-w-[120px]"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formCertUmbral}
                  onChange={(e) => setFormCertUmbral(e.target.value)}
                  placeholder="Cert %"
                  className="input-field py-2 w-24"
                  title="Umbral certificado"
                />
                <button type="submit" className="btn-primary py-2 text-sm">Guardar</button>
                <button type="button" onClick={() => setEditingId(null)} className="btn-secondary py-2 text-sm">Cancelar</button>
              </form>
            ) : (
              <>
                <span className="flex-1 font-medium text-slate-900">{u.title}</span>
                <Link to={`/docente/unidades/${u.id}`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }}>
                  Temas
                </Link>
                <button type="button" onClick={() => startEdit(u)} className="text-sm text-slate-600 hover:text-slate-800">
                  Editar
                </button>
                <button type="button" onClick={() => handleRemove(u.id)} className="text-sm text-red-600 hover:text-red-700">
                  Eliminar
                </button>
              </>
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
