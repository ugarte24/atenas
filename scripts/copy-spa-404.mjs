/**
 * GitHub Pages: sirve 404.html para rutas del SPA al recargar (mismo contenido que index).
 * Ejecuta tras `vite build`: `node scripts/copy-spa-404.mjs`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const index = path.join(dist, 'index.html');
const out = path.join(dist, '404.html');

if (fs.existsSync(index)) {
  fs.copyFileSync(index, out);
  console.log('OK: dist/404.html (copia de index.html para SPA en GitHub Pages)');
} else {
  console.warn('No existe dist/index.html; ejecuta vite build antes.');
  process.exitCode = 1;
}
