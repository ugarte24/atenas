import { describe, it, expect } from 'vitest';
import { tituloUnidadConOrden, tituloUnidadFiltro, nombreUnidadSinOrden } from './unidadTitulo';

describe('tituloUnidadConOrden', () => {
  it('prefija el orden cuando el título no lo incluye', () => {
    expect(tituloUnidadConOrden(3, 'Organización política', 2)).toBe('Unidad 3 · Organización política');
  });

  it('no duplica el orden si ya está en el título', () => {
    expect(tituloUnidadConOrden(2, 'Unidad 2 · Europa en el mapa', 1)).toBe('Unidad 2 · Europa en el mapa');
  });
});

describe('nombreUnidadSinOrden', () => {
  it('quita el prefijo Unidad N', () => {
    expect(nombreUnidadSinOrden('Unidad 2 · Europa en el mapa')).toBe('Europa en el mapa');
  });
});

describe('tituloUnidadFiltro', () => {
  it('acorta el subtítulo para desplegables', () => {
    const largo = 'El planeta Tierra y su representación cartográfica detallada';
    expect(tituloUnidadFiltro(1, largo, 0, 28)).toBe('Unidad 1 — El planeta Tierra y su repr…');
  });
});
