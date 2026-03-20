/**
 * Embebe un PNG en un SVG (archivo pesado). El proyecto usa por defecto
 * `public/favicon.svg` como **vector** dibujado a mano: no ejecutes esto salvo
 * que quieras sustituir por un logo raster.
 *
 * Uso (opcional):
 *   Coloca tu imagen en public/favicon.png y ejecuta:
 *   node scripts/embed-favicon.mjs
 *   (sobrescribe public/favicon.svg con el PNG en base64)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pngPath = path.join(root, 'public', 'favicon.png');
const svgOut = path.join(root, 'public', 'favicon.svg');

if (!fs.existsSync(pngPath)) {
  console.error('No existe public/favicon.png');
  process.exit(1);
}

const buf = fs.readFileSync(pngPath);
const w = buf.readUInt32BE(16);
const h = buf.readUInt32BE(20);
const b64 = buf.toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;
fs.writeFileSync(svgOut, svg);
console.log(`OK: favicon.svg reemplazado por PNG embebido (${w}×${h}).`);
