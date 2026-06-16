import { getAppVersionLabel } from '../constants/version';
import { cn } from './ui/cn';

type Props = {
  className?: string;
  /** Variante sobre fondo oscuro del sidebar */
  variant?: 'on-dark' | 'on-light';
};

export function AppVersionFootnote({ className, variant = 'on-dark' }: Props) {
  const label = getAppVersionLabel();

  return (
    <p
      className={cn(
        'text-[10px] text-center px-3 pt-2 leading-snug',
        variant === 'on-dark' ? 'sidebar-muted' : 'text-atenas-muted',
        className
      )}
      aria-label={`Versión ${label}`}
    >
      ATENAS {label}
    </p>
  );
}
