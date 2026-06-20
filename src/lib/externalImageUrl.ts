/** Tamaños de miniatura permitidos por Wikimedia (hotlink directo). Ver https://w.wiki/GHai */
export const WIKIMEDIA_THUMB_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840] as const;

const WIKI_THUMB_RE =
  /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/(.+?)\/(\d+)px-(.+)$/i;

function nearestWikimediaThumbWidth(requested: number): number {
  for (const step of WIKIMEDIA_THUMB_STEPS) {
    if (step >= requested) return step;
  }
  return WIKIMEDIA_THUMB_STEPS[WIKIMEDIA_THUMB_STEPS.length - 1];
}

/** Corrige URLs de miniaturas Wikimedia con tamaños no estándar (p. ej. 640px → 960px). */
export function normalizeExternalImageUrl(url: string | null | undefined): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return trimmed;

  const match = trimmed.match(WIKI_THUMB_RE);
  if (!match) return trimmed;

  const [, path, widthStr, filename] = match;
  const width = Number.parseInt(widthStr, 10);
  if (!Number.isFinite(width)) return trimmed;

  if ((WIKIMEDIA_THUMB_STEPS as readonly number[]).includes(width)) {
    return trimmed;
  }

  const target = nearestWikimediaThumbWidth(width);
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${target}px-${filename}`;
}

/** Reescribe src de <img> en HTML embebido (contenido de temas). */
export function normalizeHtmlExternalImages(html: string): string {
  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, before: string, src: string, after: string) =>
      `${before}${normalizeExternalImageUrl(src)}${after}`
  );
}
