import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useRecursos } from '../../hooks/useRecursos';

type RecursoTipo = 'imagen' | 'mapa' | 'video';

export default function DocenteRecursos() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const { recursos, loading, addFromUrl, addFromFile, remove } = useRecursos(temaId ?? null);
  const [adding, setAdding] = useState(false);
  const [tipo, setTipo] = useState<RecursoTipo>('imagen');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !url.trim()) return;
    try {
      await addFromUrl(temaId, tipo, url.trim(), title.trim() || undefined);
      setUrl('');
      setTitle('');
      setAdding(false);
    } catch (err) {
      console.error(err);
      alert('Error al agregar recurso');
    }
  }

  async function handleAddFile(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !file) return;
    try {
      await addFromFile(temaId, tipo, file, title.trim() || undefined);
      setFile(null);
      setTitle('');
      setAdding(false);
    } catch (err) {
      console.error(err);
      alert('Error al subir archivo');
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return;
    try {
      await remove(id);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  if (loadingTema || !tema) {
    return <p className="text-slate-600">Cargando...</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(`/docente/unidades/${tema.unidad_id}`)}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 hover:bg-[#e6edf5]"
        style={{ color: '#003366' }}
      >
        ← Temas
      </button>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{tema.title}</h2>
      <p className="text-slate-600 text-sm mb-6">Recursos (imágenes, mapas, vídeos)</p>

      {adding ? (
        <div className="mb-6 card p-5 space-y-4 max-w-md">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as RecursoTipo)} className="input-field">
            <option value="imagen">Imagen</option>
            <option value="mapa">Mapa</option>
            <option value="video">Vídeo</option>
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del recurso (opcional)"
            className="input-field"
          />
          <form onSubmit={handleAddUrl} className="space-y-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL del recurso (ej: enlace a imagen o vídeo)"
              className="input-field"
            />
            <button type="submit" className="btn-primary">Agregar por URL</button>
          </form>
          <p className="text-sm text-slate-500">O sube un archivo:</p>
          <form onSubmit={handleAddFile} className="space-y-3">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="input-field py-2 file:mr-2 file:rounded file:border-0 file:bg-[#e6edf5] file:px-3 file:py-1 file:text-[#003366]"
            />
            <button type="submit" disabled={!file} className="btn-primary disabled:opacity-50">Subir archivo</button>
          </form>
          <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancelar</button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary mb-6">
          + Nuevo recurso
        </button>
      )}

      {loading ? (
        <p className="text-slate-600">Cargando recursos...</p>
      ) : (
        <ul className="space-y-3">
          {recursos.map((r) => (
            <li key={r.id} className="card p-4 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-slate-900 capitalize">{r.tipo}</span>
                {r.title && <span className="text-slate-600"> — {r.title}</span>}
                <br />
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate block mt-1 hover:underline" style={{ color: '#003366' }}>
                  {r.url}
                </a>
                {r.tipo === 'imagen' && (
                  <img src={r.url} alt={r.title ?? ''} className="mt-2 max-h-32 rounded-lg object-contain" />
                )}
                {r.tipo === 'video' && (
                  <video src={r.url} controls className="mt-2 max-w-full rounded-lg" />
                )}
              </div>
              <button type="button" onClick={() => handleRemove(r.id)} className="text-sm text-red-600 hover:text-red-700 shrink-0">
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {recursos.length === 0 && !adding && !loading && (
        <p className="text-slate-500">No hay recursos. Agrega una imagen, mapa o vídeo.</p>
      )}
    </div>
  );
}
