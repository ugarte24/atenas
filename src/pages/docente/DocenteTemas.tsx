import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUnidad } from '../../hooks/useUnidad';
import { useTemas } from '../../hooks/useTemas';

export default function DocenteTemas() {
  const { unidadId } = useParams<{ unidadId: string }>();
  const navigate = useNavigate();
  const { unidad, loading: loadingUnidad } = useUnidad(unidadId ?? null);
  const { temas, loading, create, update, remove } = useTemas(unidadId ?? null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPrereq, setFormPrereq] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!unidadId) return;
    try {
      await create({
        unidad_id: unidadId,
        title: formTitle,
        content: formContent || undefined,
        orden: temas.length,
        prerequisito_tema_id: formPrereq || null,
      });
      setFormTitle('');
      setFormContent('');
      setFormPrereq('');
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
        title: formTitle,
        content: formContent || undefined,
        prerequisito_tema_id: formPrereq || null,
      });
      setEditingId(null);
      setFormTitle('');
      setFormContent('');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  }

  function startEdit(t: {
    id: string;
    title: string;
    content: string | null;
    prerequisito_tema_id?: string | null;
  }) {
    setEditingId(t.id);
    setFormTitle(t.title);
    setFormContent(t.content ?? '');
    setFormPrereq(t.prerequisito_tema_id ?? '');
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar este tema y sus recursos?')) return;
    try {
      await remove(id);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  if (loadingUnidad || !unidad) {
    return <p className="text-slate-600">Cargando...</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/docente/contenidos')}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 hover:bg-[#e6edf5]"
 style={{ color: '#003366' }}
      >
        ← Unidades
      </button>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{unidad.title}</h2>
      <p className="text-slate-600 text-sm mb-6">Temas de esta unidad</p>

      {creating ? (
        <form onSubmit={handleCreate} className="mb-6 card p-5 space-y-3 max-w-md">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Título del tema"
            className="input-field"
            required
          />
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Contenido (opcional)"
            className="input-field min-h-[100px]"
            rows={3}
          />
          <label className="label">Tema prerequisito (opcional)</label>
          <select
            value={formPrereq}
            onChange={(e) => setFormPrereq(e.target.value)}
            className="input-field"
            aria-label="Debe completarse este tema antes"
          >
            <option value="">— Ninguno —</option>
            {temas.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className="btn-primary mb-6">
          + Nuevo tema
        </button>
      )}

      {loading ? (
        <p className="text-slate-600">Cargando temas...</p>
      ) : (
        <ul className="space-y-2">
          {temas.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4 card">
              {editingId === t.id ? (
                <form onSubmit={(e) => handleUpdate(e, t.id)} className="flex-1 flex gap-2 items-start flex-wrap">
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="input-field py-2 flex-1 min-w-[120px]"
                    required
                  />
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Contenido"
                    className="input-field py-2 w-full min-h-[80px]"
                    rows={2}
                  />
                  <select
                    value={formPrereq}
                    onChange={(e) => setFormPrereq(e.target.value)}
                    className="input-field py-2 w-full"
                    aria-label="Prerequisito"
                  >
                    <option value="">Sin prerequisito</option>
                    {temas
                      .filter((x) => x.id !== t.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          Tras: {x.title}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary py-2 text-sm">Guardar</button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn-secondary py-2 text-sm">Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="flex-1 font-medium text-slate-900">{t.title}</span>
                  <Link to={`/docente/temas/${t.id}`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }}>Recursos</Link>
                  <Link to={`/docente/temas/${t.id}/actividades`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }}>Actividades</Link>
                  <Link to={`/docente/temas/${t.id}/evaluaciones`} className="text-sm font-medium hover:underline" style={{ color: '#003366' }}>Evaluaciones</Link>
                  <button type="button" onClick={() => startEdit(t)} className="text-sm text-slate-600 hover:text-slate-800">Editar</button>
                  <button type="button" onClick={() => handleRemove(t.id)} className="text-sm text-red-600 hover:text-red-700">Eliminar</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {temas.length === 0 && !creating && !loading && (
        <p className="text-slate-500 mt-4">No hay temas. Crea uno para empezar.</p>
      )}
    </div>
  );
}
