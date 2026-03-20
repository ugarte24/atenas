/**
 * Prepara el icono Atenea desde public/favicon.png (deja tu arte final ahí).
 *
 * - Escala a 512×512 con "contain", centrado, relleno #1F2D2A.
 * - Quita píxeles casi blancos por si quedan artefactos de exportación.
 *
 * Uso: npm run prepare-athena-icon
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public', 'favicon.png');
const outs = [
  path.join(root, 'public', 'favicon.png'),
  path.join(root, 'public', 'logo-athena.png'),
];

const INK = { r: 31, g: 45, b: 42 };
const SIZE = 512;

async function main() {
  if (!fs.existsSync(src)) {
    console.error('Falta', src);
    process.exit(1);
  }

  let { data, info } = await sharp(src)
    .ensureAlpha()
    .resize(SIZE, SIZE, {
      fit: 'contain',
      position: 'centre',
      background: { r: INK.r, g: INK.g, b: INK.b, alpha: 1 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);
  const ch = info.channels;

  for (let j = 0; j < data.length; j += ch) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    // Solo basura casi blanca
    if (r > 245 && g > 245 && b > 245) {
      buf[j] = INK.r;
      buf[j + 1] = INK.g;
      buf[j + 2] = INK.b;
      buf[j + 3] = 255;
    }
  }

  const png = await sharp(buf, { raw: { width: w, height: h, channels: ch } })
    .png()
    .toBuffer();

  for (const p of outs) fs.writeFileSync(p, png);
  console.log('OK:', SIZE, '×', SIZE, '→ favicon.png + logo-athena.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
