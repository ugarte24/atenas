import { useState } from 'react';
import { FileText, Image, Map, Video, Music, FileDown } from 'lucide-react';
import type { Recurso } from '../../types';
import { cn } from '../ui/cn';
import { ExternalImage } from '../ui/ExternalImage';
import { VideoEmbed } from '../ui/VideoEmbed';

const ICONS: Record<string, typeof FileText> = {
  texto: FileText,
  pdf: FileDown,
  imagen: Image,
  mapa: Map,
  video: Video,
  audio: Music,
};

type Props = {
  recursos: Recurso[];
};

export function ResourcesSplitView({ recursos }: Props) {
  const [selectedId, setSelectedId] = useState(recursos[0]?.id ?? null);
  const selected = recursos.find((r) => r.id === selectedId) ?? recursos[0];

  if (recursos.length === 0) {
    return <p className="text-atenas-muted">No hay recursos en este tema.</p>;
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
      <ul className="space-y-2 list-none m-0 p-0">
        {recursos.map((r) => {
          const Icon = ICONS[r.tipo] ?? FileText;
          const active = r.id === selected?.id;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors min-h-touch',
                  active
                    ? 'border-atenas-sidebar bg-atenas-mist/50 shadow-sm'
                    : 'border-atenas-mist-border bg-white hover:bg-atenas-mist/30'
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-atenas-sidebar/10 text-atenas-sidebar">
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-atenas-ink truncate">{r.title ?? r.tipo}</p>
                  <p className="text-xs text-atenas-muted capitalize">{r.tipo}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="rounded-2xl border border-atenas-mist-border bg-white p-5 shadow-card">
          <h3 className="text-lg font-bold text-atenas-ink mb-4">{selected.title ?? 'Recurso'}</h3>
          {selected.tipo === 'texto' && (
            <div className="whitespace-pre-wrap text-atenas-muted-strong leading-relaxed">{selected.contenido || selected.url}</div>
          )}
          {(selected.tipo === 'imagen' || selected.tipo === 'mapa') && selected.url && (
            <ExternalImage src={selected.url} alt={selected.title ?? ''} className="max-w-full rounded-xl" />
          )}
          {selected.tipo === 'video' && selected.url && (
            <VideoEmbed url={selected.url} title={selected.title ?? undefined} className="mt-0" />
          )}
          {selected.tipo === 'audio' && selected.url && (
            <audio src={selected.url} controls className="w-full" />
          )}
          {selected.tipo === 'pdf' && selected.url && (
            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
              Descargar PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
