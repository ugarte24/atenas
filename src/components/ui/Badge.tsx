import type { ReactNode } from 'react';
import { cn } from './cn';

type Tone = 'default' | 'success' | 'warning' | 'muted' | 'gold';

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneClass: Record<Tone, string> = {
  default: 'bg-atenas-mist text-atenas-muted-strong border-atenas-mist-border',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  muted: 'bg-atenas-page text-atenas-muted border-atenas-mist-border',
  gold: 'bg-atenas-gold text-atenas-ink border-amber-700/30',
};

export function Badge({ children, tone = 'default', className }: Props) {
  return (
    <span className={cn('badge border', toneClass[tone], className)}>{children}</span>
  );
}
