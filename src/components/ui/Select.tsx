import { useMemo, type ChangeEvent } from 'react';
import { cn } from './cn';
import { FieldPicker } from './FieldPicker';
import { parseSelectOptions } from './fieldPickerOptions';

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Padding y altura reducidos (el ancho sigue siendo 100% del contenedor). */
  compact?: boolean;
  /** Ancho del bloque (contenedor + flecha). Por defecto ocupa el ancho disponible. */
  className?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
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
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: Props & { inline?: boolean }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const isCompact = compact ?? inline;
  const options = useMemo(() => parseSelectOptions(children), [children]);
  const stringValue = value == null ? '' : String(value);

  function handleChange(next: string) {
    onChange?.({ target: { value: next, name: props.name } } as ChangeEvent<HTMLSelectElement>);
  }

  return (
    <div className={cn('w-full min-w-0', className)}>
      {label && (
        <label htmlFor={inputId} className={cn('label', required && 'label-required')}>
          {label}
        </label>
      )}
      <FieldPicker
        id={inputId}
        value={stringValue}
        onChange={handleChange}
        options={options}
        disabled={disabled}
        compact={isCompact}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        menuAriaLabel={ariaLabel ?? label}
        className={cn(error && 'field-picker--error')}
      />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
