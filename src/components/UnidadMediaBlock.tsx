import { getVideoEmbedInfo } from '../lib/unidadVisual';
import { VideoEmbed } from './ui/VideoEmbed';

type Props = {
  coverVideoUrl: string | null | undefined;
  className?: string;
};

export function UnidadMediaBlock({ coverVideoUrl, className = '' }: Props) {
  const raw = coverVideoUrl?.trim();
  if (!raw) return null;

  if (!getVideoEmbedInfo(raw)) {
    return (
      <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}>
        <p className="font-medium">Vídeo no reconocido</p>
        <p className="mt-1 text-xs">
          Usa un enlace de YouTube o Vimeo, o una URL directa a un archivo .mp4 / .webm.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <VideoEmbed url={raw} title="Vídeo de la unidad" className="mt-0 shadow-lg" />
    </div>
  );
}
