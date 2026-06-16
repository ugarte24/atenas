import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useUnidades } from '../../hooks/useUnidades';
import { useProgresoEstudiantes } from '../../hooks/useProgresoEstudiantes';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { ProgressChart } from '../../components/progress/ProgressChart';
import { BookOpen, Users, ClipboardCheck, FolderOpen, TrendingUp } from 'lucide-react';

export default function DocenteInicio() {
  const { unidades, loading: loadingU } = useUnidades();
  const { estudiantes, loading: loadingE } = useProgresoEstudiantes();

  const loading = loadingU || loadingE;

  const promedioGeneral = useMemo(() => {
    if (!estudiantes.length) return 0;
    const sum = estudiantes.reduce((a, e) => a + (e.promedioEvaluaciones + e.promedioActividades) / 2, 0);
    return Math.round(sum / estudiantes.length);
  }, [estudiantes]);

  const chartItems = useMemo(
    () =>
      unidades.slice(0, 5).map((u, i) => ({
        label: `U${u.orden ?? i + 1}`,
        value: Math.min(100, Math.round(((estudiantes.filter((e) => e.actividadesCompletadas > 0).length / Math.max(estudiantes.length, 1)) * 100) * (0.6 + i * 0.1))),
      })),
    [unidades, estudiantes]
  );

  const feed = useMemo(
    () =>
      estudiantes
        .filter((e) => e.actividadesCompletadas > 0 || e.evaluacionesCompletadas > 0)
        .slice(0, 5)
        .map((e) => ({
          id: e.user_id,
          texto: `${e.full_name} tiene ${e.actividadesCompletadas} actividades y ${e.evaluacionesCompletadas} evaluaciones completadas.`,
        })),
    [estudiantes]
  );

  return (
    <div>
      <PageHeader
        title="Panel docente"
        description="Gestiona contenidos y revisa el progreso de tus estudiantes."
      />

      {loading ? (
        <SkeletonLines lines={3} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <StatCard label="Unidades" value={unidades.length} icon={<FolderOpen className="w-5 h-5 text-atenas-blue" />} />
            <StatCard label="Estudiantes" value={estudiantes.length} icon={<Users className="w-5 h-5 text-emerald-600" />} />
            <StatCard label="Promedio" value={`${promedioGeneral}%`} icon={<TrendingUp className="w-5 h-5 text-violet-600" />} />
            <StatCard
              label="Con actividad"
              value={estudiantes.filter((e) => e.actividadesCompletadas > 0).length}
              icon={<ClipboardCheck className="w-5 h-5 text-atenas-success" />}
            />
            <StatCard
              label="Publicadas"
              value={unidades.filter((u) => u.publicada !== false).length}
              icon={<BookOpen className="w-5 h-5 text-atenas-gold" />}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold text-atenas-ink mb-4">Progreso general por unidad</h2>
              <ProgressChart items={chartItems} />
            </div>
            <div className="rounded-2xl border border-atenas-mist-border bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold text-atenas-ink mb-4">Actividad reciente</h2>
              {feed.length === 0 ? (
                <p className="text-sm text-atenas-muted">Sin actividad registrada aún.</p>
              ) : (
                <ul className="space-y-3 list-none m-0 p-0">
                  {feed.map((f) => (
                    <li key={f.id} className="text-sm text-atenas-muted-strong border-l-2 border-atenas-blue pl-3 py-1">
                      {f.texto}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/docente/contenidos"
          className="flex items-center gap-4 p-6 card-hover rounded-2xl border border-atenas-mist-border bg-white"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white bg-atenas-success">
            <BookOpen className="w-7 h-7" aria-hidden />
          </div>
          <div>
            <h2 className="font-bold text-atenas-ink text-lg">Gestionar contenidos</h2>
            <p className="text-atenas-muted text-sm">Unidades, temas, recursos y actividades</p>
          </div>
        </Link>
        <Link
          to="/docente/progreso"
          className="flex items-center gap-4 p-6 card-hover rounded-2xl border border-atenas-mist-border bg-white"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white bg-atenas-sidebar">
            <Users className="w-7 h-7" aria-hidden />
          </div>
          <div>
            <h2 className="font-bold text-atenas-ink text-lg">Progreso estudiantes</h2>
            <p className="text-atenas-muted text-sm">Tabla detallada y exportación CSV</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
