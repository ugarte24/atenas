import { describe, it, expect } from 'vitest';
import { parseSelectOptions } from './fieldPickerOptions';

describe('parseSelectOptions', () => {
  it('extrae value y label de option hijos', () => {
    const options = parseSelectOptions(
      <>
        <option value="">Todas</option>
        <option value="a">Opción A</option>
      </>
    );
    expect(options).toEqual([
      { value: '', label: 'Todas', disabled: undefined },
      { value: 'a', label: 'Opción A', disabled: undefined },
    ]);
  });
});
