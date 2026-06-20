import { describe, it, expect } from 'vitest';
import { tituloUnidadConOrden } from './unidadTitulo';

describe('tituloUnidadConOrden', () => {
  it('prefija el orden cuando el título no lo incluye', () => {
    expect(tituloUnidadConOrden(3, 'Organización política', 2)).toBe('Unidad 3 · Organización política');
  });

  it('no duplica el orden si ya está en el título', () => {
    expect(tituloUnidadConOrden(2, 'Unidad 2 · Europa en el mapa', 1)).toBe('Unidad 2 · Europa en el mapa');
  });
});
