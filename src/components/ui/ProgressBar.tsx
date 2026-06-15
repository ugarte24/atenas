import { cn } from './cn';

type Props = {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'blue' | 'gold' | 'ink';
  className?: string;
};

const heightClass = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
const fillClass = {
  blue: 'bg-atenas-blue',
  gold: 'bg-atenas-gold',
  ink: 'bg-atenas-ink',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent,
  size = 'md',
  tone = 'blue',
  className,
}: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 gap-2">
          {label && <span className="text-xs font-medium text-atenas-muted-strong">{label}</span>}
          {showPercent && (
            <span className="text-xs font-semibold tabular-nums text-atenas-ink">{pct}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-atenas-mist ring-1 ring-atenas-mist-border/50',
          heightClass[size]
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillClass[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
