import { useLogrosUsuario } from '../hooks/useLogrosUsuario';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { Lock, Check, TreePine, Compass, ScrollText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { SkeletonLines } from '../components/ui/Skeleton';
import { cn } from '../components/ui/cn';

/** Vista cuando aún no hay filas en `achievements` (migración pendiente) */
function LogrosFallback() {
  const { misiones } = useMisionesAlumno();

  const conTemas = misiones.filter((m) => m.totalPasos > 0);
  const totalMisiones = conTemas.length;
  const misionesCompletas = conTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length;
  const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);

  const badges = [
    {
      id: 'nature',
      title: 'Defensor de la naturaleza',
      description: 'Completa actividades sobre convivencia y naturaleza.',
      icon: TreePine,
      unlocked: hasAnyProgress,
    },
    {
      id: 'explorer',
      title: 'Explorador del Abya Yala',
      description: 'Termina al menos una misión/unidad completa.',
      icon: Compass,
      unlocked: misionesCompletas >= 1,
    },
    {
      id: 'historian',
      title: 'Historiador',
      description: 'Completa todas las misiones disponibles.',
      icon: ScrollText,
      unlocked: totalMisiones > 0 && misionesCompletas === totalMisiones,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <article
            key={badge.id}
            className={cn(
              'flex flex-col items-center rounded-2xl border p-4 text-center shadow-card min-h-[160px]',
              badge.unlocked
                ? 'bg-atenas-card border-atenas-gold/40'
                : 'bg-atenas-mist border-atenas-mist-border opacity-90'
            )}
          >
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-2',
                badge.unlocked ? 'bg-atenas-gold/20 text-atenas-gold' : 'bg-atenas-mist-border/60 text-atenas-muted'
              )}
            >
              <Icon className="w-8 h-8" aria-hidden />
            </div>
            <h2 className="text-sm font-semibold text-atenas-ink leading-snug">{badge.title}</h2>
            <p className="mt-1.5 text-xs text-atenas-muted line-clamp-3">{badge.description}</p>
            <div className="mt-auto pt-2">
              {badge.unlocked ? (
                <Badge tone="success" className="gap-1">
                  <Check className="w-3 h-3" aria-hidden />
                  Desbloqueado
                </Badge>
              ) : (
                <Badge tone="muted" className="gap-1">
                  <Lock className="w-3 h-3" aria-hidden />
                  Bloqueado
                </Badge>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default function Logros() {
  const { logros, loading, error } = useLogrosUsuario();

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="Tus logros"
        description="Desbloquea insignias mientras aprendes sobre el Abya Yala."
      />

      {loading ? (
        <SkeletonLines lines={3} />
      ) : error || logros.length === 0 ? (
        <LogrosFallback />
      ) : (
        <section className="grid grid-cols-2 gap-4">
          {logros.map((badge) => (
            <article
              key={badge.id}
              className={cn(
                'flex flex-col items-center rounded-2xl border p-4 text-center shadow-card min-h-[160px]',
                badge.unlocked
                  ? 'bg-atenas-card border-atenas-gold/40'
                  : 'bg-atenas-mist border-atenas-mist-border opacity-90'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2',
                  badge.unlocked ? 'bg-atenas-gold/20' : 'bg-atenas-mist-border/60'
                )}
              >
                <span aria-hidden="true">{badge.icon}</span>
              </div>
              <h2 className="text-sm font-semibold text-atenas-ink leading-snug">{badge.title}</h2>
              <p className="mt-1.5 text-xs text-atenas-muted line-clamp-3">{badge.description}</p>
              <div className="mt-auto pt-2">
                {badge.unlocked ? (
                  <Badge tone="success" className="gap-1">
                    <Check className="w-3 h-3" aria-hidden />
                    Desbloqueado
                  </Badge>
                ) : (
                  <Badge tone="muted" className="gap-1">
                    <Lock className="w-3 h-3" aria-hidden />
                    Bloqueado
                  </Badge>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
