import { useAppVersionLabel } from '../hooks/useAppVersionLabel';
import { cn } from './ui/cn';

type Props = {
  className?: string;
  /** Variante sobre fondo oscuro del sidebar */
  variant?: 'on-dark' | 'on-light';
};

export function AppVersionFootnote({ className, variant = 'on-dark' }: Props) {
  const label = useAppVersionLabel();

  return (
    <p
      className={cn(
        'text-[10px] text-center px-3 pt-2 pb-1 leading-snug',
        variant === 'on-dark'
          ? 'text-white/70'
          : 'text-atenas-muted',
        className
      )}
      aria-label={`Versión ${label}`}
    >
      <span className={cn(variant === 'on-dark' && 'text-atenas-gold/90 font-semibold')}>
        ATENAS
      </span>{' '}
      {label}
    </p>
  );
}
