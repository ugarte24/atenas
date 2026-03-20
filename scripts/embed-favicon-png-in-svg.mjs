/**
 * Escribe public/favicon.svg con el PNG embebido en base64.
 * Los navegadores no suelen cargar <image href="/favicon.png"> en favicons SVG.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pngPath = path.join(root, 'public', 'favicon.png');
const svgPath = path.join(root, 'public', 'favicon.svg');

const buf = fs.readFileSync(pngPath);
const b64 = buf.toString('base64');
// Zoom desde el centro: la figura ocupa casi todo el cuadro (recorta algo de negro periférico).
const ZOOM = 1.32;
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" overflow="hidden" role="img" aria-label="ATENAS">
  <title>ATENAS</title>
  <g transform="translate(256 256) scale(${ZOOM}) translate(-256 -256)">
    <image width="512" height="512" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${b64}"/>
  </g>
</svg>`;
fs.writeFileSync(svgPath, svg);
console.log('OK: favicon.svg', Math.round(svg.length / 1024), 'KB (aprox)');
