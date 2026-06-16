import { Star } from 'lucide-react';
import { cn } from '../ui/cn';

type Props = {
  titulo: string;
  puntuacion: number;
  maxPuntuacion?: number;
  tiempoSegundos?: number;
  aprobado?: boolean;
  onContinuar: () => void;
  className?: string;
};

function formatTiempo(s?: number): string {
  if (s == null) return '–';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m} min ${sec} s` : `${sec} s`;
}

export function ResultScreen({
  titulo,
  puntuacion,
  maxPuntuacion = 100,
  tiempoSegundos,
  aprobado,
  onContinuar,
  className,
}: Props) {
  const pct = maxPuntuacion > 0 ? Math.round((puntuacion / maxPuntuacion) * 100) : puntuacion;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  return (
    <div className={cn('max-w-md mx-auto text-center', className)}>
      <div className="rounded-3xl bg-white border border-atenas-mist-border shadow-elevated p-8">
        <img src="/mascot-owl.svg" alt="" className="w-20 h-20 mx-auto mb-4" aria-hidden />
        <h2 className="text-xl font-bold text-atenas-ink mb-1">{titulo}</h2>
        {aprobado != null && (
          <p className={cn('text-sm font-semibold mb-4', aprobado ? 'text-atenas-success' : 'text-orange-600')}>
            {aprobado ? '¡Aprobado!' : 'Sigue practicando'}
          </p>
        )}

        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E8EEF5" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#28A745"
              strokeWidth="8"
              strokeDasharray={`${(pct / 100) * 264} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-atenas-ink tabular-nums">{pct}</span>
            <span className="text-xs text-atenas-muted">de {maxPuntuacion}</span>
          </div>
        </div>

        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={cn('w-7 h-7', i <= stars ? 'text-atenas-gold fill-atenas-gold' : 'text-atenas-mist-border')}
              aria-hidden
            />
          ))}
        </div>

        {tiempoSegundos != null && (
          <p className="text-sm text-atenas-muted mb-6">
            Tiempo: <strong className="text-atenas-ink">{formatTiempo(tiempoSegundos)}</strong>
          </p>
        )}

        <button type="button" onClick={onContinuar} className="btn-primary w-full">
          Continuar
        </button>
      </div>
    </div>
  );
}
