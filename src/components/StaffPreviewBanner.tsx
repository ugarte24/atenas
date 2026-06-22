/** Aviso en rutas estudiante cuando entra docente o administrador (solo lectura). */
export function StaffPreviewBanner() {
  return (
    <div
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <strong>Vista previa:</strong> puedes explorar lo que verá el estudiante, pero{' '}
      <strong>no se guardan</strong> respuestas, intentos ni notas.
    </div>
  );
}
