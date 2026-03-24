/**
 * Genera src/assets/lottie/splash-favicon.json a partir de public/favicon.png.
 * Imagen embebida (reducida) para que Lottie funcione sin rutas de assets externas.
 * Ejecutar tras cambiar el favicon: node scripts/generate-splash-lottie.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPng = path.join(root, 'public', 'favicon.png');
const outDir = path.join(root, 'src', 'assets', 'lottie');
const outJson = path.join(outDir, 'splash-favicon.json');

const ICON = 200;
const COMP = 220;

const buf = await sharp(srcPng)
  .resize(ICON, ICON, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toBuffer();

const b64 = buf.toString('base64');
const dataUri = `data:image/png;base64,${b64}`;

/** Keyframes de escala (latido suave), 30 fps, 3 s en bucle */
const scaleKf = [
  {
    i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
    o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
    t: 0,
    s: [96, 96, 100],
  },
  {
    i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
    o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
    t: 45,
    s: [104, 104, 100],
  },
  {
    t: 90,
    s: [96, 96, 100],
  },
];

const animation = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 90,
  w: COMP,
  h: COMP,
  nm: 'SplashFavicon',
  ddd: 0,
  assets: [
    {
      id: 'image_0',
      w: ICON,
      h: ICON,
      u: '',
      p: dataUri,
      e: 1,
    },
  ],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 2,
      nm: 'favicon',
      refId: 'image_0',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [COMP / 2, COMP / 2, 0] },
        a: { a: 0, k: [ICON / 2, ICON / 2, 0] },
        s: { a: 1, k: scaleKf },
      },
      ao: 0,
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
  ],
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(animation), 'utf8');
console.log('OK:', path.relative(root, outJson), `(${Math.round(fs.statSync(outJson).size / 1024)} KB)`);
