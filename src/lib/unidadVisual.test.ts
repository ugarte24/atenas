import { describe, it, expect } from 'vitest';
import { getVideoEmbedInfo } from './unidadVisual';

describe('getVideoEmbedInfo', () => {
  it('convierte YouTube watch en iframe embed', () => {
    const info = getVideoEmbedInfo('https://www.youtube.com/watch?v=th79sDCAh0Q');
    expect(info?.kind).toBe('iframe');
    expect(info?.src).toBe('https://www.youtube.com/embed/th79sDCAh0Q');
  });

  it('acepta URL directa mp4', () => {
    const info = getVideoEmbedInfo('https://example.com/clase.mp4');
    expect(info?.kind).toBe('video');
    expect(info?.src).toContain('.mp4');
  });
});
