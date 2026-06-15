import type { ReactNode } from 'react';
import { cn } from './cn';

type Tone = 'info' | 'success' | 'warning' | 'error';

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneClass: Record<Tone, string> = {
  info: 'bg-atenas-page border-atenas-mist-border text-atenas-ink',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
  warning: 'bg-amber-50 border-amber-200 text-amber-950',
  error: 'bg-red-50 border-red-200 text-red-900',
};

export function Alert({ children, tone = 'info', className }: Props) {
  return (
    <div
      role="alert"
      className={cn('rounded-xl border px-4 py-3 text-sm', toneClass[tone], className)}
    >
      {children}
    </div>
  );
}
