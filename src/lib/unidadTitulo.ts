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
  const stripped = titulo.replace(/^\s*Unidad\s+\d+\s*[·•.\-]\s*/i, '').trim();
  return `Unidad ${num} · ${stripped || titulo}`;
}
