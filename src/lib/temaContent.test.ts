import { describe, expect, it } from 'vitest';
import { normalizeTemaContent, temaContentEsHtml, temaContentPreview, temaContentToPlainText } from './temaContent';

describe('temaContentPreview', () => {
  it('quita etiquetas HTML y deja texto legible', () => {
    const html =
      '<h3>La Tierra, nuestro hogar</h3> <p>La Tierra tiene forma aproximadamente esférica.</p>';
    expect(temaContentPreview(html)).toBe(
      'La Tierra, nuestro hogar\nLa Tierra tiene forma aproximadamente esférica.'
    );
  });

  it('devuelve cadena vacía si no hay contenido', () => {
    expect(temaContentPreview(null)).toBe('');
    expect(temaContentPreview('   ')).toBe('');
  });
});

describe('temaContentEsHtml', () => {
  it('detecta HTML rico', () => {
    expect(temaContentEsHtml('<h3>Título</h3>')).toBe(true);
    expect(temaContentEsHtml('Solo texto')).toBe(false);
  });
});

describe('temaContentToPlainText', () => {
  it('devuelve texto plano sin cambios', () => {
    expect(temaContentToPlainText('Hola\n\nMundo')).toBe('Hola\n\nMundo');
  });

  it('convierte HTML heredado a texto editable', () => {
    const html = '<h3>La Tierra</h3><p>Es esférica.</p>';
    expect(temaContentToPlainText(html)).toBe('La Tierra\nEs esférica.');
  });

  it('devuelve cadena vacía si no hay contenido', () => {
    expect(temaContentToPlainText(null)).toBe('');
    expect(temaContentToPlainText('   ')).toBe('');
  });
});

describe('normalizeTemaContent', () => {
  it('convierte párrafos a saltos de línea', () => {
    expect(normalizeTemaContent('<p>Uno</p><p>Dos</p>')).toBe('Uno\nDos');
  });
});
