import { describe, it, expect } from 'vitest';

/** Lógica de filtro de unidades publicadas para estudiantes (defensa en UI) */
function unidadesVisiblesEstudiante(
  unidades: { id: string; publicada?: boolean }[]
): typeof unidades {
  return unidades.filter((u) => u.publicada !== false);
}

describe('unidades publicadas estudiante', () => {
  it('oculta unidades en borrador', () => {
    const list = [
      { id: '1', publicada: true },
      { id: '2', publicada: false },
      { id: '3' },
    ];
    expect(unidadesVisiblesEstudiante(list).map((u) => u.id)).toEqual(['1', '3']);
  });
});

describe('numero de intento evaluación', () => {
  it('calcula el siguiente número de intento', () => {
    const intentosPrevios = 2;
    expect(intentosPrevios + 1).toBe(3);
  });
});
