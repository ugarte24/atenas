import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Star, BookOpen, Heart, Flame, Lock, Check, Play, Sprout, Tent, Ship } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno, type Mision } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { APP_VERSION } from '../constants/version';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';

type LevelStatus = 'locked' | 'unlocked' | 'completed';

type Level = {
  id: number;
  title: string;
  worldLabel: string;
  lessonsLabel: string;
  status: LevelStatus;
  progress: number;
};

/** Metadatos de los 3 mundos del mapa; las “lecciones” salen de las 3 primeras unidades por orden en BD */
const BASE_LEVELS: Omit<Level, 'status' | 'progress' | 'lessonsLabel'>[] = [
  {
    id: 1,
    title: 'Principios de convivencia del Abya Yala',
    worldLabel: 'Mundo 1 · Convivencia',
  },
  {
    id: 2,
    title: 'Organización política y social del Abya Yala',
    worldLabel: 'Mundo 2 · Organización social',
  },
  {
    id: 3,
    title: 'Invasión europea al Abya Yala',
    worldLabel: 'Mundo 3 · Invasión europea',
  },
];

function formatLeccionesLabel(totalPasos: number): string {
  if (totalPasos === 0) return 'Sin temas publicados';
  if (totalPasos === 1) return '1 lección';
  return `${totalPasos} lecciones`;
}

/**
 * Cada mundo = una unidad (las 3 primeras por `orden` en curso).
 * Progreso y bloqueo en cadena: el siguiente mundo se desbloquea al completar el anterior.
 */
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
      return {
        ...base,
        lessonsLabel,
        status: 'locked' as LevelStatus,
        progress: 0,
      };
    }

    if (!m || total === 0) {
      const status: LevelStatus = i === 0 ? 'unlocked' : 'locked';
      previousWorldComplete = false;
      return { ...base, lessonsLabel, status, progress: 0 };
    }

    const isComplete = done >= total;
    const progress = isComplete
      ? 100
      : Math.min(100, Math.round((done / total) * 100));
    const status: LevelStatus = isComplete ? 'completed' : 'unlocked';
    previousWorldComplete = isComplete;

    return { ...base, lessonsLabel, status, progress };
  });
}

export default function Home() {
  const { profile } = useAuthContext();
  const { misiones } = useMisionesAlumno();
  const { puntos, racha, porcentajeGlobal, energia, loading: loadingGam } = useGamificacionEstudiante();

  const isStudent = profile?.role === 'estudiante';

  /** Tres primeras unidades del curso (orden editorial) = 3 mundos del mapa */
  const misionesTresMundos = useMemo(() => {
    const sorted = [...misiones].sort((a, b) => a.orden - b.orden);
    return [0, 1, 2].map((i) => sorted[i]);
  }, [misiones]);

  const leccionesCard = useMemo(() => {
    const valid = misionesTresMundos.filter((m): m is Mision => m != null);
    const tot = valid.reduce((s, m) => s + m.totalPasos, 0);
    const done = valid.reduce((s, m) => s + m.pasosCompletados, 0);
    return { tot, done };
  }, [misionesTresMundos]);

  const levels = useMemo(
    () => buildWorldLevels(BASE_LEVELS, misionesTresMundos),
    [misionesTresMundos]
  );

  if (!isStudent) return null;

  const pctDisplay = loadingGam ? '…' : `${porcentajeGlobal}%`;

  return (
    <div className="max-w-md sm:max-w-xl mx-auto">
      {/* Hero */}
      <section className="mt-2 mb-5 rounded-2xl overflow-hidden shadow-elevated border border-atenas-ink/20 bg-atenas-ink text-white">
        <div className="px-4 py-5 sm:px-6 sm:py-6 relative">
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_30%_20%,#D6B98C_0%,transparent_55%)]" aria-hidden />
          <div className="relative flex flex-col gap-3">
            <p className="text-sm text-atenas-gold font-medium tracking-wide uppercase">
              Tu camino de aprendizaje
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight font-atenas text-atenas-page">
              Continúa tu aventura por el Abya Yala
            </h1>
            {profile && (
              <p className="text-sm text-white/85">
                Hola, <span className="font-semibold text-atenas-gold">{profile.full_name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Progreso global estilo Duolingo */}
      <section className="mb-6 rounded-2xl bg-atenas-card border border-atenas-mist-border shadow-card px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-atenas-ink uppercase tracking-wide">
              Progreso general
            </h2>
            <p className="text-xs text-atenas-muted mt-0.5">
              Suma de tus unidades · datos reales
            </p>
          </div>
          <span className="text-2xl font-extrabold tabular-nums text-atenas-ink">{pctDisplay}</span>
        </div>
        <ProgressBar value={porcentajeGlobal} size="lg" tone="blue" />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard
            label="Puntos"
            value={loadingGam ? '–' : puntos.toLocaleString('es')}
            icon={<Star className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            label="Lecciones"
            value={
              leccionesCard.tot > 0 ? `${leccionesCard.done} / ${leccionesCard.tot}` : '–'
            }
            icon={<BookOpen className="w-5 h-5 text-sky-600" />}
          />
          <StatCard
            label="Energía"
            value={loadingGam ? '–' : `${energia} / 5`}
            icon={<Heart className="w-5 h-5 text-rose-500" />}
          />
          <StatCard
            label="Racha"
            value={loadingGam ? '–' : racha > 0 ? `${racha} día${racha !== 1 ? 's' : ''}` : '0'}
            icon={<Flame className="w-5 h-5 text-orange-500" />}
          />
        </div>
      </section>

      {/* CTA principal */}
      <div className="mb-8 flex justify-center">
        <Link
          to="/unidades"
          className="btn-atenas-gold w-full max-w-sm text-center justify-center shadow-elevated ring-1 ring-atenas-gold/35 text-base"
        >
          Continuar aprendiendo
        </Link>
      </div>

      {/* Mapa / niveles sobre fondo neutro */}
      <section aria-label="Mapa de niveles Abya Yala" className="relative">
        <h2 className="text-sm font-semibold text-atenas-ink mb-3">Tu ruta por el Abya Yala</h2>
        <div className="space-y-6">
          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';
            const LevelIcon = index === 0 ? Sprout : index === 1 ? Tent : Ship;

            return (
              <div key={level.id} className="relative pt-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white border border-atenas-mist-border px-3 py-1 text-[11px] font-semibold text-atenas-muted-strong shadow-sm">
                    {level.worldLabel}
                  </span>
                </div>

                <div className="absolute -left-1 top-11 flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 min-h-touch min-w-touch rounded-full border-4 flex items-center justify-center ${
                      isLocked
                        ? 'border-atenas-muted bg-atenas-mist text-atenas-muted'
                        : isCompleted
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                          : 'border-atenas-blue bg-sky-100 text-sky-800'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4" aria-hidden />
                    ) : isCompleted ? (
                      <Check className="w-4 h-4" aria-hidden />
                    ) : (
                      <Play className="w-4 h-4" aria-hidden />
                    )}
                  </div>
                </div>

                <div
                  className={`ml-10 rounded-2xl bg-atenas-card border border-atenas-mist-border shadow-card p-4 flex gap-3 items-center min-h-touch ${
                    isLocked ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-atenas-ink leading-snug">{level.title}</h3>
                    <p className="mt-0.5 text-xs text-atenas-muted">{level.lessonsLabel}</p>
                    <div className="mt-2">
                      <ProgressBar
                        value={isLocked ? 0 : level.progress}
                        size="sm"
                        tone="blue"
                        showPercent={!isLocked}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-atenas-muted">
                      {isLocked
                        ? 'Completa el nivel anterior para desbloquear.'
                        : isCompleted
                          ? 'Nivel completado.'
                          : `${level.progress}% completado.`}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {isLocked ? (
                        <Button variant="secondary" size="sm" disabled>
                          Bloqueado
                        </Button>
                      ) : (
                        <Link
                          to="/unidades"
                          className="inline-flex items-center justify-center rounded-full btn-atenas-gold text-xs px-4 py-2 font-semibold shadow-sm min-h-touch"
                        >
                          {isCompleted ? 'Repetir' : 'Jugar'}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-atenas-mist-border flex items-center justify-center shrink-0 text-atenas-gold">
                    <LevelIcon className="w-7 h-7" aria-hidden />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[11px] text-atenas-muted text-right">
          Versión del sistema{' '}
          <span className="font-semibold text-atenas-ink">v{APP_VERSION}</span>
        </p>
      </section>
    </div>
  );
}
