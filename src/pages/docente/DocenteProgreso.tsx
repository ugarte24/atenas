import { useMemo, useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  Download,
  Search,
  TrendingUp,
  Trophy,
  UserX,
  Users,
} from 'lucide-react';
import { useProgresoEstudiantes } from '../../hooks/useProgresoEstudiantes';
import { descargarCsv } from '../../lib/exportCsv';
import { formatTiempoEstudio } from '../../lib/formatTiempo';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import type { ProgresoEstudiante } from '../../hooks/useProgresoEstudiantes';

type FiltroActividad = 'todos' | 'activos' | 'inactivos';
type OrdenLista = 'nombre' | 'rendimiento' | 'actividad';

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function rendimientoGeneral(e: ProgresoEstudiante): number {
  if (e.actividadesCompletadas === 0 && e.evaluacionesCompletadas === 0) return 0;
  const partes = [e.promedioActividades, e.promedioEvaluaciones].filter((n) => n > 0);
  if (!partes.length) return 0;
  return Math.round(partes.reduce((a, b) => a + b, 0) / partes.length);
}

function tieneActividad(e: ProgresoEstudiante): boolean {
  return e.actividadesCompletadas > 0 || e.evaluacionesCompletadas > 0;
}

function estadoEstudiante(e: ProgresoEstudiante): { label: string; tone: 'muted' | 'default' | 'success' | 'warning' } {
  if (!tieneActividad(e)) return { label: 'Sin actividad', tone: 'muted' };
  if (e.promedioEvaluaciones >= 80 || rendimientoGeneral(e) >= 80) {
    return { label: 'Destacado', tone: 'success' };
  }
  return { label: 'En curso', tone: 'warning' };
}

function EstudianteAvatar({ nombre }: { nombre: string }) {
  return (
    <div
      className="w-10 h-10 rounded-xl bg-atenas-sidebar text-white flex items-center justify-center text-sm font-bold shrink-0"
      aria-hidden
    >
      {iniciales(nombre)}
    </div>
  );
}

type EstudianteCardProps = {
  estudiante: ProgresoEstudiante;
};

function EstudianteProgresoCard({ estudiante: e }: EstudianteCardProps) {
  const estado = estadoEstudiante(e);
  const rendimiento = rendimientoGeneral(e);

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-start gap-3">
        <EstudianteAvatar nombre={e.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-atenas-ink leading-snug">{e.full_name}</p>
            <Badge tone={estado.tone}>{estado.label}</Badge>
          </div>
          <p className="text-xs text-atenas-muted truncate mt-0.5">{e.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-atenas-ink tabular-nums">{rendimiento}%</p>
          <p className="text-[10px] uppercase tracking-wide text-atenas-muted font-semibold">Global</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-atenas-page border border-atenas-mist-border p-3">
          <p className="text-xs text-atenas-muted font-medium mb-1">Actividades</p>
          <p className="font-bold text-atenas-ink tabular-nums">{e.actividadesCompletadas}</p>
          <ProgressBar value={e.promedioActividades} size="sm" tone="blue" className="mt-2" showPercent />
        </div>
        <div className="rounded-xl bg-atenas-page border border-atenas-mist-border p-3">
          <p className="text-xs text-atenas-muted font-medium mb-1">Evaluaciones</p>
          <p className="font-bold text-atenas-ink tabular-nums">{e.evaluacionesCompletadas}</p>
          <ProgressBar value={e.promedioEvaluaciones} size="sm" tone="success" className="mt-2" showPercent />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-atenas-muted-strong pt-1 border-t border-atenas-mist-border">
        <span className="inline-flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-atenas-gold" aria-hidden />
          {e.logrosEstimados > 0 ? `${e.logrosEstimados} logros` : 'Sin logros aún'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" aria-hidden />
          {formatTiempoEstudio(e.tiempoEstudioSegundos)}
        </span>
      </div>
    </Card>
  );
}

export default function DocenteProgreso() {
  const { estudiantes, loading, error } = useProgresoEstudiantes();
  const [busqueda, setBusqueda] = useState('');
  const [filtroActividad, setFiltroActividad] = useState<FiltroActividad>('todos');
  const [orden, setOrden] = useState<OrdenLista>('nombre');

  const stats = useMemo(() => {
    const activos = estudiantes.filter(tieneActividad).length;
    const promEval = activos
      ? Math.round(
          estudiantes.filter(tieneActividad).reduce((a, e) => a + e.promedioEvaluaciones, 0) / activos
        )
      : 0;
    const promAct = activos
      ? Math.round(
          estudiantes.filter(tieneActividad).reduce((a, e) => a + e.promedioActividades, 0) / activos
        )
      : 0;
    const tiempoTotal = estudiantes.reduce((a, e) => a + e.tiempoEstudioSegundos, 0);
    return {
      total: estudiantes.length,
      activos,
      inactivos: estudiantes.length - activos,
      promEval,
      promAct,
      tiempoTotal,
    };
  }, [estudiantes]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let list = estudiantes.filter((e) => {
      const matchBusqueda =
        !q || e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const activo = tieneActividad(e);
      const matchFiltro =
        filtroActividad === 'todos' ||
        (filtroActividad === 'activos' && activo) ||
        (filtroActividad === 'inactivos' && !activo);
      return matchBusqueda && matchFiltro;
    });

    list = [...list].sort((a, b) => {
      if (orden === 'rendimiento') return rendimientoGeneral(b) - rendimientoGeneral(a);
      if (orden === 'actividad') {
        return (
          b.actividadesCompletadas +
          b.evaluacionesCompletadas -
          (a.actividadesCompletadas + a.evaluacionesCompletadas)
        );
      }
      return a.full_name.localeCompare(b.full_name, 'es');
    });

    return list;
  }, [estudiantes, busqueda, filtroActividad, orden]);

  function exportarCsv() {
    const rows = [
      [
        'Nombre',
        'Email',
        'Actividades',
        'Prom. actividades %',
        'Evaluaciones',
        'Prom. evaluaciones %',
        'Rendimiento global %',
        'Logros estimados',
        'Tiempo de estudio',
      ],
      ...filtrados.map((e) => [
        e.full_name,
        e.email,
        String(e.actividadesCompletadas),
        String(e.promedioActividades),
        String(e.evaluacionesCompletadas),
        String(e.promedioEvaluaciones),
        String(rendimientoGeneral(e)),
        String(e.logrosEstimados),
        formatTiempoEstudio(e.tiempoEstudioSegundos),
      ]),
    ];
    descargarCsv(rows, 'progreso-estudiantes.csv');
  }

  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Estudiante',
        cell: (e: ProgresoEstudiante) => {
          const estado = estadoEstudiante(e);
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <EstudianteAvatar nombre={e.full_name} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-atenas-ink">{e.full_name}</span>
                  <Badge tone={estado.tone} className="text-[10px] py-0">
                    {estado.label}
                  </Badge>
                </div>
                <span className="text-xs text-atenas-muted truncate block max-w-[240px]">{e.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'act',
        header: 'Actividades',
        className: 'min-w-[140px]',
        cell: (e: ProgresoEstudiante) => (
          <div>
            <span className="font-semibold tabular-nums">{e.actividadesCompletadas}</span>
            <ProgressBar value={e.promedioActividades} size="sm" tone="blue" className="mt-1.5 w-28" showPercent />
          </div>
        ),
      },
      {
        key: 'eval',
        header: 'Evaluaciones',
        className: 'min-w-[140px]',
        cell: (e: ProgresoEstudiante) => (
          <div>
            <span className="font-semibold tabular-nums">{e.evaluacionesCompletadas}</span>
            <ProgressBar value={e.promedioEvaluaciones} size="sm" tone="success" className="mt-1.5 w-28" showPercent />
          </div>
        ),
      },
      {
        key: 'global',
        header: 'Global',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => (
          <span className="font-bold text-atenas-ink tabular-nums">{rendimientoGeneral(e)}%</span>
        ),
      },
      {
        key: 'logros',
        header: 'Logros',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) =>
          e.logrosEstimados > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium">
              <Trophy className="w-3.5 h-3.5 text-atenas-gold" aria-hidden />
              {e.logrosEstimados}
            </span>
          ) : (
            <span className="text-atenas-muted">—</span>
          ),
      },
      {
        key: 'tiempo',
        header: 'Tiempo',
        className: 'text-center whitespace-nowrap',
        cell: (e: ProgresoEstudiante) => (
          <span className="text-sm text-atenas-muted-strong">{formatTiempoEstudio(e.tiempoEstudioSegundos)}</span>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Progreso de estudiantes"
          description="Seguimiento de actividades, evaluaciones y tiempo de estudio por alumno."
        />
        <SkeletonLines lines={6} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
        {error}
      </p>
    );
  }

  const hayFiltros = busqueda.trim() !== '' || filtroActividad !== 'todos';

  return (
    <div>
      <PageHeader
        title="Progreso de estudiantes"
        description="Seguimiento de actividades, evaluaciones y tiempo de estudio por alumno."
        actions={
          <Button
            variant="secondary"
            className="inline-flex items-center gap-1.5"
            onClick={exportarCsv}
            disabled={filtrados.length === 0}
          >
            <Download className="w-4 h-4" aria-hidden />
            Exportar CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Estudiantes"
          value={stats.total}
          icon={<Users className="w-5 h-5 text-atenas-blue" />}
        />
        <StatCard
          label="Con actividad"
          value={stats.activos}
          hint={`${stats.inactivos} sin actividad`}
          icon={<ClipboardCheck className="w-5 h-5 text-atenas-success" />}
        />
        <StatCard
          label="Prom. evaluaciones"
          value={`${stats.promEval}%`}
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
        />
        <StatCard
          label="Tiempo total"
          value={formatTiempoEstudio(stats.tiempoTotal)}
          hint={`Prom. actividades ${stats.promAct}%`}
          icon={<Clock className="w-5 h-5 text-atenas-gold" />}
        />
      </div>

      {estudiantes.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atenas-muted pointer-events-none"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Buscar por nombre o correo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar estudiantes"
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-atenas-muted shrink-0">
              <span className="font-medium">Ordenar</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as OrdenLista)}
                className="input-field py-2 min-h-touch text-sm w-auto min-w-[10rem]"
                aria-label="Ordenar lista de estudiantes"
              >
                <option value="nombre">Por nombre</option>
                <option value="rendimiento">Mejor rendimiento</option>
                <option value="actividad">Más actividad</option>
              </select>
            </label>
          </div>

          <div
            className="flex gap-1 p-1 rounded-xl bg-atenas-mist border border-atenas-mist-border max-w-lg"
            role="tablist"
            aria-label="Filtrar por actividad"
          >
            {(
              [
                ['todos', 'Todos'],
                ['activos', 'Con actividad'],
                ['inactivos', 'Sin actividad'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filtroActividad === key}
                className={`segment-tab ${filtroActividad === key ? 'segment-tab--active' : 'segment-tab--inactive'}`}
                onClick={() => setFiltroActividad(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {hayFiltros && (
            <p className="text-xs text-atenas-muted">
              Mostrando {filtrados.length} de {estudiantes.length} estudiantes
            </p>
          )}
        </div>
      )}

      {estudiantes.length === 0 ? (
        <EmptyState
          title="No hay estudiantes registrados"
          description="Cuando se registren alumnos con rol estudiante, verás aquí su progreso."
          icon={<Users className="w-7 h-7 text-atenas-blue" />}
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ningún estudiante coincide con la búsqueda o el filtro seleccionado."
          icon={<UserX className="w-7 h-7 text-atenas-muted" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setBusqueda('');
                setFiltroActividad('todos');
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          data={filtrados}
          keyExtractor={(e) => e.user_id}
          mobileCard={(e) => <EstudianteProgresoCard estudiante={e} />}
        />
      )}
    </div>
  );
}
