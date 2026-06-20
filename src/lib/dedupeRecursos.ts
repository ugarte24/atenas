import type { Recurso } from '../types';
import { normalizeExternalImageUrl } from './externalImageUrl';

/** Clave estable para detectar recursos duplicados (p. ej. mismo seed piloto + demo). */
export function recursoDedupeKey(r: Recurso): string {
  const title = (r.title ?? '').trim().toLowerCase();
  if (r.tipo === 'texto') {
    return `texto:${title}:${(r.contenido ?? '').trim()}`;
  }
  const url = normalizeExternalImageUrl(r.url).trim().toLowerCase();
  if (url) return `${r.tipo}:${url}`;
  return `${r.tipo}:${title}:${r.id}`;
}

/** Conserva el primero de cada grupo (orden de entrada = created_at asc). */
export function dedupeRecursos(recursos: Recurso[]): Recurso[] {
  const seen = new Set<string>();
  const out: Recurso[] = [];
  for (const r of recursos) {
    const key = recursoDedupeKey(r);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}
