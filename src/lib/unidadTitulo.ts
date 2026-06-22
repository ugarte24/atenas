/**
 * Título visible: "Unidad N · …" alineado al orden curricular.
 * Si el texto ya traía "Unidad M ·", se quita para no duplicar.
 */
export function tituloUnidadConOrden(
  orden: number,
  titulo: string,
  /** Si `orden` no es válido (p. ej. 0), usar índice 0-based + 1 */
  fallbackIndex?: number
): string {
  const num =
    typeof orden === 'number' && orden > 0
      ? orden
      : fallbackIndex != null && fallbackIndex >= 0
        ? fallbackIndex + 1
        : 1;
  const stripped = titulo.replace(/^\s*Unidad\s+\d+\s*[·•.-]\s*/i, '').trim();
  return `Unidad ${num} · ${stripped || titulo}`;
}

/** Etiqueta breve para listas y filtros (p. ej. desplegables). */
export function tituloUnidadFiltro(
  orden: number,
  titulo: string,
  fallbackIndex?: number,
  maxResto = 40
): string {
  const num =
    typeof orden === 'number' && orden > 0
      ? orden
      : fallbackIndex != null && fallbackIndex >= 0
        ? fallbackIndex + 1
        : 1;
  const stripped = titulo.replace(/^\s*Unidad\s+\d+\s*[·•.-]\s*/i, '').trim() || titulo;
  const rest =
    stripped.length > maxResto ? `${stripped.slice(0, maxResto - 1).trimEnd()}…` : stripped;
  return `Unidad ${num} — ${rest}`;
}

/** Título completo para tooltip / aria en opciones truncadas. */
export function tituloUnidadFiltroCompleto(
  orden: number,
  titulo: string,
  fallbackIndex?: number
): string {
  return tituloUnidadConOrden(orden, titulo, fallbackIndex);
}
