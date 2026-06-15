import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost:
    'inline-flex items-center justify-center font-semibold text-atenas-ink hover:bg-atenas-mist rounded-xl transition-colors min-h-touch px-4 py-2',
  gold: 'btn-atenas-gold',
  danger:
    'inline-flex items-center justify-center font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-colors min-h-touch px-4 py-2',
};

const sizeClass: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 min-h-[40px]',
  md: 'text-base',
  lg: 'text-lg px-8 py-3.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        variantClass[variant],
        size !== 'md' && sizeClass[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
