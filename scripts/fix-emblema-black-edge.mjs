/**
 * Sustituye el fondo **negro** (o casi negro) conectado al borde del PNG por el color
 * del papel del certificado (#FDFBF4), para que no se vea un cuadrado negro detrás del sello.
 *
 * Uso: `npm run fix-emblema-black`  o  `node scripts/fix-emblema-black-edge.mjs [entrada.png]`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPath = path.join(root, 'public', 'emblema-colegio-vaca-diez.png');
const outPath = path.join(root, 'public', 'emblema-colegio-vaca-diez.png');

/** Mismo tono que `--cert-paper` en certificadoPrintHtml.ts */
const PAPER = { r: 253, g: 251, b: 244 };

/** Píxel “fondo oscuro” si los tres canales son bajos (evita comerse grises del dibujo) */
const DARK_MAX = 46;

function idx4(x, y, w) {
  return (y * w + x) * 4;
}

async function main() {
  const src = path.resolve(process.argv[2] || defaultPath);
  if (!fs.existsSync(src)) {
    console.error('No existe:', src);
    process.exit(1);
  }

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  function isDarkBackground(x, y) {
    const j = idx4(x, y, w);
    const r = buf[j];
    const g = buf[j + 1];
    const b = buf[j + 2];
    return r < DARK_MAX && g < DARK_MAX && b < DARK_MAX;
  }

  const visited = new Uint8Array(w * h);
  const mark = new Uint8Array(w * h);
  const q = [];

  function tryEnqueue(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    visited[i] = 1;
    if (!isDarkBackground(x, y)) return;
    mark[i] = 1;
    q.push([x, y]);
  }

  for (let x = 0; x < w; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryEnqueue(0, y);
    tryEnqueue(w - 1, y);
  }

  while (q.length) {
    const [x, y] = q.shift();
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mark[i]) continue;
    const j = i * 4;
    buf[j] = PAPER.r;
    buf[j + 1] = PAPER.g;
    buf[j + 2] = PAPER.b;
    buf[j + 3] = 255;
    n++;
  }

  const png = await sharp(buf, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(outPath, png);
  console.log(
    'OK →',
    path.relative(root, outPath),
    `(${w}×${h}, ${n} px negro exterior → #FDFBF4)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
