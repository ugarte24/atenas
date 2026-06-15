import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-atenas-mist-border bg-atenas-card p-8 sm:p-10 text-center shadow-card',
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-atenas-mist flex items-center justify-center text-atenas-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-atenas-ink">{title}</h3>
      {description && <p className="text-sm text-atenas-muted mt-2 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
