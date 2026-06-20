import { describe, it, expect } from 'vitest';
import { dedupeRecursos } from './dedupeRecursos';
import type { Recurso } from '../types';

const base = {
  tema_id: 't1',
  created_at: '',
  updated_at: '',
};

describe('dedupeRecursos', () => {
  it('elimina imágenes duplicadas con la misma URL normalizada', () => {
    const url =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg';
    const url960 =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/960px-The_Earth_seen_from_Apollo_17.jpg';
    const recursos: Recurso[] = [
      { ...base, id: 'a', tipo: 'imagen', url: url960, title: 'La Tierra desde el espacio', contenido: null },
      { ...base, id: 'b', tipo: 'imagen', url, title: 'La Tierra desde el espacio', contenido: null },
    ];
    expect(dedupeRecursos(recursos)).toHaveLength(1);
    expect(dedupeRecursos(recursos)[0]!.id).toBe('a');
  });
});
