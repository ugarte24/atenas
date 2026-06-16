import { useMemo, useState } from 'react';
import { useProgresoEstudiantes } from '../../hooks/useProgresoEstudiantes';
import { descargarCsv } from '../../lib/exportCsv';
import { formatTiempoEstudio } from '../../lib/formatTiempo';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { SkeletonLines } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import type { ProgresoEstudiante } from '../../hooks/useProgresoEstudiantes';

export default function DocenteProgreso() {
  const { estudiantes, loading, error } = useProgresoEstudiantes();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [estudiantes, busqueda]);

  function exportarCsv() {
    const rows = [
      [
        'Nombre',
        'Email',
        'Actividades',
        'Prom. actividades %',
        'Evaluaciones',
        'Prom. evaluaciones %',
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
        cell: (e: ProgresoEstudiante) => (
          <div>
            <span className="font-medium">{e.full_name}</span>
            <span className="md:hidden block text-xs text-atenas-muted mt-0.5 truncate max-w-[200px]">
              {e.email}
            </span>
          </div>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        hideOnMobile: true,
        cell: (e: ProgresoEstudiante) => e.email,
      },
      {
        key: 'act',
        header: 'Act.',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => e.actividadesCompletadas,
      },
      {
        key: 'promA',
        header: 'Prom.A',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => `${e.promedioActividades}%`,
      },
      {
        key: 'eval',
        header: 'Eval.',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => e.evaluacionesCompletadas,
      },
      {
        key: 'promE',
        header: 'Prom.E',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => `${e.promedioEvaluaciones}%`,
      },
      {
        key: 'logros',
        header: 'Logros',
        className: 'text-center',
        cell: (e: ProgresoEstudiante) => (e.logrosEstimados > 0 ? e.logrosEstimados : '—'),
      },
      {
        key: 'tiempo',
        header: 'Tiempo',
        className: 'text-center whitespace-nowrap',
        cell: (e: ProgresoEstudiante) => formatTiempoEstudio(e.tiempoEstudioSegundos),
      },
    ],
    []
  );

  const promedioEval = useMemo(() => {
    if (!filtrados.length) return 0;
    return Math.round(filtrados.reduce((a, e) => a + e.promedioEvaluaciones, 0) / filtrados.length);
  }, [filtrados]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Progreso de estudiantes"
          description="Resumen de actividades y evaluaciones realizadas por cada estudiante."
        />
        <SkeletonLines lines={6} />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600" role="alert">{error}</p>;
  }

  return (
    <div>
      <PageHeader
        title="Progreso de estudiantes"
        description="Resumen de actividades y evaluaciones realizadas por cada estudiante."
        actions={
          <Button variant="secondary" onClick={exportarCsv} disabled={filtrados.length === 0}>
            Exportar CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Estudiantes" value={filtrados.length} icon={<Users className="w-5 h-5 text-atenas-blue" />} />
        <StatCard
          label="Con actividad"
          value={filtrados.filter((e) => e.actividadesCompletadas > 0).length}
          icon={<ClipboardCheck className="w-5 h-5 text-atenas-success" />}
        />
        <StatCard label="Prom. evaluaciones" value={`${promedioEval}%`} icon={<TrendingUp className="w-5 h-5 text-violet-600" />} />
      </div>

      <div className="mb-4 max-w-md">
        <Input
          type="search"
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar estudiantes"
        />
      </div>

      <ResponsiveTable
        columns={columns}
        data={filtrados}
        keyExtractor={(e) => e.user_id}
        emptyMessage={
          estudiantes.length === 0
            ? 'No hay estudiantes registrados.'
            : 'Ningún resultado para la búsqueda.'
        }
        mobileCard={(e) => (
          <Card className="space-y-2 text-sm">
            <p className="font-semibold text-atenas-ink">{e.full_name}</p>
            <p className="text-xs text-atenas-muted truncate">{e.email}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div>
                <span className="text-atenas-muted">Actividades</span>
                <p className="font-medium">{e.actividadesCompletadas} · {e.promedioActividades}%</p>
              </div>
              <div>
                <span className="text-atenas-muted">Evaluaciones</span>
                <p className="font-medium">{e.evaluacionesCompletadas} · {e.promedioEvaluaciones}%</p>
              </div>
              <div>
                <span className="text-atenas-muted">Logros</span>
                <p className="font-medium">{e.logrosEstimados > 0 ? e.logrosEstimados : '—'}</p>
              </div>
              <div>
                <span className="text-atenas-muted">Tiempo</span>
                <p className="font-medium">{formatTiempoEstudio(e.tiempoEstudioSegundos)}</p>
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
}
