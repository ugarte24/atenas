import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LayoutGrid, Map } from 'lucide-react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useAdventureMapProgress } from '../hooks/useAdventureMapProgress';
import { UnidadCard } from '../components/UnidadCard';
import { IslandMapView } from '../components/island/IslandMapView';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { cn } from '../components/ui/cn';

type ViewMode = 'map' | 'list';

export default function Unidades() {
  const { user, profile } = useAuthContext();
  const { unidades, loading, error } = useUnidades();
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const esEstudiante = profile?.role === 'estudiante';
  const esDocenteOAdmin = profile?.role === 'docente' || profile?.role === 'admin';

  const { progressByUnit, loading: loadingProgress } = useAdventureMapProgress(
    unidades,
    user?.id,
    esEstudiante
  );

  const pctByUnit = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(progressByUnit).map(([id, p]) => [id, p.progressPct])
      ),
    [progressByUnit]
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader eyebrow="Plataforma ATENAS" title="Contenidos" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <SkeletonCard />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-lg" role="alert">
        Algo salió mal. Vuelve a intentarlo.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <PageHeader
          eyebrow="ATENAS"
          title="Unidades"
          description={
            esDocenteOAdmin
              ? undefined
              : 'Explora el archipiélago del Abya Yala: avanza por Convivencia, Territorio e Historia.'
          }
          className="mb-0 flex-1"
        />
        {unidades.length > 0 && (
          <div
            className="flex rounded-xl border border-atenas-mist-border bg-white p-1 shadow-soft shrink-0 self-start"
            role="group"
            aria-label="Modo de vista"
          >
            <button
              type="button"
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold min-h-touch transition-colors',
                viewMode === 'map'
                  ? 'bg-atenas-ink text-white'
                  : 'text-atenas-muted hover:text-atenas-ink hover:bg-atenas-mist'
              )}
            >
              <Map className="w-4 h-4" aria-hidden />
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold min-h-touch transition-colors',
                viewMode === 'list'
                  ? 'bg-atenas-ink text-white'
                  : 'text-atenas-muted hover:text-atenas-ink hover:bg-atenas-mist'
              )}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden />
              Lista
            </button>
          </div>
        )}
      </div>

      {esDocenteOAdmin && (
        <p className="text-atenas-muted mb-6 max-w-2xl text-sm sm:text-base">
          Vista previa del recorrido del alumno. Para{' '}
          <strong className="text-atenas-ink font-semibold">crear o editar</strong> contenido usa el{' '}
          <Link to="/docente/contenidos" className="text-atenas-ink font-semibold underline underline-offset-2">
            panel docente
          </Link>
          .
        </p>
      )}

      {unidades.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Sin unidades"
          description={
            esDocenteOAdmin
              ? 'Aún no hay unidades cargadas. Créalas desde el panel docente.'
              : 'Aún no hay unidades. Tu profesor las publicará pronto.'
          }
        />
      ) : viewMode === 'map' ? (
        loadingProgress && esEstudiante ? (
          <p className="text-atenas-muted text-sm py-8 text-center">Cargando tu progreso en el mapa…</p>
        ) : (
          <IslandMapView
            unidades={unidades}
            progressByUnit={progressByUnit}
            showProgress={esEstudiante}
          />
        )
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
          {unidades.map((u, i) => (
            <li key={u.id}>
              <UnidadCard
                unidad={u}
                listIndex={i}
                progressPct={esEstudiante ? (pctByUnit[u.id] ?? null) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
