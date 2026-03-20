import { getVideoEmbedInfo } from '../lib/unidadVisual';

type Props = {
  coverVideoUrl: string | null | undefined;
  className?: string;
};

export function UnidadMediaBlock({ coverVideoUrl, className = '' }: Props) {
  const raw = coverVideoUrl?.trim();
  if (!raw) return null;

  const info = getVideoEmbedInfo(raw);
  if (!info) {
    return (
      <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}>
        <p className="font-medium">Vídeo no reconocido</p>
        <p className="mt-1 text-xs">
          Usa un enlace de YouTube o Vimeo, o una URL directa a un archivo .mp4 / .webm.
        </p>
      </div>
    );
  }

  if (info.kind === 'iframe') {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black ${className}`}>
        <div className="aspect-video w-full">
          <iframe
            src={info.src}
            title={info.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black ${className}`}>
      <video src={info.src} controls className="w-full max-h-[480px]" playsInline>
        Tu navegador no reproduce vídeo HTML5.
      </video>
    </div>
  );
}
