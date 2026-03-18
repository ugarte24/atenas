import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno, type Mision } from '../hooks/useMisiones';

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
    // Sin datos: primer nivel desbloqueado, resto bloqueado
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

  const abyaMision = useMemo(
    () => misiones.find((m) => m.titulo === 'Abya Yala y mundo actual'),
    [misiones],
  );

  const levels = useMemo(() => buildLevelsFromMision(abyaMision), [abyaMision]);

  return (
    <div className="max-w-md sm:max-w-xl mx-auto pb-24">
      {/* Header gamificado */}
      <section className="mt-2 mb-5">
        <div className="rounded-3xl bg-gradient-to-r from-[#C6F7D0] via-[#FFE9A9] to-[#C9E7FF] shadow-lg px-5 py-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-4 w-32 h-32 rounded-full bg-white/40" />
          <div className="flex items-center gap-4 relative">
            <div className="flex-1">
              <p className="text-sm text-slate-700">Hola, Estudiante!</p>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Tu aventura por el Abya Yala
              </h1>
              {profile && (
                <p className="mt-1 text-sm text-slate-700">
                  Bienvenido, <span className="font-semibold">{profile.full_name}</span>
                </p>
              )}
            </div>
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                <span className="text-3xl" aria-hidden="true">
                  🎒
                </span>
              </div>
            </div>
          </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white/70 py-2 px-1 flex flex-col items-center gap-1">
              <span className="text-amber-500 text-lg" aria-hidden="true">
                ⭐
              </span>
              <span className="font-semibold text-slate-800">Puntos</span>
              <span className="text-slate-600">1 250</span>
            </div>
            <div className="rounded-xl bg-white/70 py-2 px-1 flex flex-col items-center gap-1">
              <span className="text-sky-500 text-lg" aria-hidden="true">
                📚
              </span>
              <span className="font-semibold text-slate-800">Lecciones</span>
              <span className="text-slate-600">
                {abyaMision ? `${abyaMision.pasosCompletados} / ${abyaMision.totalPasos}` : '–'}
              </span>
            </div>
            <div className="rounded-xl bg-white/70 py-2 px-1 flex flex-col items-center gap-1">
              <span className="text-rose-500 text-lg" aria-hidden="true">
                ❤️
              </span>
              <span className="font-semibold text-slate-800">Energía</span>
              <span className="text-slate-600">5 / 5</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 text-right">
            Versión del sistema <span className="font-semibold">v1.0.0</span>
          </div>
        </div>
      </section>

      {/* Mapa vertical */}
      <section aria-label="Mapa de niveles Abya Yala">
        <div className="relative">
          {/* Fondo con naturaleza */}
          <div className="absolute inset-0 -z-10">
            <div className="h-24 bg-gradient-to-b from-[#E5D4FF] to-[#C6F7D0]" />
            <div className="h-32 bg-gradient-to-b from-[#C6F7D0] to-[#FFE9A9]" />
            <div className="h-32 bg-gradient-to-b from-[#FFE9A9] to-[#C9E7FF]" />
          </div>

          {/* Camino curvo aproximado */}
          <div className="absolute inset-x-10 sm:inset-x-16 top-0 bottom-0 -z-10 flex flex-col items-center justify-between pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-emerald-200/80" />
            <div className="w-20 h-20 rounded-full bg-emerald-300/80 translate-x-6" />
            <div className="w-16 h-16 rounded-full bg-emerald-200/80 -translate-x-6" />
          </div>

          {/* Mundos y niveles */}
          <div className="space-y-10">
            {levels.map((level, index) => {
              const isFirst = index === 0;
              const worldColor =
                index === 0 ? 'from-[#C6F7D0] to-[#E5F9F0]' :
                index === 1 ? 'from-[#FFE9A9] to-[#FFE0C2]' :
                'from-[#C9E7FF] to-[#E5D4FF]';

              const isLocked = level.status === 'locked';
              const isCompleted = level.status === 'completed';

              return (
                <div key={level.id} className="relative pt-2">
                  {/* Etiqueta de mundo */}
                  {isFirst && (
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Tu ruta por el Abya Yala
                    </p>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                      {level.worldLabel}
                    </span>
                  </div>

                  {/* Nodo principal sobre el camino */}
                  <div className="absolute -left-1 top-12 flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full border-4 ${
                        isLocked
                          ? 'border-slate-400 bg-slate-300'
                          : isCompleted
                          ? 'border-emerald-400 bg-emerald-300'
                          : 'border-sky-400 bg-sky-300 animate-pulse'
                      } flex items-center justify-center text-sm`}
                    >
                      {isLocked ? '🔒' : isCompleted ? '✔' : '▶'}
                    </div>
                  </div>

                  {/* Tarjeta de nivel */}
                  <div
                    className={`ml-8 rounded-3xl bg-gradient-to-br ${worldColor} shadow-lg p-4 pr-3 flex gap-3 items-center ${
                      isLocked ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-slate-900">
                        {level.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-700">
                        {level.lessonsLabel}
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${isLocked ? 0 : level.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-700">
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
                            className="rounded-full bg-slate-400 text-white text-xs px-3 py-1.5 opacity-80 cursor-not-allowed"
                          >
                            Bloqueado
                          </button>
                        ) : (
                          <Link
                            to="/unidades"
                            className="rounded-full bg-emerald-500 text-white text-xs px-4 py-1.5 font-semibold shadow-sm hover:bg-emerald-600 transition-colors"
                          >
                            {isCompleted ? 'Repetir' : 'Jugar'}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Ilustración lateral */}
                    <div className="w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center shrink-0 text-2xl">
                      {index === 0 && '🌱'}
                      {index === 1 && '🏕️'}
                      {index === 2 && '⛵'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navegación inferior tipo app móvil */}
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
        active ? 'text-emerald-600' : 'text-slate-500'
      }`}
    >
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
          active ? 'bg-emerald-50' : ''
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
