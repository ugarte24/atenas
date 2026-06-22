import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Film,
  Headphones,
  Image as ImageIcon,
  Map,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTema } from '../../hooks/useTema';
import { useRecursos, type RecursoTipo } from '../../hooks/useRecursos';
import { DocenteTemaSubpageShell } from '../../components/docente/DocenteTemaSubpage';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { Form, FormBody, FormFooter } from '../../components/ui/Form';
import { FormModal } from '../../components/ui/FormModal';
import { ExternalImage } from '../../components/ui/ExternalImage';
import { VideoEmbed } from '../../components/ui/VideoEmbed';
import type { Recurso } from '../../types';

const TIPO_LABELS: Record<RecursoTipo, string> = {
  texto: 'Texto',
  pdf: 'PDF',
  imagen: 'Imagen',
  mapa: 'Mapa',
  video: 'Vídeo',
  audio: 'Audio',
};

const TIPO_ICONS: Record<RecursoTipo, React.ReactNode> = {
  texto: <FileText className="w-5 h-5" aria-hidden />,
  pdf: <FileText className="w-5 h-5" aria-hidden />,
  imagen: <ImageIcon className="w-5 h-5" aria-hidden />,
  mapa: <Map className="w-5 h-5" aria-hidden />,
  video: <Film className="w-5 h-5" aria-hidden />,
  audio: <Headphones className="w-5 h-5" aria-hidden />,
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

function RecursoCard({ recurso, onRemove }: { recurso: Recurso; onRemove: () => void }) {
  return (
    <Card padding="md" hover className="flex flex-col gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-atenas-blue/10 text-atenas-blue flex items-center justify-center">
          {TIPO_ICONS[recurso.tipo as RecursoTipo] ?? <BookOpen className="w-5 h-5" aria-hidden />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-atenas-ink leading-snug break-words">
                {recurso.title?.trim() || TIPO_LABELS[recurso.tipo as RecursoTipo] || recurso.tipo}
              </h3>
              {recurso.title?.trim() && (
                <p className="text-xs text-atenas-muted mt-0.5">
                  {TIPO_LABELS[recurso.tipo as RecursoTipo] ?? recurso.tipo}
                </p>
              )}
            </div>
            <Badge tone="default">{TIPO_LABELS[recurso.tipo as RecursoTipo] ?? recurso.tipo}</Badge>
          </div>

          {recurso.tipo === 'texto' && recurso.contenido && (
            <p className="text-sm text-atenas-muted-strong mt-3 whitespace-pre-wrap line-clamp-4 leading-relaxed">
              {recurso.contenido}
            </p>
          )}

          {recurso.url && recurso.tipo !== 'texto' && (
            <a
              href={recurso.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-atenas-blue hover:underline mt-2 block truncate"
            >
              {recurso.url}
            </a>
          )}

          {(recurso.tipo === 'imagen' || recurso.tipo === 'mapa') && recurso.url && (
            <ExternalImage
              src={recurso.url}
              alt={recurso.title ?? ''}
              className="mt-3 max-h-40 w-full rounded-xl object-contain bg-atenas-page border border-atenas-mist-border"
            />
          )}
          {recurso.tipo === 'video' && recurso.url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-atenas-mist-border">
              <VideoEmbed url={recurso.url} title={recurso.title ?? undefined} compact />
            </div>
          )}
          {recurso.tipo === 'audio' && recurso.url && (
            <audio src={recurso.url} controls className="mt-3 w-full" />
          )}
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-atenas-mist-border">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-sm font-medium min-h-touch px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 shrink-0" aria-hidden />
          Eliminar
        </button>
      </div>
    </Card>
  );
}

export default function DocenteRecursos() {
  const { temaId } = useParams<{ temaId: string }>();
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

  const resumen = useMemo(() => {
    const porTipo = recursos.reduce(
      (acc, r) => {
        const t = r.tipo as RecursoTipo;
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      },
      {} as Partial<Record<RecursoTipo, number>>
    );
    const multimedia = (porTipo.imagen ?? 0) + (porTipo.video ?? 0) + (porTipo.audio ?? 0) + (porTipo.mapa ?? 0);
    return { total: recursos.length, texto: porTipo.texto ?? 0, multimedia };
  }, [recursos]);

  function resetForm() {
    setUrl('');
    setTitle('');
    setContenidoTexto('');
    setFile(null);
  }

  function closeModal() {
    setAdding(false);
    resetForm();
  }

  async function handleAddTexto(e: React.FormEvent) {
    e.preventDefault();
    if (!temaId || !contenidoTexto.trim()) return;
    try {
      await addFromTexto(temaId, contenidoTexto.trim(), title.trim() || undefined);
      closeModal();
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
      closeModal();
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
      closeModal();
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
    return <SkeletonLines lines={6} />;
  }

  const esTexto = tipo === 'texto';
  const permiteUrl = !esTexto;
  const permiteArchivo = tipo !== 'texto';

  return (
    <>
      <DocenteTemaSubpageShell
        unidadId={tema.unidad_id}
        temaTitle={tema.title}
        sectionLabel="Recursos"
        sectionDescription="Texto, PDF, imágenes, mapas, vídeo y audio para enriquecer la lección."
        icon={<BookOpen className="w-5 h-5" />}
        primaryAction={
          <Button
            type="button"
            className="inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nuevo recurso
          </Button>
        }
        stats={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Recursos"
              value={resumen.total}
              icon={<BookOpen className="w-5 h-5 text-atenas-blue" />}
            />
            <StatCard
              label="Texto"
              value={resumen.texto}
              hint="Bloques escritos"
              icon={<FileText className="w-5 h-5 text-atenas-success" />}
            />
            <StatCard
              label="Multimedia"
              value={resumen.multimedia}
              hint="Imagen, vídeo, audio, mapa"
              icon={<Film className="w-5 h-5 text-violet-600" />}
            />
          </div>
        }
        loading={loading}
        empty={
          recursos.length === 0 && !adding
            ? {
                title: 'Sin recursos todavía',
                description: 'Añade material educativo para complementar el contenido del tema.',
                icon: <BookOpen className="w-7 h-7" />,
                action: (
                  <Button
                    type="button"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => setAdding(true)}
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                    Agregar recurso
                  </Button>
                ),
              }
            : undefined
        }
      >
        <ul className="flex flex-col gap-4 list-none p-0 m-0">
          {recursos.map((r) => (
            <li key={r.id}>
              <RecursoCard recurso={r} onRemove={() => void handleRemove(r.id)} />
            </li>
          ))}
        </ul>
      </DocenteTemaSubpageShell>

      <FormModal
        open={adding}
        onClose={closeModal}
        title="Nuevo recurso"
        description="Elige el tipo y añade el contenido educativo para este tema."
        icon={<Plus className="w-5 h-5" />}
      >
        <Form
          onSubmit={(e) => {
            if (esTexto) void handleAddTexto(e);
            else if (file) void handleAddFile(e);
            else void handleAddUrl(e);
          }}
        >
          <FormBody className="space-y-4">
            <Select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as RecursoTipo);
                setFile(null);
                setUrl('');
              }}
              label="Tipo de recurso"
            >
              {(Object.keys(TIPO_LABELS) as RecursoTipo[]).map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </Select>
            <div>
              <label htmlFor="recurso-title" className="label">
                Título (opcional)
              </label>
              <input
                id="recurso-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del recurso"
                className="input-field"
              />
            </div>
            {esTexto ? (
              <div>
                <label htmlFor="recurso-texto" className="label">
                  Contenido
                </label>
                <textarea
                  id="recurso-texto"
                  value={contenidoTexto}
                  onChange={(e) => setContenidoTexto(e.target.value)}
                  placeholder="Escribe el contenido de texto…"
                  className="input-field min-h-[120px] font-sans"
                  rows={6}
                  required
                />
              </div>
            ) : (
              <>
                {permiteUrl && (
                  <div>
                    <label htmlFor="recurso-url" className="label">
                      URL del recurso
                    </label>
                    <input
                      id="recurso-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://…"
                      className="input-field"
                    />
                  </div>
                )}
                {permiteArchivo && (
                  <div>
                    <p className="label mb-2">O sube un archivo</p>
                    <input
                      type="file"
                      accept={acceptForTipo(tipo)}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="input-field py-2 file:mr-2 file:rounded file:border-0 file:bg-atenas-mist file:px-3 file:py-1 file:text-atenas-ink"
                    />
                  </div>
                )}
              </>
            )}
          </FormBody>
          <FormFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!esTexto && !file && !url.trim()}>
              {esTexto ? 'Guardar texto' : file ? 'Subir archivo' : 'Agregar por URL'}
            </Button>
          </FormFooter>
        </Form>
      </FormModal>
    </>
  );
}
