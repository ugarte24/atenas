/** Indica si el contenido del tema usa marcado HTML rico (no solo párrafos). */
export function temaContentEsHtml(raw: string): boolean {
  return /<h[1-6]|<ul|<ol|<blockquote|<strong/i.test(raw);
}

/**
 * Convierte HTML o texto con etiquetas sueltas en texto plano legible (previews, cards).
 */
export function temaContentPreview(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';

  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

/** Normaliza contenido con solo párrafos `<p>` (vista estudiante, texto plano). */
export function normalizeTemaContent(raw: string | null | undefined): string {
  if (!raw) return '';
  if (!raw.toLowerCase().includes('<p')) return raw;

  return raw
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<\/?p>/gi, '')
    .trimEnd();
}
