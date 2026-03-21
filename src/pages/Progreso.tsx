import { useMemo } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';

export default function Progreso() {
  const { misiones, loading, error } = useMisionesAlumno();
  const misionesConTemas = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0),
    [misiones]
  );

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6 border-b border-atenas-mist-border pb-5">
        <h1 className="text-2xl font-extrabold text-atenas-ink">Tu progreso</h1>
        <p className="text-sm text-atenas-muted mt-1">
          Revisa cómo avanzas en las unidades y niveles del Abya Yala.
        </p>
      </header>

      {loading && <p className="text-sm text-atenas-muted">Cargando progreso…</p>}
      {error && !loading && (
        <p className="text-sm text-red-600">No se pudo cargar tu progreso.</p>
      )}

      {!loading && !error && misionesConTemas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-atenas-mist-border bg-atenas-card p-8 text-center shadow-card">
          <p className="text-atenas-muted text-sm">
            Aún no tienes progreso registrado. Cuando completes actividades, lo verás aquí.
          </p>
        </div>
      )}

      {!loading && !error && misionesConTemas.length > 0 && (
        <div className="space-y-4">
          {misionesConTemas.map((m) => {
            const porcentaje = m.totalPasos
              ? Math.round((m.pasosCompletados / m.totalPasos) * 100)
              : 0;
            const tituloMostrado = tituloUnidadConOrden(m.orden, m.titulo);
            const descripcionLimpia = limpiarDescripcionUnidad(m.descripcion);
            return (
              <article
                key={m.id}
                className="card p-5 flex flex-col gap-3 bg-white border border-atenas-mist-border shadow-card"
              >
                <div>
                  <h2 className="text-sm font-semibold text-atenas-ink">{tituloMostrado}</h2>
                  {descripcionLimpia && (
                    <p className="mt-0.5 text-xs text-atenas-muted line-clamp-2">
                      {descripcionLimpia}
                    </p>
                  )}
                </div>
                <div>
                  <div className="w-full h-3 rounded-full bg-atenas-mist overflow-hidden ring-1 ring-atenas-mist-border/50">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-atenas-muted text-right">
                    {m.pasosCompletados} de {m.totalPasos} pasos · {porcentaje}% completado
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
