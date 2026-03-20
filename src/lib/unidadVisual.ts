import type { Unidad } from '../types';

/** Imágenes genéricas cuando no hay `cover_image_url` ni tema reconocido */
const GENERIC_FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
];

const THEME_FALLBACK_COVERS: Record<string, string> = {
  default: GENERIC_FALLBACK_COVERS[2],
  /** Abya Yala / América (naturaleza y cultura) */
  abya_yala:
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  europa:
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  historia:
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  ciudadania:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
};

export function normalizeVisualThemeKey(raw: string | null | undefined): string {
  if (!raw?.trim()) return 'default';
  return raw.trim().toLowerCase().replace(/-/g, '_');
}

/** URL de portada efectiva: BD → tema → rotación por índice */
export function resolveCoverImageUrl(
  u: Pick<Unidad, 'cover_image_url' | 'visual_theme'>,
  listIndex: number
): string {
  const fromDb = u.cover_image_url?.trim();
  if (fromDb) return fromDb;
  const key = normalizeVisualThemeKey(u.visual_theme ?? undefined);
  const themed = THEME_FALLBACK_COVERS[key];
  if (themed) return themed;
  return GENERIC_FALLBACK_COVERS[listIndex % GENERIC_FALLBACK_COVERS.length];
}

const DEFAULT_ACCENT = '#003366';

export function resolveAccentColor(accent: string | null | undefined): string {
  const s = accent?.trim();
  if (s && /^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return DEFAULT_ACCENT;
}

export type VideoEmbedInfo =
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'video'; src: string };

/** YouTube / Vimeo / URL directa a archivo de vídeo */
export function getVideoEmbedInfo(url: string): VideoEmbedInfo | null {
  const u = url.trim();
  if (!u) return null;

  const ytMatch = u.match(
    /(?:youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/.*[?&]v=)([\w-]{11})/
  );
  if (ytMatch) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}`,
      title: 'Vídeo de YouTube',
    };
  }

  const vmMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vmMatch) {
    return {
      kind: 'iframe',
      src: `https://player.vimeo.com/video/${vmMatch[1]}`,
      title: 'Vídeo de Vimeo',
    };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) {
    return { kind: 'video', src: u };
  }

  return null;
}

export function isOptionalHttpUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  try {
    const parsed = new URL(t);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isOptionalHexColor(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  return /^#[0-9A-Fa-f]{6}$/.test(t);
}
