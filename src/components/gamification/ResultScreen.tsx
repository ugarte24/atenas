import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '../ui/cn';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { ConfettiBurst } from '../motion/ConfettiBurst';
import { MascotLottie } from '../MascotLottie';

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

const CIRCLE_LEN = 264;

export function ResultScreen({
  titulo,
  puntuacion,
  maxPuntuacion = 100,
  tiempoSegundos,
  aprobado,
  onContinuar,
  className,
}: Props) {
  const { reduceMotion, spring, stagger } = useMotionSafe();
  const pct = maxPuntuacion > 0 ? Math.round((puntuacion / maxPuntuacion) * 100) : puntuacion;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const dashTarget = (pct / 100) * CIRCLE_LEN;

  return (
    <div className={cn('max-w-md mx-auto text-center relative', className)}>
      {aprobado === true && <ConfettiBurst className="pointer-events-none absolute inset-0 overflow-hidden z-0" />}
      <motion.div
        className="relative z-10 rounded-3xl bg-white border border-atenas-mist-border shadow-elevated p-8"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: reduceMotion ? 0 : 0.05 }}
        >
          {aprobado === true ? (
            <MascotLottie variant="celebrate" loop={false} className="w-20 h-20 mx-auto" />
          ) : (
            <img src="/mascot-owl.svg" alt="" className="w-20 h-20 mx-auto" aria-hidden />
          )}
        </motion.div>
        <h2 className="text-xl font-bold text-atenas-ink mb-1">{titulo}</h2>
        {aprobado != null && (
          <p className={cn('text-sm font-semibold mb-4', aprobado ? 'text-atenas-success' : 'text-orange-600')}>
            {aprobado ? '¡Aprobado!' : 'Sigue practicando'}
          </p>
        )}

        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E8EEF5" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#28A745"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_LEN}
              initial={{ strokeDashoffset: reduceMotion ? CIRCLE_LEN - dashTarget : CIRCLE_LEN }}
              animate={{ strokeDashoffset: CIRCLE_LEN - dashTarget }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-atenas-ink tabular-nums">{pct}</span>
            <span className="text-xs text-atenas-muted">de {maxPuntuacion}</span>
          </div>
        </div>

        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                ...spring,
                delay: reduceMotion ? 0 : 0.35 + (i - 1) * stagger,
              }}
            >
              <Star
                className={cn('w-7 h-7', i <= stars ? 'text-atenas-gold fill-atenas-gold' : 'text-atenas-mist-border')}
                aria-hidden
              />
            </motion.span>
          ))}
        </div>

        {tiempoSegundos != null && (
          <p className="text-sm text-atenas-muted mb-6">
            Tiempo: <strong className="text-atenas-ink">{formatTiempo(tiempoSegundos)}</strong>
          </p>
        )}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.55 }}
        >
          <button type="button" onClick={onContinuar} className="btn-primary w-full">
            Continuar
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
