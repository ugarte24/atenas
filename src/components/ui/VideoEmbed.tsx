import { getVideoEmbedInfo } from '../../lib/unidadVisual';
import { cn } from './cn';

type Props = {
  url: string;
  title?: string;
  className?: string;
  compact?: boolean;
};

export function VideoEmbed({ url, title, className, compact }: Props) {
  const info = getVideoEmbedInfo(url);
  if (!info) {
    return (
      <div
        className={cn(
          'rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 mt-2',
          className
        )}
      >
        <p className="font-medium">Vídeo no reconocido</p>
        <p className="mt-1 text-xs">
          Usa YouTube, Vimeo o una URL directa (.mp4 / .webm).
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline mt-2 inline-block">
          Abrir enlace
        </a>
      </div>
    );
  }

  if (info.kind === 'iframe') {
    return (
      <div
        className={cn(
          'rounded-xl overflow-hidden border border-atenas-mist-border bg-black mt-2',
          compact ? 'max-w-sm' : 'w-full',
          className
        )}
      >
        <div className="aspect-video w-full">
          <iframe
            src={info.src}
            title={title ?? info.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <video
      src={info.src}
      controls
      playsInline
      className={cn('max-w-full rounded-lg mt-2', className)}
    >
      Tu navegador no reproduce vídeo HTML5.
    </video>
  );
}
