/**
 * Genera public/favicon.svg con el PNG embebido (cuadrado 512, sin recorte circular).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pngPath = path.join(root, 'public', 'favicon.png');
const svgPath = path.join(root, 'public', 'favicon.svg');

const BG = '#1F2D2A';
const buf = fs.readFileSync(pngPath);
const b64 = buf.toString('base64');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="ATENAS" style="background-color:${BG}">
  <title>ATENAS</title>
  <rect width="512" height="512" fill="${BG}"/>
  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;

fs.writeFileSync(svgPath, svg);
console.log('OK: favicon.svg', Math.round(svg.length / 1024), 'KB (aprox)');
