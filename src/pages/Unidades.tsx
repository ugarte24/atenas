import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  LayoutGrid,
  Map,
  TrendingUp,
} from 'lucide-react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useAdventureMapProgress } from '../hooks/useAdventureMapProgress';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { useMapRewards } from '../hooks/useMapRewards';
import { UnidadCard } from '../components/UnidadCard';
import { IslandMapView } from '../components/island/IslandMapView';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard, SkeletonLines } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../components/ui/cn';
import { buildAdventureMapGraph } from '../lib/adventureMapLayout';
import type { MapNodeStatus, WorldId } from '../lib/adventureMapTypes';
import type { Unidad } from '../types';
import { MUNDOS, islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import {
  buildUnidadesMapHref,
  getUnidadesViewPreference,
  parseMapSearchParams,
  setUnidadesViewPreference,
  type UnidadesViewMode,
} from '../lib/adventureMapDeepLinks';

type FiltroLista = 'todos' | 'en_progreso' | 'completadas' | 'pendientes';

function matchesFiltro(
  pct: number,
  mapStatus: MapNodeStatus | undefined,
  filtro: FiltroLista
): boolean {
  const locked = mapStatus === 'locked';
  const completed = pct >= 100;
  const inProgress = pct > 0 && pct < 100;

  switch (filtro) {
    case 'todos':
      return true;
    case 'completadas':
      return completed;
    case 'en_progreso':
      return inProgress && !locked;
    case 'pendientes':
      return !completed && !inProgress;
  }
}

function pctIsla(
  unidades: Unidad[],
  pctByUnit: Record<string, number>,
  worldId: WorldId
): { pct: number; completadas: number; total: number } {
  const items = unidades
    .map((u, i) => ({ u, i }))
    .filter(({ u, i }) => islaDesdeOrdenUnidadSafe(u.orden, i).id === worldId);
  if (items.length === 0) return { pct: 0, completadas: 0, total: 0 };
  const sum = items.reduce((acc, { u }) => acc + (pctByUnit[u.id] ?? 0), 0);
  const completadas = items.filter(({ u }) => (pctByUnit[u.id] ?? 0) >= 100).length;
  return { pct: Math.round(sum / items.length), completadas, total: items.length };
}

export default function Unidades() {
  const { user, profile } = useAuthContext();
  const { unidades, loading, error } = useUnidades();
  const [searchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseMapSearchParams(searchParams.toString()),
    [searchParams]
  );
  const [viewMode, setViewMode] = useState<UnidadesViewMode>(
    () => parsed.view ?? getUnidadesViewPreference()
  );
  const [filtro, setFiltro] = useState<FiltroLista>('todos');
  const [islaFiltro, setIslaFiltro] = useState<WorldId | null>(null);

  useEffect(() => {
    if (parsed.view) setViewMode(parsed.view);
  }, [parsed.view]);

  const esEstudiante = profile?.role === 'estudiante';
  const esDocenteOAdmin = profile?.role === 'docente' || profile?.role === 'admin';

  const {
    progressByUnit,
    loading: loadingProgress,
    nextUnit,
    nextUnitId,
    activeWorldId,
  } = useAdventureMapProgress(unidades, user?.id, esEstudiante);

  const { porcentajeGlobal, loading: loadingGam } = useGamificacionEstudiante();
  const { openedChestIds } = useMapRewards(esEstudiante);

  const pctByUnit = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(progressByUnit).map(([id, p]) => [id, p.progressPct])
      ),
    [progressByUnit]
  );

  const unitMapStatus = useMemo(() => {
    if (!esEstudiante) return {} as Record<string, MapNodeStatus>;
    const nodes = buildAdventureMapGraph(unidades, progressByUnit, openedChestIds, false);
    return Object.fromEntries(
      nodes
        .filter((n) => n.kind === 'unit' && n.unitId)
        .map((n) => [n.unitId!, n.status])
    ) as Record<string, MapNodeStatus>;
  }, [unidades, progressByUnit, openedChestIds, esEstudiante]);

  const unidadesCompletas = useMemo(
    () => unidades.filter((u) => (pctByUnit[u.id] ?? 0) >= 100).length,
    [unidades, pctByUnit]
  );

  const groupedList = useMemo(() => {
    const indexed = unidades.map((u, i) => ({ u, i }));
    const filtered = indexed.filter(({ u, i }) => {
      const pct = pctByUnit[u.id] ?? 0;
      const status = unitMapStatus[u.id];
      if (!matchesFiltro(pct, status, filtro)) return false;
      if (islaFiltro != null && islaDesdeOrdenUnidadSafe(u.orden, i).id !== islaFiltro) {
        return false;
      }
      return true;
    });

    return MUNDOS.map((isla) => ({
      isla,
      items: filtered.filter(
        ({ u, i }) => islaDesdeOrdenUnidadSafe(u.orden, i).id === isla.id
      ),
    })).filter((g) => g.items.length > 0);
  }, [unidades, pctByUnit, unitMapStatus, filtro, islaFiltro]);

  function selectView(mode: UnidadesViewMode) {
    setViewMode(mode);
    setUnidadesViewPreference(mode);
  }

  const filtroTabs: { id: FiltroLista; label: string }[] = [
    { id: 'todos', label: 'Todas' },
    { id: 'en_progreso', label: 'En progreso' },
    { id: 'completadas', label: 'Completadas' },
    { id: 'pendientes', label: 'Pendientes' },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader eyebrow="ATENAS" title="Unidades" />
        <SkeletonLines lines={2} className="mb-6" />
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
      <div className="max-w-6xl mx-auto">
        <PageHeader eyebrow="ATENAS" title="Unidades" />
        <Alert tone="error">No se pudieron cargar las unidades. Intenta recargar la página.</Alert>
      </div>
    );
  }

  const continueTitulo = nextUnit
    ? tituloUnidadConOrden(nextUnit.orden ?? 0, nextUnit.title)
    : null;

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <PageHeader
        eyebrow="ATENAS"
        title="Unidades"
        description={
          esDocenteOAdmin
            ? undefined
            : 'Explora el archipiélago del Abya Yala: Convivencia, Territorio e Historia.'
        }
        className="mb-4"
      />

      {esEstudiante && unidades.length > 0 && (
        <section
          className="mb-6 rounded-3xl border border-atenas-mist-border bg-gradient-to-br from-sky-50/80 via-white to-atenas-mist/40 p-5 shadow-card"
          aria-label="Resumen del archipiélago"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-atenas-muted">
                Tu recorrido
              </p>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums mt-0.5">
                {loadingProgress || loadingGam ? (
                  <span className="text-lg text-atenas-muted">Cargando…</span>
                ) : (
                  <>
                    {unidadesCompletas}
                    <span className="text-base font-semibold text-atenas-muted">
                      {' '}
                      / {unidades.length} unidades
                    </span>
                  </>
                )}
              </p>
              {!loadingGam && (
                <p className="text-sm text-atenas-muted mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
                  {porcentajeGlobal}% de avance global
                </p>
              )}
            </div>
            {nextUnitId && continueTitulo && (
              <Link
                to={`/unidades/${nextUnitId}`}
                className="btn-success inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-touch font-bold text-sm shrink-0"
              >
                Continuar
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            )}
          </div>

          {continueTitulo && (
            <p className="text-sm text-atenas-muted mt-3 sm:mt-2">
              Siguiente: <strong className="text-atenas-ink">{continueTitulo}</strong>
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MUNDOS.map((isla) => {
              const { pct, completadas, total } = pctIsla(unidades, pctByUnit, isla.id);
              const active = islaFiltro === isla.id;
              return (
                <button
                  key={isla.id}
                  type="button"
                  onClick={() => {
                    setIslaFiltro((prev) => (prev === isla.id ? null : isla.id));
                    if (viewMode === 'map') selectView('list');
                  }}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition-all min-h-touch',
                    active
                      ? 'border-atenas-ink ring-1 ring-atenas-ink/20 bg-white shadow-sm'
                      : 'border-atenas-mist-border bg-white/70 hover:bg-white'
                  )}
                  aria-pressed={active}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted">
                    {isla.shortLabel}
                  </p>
                  <p className="text-xs font-semibold text-atenas-ink mt-0.5 truncate">{isla.label}</p>
                  <div className="mt-2">
                    <ProgressBar value={pct} size="sm" tone={pct >= 100 ? 'success' : 'gold'} />
                  </div>
                  <p className="text-[10px] text-atenas-muted mt-1 tabular-nums">
                    {completadas}/{total} · {pct}%
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {unidades.length > 0 && (
        <div className="sticky top-0 z-20 -mx-[var(--space-page-x,1rem)] px-[var(--space-page-x,1rem)] py-2 mb-4 bg-atenas-page/95 backdrop-blur-sm border-b border-atenas-mist-border/60 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
          <div
            className="flex rounded-xl border border-atenas-mist-border bg-white p-1 shadow-card"
            role="group"
            aria-label="Modo de vista"
          >
            <button
              type="button"
              onClick={() => selectView('map')}
              aria-pressed={viewMode === 'map'}
              className={cn(
                'segment-tab flex-1 inline-flex items-center justify-center gap-2',
                viewMode === 'map' ? 'segment-tab--active' : 'segment-tab--inactive'
              )}
            >
              <Map className="w-4 h-4 shrink-0" aria-hidden />
              Mapa
            </button>
            <button
              type="button"
              onClick={() => selectView('list')}
              aria-pressed={viewMode === 'list'}
              className={cn(
                'segment-tab flex-1 inline-flex items-center justify-center gap-2',
                viewMode === 'list' ? 'segment-tab--active' : 'segment-tab--inactive'
              )}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />
              Lista
            </button>
          </div>
        </div>
      )}

      {esDocenteOAdmin && (
        <p className="text-atenas-muted mb-6 max-w-2xl text-sm sm:text-base">
          Vista previa del recorrido del alumno. Para{' '}
          <strong className="text-atenas-ink font-semibold">crear o editar</strong> contenido usa el{' '}
          <Link
            to="/docente/contenidos"
            className="text-atenas-ink font-semibold underline underline-offset-2"
          >
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
          <div className="py-8">
            <SkeletonLines lines={4} />
          </div>
        ) : (
          <>
            {esEstudiante && (
              <p className="text-xs text-atenas-muted mb-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => selectView('list')}
                  className="font-semibold text-atenas-blue underline underline-offset-2"
                >
                  Ver todas en lista
                </button>
              </p>
            )}
            <IslandMapView
              unidades={unidades}
              progressByUnit={progressByUnit}
              showProgress={esEstudiante}
              scrollWorldId={parsed.world ?? islaFiltro ?? activeWorldId}
              scrollNodeId={parsed.nodeId}
            />
          </>
        )
      ) : (
        <>
          <div
            className="flex overflow-x-auto scrollbar-nav-hide rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card gap-0.5"
            role="tablist"
            aria-label="Filtrar unidades"
          >
            {filtroTabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filtro === id}
                onClick={() => setFiltro(id)}
                className={cn(
                  'segment-tab shrink-0 px-3 sm:flex-1',
                  filtro === id ? 'segment-tab--active' : 'segment-tab--inactive'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {islaFiltro != null && (
            <div className="mb-4 flex items-center justify-between gap-2 text-sm">
              <span className="text-atenas-muted">
                Filtrando:{' '}
                <strong className="text-atenas-ink">
                  {MUNDOS.find((m) => m.id === islaFiltro)?.label}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setIslaFiltro(null)}
                className="text-xs font-semibold text-atenas-blue hover:underline underline-offset-2"
              >
                Quitar filtro
              </button>
            </div>
          )}

          {groupedList.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="Sin unidades en este filtro"
              description="Prueba otro filtro o explora el mapa del archipiélago."
              action={
                <button
                  type="button"
                  className="btn-secondary inline-flex text-sm"
                  onClick={() => {
                    setFiltro('todos');
                    setIslaFiltro(null);
                  }}
                >
                  Ver todas
                </button>
              }
            />
          ) : (
            <div className="space-y-8">
              {groupedList.map(({ isla, items }) => (
                <section key={isla.id} aria-labelledby={`isla-heading-${isla.id}`}>
                  <div
                    className={cn(
                      'mb-4 rounded-2xl px-4 py-3 bg-gradient-to-r text-white shadow-sm',
                      isla.gradient
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2
                          id={`isla-heading-${isla.id}`}
                          className="text-sm sm:text-base font-bold leading-snug"
                        >
                          {isla.label}
                        </h2>
                        <p className="text-xs text-white/85 mt-0.5">{isla.subtitle}</p>
                      </div>
                      <Link
                        to={buildUnidadesMapHref(isla.id)}
                        onClick={() => selectView('map')}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-semibold border border-white/25 transition-colors"
                      >
                        Ver en mapa
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                  <ul className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
                    {items.map(({ u, i }) => (
                      <li key={u.id}>
                        <UnidadCard
                          unidad={u}
                          listIndex={i}
                          progressPct={esEstudiante ? (pctByUnit[u.id] ?? null) : undefined}
                          mapStatus={esEstudiante ? unitMapStatus[u.id] : undefined}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {esEstudiante && (
            <div className="mt-8 sm:hidden">
              <Link
                to={buildUnidadesMapHref(activeWorldId)}
                onClick={() => selectView('map')}
                className="btn-secondary inline-flex w-full items-center justify-center gap-2 min-h-touch font-semibold text-sm"
              >
                <Map className="w-4 h-4" aria-hidden />
                Ir al mapa del archipiélago
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
