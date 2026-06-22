import { describe, it, expect } from 'vitest';
import { generarCertificadoId } from './certificadoId';

describe('generarCertificadoId', () => {
  it('genera ID con formato AT-AÑO-######', () => {
    const id = generarCertificadoId('user-abc', 'unidad-xyz');
    expect(id).toMatch(/^AT-\d{4}-\d{6}$/);
  });

  it('es determinista para el mismo usuario y unidad', () => {
    const a = generarCertificadoId('u1', 'un1');
    const b = generarCertificadoId('u1', 'un1');
    expect(a).toBe(b);
  });
});
