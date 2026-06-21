import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  CheckCircle2,
  TreePine,
  Compass,
  ScrollText,
  Trophy,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { cn } from '../components/ui/cn';

type Filtro = 'todos' | 'desbloqueados' | 'bloqueados';

type BadgeItem = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  emoji?: string;
  Icon?: LucideIcon;
  progressLabel?: string;
};

function parseProgress(label?: string): { current: number; total: number } | null {
  if (!label) return null;
  const m = label.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  const total = Number(m[2]);
  if (total <= 0) return null;
  return { current: Number(m[1]), total };
}

export default function Logros() {
  const { logros, loading, error } = useLogrosUsuario();
  const { misiones } = useMisionesAlumno();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const badges = useMemo((): BadgeItem[] => {
    if (logros.length > 0) {
      return logros.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description ?? '',
        unlocked: b.unlocked,
        emoji: b.icon,
        progressLabel: b.progressLabel,
      }));
    }
    const conTemas = misiones.filter((m) => m.totalPasos > 0);
    const misionesCompletas = conTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length;
    const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);
    return [
      {
        id: 'nature',
        title: 'Defensor de la naturaleza',
        description: 'Actividades de convivencia.',
        unlocked: hasAnyProgress,
        Icon: TreePine,
        progressLabel: hasAnyProgress ? undefined : 'Completa tu primera actividad',
      },
      {
        id: 'explorer',
        title: 'Explorador del Abya Yala',
        description: 'Una misión completa.',
        unlocked: misionesCompletas >= 1,
        Icon: Compass,
        progressLabel:
          misionesCompletas >= 1 ? undefined : `${Math.min(misionesCompletas, 1)}/1 misión`,
      },
      {
        id: 'historian',
        title: 'Historiador',
        description: 'Todas las misiones.',
        unlocked: conTemas.length > 0 && misionesCompletas === conTemas.length,
        Icon: ScrollText,
        progressLabel:
          conTemas.length > 0
            ? `${misionesCompletas}/${conTemas.length} misiones`
            : 'Sin misiones publicadas',
      },
    ];
  }, [logros, misiones]);

  const stats = useMemo(() => {
    const desbloqueados = badges.filter((b) => b.unlocked).length;
    const total = badges.length;
    const pct = total > 0 ? Math.round((desbloqueados / total) * 100) : 0;
    return { desbloqueados, total, pct };
  }, [badges]);

  const filtered = badges.filter((b) => {
    if (filtro === 'desbloqueados') return b.unlocked;
    if (filtro === 'bloqueados') return !b.unlocked;
    return true;
  });

  const tabs: { id: Filtro; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'desbloqueados', label: 'Desbloqueados' },
    { id: 'bloqueados', label: 'Bloqueados' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-2">
      <PageHeader
        title="Mis logros"
        description="Insignias que desbloqueas mientras aprendes en el archipiélago."
      />

      {!loading && !error && badges.length > 0 && (
        <section
          className="mb-6 rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-purple-50/40 p-5 shadow-card"
          aria-label="Resumen de logros"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <Trophy className="w-7 h-7" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-800/80">
                Colección de insignias
              </p>
              <p className="text-2xl font-bold text-atenas-ink tabular-nums mt-0.5">
                {stats.desbloqueados}
                <span className="text-base font-semibold text-atenas-muted">
                  {' '}
                  / {stats.total} desbloqueadas
                </span>
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={stats.pct}
                  label="Progreso de la colección"
                  showPercent
                  size="sm"
                  tone="gold"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div
        className="flex overflow-x-auto scrollbar-nav-hide rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card gap-0.5"
        role="tablist"
        aria-label="Filtrar logros"
      >
        {tabs.map(({ id, label }) => (
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

      {loading ? (
        <SkeletonLines lines={4} />
      ) : error ? (
        <Alert tone="error">No se pudieron cargar los logros. Intenta recargar la página.</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title={filtro === 'desbloqueados' ? 'Aún no tienes logros' : 'No hay logros en esta vista'}
          description={
            filtro === 'desbloqueados'
              ? 'Completa actividades y misiones para desbloquear insignias.'
              : 'Prueba otro filtro o sigue aprendiendo para ganar nuevas insignias.'
          }
          action={
            filtro !== 'todos' ? (
              <button
                type="button"
                className="btn-secondary inline-flex text-sm"
                onClick={() => setFiltro('todos')}
              >
                Ver todos
              </button>
            ) : (
              <Link to="/unidades" className="btn-secondary inline-flex text-sm gap-1.5">
                Ir a unidades
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((badge) => {
            const progress = parseProgress(badge.progressLabel);
            const progressPct = progress
              ? Math.min(100, Math.round((progress.current / progress.total) * 100))
              : null;

            return (
              <Card
                key={badge.id}
                padding="none"
                className={cn(
                  'overflow-hidden border shadow-card transition-shadow hover:shadow-lg',
                  badge.unlocked
                    ? 'border-amber-300/80 ring-1 ring-amber-200/50'
                    : 'border-atenas-mist-border'
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm',
                        badge.unlocked
                          ? 'bg-gradient-to-br from-atenas-gold to-amber-500 ring-2 ring-amber-300/50'
                          : 'bg-atenas-mist grayscale opacity-80'
                      )}
                      aria-hidden
                    >
                      {badge.emoji ? (
                        <span>{badge.emoji}</span>
                      ) : badge.Icon ? (
                        <badge.Icon className="w-7 h-7 text-atenas-ink" />
                      ) : (
                        <Trophy className="w-7 h-7 text-atenas-muted" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {badge.unlocked ? (
                          <Badge tone="success" className="text-[10px]">
                            Desbloqueada
                          </Badge>
                        ) : (
                          <Badge tone="muted" className="text-[10px]">
                            Bloqueada
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-bold text-atenas-ink leading-snug">{badge.title}</h2>
                      {badge.description && (
                        <p className="text-xs text-atenas-muted mt-1 leading-relaxed line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </div>

                    {badge.unlocked ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-atenas-success mt-0.5" aria-hidden />
                    ) : (
                      <Lock className="w-5 h-5 shrink-0 text-atenas-muted mt-0.5" aria-hidden />
                    )}
                  </div>

                  {!badge.unlocked && badge.progressLabel && (
                    <div className="mt-4 pt-3 border-t border-atenas-mist-border/80">
                      {progressPct != null ? (
                        <ProgressBar
                          value={progressPct}
                          label={badge.progressLabel}
                          showPercent
                          size="sm"
                          tone="gold"
                        />
                      ) : (
                        <p className="text-xs text-atenas-muted font-medium">{badge.progressLabel}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && stats.desbloqueados < stats.total && (
        <section className="mt-6 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-atenas-muted">
            Sigue coleccionando
          </p>
          <p className="text-sm text-atenas-muted mt-1">
            Completa misiones y actividades para desbloquear más insignias.
          </p>
          <Link
            to="/misiones"
            className="mt-3 btn-success inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-touch font-bold text-sm"
          >
            Ver misiones
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </section>
      )}
    </div>
  );
}
