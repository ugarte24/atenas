/**
 * Recorta el rostro de Atenea desde logo-athena.png con fondo transparente.
 * Uso: node scripts/make-athena-face-png.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public', 'logo-athena.png');
const out = path.join(root, 'public', 'logo-athena-face.png');

const INK = { r: 31, g: 45, b: 42 };
const TOLERANCE = 55;

async function main() {
  if (!fs.existsSync(src)) {
    console.error('Falta', src);
    process.exit(1);
  }

  const meta = await sharp(src).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;

  const cropW = Math.round(w * 0.58);
  const cropH = Math.round(h * 0.52);
  const left = Math.round((w - cropW) / 2);
  const top = Math.max(0, Math.round(h * 0.0));

  let { data, info } = await sharp(src)
    .extract({ left, top, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  const ch = info.channels;

  for (let j = 0; j < data.length; j += ch) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    const dr = Math.abs(r - INK.r);
    const dg = Math.abs(g - INK.g);
    const db = Math.abs(b - INK.b);
    if (dr <= TOLERANCE && dg <= TOLERANCE && db <= TOLERANCE) {
      buf[j + 3] = 0;
    }
    // Verde u oliva de fondo
    if (g > r + 12 && g > b + 12 && g > 60) {
      buf[j + 3] = 0;
    }
    // Gris oscuro uniforme del lienzo
    if (r < 70 && g < 90 && b < 90 && Math.max(r, g, b) - Math.min(r, g, b) < 25) {
      buf[j + 3] = 0;
    }
  }

  const png = await sharp(buf, { raw: { width: info.width, height: info.height, channels: ch } })
    .trim({ threshold: 12 })
    .png()
    .toBuffer();

  fs.writeFileSync(out, png);
  console.log('OK →', out, `(${info.width}×${info.height})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
