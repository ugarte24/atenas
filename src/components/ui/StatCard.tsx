import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, hint, icon, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card flex flex-col gap-1 min-h-[88px]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-atenas-muted-strong">{label}</span>
        {icon && <span className="text-atenas-gold shrink-0">{icon}</span>}
      </div>
      <span className="text-2xl font-bold text-atenas-ink tabular-nums leading-none">{value}</span>
      {hint && <span className="text-xs text-atenas-muted">{hint}</span>}
    </div>
  );
}
