import { useMemo } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { useActividadReciente } from '../hooks/useActividadReciente';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';
import { formatTiempoEstudio } from '../lib/formatTiempo';
import { nivelDesdeXp } from '../lib/gamificacion';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { ProgressChart } from '../components/progress/ProgressChart';
import { RecentActivityList } from '../components/progress/RecentActivityList';
import { BookOpen, ClipboardCheck, Star, Flame } from 'lucide-react';

export default function Progreso() {
  const { misiones, loading, error } = useMisionesAlumno();
  const { puntos, racha, loading: loadingGam } = useGamificacionEstudiante();
  const { items: recientes, loading: loadingRec } = useActividadReciente(6);
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);

  const misionesConTemas = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0),
    [misiones]
  );

  const chartItems = useMemo(
    () =>
      misionesConTemas.map((m) => ({
        label: `U${m.orden}`,
        value: m.totalPasos ? Math.round((m.pasosCompletados / m.totalPasos) * 100) : 0,
      })),
    [misionesConTemas]
  );

  const unidadesCompletas = misionesConTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Tu progreso" description="Resumen de avance, XP y actividad reciente." />

      {(loading || loadingGam) && <SkeletonLines lines={4} />}
      {error && !loading && (
        <p className="text-sm text-red-600" role="alert">
          No se pudo cargar tu progreso.
        </p>
      )}

      {!loading && !error && misionesConTemas.length === 0 && (
        <EmptyState title="Sin progreso aún" description="Cuando completes actividades, lo verás aquí." />
      )}

      {!loading && !error && misionesConTemas.length > 0 && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Unidades" value={`${unidadesCompletas}/${misionesConTemas.length}`} icon={<BookOpen className="w-5 h-5 text-atenas-blue" />} />
            <StatCard
              label="Temas"
              value={`${misionesConTemas.reduce((s, m) => s + m.pasosCompletados, 0)}/${misionesConTemas.reduce((s, m) => s + m.totalPasos, 0)}`}
              icon={<ClipboardCheck className="w-5 h-5 text-atenas-success" />}
            />
            <StatCard label="XP total" value={loadingGam ? '–' : puntos.toLocaleString('es')} icon={<Star className="w-5 h-5 text-atenas-gold fill-atenas-gold" />} />
            <StatCard label="Nivel" value={loadingGam ? '–' : `${nivel.nivel}`} icon={<Flame className="w-5 h-5 text-orange-500" />} />
          </section>

          <Card className="mb-6 p-5">
            <h2 className="text-sm font-bold text-atenas-ink mb-4">Progreso por unidad</h2>
            <ProgressChart items={chartItems} />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {misionesConTemas.map((m) => {
                const porcentaje = m.totalPasos ? Math.round((m.pasosCompletados / m.totalPasos) * 100) : 0;
                const tituloMostrado = tituloUnidadConOrden(m.orden, m.titulo);
                const descripcionLimpia = limpiarDescripcionUnidad(m.descripcion);
                return (
                  <Card key={m.id} className="flex flex-col gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-atenas-ink">{tituloMostrado}</h2>
                      {descripcionLimpia && (
                        <p className="mt-0.5 text-xs text-atenas-muted line-clamp-2">{descripcionLimpia}</p>
                      )}
                    </div>
                    <ProgressBar value={porcentaje} label={`${m.pasosCompletados} de ${m.totalPasos} temas`} showPercent />
                    {m.tiempoEstudioSegundos > 0 && (
                      <p className="text-[11px] text-atenas-muted text-right -mt-1">
                        Tiempo: {formatTiempoEstudio(m.tiempoEstudioSegundos)}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            <div>
              <h2 className="text-sm font-bold text-atenas-ink mb-3">Actividad reciente</h2>
              <RecentActivityList items={recientes} loading={loadingRec} />
              {racha > 0 && (
                <p className="text-xs text-atenas-muted mt-4">Racha actual: {racha} día{racha !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
