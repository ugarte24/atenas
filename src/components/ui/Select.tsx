import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Padding y altura reducidos (el ancho sigue siendo 100% del contenedor). */
  compact?: boolean;
  /** Ancho del bloque (contenedor + flecha). Por defecto ocupa el ancho disponible. */
  className?: string;
};

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  required,
  compact,
  inline,
  ...props
}: Props & { inline?: boolean }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const isCompact = compact ?? inline;

  return (
    <div className={cn('w-full min-w-0', className)}>
      {label && (
        <label htmlFor={inputId} className={cn('label', required && 'label-required')}>
          {label}
        </label>
      )}
      <div className="select-wrap w-full min-w-0">
        <select
          id={inputId}
          required={required}
          className={cn(
            'input-field w-full min-w-0',
            isCompact && 'input-field--inline',
            error && 'border-red-400'
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="select-wrap__chevron" aria-hidden />
      </div>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
