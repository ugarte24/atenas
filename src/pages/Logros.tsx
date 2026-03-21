import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { useMisionesAlumno } from '../hooks/useMisiones';

/** Vista cuando aún no hay filas en `achievements` (migración pendiente) */
function LogrosFallback() {
  const { misiones } = useMisionesAlumno();

  const totalMisiones = misiones.length;
  const misionesCompletas = misiones.filter(
    (m) => m.totalPasos > 0 && m.pasosCompletados >= m.totalPasos
  ).length;
  const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);

  const badges = [
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
    <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <article
          key={badge.id}
          className={`flex flex-col items-center justify-between rounded-2xl border p-3 text-center shadow-sm ${
            badge.unlocked
              ? 'bg-atenas-card border-atenas-gold/40'
              : 'bg-atenas-mist border-atenas-mist-border opacity-80'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1 ${
              badge.unlocked ? 'bg-atenas-gold/20' : 'bg-atenas-mist-border/60'
            }`}
          >
            <span aria-hidden="true">{badge.icon}</span>
          </div>
          <h2 className="text-xs font-semibold text-atenas-ink">{badge.title}</h2>
          <p className="mt-1 text-[11px] text-atenas-muted">{badge.description}</p>
          {!badge.unlocked && (
            <span className="mt-1 inline-flex items-center rounded-full bg-atenas-mist-border/80 px-2 py-0.5 text-[10px] font-semibold text-atenas-muted-strong">
              🔒 Bloqueado
            </span>
          )}
          {badge.unlocked && (
            <span className="mt-1 inline-flex items-center rounded-full bg-atenas-ink/10 px-2 py-0.5 text-[10px] font-semibold text-atenas-ink">
              ✔ Desbloqueado
            </span>
          )}
        </article>
      ))}
    </section>
  );
}

export default function Logros() {
  const { logros, loading, error } = useLogrosUsuario();

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6 border-b border-atenas-mist-border pb-5">
        <h1 className="text-2xl font-extrabold text-atenas-ink">Tus logros</h1>
        <p className="text-sm text-atenas-muted">
          Desbloquea insignias mientras aprendes sobre el Abya Yala.
        </p>
      </header>

      {loading ? (
        <p className="text-atenas-muted text-sm">Cargando logros…</p>
      ) : error || logros.length === 0 ? (
        <LogrosFallback />
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {logros.map((badge) => (
            <article
              key={badge.id}
              className={`flex flex-col items-center justify-between rounded-2xl border p-3 text-center shadow-sm ${
                badge.unlocked
                  ? 'bg-atenas-card border-atenas-gold/40'
                  : 'bg-atenas-mist border-atenas-mist-border opacity-80'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1 ${
                  badge.unlocked ? 'bg-atenas-gold/20' : 'bg-atenas-mist-border/60'
                }`}
              >
                <span aria-hidden="true">{badge.icon}</span>
              </div>
              <h2 className="text-xs font-semibold text-atenas-ink">{badge.title}</h2>
              <p className="mt-1 text-[11px] text-atenas-muted">{badge.description}</p>
              {!badge.unlocked && (
                <span className="mt-1 inline-flex items-center rounded-full bg-atenas-mist-border/80 px-2 py-0.5 text-[10px] font-semibold text-atenas-muted-strong">
                  🔒 Bloqueado
                </span>
              )}
              {badge.unlocked && (
                <span className="mt-1 inline-flex items-center rounded-full bg-atenas-ink/10 px-2 py-0.5 text-[10px] font-semibold text-atenas-ink">
                  ✔ Desbloqueado
                </span>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
