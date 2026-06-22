import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export { Select } from './Select';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
};

export function Input({ label, hint, error, icon, className, id, required, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={cn('label', required && 'label-required')}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-atenas-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          className={cn(
            'input-field',
            icon ? 'pl-11' : undefined,
            error ? 'border-red-400' : undefined,
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  rows = 4,
  required,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={cn('label', required && 'label-required')}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={cn(
          'input-field input-field--textarea font-sans',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
