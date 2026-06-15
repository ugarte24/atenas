import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useRecursos, type RecursoTipo } from '../../hooks/useRecursos';

const TIPO_LABELS: Record<RecursoTipo, string> = {
  texto: 'Texto',
  pdf: 'PDF',
  imagen: 'Imagen',
  mapa: 'Mapa',
  video: 'Vídeo',
  audio: 'Audio',
};

function acceptForTipo(tipo: RecursoTipo): string {
  switch (tipo) {
    case 'imagen':
    case 'mapa':
      return 'image/*';
    case 'video':
      return 'video/*';
    case 'audio':
      return 'audio/*';
    case 'pdf':
      return 'application/pdf,.pdf';
    default:
      return '*/*';
  }
}

export default function DocenteRecursos() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const { recursos, loading, addFromUrl, addFromTexto, addFromFile, remove } = useRecursos(
    temaId ?? null
  );
  const [adding, setAdding] = useState(false);
  const [tipo, setTipo] = useState<RecursoTipo>('imagen');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [file, setFile] = useState<File | null>(null);

  function resetForm() {
    setUrl('');
    setTitle('');
    setContenidoTexto('');
    setFile(null);
  }

  async function handleAddTexto(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !contenidoTexto.trim()) return;
    try {
      await addFromTexto(temaId, contenidoTexto.trim(), title.trim() || undefined);
      resetForm();
      setAdding(false);
    } catch (err) {
      console.error(err);
      alert('Error al agregar texto');
    }
  }

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !url.trim()) return;
    try {
      await addFromUrl(temaId, tipo, url.trim(), title.trim() || undefined);
      resetForm();
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
      resetForm();
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
    return <p className="text-atenas-muted">Cargando...</p>;
  }

  const esTexto = tipo === 'texto';
  const permiteUrl = !esTexto;
  const permiteArchivo = tipo !== 'texto';

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(`/docente/unidades/${tema.unidad_id}`)}
        className="text-sm font-medium mb-4 min-h-touch flex items-center rounded-lg px-2 -ml-2 hover:bg-atenas-mist"
        
      >
        ← Temas
      </button>
      <h2 className="text-xl font-bold text-atenas-ink mb-1">{tema.title}</h2>
      <p className="text-atenas-muted text-sm mb-6">
        Recursos educativos: texto, PDF, imagen, vídeo y audio
      </p>

      {adding ? (
        <div className="mb-6 card p-5 space-y-4 max-w-md">
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as RecursoTipo);
              setFile(null);
              setUrl('');
            }}
            className="input-field"
          >
            {(Object.keys(TIPO_LABELS) as RecursoTipo[]).map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del recurso (opcional)"
            className="input-field"
          />
          {esTexto ? (
            <form onSubmit={handleAddTexto} className="space-y-3">
              <textarea
                value={contenidoTexto}
                onChange={(e) => setContenidoTexto(e.target.value)}
                placeholder="Escribe el contenido de texto…"
                className="input-field min-h-[120px]"
                rows={6}
                required
              />
              <button type="submit" className="btn-primary">
                Guardar texto
              </button>
            </form>
          ) : (
            <>
              {permiteUrl && (
                <form onSubmit={handleAddUrl} className="space-y-3">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL del recurso"
                    className="input-field"
                  />
                  <button type="submit" className="btn-primary">
                    Agregar por URL
                  </button>
                </form>
              )}
              {permiteArchivo && (
                <>
                  <p className="text-sm text-atenas-muted">O sube un archivo:</p>
                  <form onSubmit={handleAddFile} className="space-y-3">
                    <input
                      type="file"
                      accept={acceptForTipo(tipo)}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="input-field py-2 file:mr-2 file:rounded file:border-0 file:bg-atenas-mist file:px-3 file:py-1 file:text-atenas-ink"
                    />
                    <button type="submit" disabled={!file} className="btn-primary disabled:opacity-50">
                      Subir archivo
                    </button>
                  </form>
                </>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              resetForm();
            }}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-primary mb-6">
          + Nuevo recurso
        </button>
      )}

      {loading ? (
        <p className="text-atenas-muted">Cargando recursos...</p>
      ) : (
        <ul className="space-y-3">
          {recursos.map((r) => (
            <li key={r.id} className="card p-4 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-atenas-ink">{TIPO_LABELS[r.tipo] ?? r.tipo}</span>
                {r.title && <span className="text-atenas-muted"> — {r.title}</span>}
                {r.tipo === 'texto' && r.contenido && (
                  <p className="text-sm text-atenas-muted-strong mt-2 whitespace-pre-wrap line-clamp-4">
                    {r.contenido}
                  </p>
                )}
                {r.url && r.tipo !== 'texto' && (
                  <>
                    <br />
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm truncate block mt-1 hover:underline"
                      
                    >
                      {r.url}
                    </a>
                  </>
                )}
                {(r.tipo === 'imagen' || r.tipo === 'mapa') && r.url && (
                  <img
                    src={r.url}
                    alt={r.title ?? ''}
                    className="mt-2 max-h-32 rounded-lg object-contain"
                  />
                )}
                {r.tipo === 'video' && r.url && (
                  <video src={r.url} controls className="mt-2 max-w-full rounded-lg" />
                )}
                {r.tipo === 'audio' && r.url && (
                  <audio src={r.url} controls className="mt-2 w-full" />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(r.id)}
                className="text-sm text-red-600 hover:text-red-700 shrink-0"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {recursos.length === 0 && !adding && !loading && (
        <p className="text-atenas-muted">No hay recursos. Agrega contenido educativo.</p>
      )}
    </div>
  );
}
