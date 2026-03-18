import { useMisionesAlumno } from '../hooks/useMisiones';

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export default function Logros() {
  const { misiones } = useMisionesAlumno();

  const totalMisiones = misiones.length;
  const misionesCompletas = misiones.filter(
    (m) => m.totalPasos > 0 && m.pasosCompletados >= m.totalPasos,
  ).length;

  const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);

  const badges: Badge[] = [
    {
      id: 'nature',
      title: 'Defensor de la naturaleza',
      description: 'Completa actividades sobre convivencia y naturaleza.',
      icon: '🌳',
      unlocked: hasAnyProgress,
    },
    {
      id: 'explorer',
      title: 'Explorador del Abya Yala',
      description: 'Termina al menos una misión/unidad completa.',
      icon: '🧭',
      unlocked: misionesCompletas >= 1,
    },
    {
      id: 'historian',
      title: 'Historiador',
      description: 'Completa todas las misiones disponibles.',
      icon: '📜',
      unlocked: totalMisiones > 0 && misionesCompletas === totalMisiones,
    },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Tus logros</h1>
        <p className="text-sm text-slate-600">
          Desbloquea insignias mientras aprendes sobre el Abya Yala.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`flex flex-col items-center justify-between rounded-2xl border p-3 text-center shadow-sm ${
              badge.unlocked
                ? 'bg-white border-emerald-300'
                : 'bg-slate-100 border-slate-200 opacity-70'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1 ${
                badge.unlocked ? 'bg-emerald-50' : 'bg-slate-200'
              }`}
            >
              <span aria-hidden="true">{badge.icon}</span>
            </div>
            <h2 className="text-xs font-semibold text-slate-900">{badge.title}</h2>
            <p className="mt-1 text-[11px] text-slate-600">{badge.description}</p>
            {!badge.unlocked && (
              <span className="mt-1 inline-flex items-center rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                🔒 Bloqueado
              </span>
            )}
            {badge.unlocked && (
              <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                ✔ Desbloqueado
              </span>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

