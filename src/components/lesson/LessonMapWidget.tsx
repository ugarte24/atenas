import { MapPin } from 'lucide-react';
import type { Recurso } from '../../types';
import { ExternalImage } from '../ui/ExternalImage';

type Props = {
  recursos: Recurso[];
};

export function LessonMapWidget({ recursos }: Props) {
  const mapa = recursos.find((r) => r.tipo === 'mapa');
  if (!mapa) return null;

  return (
    <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
      <h3 className="text-sm font-bold text-atenas-ink mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-500" aria-hidden />
        Explora en el mapa
      </h3>
      <div className="rounded-xl overflow-hidden border border-atenas-mist-border bg-sky-50 aspect-video relative">
        {mapa.url ? (
          <ExternalImage src={mapa.url} alt={mapa.title ?? 'Mapa'} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-atenas-muted text-sm">Mapa</div>
        )}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="w-8 h-8 text-red-500 drop-shadow-md" fill="currentColor" aria-hidden />
        </span>
      </div>
      {mapa.title && <p className="text-xs text-atenas-muted mt-2 font-medium">{mapa.title}</p>}
      {mapa.url && (
        <a
          href={mapa.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-atenas-blue hover:underline mt-2 inline-block"
        >
          Ver mapa ampliado
        </a>
      )}
    </div>
  );
}
