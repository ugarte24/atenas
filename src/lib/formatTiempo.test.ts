import { describe, it, expect } from 'vitest';
import { formatTiempoEstudio, formatTiempoCertificado } from './formatTiempo';

describe('formatTiempoEstudio', () => {
  it('formatea cero segundos', () => {
    expect(formatTiempoEstudio(0)).toBe('0 min');
  });

  it('formatea minutos', () => {
    expect(formatTiempoEstudio(120)).toBe('2 min');
  });

  it('formatea horas y minutos', () => {
    expect(formatTiempoEstudio(3660)).toBe('1h 1m');
  });

  it('formatea solo horas', () => {
    expect(formatTiempoEstudio(7200)).toBe('2h');
  });

  it('formatea menos de un minuto', () => {
    expect(formatTiempoEstudio(45)).toBe('< 1 min');
  });
});

describe('formatTiempoCertificado', () => {
  it('oculta tiempo cero (columna no se muestra en certificado)', () => {
    expect(formatTiempoCertificado(0)).toBe('—');
  });

  it('muestra menos de un minuto cuando hay tiempo registrado', () => {
    expect(formatTiempoCertificado(45)).toBe('< 1 min');
    expect(formatTiempoCertificado(1)).toBe('< 1 min');
  });

  it('formatea horas para certificado', () => {
    expect(formatTiempoCertificado(7200)).toBe('2 horas');
    expect(formatTiempoCertificado(3600)).toBe('1 hora');
    expect(formatTiempoCertificado(120)).toBe('2 min');
  });
});
