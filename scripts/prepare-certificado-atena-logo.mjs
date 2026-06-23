/**
 * Quita el fondo negro de logo-certificado-atena.png (solo certificado).
 * Uso: node scripts/prepare-certificado-atena-logo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'public', 'logo-certificado-atena.png');

const BLACK_MAX = 42;

async function main() {
  if (!fs.existsSync(file)) {
    console.error('Falta', file);
    process.exit(1);
  }

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  const ch = info.channels;

  for (let j = 0; j < data.length; j += ch) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    if (r <= BLACK_MAX && g <= BLACK_MAX && b <= BLACK_MAX) {
      buf[j + 3] = 0;
    }
  }

  const out = await sharp(buf, { raw: { width: info.width, height: info.height, channels: ch } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  const tmp = file + '.tmp.png';
  fs.writeFileSync(tmp, out);
  fs.renameSync(tmp, file);
  const meta = await sharp(file).metadata();
  console.log('OK →', file, `(${meta.width}×${meta.height}, alpha: ${meta.hasAlpha})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
