import type { Recurso } from '../../types';
import { ExternalImage } from '../ui/ExternalImage';
import { VideoEmbed } from '../ui/VideoEmbed';

export function RecursoItem({ r }: { r: Recurso }) {
  return (
    <li className="rounded-xl border border-atenas-mist-border bg-white p-4 shadow-card list-none">
      {r.title && <h3 className="font-medium text-atenas-ink mb-2">{r.title}</h3>}
      {r.tipo === 'texto' && (
        <div className="text-atenas-ink whitespace-pre-wrap text-base leading-relaxed">
          {r.contenido || r.url}
        </div>
      )}
      {r.tipo === 'imagen' && (
        <ExternalImage src={r.url} alt={r.title ?? ''} className="max-w-full rounded-lg mt-2" loading="lazy" />
      )}
      {r.tipo === 'mapa' && (
        <ExternalImage src={r.url} alt={r.title ?? 'Mapa'} className="max-w-full rounded-lg mt-2" loading="lazy" />
      )}
      {r.tipo === 'video' && r.url && (
        <VideoEmbed url={r.url} title={r.title ?? undefined} />
      )}
      {r.tipo === 'audio' && <audio src={r.url} controls className="w-full mt-2" />}
      {r.tipo === 'pdf' && r.url && (
        <div className="mt-2 space-y-2">
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-atenas-blue hover:underline"
          >
            Descargar PDF
          </a>
          <iframe
            src={r.url}
            title={r.title ?? 'Documento PDF'}
            className="hidden sm:block w-full min-h-[320px] rounded-lg border border-atenas-mist-border"
          />
        </div>
      )}
    </li>
  );
}
