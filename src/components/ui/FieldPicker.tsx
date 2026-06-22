import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { FieldPickerOption } from './fieldPickerOptions';
import { cn } from './cn';

export type FieldPickerProps = {
  value: string;
  onChange: (value: string) => void;
  options: FieldPickerOption[];
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  menuAriaLabel?: string;
  renderTriggerValue?: (selected: FieldPickerOption | null) => ReactNode;
  renderOption?: (option: FieldPickerOption, selected: boolean) => ReactNode;
};

function defaultPlaceholder(options: FieldPickerOption[]): string {
  const empty = options.find((o) => o.value === '');
  if (empty && typeof empty.label === 'string') return empty.label;
  return 'Seleccionar…';
}

export function FieldPicker({
  value,
  onChange,
  options,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  placeholder,
  disabled,
  compact,
  className,
  menuAriaLabel = 'Opciones',
  renderTriggerValue,
  renderOption,
}: FieldPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder(options);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(next: string, optionDisabled?: boolean) {
    if (optionDisabled || disabled) return;
    onChange(next);
    setOpen(false);
  }

  const triggerContent =
    renderTriggerValue?.(selected) ??
    (selected ? (
      <span className="field-picker__trigger-text truncate">{selected.label}</span>
    ) : (
      <span className="field-picker__placeholder truncate">{resolvedPlaceholder}</span>
    ));

  return (
    <div ref={rootRef} className={cn('field-picker', compact && 'field-picker--compact', className)}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        className="field-picker__trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        {triggerContent}
        <ChevronDown
          className={cn('field-picker__chevron', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <ul id={listId} role="listbox" className="field-picker__menu" aria-label={menuAriaLabel}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || '__empty'} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={cn(
                    'field-picker__option',
                    isSelected && 'field-picker__option--selected',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => pick(option.value, option.disabled)}
                >
                  {renderOption?.(option, isSelected) ?? (
                    <>
                      <span className="field-picker__option-text">{option.label}</span>
                      {isSelected && <Check className="field-picker__check" aria-hidden />}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
