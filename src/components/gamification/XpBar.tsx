import { motion } from 'framer-motion';
import { cn } from '../ui/cn';
import { useMotionSafe } from '../../hooks/useMotionSafe';

type Props = {
  value: number;
  max?: number;
  label?: string;
  showValues?: boolean;
  xpCurrent?: number;
  xpTotal?: number | null;
  size?: 'sm' | 'md';
  variant?: 'on-dark' | 'on-light';
  className?: string;
};

export function XpBar({
  value,
  max = 100,
  label,
  showValues,
  xpCurrent,
  xpTotal,
  size = 'md',
  variant = 'on-dark',
  className,
}: Props) {
  const { reduceMotion } = useMotionSafe();
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const h = size === 'sm' ? 'h-2' : 'h-2.5';
  const onDark = variant === 'on-dark';

  return (
    <div className={cn('w-full', className)}>
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-1 gap-2">
          {label && (
            <span
              className={cn(
                'text-[10px] uppercase tracking-wide font-medium',
                onDark ? 'text-white/80' : 'text-atenas-muted-strong'
              )}
            >
              {label}
            </span>
          )}
          {showValues && xpCurrent != null && (
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums',
                onDark ? 'text-atenas-gold' : 'text-atenas-ink'
              )}
            >
              {xpCurrent.toLocaleString('es')}
              {xpTotal != null ? ` / ${xpTotal.toLocaleString('es')} XP` : ' XP'}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          h,
          onDark ? 'bg-white/20' : 'bg-atenas-mist'
        )}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-atenas-gold to-amber-400"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
