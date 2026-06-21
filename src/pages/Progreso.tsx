import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  Star,
  Flame,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { useActividadReciente } from '../hooks/useActividadReciente';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';
import { formatTiempoEstudio } from '../lib/formatTiempo';
import { nivelDesdeXp } from '../lib/gamificacion';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { ProgressChart } from '../components/progress/ProgressChart';
import { RecentActivityList } from '../components/progress/RecentActivityList';
import { cn } from '../components/ui/cn';

function estadoUnidad(pasosCompletados: number, totalPasos: number) {
  if (totalPasos === 0 || pasosCompletados === 0) {
    return { label: 'Sin empezar', tone: 'muted' as const };
  }
  if (pasosCompletados >= totalPasos) {
    return { label: 'Completada', tone: 'success' as const };
  }
  return { label: 'En progreso', tone: 'warning' as const };
}

export default function Progreso() {
  const { misiones, loading, error } = useMisionesAlumno();
  const { puntos, racha, porcentajeGlobal, loading: loadingGam } = useGamificacionEstudiante();
  const { items: recientes, loading: loadingRec } = useActividadReciente(6);
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);

  const misionesConTemas = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0),
    [misiones]
  );

  const temasCompletados = useMemo(
    () => misionesConTemas.reduce((s, m) => s + m.pasosCompletados, 0),
    [misionesConTemas]
  );

  const totalTemas = useMemo(
    () => misionesConTemas.reduce((s, m) => s + m.totalPasos, 0),
    [misionesConTemas]
  );

  const unidadesCompletas = misionesConTemas.filter(
    (m) => m.pasosCompletados >= m.totalPasos
  ).length;

  const tiempoTotal = useMemo(
    () => misionesConTemas.reduce((s, m) => s + m.tiempoEstudioSegundos, 0),
    [misionesConTemas]
  );

  const chartItems = useMemo(
    () =>
      misionesConTemas.map((m) => ({
        label: `U${m.orden}`,
        title: tituloUnidadConOrden(m.orden, m.titulo),
        value: m.totalPasos ? Math.round((m.pasosCompletados / m.totalPasos) * 100) : 0,
      })),
    [misionesConTemas]
  );

  const siguienteUnidad = useMemo(() => {
    return misionesConTemas.find(
      (m) => m.pasosCompletados > 0 && m.pasosCompletados < m.totalPasos
    ) ?? misionesConTemas.find((m) => m.pasosCompletados === 0);
  }, [misionesConTemas]);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Tu progreso"
        description="Avance por unidad, XP acumulado y actividad reciente."
      />

      {(loading || loadingGam) && <SkeletonLines lines={4} />}
      {error && !loading && (
        <Alert tone="error" className="mb-4">
          No se pudo cargar tu progreso. Intenta recargar la página.
        </Alert>
      )}

      {!loading && !error && misionesConTemas.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Sin progreso aún"
          description="Cuando completes actividades en tus unidades, verás aquí tu avance y XP."
          action={
            <Link to="/unidades" className="btn-secondary inline-flex text-sm">
              Explorar unidades
            </Link>
          }
        />
      )}

      {!loading && !error && misionesConTemas.length > 0 && (
        <>
          <section
            className="mb-6 rounded-3xl border border-atenas-mist-border bg-gradient-to-br from-sky-50/80 via-white to-atenas-mist/40 p-5 shadow-card"
            aria-label="Resumen de gamificación"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-atenas-gold to-amber-500 text-atenas-ink font-bold text-xl shadow-md">
                  {loadingGam ? '–' : nivel.nivel}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-atenas-muted">
                    Nivel {loadingGam ? '…' : nivel.nivel} · {loadingGam ? '…' : nivel.nombre}
                  </p>
                  <p className="text-2xl font-bold text-atenas-ink tabular-nums mt-0.5">
                    {loadingGam ? '–' : puntos.toLocaleString('es')}
                    <span className="text-base font-semibold text-atenas-muted"> XP</span>
                  </p>
                  {!loadingGam && nivel.xpParaSiguiente != null && (
                    <div className="mt-3">
                      <ProgressBar
                        value={nivel.progresoEnNivel}
                        label={`${nivel.xpEnNivel} / ${nivel.xpParaSiguiente} XP al siguiente nivel`}
                        showPercent
                        size="sm"
                        tone="gold"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:w-52 shrink-0">
                <div className="rounded-2xl border border-atenas-mist-border bg-white/80 px-3 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" aria-hidden />
                    Avance
                  </p>
                  <p className="text-lg font-bold text-atenas-ink tabular-nums mt-0.5">
                    {loadingGam ? '–' : `${porcentajeGlobal}%`}
                  </p>
                </div>
                <div className="rounded-2xl border border-atenas-mist-border bg-white/80 px-3 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" aria-hidden />
                    Racha
                  </p>
                  <p className="text-lg font-bold text-atenas-ink tabular-nums mt-0.5">
                    {loadingGam ? '–' : `${racha} d`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" aria-label="Estadísticas">
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-atenas-muted-strong">
                  Unidades
                </span>
                <BookOpen className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums leading-none">
                {unidadesCompletas}/{misionesConTemas.length}
              </p>
              <p className="text-xs text-atenas-muted mt-1">completadas</p>
            </div>
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-atenas-muted-strong">
                  Temas
                </span>
                <ClipboardCheck className="w-4 h-4 text-atenas-success shrink-0" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums leading-none">
                {temasCompletados}/{totalTemas}
              </p>
              <p className="text-xs text-atenas-muted mt-1">finalizados</p>
            </div>
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-atenas-muted-strong">
                  XP total
                </span>
                <Star className="w-4 h-4 text-atenas-gold fill-atenas-gold shrink-0" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums leading-none">
                {loadingGam ? '–' : puntos.toLocaleString('es')}
              </p>
              <p className="text-xs text-atenas-muted mt-1">puntos</p>
            </div>
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-atenas-muted-strong">
                  Tiempo
                </span>
                <Clock className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums leading-none">
                {tiempoTotal > 0 ? formatTiempoEstudio(tiempoTotal) : '–'}
              </p>
              <p className="text-xs text-atenas-muted mt-1">de estudio</p>
            </div>
          </section>

          {siguienteUnidad && (
            <section className="mb-6 rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 to-white p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800/80">
                Sigue aprendiendo
              </p>
              <h2 className="text-base font-bold text-atenas-ink mt-1 leading-snug">
                {tituloUnidadConOrden(siguienteUnidad.orden, siguienteUnidad.titulo)}
              </h2>
              <p className="text-sm text-atenas-muted mt-0.5">
                {siguienteUnidad.pasosCompletados} de {siguienteUnidad.totalPasos} temas completados
              </p>
              <Link
                to={`/unidades/${siguienteUnidad.id}`}
                className="mt-3 btn-success inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-touch font-bold text-sm"
              >
                Continuar unidad
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            </section>
          )}

          <Card className="mb-6" padding="md">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-atenas-ink">Vista rápida por unidad</h2>
              <span className="text-xs text-atenas-muted tabular-nums">
                Promedio {porcentajeGlobal}%
              </span>
            </div>
            <ProgressChart items={chartItems} />
          </Card>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-sm font-bold text-atenas-ink">Detalle por unidad</h2>
                <Link
                  to="/unidades"
                  className="text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
                >
                  Ver todas
                </Link>
              </div>

              {misionesConTemas.map((m, listIndex) => {
                const porcentaje = m.totalPasos
                  ? Math.round((m.pasosCompletados / m.totalPasos) * 100)
                  : 0;
                const tituloMostrado = tituloUnidadConOrden(m.orden, m.titulo);
                const descripcionLimpia = limpiarDescripcionUnidad(m.descripcion);
                const isla = islaDesdeOrdenUnidadSafe(m.orden, listIndex);
                const estado = estadoUnidad(m.pasosCompletados, m.totalPasos);
                const completada = estado.tone === 'success';

                return (
                  <Link
                    key={m.id}
                    to={`/unidades/${m.id}`}
                    className={cn(
                      'group block rounded-2xl border bg-white p-4 shadow-card transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2',
                      completada
                        ? 'border-emerald-200/80 ring-1 ring-emerald-100/60'
                        : 'border-atenas-mist-border'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
                          completada
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                            : porcentaje > 0
                              ? 'bg-gradient-to-br from-atenas-blue/90 to-sky-600/90 text-white'
                              : 'bg-atenas-mist text-atenas-muted'
                        )}
                      >
                        {completada ? (
                          <CheckCircle2 className="w-5 h-5" aria-hidden />
                        ) : (
                          <span className="text-sm font-bold tabular-nums">{porcentaje}%</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge tone="muted" className="text-[10px] font-bold">
                            {isla.shortLabel}
                          </Badge>
                          <Badge tone={estado.tone} className="text-[10px]">
                            {estado.label}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-atenas-ink leading-snug group-hover:text-atenas-blue transition-colors">
                          {tituloMostrado}
                        </h3>
                        {descripcionLimpia && (
                          <p className="mt-0.5 text-xs text-atenas-muted line-clamp-1">
                            {descripcionLimpia}
                          </p>
                        )}
                        <div className="mt-3">
                          <ProgressBar
                            value={porcentaje}
                            label={`${m.pasosCompletados} de ${m.totalPasos} temas`}
                            showPercent
                            size="sm"
                            tone={completada ? 'success' : porcentaje > 0 ? 'gold' : 'blue'}
                          />
                        </div>
                        {m.tiempoEstudioSegundos > 0 && (
                          <p className="text-[11px] text-atenas-muted mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" aria-hidden />
                            {formatTiempoEstudio(m.tiempoEstudioSegundos)} de estudio
                          </p>
                        )}
                      </div>

                      <ChevronRight
                        className="w-5 h-5 shrink-0 text-atenas-muted group-hover:text-atenas-ink transition-colors mt-1"
                        aria-hidden
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              <Card padding="md">
                <h2 className="text-sm font-bold text-atenas-ink mb-4">Actividad reciente</h2>
                <RecentActivityList items={recientes} loading={loadingRec} />
                {racha > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200/60 px-3 py-2">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" aria-hidden />
                    <p className="text-xs text-orange-900 font-medium">
                      Racha de {racha} día{racha !== 1 ? 's' : ''} seguido{racha !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
