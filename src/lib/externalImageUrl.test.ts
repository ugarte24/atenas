import { describe, it, expect } from 'vitest';
import { normalizeExternalImageUrl, normalizeHtmlExternalImages } from './externalImageUrl';

describe('normalizeExternalImageUrl', () => {
  it('corrige 640px a 960px (tamaño estándar Wikimedia)', () => {
    const bad =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg';
    expect(normalizeExternalImageUrl(bad)).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/960px-The_Earth_seen_from_Apollo_17.jpg'
    );
  });

  it('deja intactos tamaños ya estándar', () => {
    const ok =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg';
    expect(normalizeExternalImageUrl(ok)).toBe(ok);
  });

  it('no altera URLs que no son Wikimedia', () => {
    const unsplash = 'https://images.unsplash.com/photo-123?w=640';
    expect(normalizeExternalImageUrl(unsplash)).toBe(unsplash);
  });
});

describe('normalizeHtmlExternalImages', () => {
  it('reescribe src en etiquetas img', () => {
    const html =
      '<p>Hola</p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg" alt="Tierra">';
    const out = normalizeHtmlExternalImages(html);
    expect(out).toContain('/960px-The_Earth_seen_from_Apollo_17.jpg');
    expect(out).not.toContain('/640px-');
  });
});
