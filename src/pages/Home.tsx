import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno, type Mision } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';

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
      <section className="mt-2 mb-6 rounded-3xl overflow-hidden shadow-lg border border-[#1F2D2A]/20 bg-[#1F2D2A] text-white">
        <div className="px-5 py-6 sm:px-7 sm:py-7 relative">
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_30%_20%,#D6B98C_0%,transparent_55%)]" aria-hidden />
          <div className="relative flex flex-col gap-3">
            <p className="text-sm text-[#D6B98C] font-medium tracking-wide uppercase">
              Tu camino de aprendizaje
            </p>
            <h1 className="text-2xl sm:text-[1.65rem] font-extrabold leading-tight font-atenas text-[#FAF8F5]">
              Continúa tu aventura por el Abya Yala
            </h1>
            {profile && (
              <p className="text-sm text-white/85">
                Hola, <span className="font-semibold text-[#D6B98C]">{profile.full_name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Progreso global estilo Duolingo */}
      <section className="mb-6 rounded-3xl bg-atenas-card border border-atenas-mist-border shadow-card px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2D2A] uppercase tracking-wide">
              Progreso general
            </h2>
            <p className="text-xs text-atenas-muted mt-0.5">
              Suma de tus unidades · datos reales
            </p>
          </div>
          <span className="text-2xl font-extrabold tabular-nums text-[#1F2D2A]">{pctDisplay}</span>
        </div>
        <div
          className="h-5 w-full rounded-full overflow-hidden bg-[#1F2D2A]/15 ring-1 ring-[#1F2D2A]/10"
          role="progressbar"
          aria-valuenow={porcentajeGlobal}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-atenas-blue transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, porcentajeGlobal)}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-white/80 border border-atenas-mist-border py-2.5 px-1">
            <span className="text-amber-600 text-lg block mb-0.5" aria-hidden>
              ⭐
            </span>
            <span className="font-semibold text-atenas-ink block">Puntos</span>
            <span className="text-atenas-muted tabular-nums">{loadingGam ? '–' : puntos.toLocaleString('es')}</span>
          </div>
          <div className="rounded-2xl bg-white/80 border border-atenas-mist-border py-2.5 px-1">
            <span className="text-sky-600 text-lg block mb-0.5" aria-hidden>
              📚
            </span>
            <span className="font-semibold text-atenas-ink block">Lecciones</span>
            <span className="text-atenas-muted tabular-nums">
              {leccionesCard.tot > 0
                ? `${leccionesCard.done} / ${leccionesCard.tot}`
                : '–'}
            </span>
          </div>
          <div className="rounded-2xl bg-white/80 border border-atenas-mist-border py-2.5 px-1">
            <span className="text-rose-500 text-lg block mb-0.5" aria-hidden>
              ❤️
            </span>
            <span className="font-semibold text-atenas-ink block">Energía</span>
            <span className="text-atenas-muted tabular-nums">
              {loadingGam ? '–' : `${energia} / 5`}
            </span>
          </div>
        </div>
        {racha > 0 && (
          <p className="mt-3 text-[11px] text-center text-atenas-muted">
            Racha: <span className="font-semibold text-[#1F2D2A]">{racha}</span> día{racha !== 1 ? 's' : ''} seguidos
          </p>
        )}
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
        <div className="space-y-8">
          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';

            return (
              <div key={level.id} className="relative pt-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white border border-atenas-mist-border px-3 py-1 text-[11px] font-semibold text-atenas-muted-strong shadow-sm">
                    {level.worldLabel}
                  </span>
                </div>

                <div className="absolute -left-1 top-11 flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full border-4 flex items-center justify-center text-sm ${
                      isLocked
                        ? 'border-slate-400 bg-slate-200'
                        : isCompleted
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                          : 'border-atenas-blue bg-sky-100 text-sky-800'
                    }`}
                  >
                    {isLocked ? '🔒' : isCompleted ? '✔' : '▶'}
                  </div>
                </div>

                <div
                  className={`ml-8 rounded-3xl bg-atenas-card border border-atenas-mist-border shadow-card p-4 pr-3 flex gap-3 items-center ${
                    isLocked ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-atenas-ink leading-snug">{level.title}</h3>
                    <p className="mt-0.5 text-xs text-atenas-muted">{level.lessonsLabel}</p>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-[#1F2D2A]/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${isLocked ? 0 : level.progress}%` }}
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
                        <button
                          type="button"
                          disabled
                          className="rounded-full bg-slate-300 text-slate-600 text-xs px-3 py-1.5 cursor-not-allowed"
                        >
                          Bloqueado
                        </button>
                      ) : (
                        <Link
                          to="/unidades"
                          className="rounded-full btn-atenas-gold text-xs px-4 py-1.5 font-semibold shadow-sm"
                        >
                          {isCompleted ? 'Repetir' : 'Jugar'}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-atenas-mist-border flex items-center justify-center shrink-0 text-2xl">
                    {index === 0 && '🌱'}
                    {index === 1 && '🏕️'}
                    {index === 2 && '⛵'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[11px] text-atenas-muted text-right">
          Versión del sistema <span className="font-semibold text-atenas-ink">v1.0.0</span>
        </p>
      </section>
    </div>
  );
}
