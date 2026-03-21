/**
 * Normaliza textos de descripción de unidad (quita marcadores de seeds antiguos).
 */
export function limpiarDescripcionUnidad(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  return text
    .replace(/\s*Contenido de ejemplo para ATENAS\.?/gi, '')
    .replace(/\s*\(contenido de ejemplo\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}
