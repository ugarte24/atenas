import { Children, Fragment, isValidElement, type ReactNode } from 'react';

export type FieldPickerOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

/** Extrae opciones de hijos `<option>` (compatible con API de Select). */
export function parseSelectOptions(children: ReactNode): FieldPickerOption[] {
  const options: FieldPickerOption[] = [];

  function walk(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        walk((child.props as { children?: ReactNode }).children);
        return;
      }
      if (child.type !== 'option') return;
      const props = child.props as {
        value?: string | number | readonly string[];
        children?: ReactNode;
        disabled?: boolean;
      };
      const raw = props.value;
      const value =
        raw == null ? '' : Array.isArray(raw) ? String(raw[0] ?? '') : String(raw);
      options.push({
        value,
        label: props.children ?? '',
        disabled: props.disabled,
      });
    });
  }

  walk(children);
  return options;
}
