import { useMemo } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';
import { formatTiempoEstudio } from '../lib/formatTiempo';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';

export default function Progreso() {
  const { misiones, loading, error } = useMisionesAlumno();
  const misionesConTemas = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0),
    [misiones]
  );

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Tu progreso"
        description="Revisa cómo avanzas en las unidades y niveles del Abya Yala."
      />

      {loading && <SkeletonLines lines={4} />}
      {error && !loading && (
        <p className="text-sm text-red-600" role="alert">
          No se pudo cargar tu progreso.
        </p>
      )}

      {!loading && !error && misionesConTemas.length === 0 && (
        <EmptyState
          title="Sin progreso aún"
          description="Cuando completes actividades, lo verás aquí."
        />
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
              <Card key={m.id} className="flex flex-col gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-atenas-ink">{tituloMostrado}</h2>
                  {descripcionLimpia && (
                    <p className="mt-0.5 text-xs text-atenas-muted line-clamp-2">
                      {descripcionLimpia}
                    </p>
                  )}
                </div>
                <ProgressBar
                  value={porcentaje}
                  label={`${m.pasosCompletados} de ${m.totalPasos} pasos`}
                  showPercent
                />
                {m.tiempoEstudioSegundos > 0 && (
                  <p className="text-[11px] text-atenas-muted text-right -mt-1">
                    Tiempo: {formatTiempoEstudio(m.tiempoEstudioSegundos)}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
