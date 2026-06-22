import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { nombreUnidadSinOrden } from '../../lib/unidadTitulo';
import type { Unidad } from '../../types';
import { FieldPicker } from './FieldPicker';
import type { FieldPickerOption } from './fieldPickerOptions';

type Props = {
  unidades: Unidad[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
  'aria-labelledby'?: string;
  placeholder?: string;
  className?: string;
};

function numeroUnidad(orden: number, index: number): number {
  return typeof orden === 'number' && orden > 0 ? orden : index + 1;
}

export function UnidadPicker({
  unidades,
  value,
  onChange,
  id,
  'aria-labelledby': labelledBy,
  placeholder = 'Todas las unidades',
  className,
}: Props) {
  const options = useMemo<FieldPickerOption[]>(() => {
    const items: FieldPickerOption[] = [
      { value: '', label: 'Todas las unidades' },
      ...unidades.map((u) => ({
        value: u.id,
        label: nombreUnidadSinOrden(u.title),
      })),
    ];
    return items;
  }, [unidades]);

  const selectedIndex = unidades.findIndex((u) => u.id === value);
  const selected = selectedIndex >= 0 ? unidades[selectedIndex] : null;

  return (
    <FieldPicker
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      aria-labelledby={labelledBy}
      menuAriaLabel="Unidades"
      className={className}
      renderTriggerValue={() =>
        selected ? (
          <>
            <span className="field-picker__badge" aria-hidden>
              {numeroUnidad(selected.orden ?? 0, selectedIndex)}
            </span>
            <span className="field-picker__trigger-text truncate">
              {nombreUnidadSinOrden(selected.title)}
            </span>
          </>
        ) : (
          <span className="field-picker__placeholder truncate">{placeholder}</span>
        )
      }
      renderOption={(option, isSelected) => {
        if (option.value === '') {
          return (
            <>
              <span className="field-picker__option-all">{option.label}</span>
              {isSelected && <Check className="field-picker__check" aria-hidden />}
            </>
          );
        }
        const index = unidades.findIndex((u) => u.id === option.value);
        const u = unidades[index];
        if (!u) return option.label;
        return (
          <>
            <span className="field-picker__badge" aria-hidden>
              {numeroUnidad(u.orden ?? 0, index)}
            </span>
            <span className="field-picker__option-text">{option.label}</span>
            {isSelected && <Check className="field-picker__check" aria-hidden />}
          </>
        );
      }}
    />
  );
}
