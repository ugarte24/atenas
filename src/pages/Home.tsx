import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Star, BookOpen, Flame, Lock, Check, Play, MapPin, Sparkles, Target, Trophy, Award, TrendingUp, Radio } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno, type Mision } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../lib/gamificacion';
import { APP_VERSION } from '../constants/version';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ActivityCalendar } from '../components/calendar/ActivityCalendar';
import { cn } from '../components/ui/cn';

const QUICK_LINKS = [
  { to: '/unidades', label: 'Mis Unidades', icon: BookOpen, color: 'from-sky-500 to-blue-600' },
  { to: '/misiones', label: 'Misiones', icon: Target, color: 'from-orange-400 to-amber-500' },
  { to: '/logros', label: 'Logros', icon: Trophy, color: 'from-violet-500 to-purple-600' },
  { to: '/progreso', label: 'Mi Progreso', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  { to: '/certificados', label: 'Certificados', icon: Award, color: 'from-amber-400 to-yellow-500' },
  { to: '/aula-en-vivo', label: 'Aula en vivo', icon: Radio, color: 'from-red-500 to-rose-600' },
];

type LevelStatus = 'locked' | 'unlocked' | 'completed';

type Level = {
  id: number;
  title: string;
  worldLabel: string;
  lessonsLabel: string;
  status: LevelStatus;
  progress: number;
};

const BASE_LEVELS: Omit<Level, 'status' | 'progress' | 'lessonsLabel'>[] = [
  { id: 1, title: 'Principios de convivencia del Abya Yala', worldLabel: 'Isla 1 · Convivencia' },
  { id: 2, title: 'Organización política y social del Abya Yala', worldLabel: 'Isla 2 · Organización' },
  { id: 3, title: 'Invasión europea al Abya Yala', worldLabel: 'Isla 3 · Invasión europea' },
];

const ISLAND_COLORS = [
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-amber-400 to-orange-500',
];

function formatLeccionesLabel(totalPasos: number): string {
  if (totalPasos === 0) return 'Sin temas publicados';
  if (totalPasos === 1) return '1 lección';
  return `${totalPasos} lecciones`;
}

function buildWorldLevels(
  bases: typeof BASE_LEVELS,
  misionesPorMundo: (Mision | undefined)[]
): Level[] {
  let previousWorldComplete = true;

  return bases.map((base, i) => {
    const m = misionesPorMundo[i];
    const total = m?.totalPasos ?? 0;
    const done = m?.pasosCompletados ?? 0;
    const lessonsLabel = formatLeccionesLabel(total);

    if (i > 0 && !previousWorldComplete) {
      return { ...base, lessonsLabel, status: 'locked' as LevelStatus, progress: 0 };
    }
    if (!m || total === 0) {
      const status: LevelStatus = i === 0 ? 'unlocked' : 'locked';
      previousWorldComplete = false;
      return { ...base, lessonsLabel, status, progress: 0 };
    }
    const isComplete = done >= total;
    const progress = isComplete ? 100 : Math.min(100, Math.round((done / total) * 100));
    const status: LevelStatus = isComplete ? 'completed' : 'unlocked';
    previousWorldComplete = isComplete;
    return { ...base, lessonsLabel, status, progress };
  });
}

export default function Home() {
  const { profile } = useAuthContext();
  const { misiones } = useMisionesAlumno();
  const { puntos, racha, porcentajeGlobal, loading: loadingGam } = useGamificacionEstudiante();

  const isStudent = profile?.role === 'estudiante';
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);

  const misionesTresMundos = useMemo(() => {
    const sorted = [...misiones].sort((a, b) => a.orden - b.orden);
    return [0, 1, 2].map((i) => sorted[i]);
  }, [misiones]);

  const leccionesCard = useMemo(() => {
    const valid = misionesTresMundos.filter((m): m is Mision => m != null);
    return {
      tot: valid.reduce((s, m) => s + m.totalPasos, 0),
      done: valid.reduce((s, m) => s + m.pasosCompletados, 0),
    };
  }, [misionesTresMundos]);

  const levels = useMemo(
    () => buildWorldLevels(BASE_LEVELS, misionesTresMundos),
    [misionesTresMundos]
  );

  if (!isStudent) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra superior estilo mockup: nivel + XP */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-atenas-ink">
            ¡Hola, {profile?.full_name?.split(' ')[0] ?? 'explorador'}!
          </h1>
          <p className="text-sm text-atenas-muted-strong mt-0.5">
            Sigue explorando el Abya Yala y gana XP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="atenas-sidebar-panel flex items-center gap-2 rounded-2xl pl-2 pr-4 py-1.5 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-atenas-gold text-atenas-ink font-bold text-lg">
              {loadingGam ? '–' : nivel.nivel}
            </span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wide sidebar-muted font-semibold">Nivel</p>
              <p className="text-xs font-bold text-white leading-tight">{nivel.nombre}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-atenas-mist-border px-3 py-2 shadow-card flex items-center gap-1.5">
            <Star className="w-4 h-4 text-atenas-gold fill-atenas-gold" aria-hidden />
            <span className="text-sm font-bold text-atenas-ink tabular-nums">
              {loadingGam ? '–' : puntos.toLocaleString('es')} XP
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Progreso"
          value={loadingGam ? '–' : `${porcentajeGlobal}%`}
          icon={<Sparkles className="w-5 h-5 text-atenas-blue" />}
        />
        <StatCard
          label="Lecciones"
          value={leccionesCard.tot > 0 ? `${leccionesCard.done}/${leccionesCard.tot}` : '–'}
          icon={<BookOpen className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          label="Racha"
          value={loadingGam ? '–' : `${racha} d`}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <StatCard
          label="Mundos"
          value={`${levels.filter((l) => l.status === 'completed').length}/3`}
          icon={<MapPin className="w-5 h-5 text-emerald-600" />}
        />
      </section>

      <div className="mb-6">
        <ProgressBar value={porcentajeGlobal} label="Progreso general" showPercent size="lg" tone="success" />
      </div>

      <section className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card card-hover min-h-[100px] justify-center text-center"
          >
            <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br shadow-md', color)}>
              <Icon className="w-6 h-6" aria-hidden />
            </span>
            <span className="text-xs font-bold text-atenas-ink leading-tight">{label}</span>
          </Link>
        ))}
      </section>

      <div className="mb-8">
        <ActivityCalendar />
      </div>

      {/* Mapa de islas */}
      <section
        aria-label="Mapa de niveles Abya Yala"
        className="relative rounded-3xl overflow-hidden border border-sky-200/60 shadow-elevated bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50 p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(56,189,248,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(52,211,153,0.35) 0%, transparent 45%)',
          }}
        />

        <h2 className="relative text-sm font-bold text-atenas-ink mb-5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-atenas-ink" aria-hidden />
          Tu ruta por el Abya Yala
        </h2>

        <div className="relative space-y-8">
          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';
            const align = index % 2 === 0 ? 'ml-0 mr-auto' : 'ml-auto mr-0';

            return (
              <div key={level.id} className={cn('relative max-w-[85%]', align)}>
                {index > 0 && (
                  <div
                    className="absolute -top-6 left-1/2 w-0.5 h-6 bg-sky-300/80 -translate-x-1/2"
                    aria-hidden
                  />
                )}

                <div
                  className={cn(
                    'rounded-2xl bg-white/95 backdrop-blur border border-white shadow-card p-4',
                    isLocked && 'opacity-80'
                  )}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-md bg-gradient-to-br',
                        isLocked ? 'from-gray-300 to-gray-400' : ISLAND_COLORS[index]
                      )}
                    >
                      {isLocked ? (
                        <Lock className="w-6 h-6" aria-hidden />
                      ) : isCompleted ? (
                        <Check className="w-6 h-6" aria-hidden />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-atenas-muted">
                        {level.worldLabel}
                      </span>
                      <h3 className="text-sm font-bold text-atenas-ink leading-snug mt-0.5">
                        {level.title}
                      </h3>
                      <p className="text-xs text-atenas-muted mt-1">{level.lessonsLabel}</p>
                      {!isLocked && (
                        <div className="mt-2">
                          <ProgressBar value={level.progress} size="sm" tone="success" showPercent />
                        </div>
                      )}
                      <div className="mt-3">
                        {isLocked ? (
                          <span className="text-xs text-atenas-muted font-medium">Bloqueado</span>
                        ) : (
                          <Link
                            to="/unidades"
                            className={cn(
                              'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold min-h-touch',
                              isCompleted
                                ? 'bg-atenas-mist text-atenas-ink border border-atenas-mist-border'
                                : 'btn-success py-2'
                            )}
                          >
                            {isCompleted ? 'Revisar' : 'Explorar'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-6 text-[11px] text-atenas-muted text-right">
        ATENAS v{APP_VERSION}
      </p>
    </div>
  );
}
