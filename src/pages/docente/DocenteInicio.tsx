import { Link } from 'react-router-dom';
import { useMemo, type ReactNode } from 'react';
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FolderOpen,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { useUnidades } from '../../hooks/useUnidades';
import { useProgresoEstudiantes } from '../../hooks/useProgresoEstudiantes';
import { useProgresoUnidadesAgregado } from '../../hooks/useProgresoUnidadesAgregado';
import { useAuthContext } from '../../contexts/AuthContext';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { ProgressChart } from '../../components/progress/ProgressChart';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import type { ProgresoEstudiante } from '../../hooks/useProgresoEstudiantes';

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function rendimientoEstudiante(e: ProgresoEstudiante): number {
  const partes = [e.promedioActividades, e.promedioEvaluaciones].filter((n) => n > 0);
  if (!partes.length) return 0;
  return Math.round(partes.reduce((a, b) => a + b, 0) / partes.length);
}

type AccesoRapidoProps = {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
};

function AccesoRapido({ to, title, description, icon, iconClassName }: AccesoRapidoProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-5 card-hover rounded-2xl border border-atenas-mist-border bg-white min-h-touch"
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 text-white ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-atenas-ink text-base sm:text-lg leading-snug">{title}</h2>
        <p className="text-atenas-muted text-sm mt-0.5">{description}</p>
      </div>
      <ChevronRight
        className="w-5 h-5 text-atenas-muted group-hover:text-atenas-ink shrink-0 transition-colors"
        aria-hidden
      />
    </Link>
  );
}

export default function DocenteInicio() {
  const { profile } = useAuthContext();
  const { unidades, loading: loadingU } = useUnidades();
  const { estudiantes, loading: loadingE } = useProgresoEstudiantes();
  const unidadIds = useMemo(() => unidades.map((u) => u.id), [unidades]);
  const { items: progresoUnidades, loading: loadingProg } = useProgresoUnidadesAgregado(unidadIds);

  const loading = loadingU || loadingE || loadingProg;

  const stats = useMemo(() => {
    const activos = estudiantes.filter((e) => e.actividadesCompletadas > 0 || e.evaluacionesCompletadas > 0);
    const promedioGeneral = estudiantes.length
      ? Math.round(
          estudiantes.reduce(
            (a, e) => a + (e.promedioEvaluaciones + e.promedioActividades) / 2,
            0
          ) / estudiantes.length
        )
      : 0;
    const publicadas = unidades.filter((u) => u.publicada !== false).length;
    const borradores = unidades.length - publicadas;
    const sinActividad = estudiantes.length - activos.length;
    const promedioUnidades = progresoUnidades.length
      ? Math.round(
          progresoUnidades.reduce((a, p) => a + p.porcentajePromedio, 0) / progresoUnidades.length
        )
      : 0;

    return {
      unidades: unidades.length,
      estudiantes: estudiantes.length,
      promedioGeneral,
      conActividad: activos.length,
      publicadas,
      borradores,
      sinActividad,
      promedioUnidades,
    };
  }, [estudiantes, unidades, progresoUnidades]);

  const chartItems = useMemo(
    () =>
      progresoUnidades.slice(0, 7).map((p, i) => {
        const u = unidades.find((un) => un.id === p.unidadId);
        return {
          label: `U${i + 1}`,
          title: u ? tituloUnidadConOrden(u.orden ?? i, u.title, i) : p.label,
          value: p.porcentajePromedio,
        };
      }),
    [progresoUnidades, unidades]
  );

  const unidadesBajoProgreso = useMemo(
    () =>
      progresoUnidades
        .map((p, i) => {
          const u = unidades.find((un) => un.id === p.unidadId);
          return {
            ...p,
            titulo: u ? tituloUnidadConOrden(u.orden ?? i, u.title, i) : p.label,
            unidadId: u?.id,
          };
        })
        .filter((p) => p.porcentajePromedio < 50)
        .slice(0, 3),
    [progresoUnidades, unidades]
  );

  const feed = useMemo(
    () =>
      [...estudiantes]
        .filter((e) => e.actividadesCompletadas > 0 || e.evaluacionesCompletadas > 0)
        .sort((a, b) => rendimientoEstudiante(b) - rendimientoEstudiante(a))
        .slice(0, 5),
    [estudiantes]
  );

  const saludo = profile?.full_name?.trim().split(/\s+/)[0] ?? 'Docente';

  return (
    <div>
      <PageHeader
        title="Panel docente"
        description="Resumen del curso, accesos rápidos y seguimiento de tus estudiantes."
      />

      {loading ? (
        <SkeletonLines lines={8} />
      ) : (
        <>
          <Card padding="none" className="mb-6 overflow-hidden border-atenas-sidebar/20">
            <div className="bg-atenas-sidebar text-white p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                    Bienvenido, {saludo}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                    {stats.estudiantes > 0
                      ? `Tu curso avanza al ${stats.promedioUnidades}%`
                      : 'Organiza tu curso'}
                  </h2>
                  <p className="text-sm text-white/80 mt-2 max-w-xl">
                    {stats.unidades} unidades · {stats.publicadas} publicadas · {stats.conActividad} de{' '}
                    {stats.estudiantes} estudiantes con actividad reciente
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link to="/docente/contenidos" className="btn-atenas-gold inline-flex items-center gap-1.5 text-sm min-h-touch px-4">
                    Gestionar contenidos
                  </Link>
                  <Link to="/docente/progreso" className="btn-secondary inline-flex items-center gap-1.5 text-sm min-h-touch px-4 bg-white/10 border-white/20 text-white hover:bg-white/15">
                    Ver progreso
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {(stats.borradores > 0 || stats.sinActividad > 0) && (
            <div className="mb-6 space-y-2">
              {stats.borradores > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" aria-hidden />
                  <p>
                    Tienes <strong>{stats.borradores}</strong>{' '}
                    {stats.borradores === 1 ? 'unidad en borrador' : 'unidades en borrador'}.{' '}
                    <Link to="/docente/contenidos" className="font-semibold underline underline-offset-2">
                      Revisar y publicar
                    </Link>
                  </p>
                </div>
              )}
              {stats.sinActividad > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-atenas-mist-border bg-atenas-page px-4 py-3 text-sm text-atenas-muted-strong">
                  <Users className="w-5 h-5 shrink-0 text-atenas-blue mt-0.5" aria-hidden />
                  <p>
                    <strong>{stats.sinActividad}</strong>{' '}
                    {stats.sinActividad === 1 ? 'estudiante aún no' : 'estudiantes aún no'} registra actividad.{' '}
                    <Link to="/docente/progreso" className="font-semibold text-atenas-ink underline underline-offset-2">
                      Ver detalle
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <StatCard
              label="Unidades"
              value={stats.unidades}
              hint={`${stats.publicadas} publicadas`}
              icon={<FolderOpen className="w-5 h-5 text-atenas-blue" />}
            />
            <StatCard
              label="Estudiantes"
              value={stats.estudiantes}
              icon={<Users className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              label="Promedio"
              value={`${stats.promedioGeneral}%`}
              hint="Actividades y evaluaciones"
              icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
            />
            <StatCard
              label="Con actividad"
              value={stats.conActividad}
              icon={<ClipboardCheck className="w-5 h-5 text-atenas-success" />}
            />
            <StatCard
              label="Avance curso"
              value={`${stats.promedioUnidades}%`}
              hint="Promedio por unidad"
              icon={<BookOpen className="w-5 h-5 text-atenas-gold" />}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card padding="md">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-atenas-ink">Progreso promedio por unidad</h2>
                  <p className="text-xs text-atenas-muted mt-1">Completitud de actividades y evaluaciones</p>
                </div>
                <Link
                  to="/docente/progreso"
                  className="text-xs font-semibold text-atenas-blue hover:underline shrink-0"
                >
                  Ver estudiantes
                </Link>
              </div>
              {chartItems.length > 0 ? (
                <ProgressChart items={chartItems} />
              ) : (
                <p className="text-sm text-atenas-muted py-6 text-center">Aún no hay unidades con datos.</p>
              )}

              {unidadesBajoProgreso.length > 0 && (
                <div className="mt-5 pt-4 border-t border-atenas-mist-border space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-atenas-muted">
                    Unidades con menor avance
                  </p>
                  {unidadesBajoProgreso.map((u) => (
                    <div key={u.unidadId ?? u.label}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-atenas-ink line-clamp-1">{u.titulo}</span>
                        <span className="text-xs font-bold tabular-nums text-atenas-muted">{u.porcentajePromedio}%</span>
                      </div>
                      <ProgressBar value={u.porcentajePromedio} size="sm" tone="gold" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="md">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-atenas-ink">Estudiantes activos</h2>
                  <p className="text-xs text-atenas-muted mt-1">Ordenados por mejor rendimiento</p>
                </div>
                <Link
                  to="/docente/progreso"
                  className="text-xs font-semibold text-atenas-blue hover:underline shrink-0"
                >
                  Ver todos
                </Link>
              </div>

              {feed.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-atenas-muted">Sin actividad registrada aún.</p>
                  <Link to="/docente/contenidos" className="btn-secondary inline-flex mt-4 text-sm min-h-touch px-4">
                    Publicar contenidos
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3 list-none m-0 p-0">
                  {feed.map((e) => {
                    const rendimiento = rendimientoEstudiante(e);
                    return (
                      <li
                        key={e.user_id}
                        className="flex items-center gap-3 rounded-xl border border-atenas-mist-border bg-atenas-page/50 p-3"
                      >
                        <div
                          className="w-9 h-9 rounded-lg bg-atenas-sidebar text-white flex items-center justify-center text-xs font-bold shrink-0"
                          aria-hidden
                        >
                          {iniciales(e.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-atenas-ink truncate">{e.full_name}</p>
                          <p className="text-xs text-atenas-muted">
                            {e.actividadesCompletadas} act. · {e.evaluacionesCompletadas} eval.
                          </p>
                        </div>
                        <Badge tone={rendimiento >= 80 ? 'success' : rendimiento > 0 ? 'warning' : 'muted'}>
                          {rendimiento}%
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      <section aria-labelledby="accesos-docente">
        <h2 id="accesos-docente" className="text-sm font-bold text-atenas-ink mb-3">
          Accesos rápidos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AccesoRapido
            to="/docente/contenidos"
            title="Gestionar contenidos"
            description="Unidades, temas, recursos y actividades"
            icon={<BookOpen className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />}
            iconClassName="bg-atenas-success"
          />
          <AccesoRapido
            to="/docente/progreso"
            title="Progreso estudiantes"
            description="Tabla detallada y exportación CSV"
            icon={<Users className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />}
            iconClassName="bg-atenas-sidebar"
          />
          <AccesoRapido
            to="/docente/logros"
            title="Logros e insignias"
            description="Activar logros y ver desbloqueos"
            icon={<Trophy className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />}
            iconClassName="bg-gradient-to-br from-violet-500 to-purple-600"
          />
        </div>
      </section>
    </div>
  );
}
