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

const BASE_LEVELS: Omit<Level, 'status' | 'progress'>[] = [
  {
    id: 1,
    title: 'Principios de convivencia del Abya Yala',
    worldLabel: 'Mundo 1 · Convivencia',
    lessonsLabel: '5 lecciones',
  },
  {
    id: 2,
    title: 'Organización política y social del Abya Yala',
    worldLabel: 'Mundo 2 · Organización social',
    lessonsLabel: '5 lecciones',
  },
  {
    id: 3,
    title: 'Invasión europea al Abya Yala',
    worldLabel: 'Mundo 3 · Invasión europea',
    lessonsLabel: '5 lecciones',
  },
];

function buildLevelsFromMision(mision: Mision | undefined): Level[] {
  if (!mision || mision.totalPasos === 0) {
    return BASE_LEVELS.map((base) => ({
      ...base,
      status: base.id === 1 ? 'unlocked' : 'locked',
      progress: 0,
    }));
  }

  const stepsPerLevel = Math.max(1, Math.round(mision.totalPasos / BASE_LEVELS.length));

  return BASE_LEVELS.map((base) => {
    const minStepsForLevel = (base.id - 1) * stepsPerLevel + 1;
    const maxStepsForLevel = base.id * stepsPerLevel;
    const clampedMax = Math.min(maxStepsForLevel, mision.totalPasos);

    let status: LevelStatus;
    let progress = 0;

    if (mision.pasosCompletados >= clampedMax) {
      status = 'completed';
      progress = 100;
    } else if (mision.pasosCompletados >= minStepsForLevel) {
      status = 'unlocked';
      const stepsInThisLevel =
        Math.min(mision.pasosCompletados, clampedMax) - minStepsForLevel + 1;
      const totalStepsThisLevel = clampedMax - minStepsForLevel + 1;
      progress = Math.round((stepsInThisLevel / totalStepsThisLevel) * 100);
    } else if (base.id === 1) {
      status = 'unlocked';
      progress = 0;
    } else {
      status = 'locked';
      progress = 0;
    }

    return {
      ...base,
      status,
      progress,
    };
  });
}

export default function Home() {
  const { profile } = useAuthContext();
  const { misiones } = useMisionesAlumno();
  const { puntos, racha, porcentajeGlobal, energia, loading: loadingGam } = useGamificacionEstudiante();

  const isStudent = profile?.role === 'estudiante';
  const abyaMision = useMemo(
    () => misiones.find((m) => m.titulo === 'Abya Yala y mundo actual'),
    [misiones]
  );

  const levels = useMemo(() => buildLevelsFromMision(abyaMision), [abyaMision]);

  if (!isStudent) return null;

  const pctDisplay = loadingGam ? '…' : `${porcentajeGlobal}%`;

  return (
    <div className="max-w-md sm:max-w-xl mx-auto pb-24">
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
      <section className="mb-6 rounded-3xl bg-atenas-card border border-slate-200/80 shadow-md px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2D2A] uppercase tracking-wide">
              Progreso general
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
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
          <div className="rounded-2xl bg-white/80 border border-slate-100 py-2.5 px-1">
            <span className="text-amber-600 text-lg block mb-0.5" aria-hidden>
              ⭐
            </span>
            <span className="font-semibold text-slate-800 block">Puntos</span>
            <span className="text-slate-600 tabular-nums">{loadingGam ? '–' : puntos.toLocaleString('es')}</span>
          </div>
          <div className="rounded-2xl bg-white/80 border border-slate-100 py-2.5 px-1">
            <span className="text-sky-600 text-lg block mb-0.5" aria-hidden>
              📚
            </span>
            <span className="font-semibold text-slate-800 block">Lecciones</span>
            <span className="text-slate-600 tabular-nums">
              {abyaMision ? `${abyaMision.pasosCompletados} / ${abyaMision.totalPasos}` : '–'}
            </span>
          </div>
          <div className="rounded-2xl bg-white/80 border border-slate-100 py-2.5 px-1">
            <span className="text-rose-500 text-lg block mb-0.5" aria-hidden>
              ❤️
            </span>
            <span className="font-semibold text-slate-800 block">Energía</span>
            <span className="text-slate-600 tabular-nums">
              {loadingGam ? '–' : `${energia} / 5`}
            </span>
          </div>
        </div>
        {racha > 0 && (
          <p className="mt-3 text-[11px] text-center text-slate-600">
            Racha: <span className="font-semibold text-[#1F2D2A]">{racha}</span> día{racha !== 1 ? 's' : ''} seguidos
          </p>
        )}
      </section>

      {/* CTA principal */}
      <div className="mb-8 flex justify-center">
        <Link to="/unidades" className="btn-atenas-gold w-full max-w-sm text-center justify-center">
          Continuar aprendiendo
        </Link>
      </div>

      {/* Mapa / niveles sobre fondo neutro */}
      <section aria-label="Mapa de niveles Abya Yala" className="relative">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Tu ruta por el Abya Yala</h2>
        <div className="space-y-8">
          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';

            return (
              <div key={level.id} className="relative pt-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
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
                  className={`ml-8 rounded-3xl bg-atenas-card border border-slate-200/90 shadow-md p-4 pr-3 flex gap-3 items-center ${
                    isLocked ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{level.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-600">{level.lessonsLabel}</p>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-[#1F2D2A]/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${isLocked ? 0 : level.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
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
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 text-2xl">
                    {index === 0 && '🌱'}
                    {index === 1 && '🏕️'}
                    {index === 2 && '⛵'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[11px] text-slate-500 text-right">
          Versión del sistema <span className="font-semibold text-slate-700">v1.0.0</span>
        </p>
      </section>

      <nav className="fixed bottom-0 inset-x-0 z-20 md:hidden">
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="rounded-3xl bg-white/95 shadow-lg border border-slate-100 flex justify-around py-2">
            <BottomNavItem to="/" label="Inicio" icon="🏠" active />
            <BottomNavItem to="/progreso" label="Progreso" icon="📈" />
            <BottomNavItem to="/logros" label="Logros" icon="🏆" />
            <BottomNavItem to="/perfil" label="Perfil" icon="👤" />
          </div>
        </div>
      </nav>
    </div>
  );
}

type BottomNavItemProps = {
  to: string;
  label: string;
  icon: string;
  active?: boolean;
};

function BottomNavItem({ to, label, icon, active }: BottomNavItemProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 text-[11px] ${
        active ? 'text-[#1F2D2A]' : 'text-slate-500'
      }`}
    >
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
          active ? 'bg-[#D6B98C]/25' : ''
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
