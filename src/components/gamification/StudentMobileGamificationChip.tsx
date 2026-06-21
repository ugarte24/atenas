import { Flame, Star } from 'lucide-react';
import { useGamificacionEstudiante } from '../../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../../lib/gamificacion';
import { cn } from '../ui/cn';

export function StudentMobileGamificationChip({ className }: { className?: string }) {
  const { puntos, racha, loading } = useGamificacionEstudiante();
  const nivel = nivelDesdeXp(puntos);

  return (
    <div className={cn('flex lg:hidden items-center gap-1.5 shrink-0', className)}>
      <div className="flex items-center gap-1 rounded-xl bg-atenas-mist px-2 py-1 border border-atenas-mist-border">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-atenas-gold text-atenas-ink font-bold text-xs">
          {loading ? '–' : nivel.nivel}
        </span>
        <Star className="w-3.5 h-3.5 text-atenas-gold fill-atenas-gold" aria-hidden />
        <span className="text-xs font-bold text-atenas-ink tabular-nums">
          {loading ? '–' : puntos.toLocaleString('es')}
        </span>
      </div>
      {racha > 0 && (
        <div className="flex items-center gap-0.5 rounded-xl bg-orange-50 border border-orange-200 px-2 py-1">
          <Flame className="w-3.5 h-3.5 text-orange-500" aria-hidden />
          <span className="text-xs font-bold text-orange-700 tabular-nums">{racha}d</span>
        </div>
      )}
    </div>
  );
}
