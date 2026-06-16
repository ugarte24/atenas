import { useMemo, useState } from 'react';
import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { Lock, Check, TreePine, Compass, ScrollText, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { cn } from '../components/ui/cn';

type Filtro = 'todos' | 'desbloqueados' | 'bloqueados';

type Badge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  emoji?: string;
  Icon?: LucideIcon;
};

export default function Logros() {
  const { logros, loading, error } = useLogrosUsuario();
  const { misiones } = useMisionesAlumno();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const badges = useMemo((): Badge[] => {
    if (logros.length > 0) {
      return logros.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description ?? '',
        unlocked: b.unlocked,
        emoji: b.icon,
      }));
    }
    const conTemas = misiones.filter((m) => m.totalPasos > 0);
    const misionesCompletas = conTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length;
    const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);
    return [
      { id: 'nature', title: 'Defensor de la naturaleza', description: 'Actividades de convivencia.', unlocked: hasAnyProgress, Icon: TreePine },
      { id: 'explorer', title: 'Explorador del Abya Yala', description: 'Una misión completa.', unlocked: misionesCompletas >= 1, Icon: Compass },
      { id: 'historian', title: 'Historiador', description: 'Todas las misiones.', unlocked: conTemas.length > 0 && misionesCompletas === conTemas.length, Icon: ScrollText },
    ];
  }, [logros, misiones]);

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
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Mis logros" description="Insignias que desbloqueas mientras aprendes." />

      <div className="flex rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFiltro(id)}
            className={cn(
              'segment-tab',
              filtro === id ? 'segment-tab--active' : 'segment-tab--inactive'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLines lines={3} />
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((badge) => (
            <article
              key={badge.id}
              className={cn(
                'flex flex-col items-center rounded-full aspect-square max-w-[140px] mx-auto border-4 p-4 text-center',
                badge.unlocked
                  ? 'border-atenas-gold bg-gradient-to-b from-amber-50 to-white shadow-card'
                  : 'border-atenas-mist-border bg-gray-100 opacity-75 grayscale'
              )}
            >
              <div className="flex-1 flex items-center justify-center mb-1">
                {badge.emoji ? (
                  <span className="text-3xl" aria-hidden>{badge.emoji}</span>
                ) : badge.Icon ? (
                  <badge.Icon className="w-10 h-10 text-atenas-gold" aria-hidden />
                ) : null}
              </div>
              <h2 className="text-[11px] font-bold text-atenas-ink leading-tight line-clamp-2">{badge.title}</h2>
              {!badge.unlocked && <Lock className="w-4 h-4 text-atenas-muted mt-1" aria-hidden />}
              {badge.unlocked && <Check className="w-4 h-4 text-atenas-success mt-1" aria-hidden />}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
