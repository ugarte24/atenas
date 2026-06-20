/**
 * Genera Lottie de celebración e idle de la mascota.
 * Ejecutar: node scripts/generate-celebrate-lottie.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mascotSvg = path.join(root, 'public', 'mascot-owl.svg');
const outDir = path.join(root, 'src', 'assets', 'lottie');

const MASCOT = 120;
const COMP = 160;

const mascotBuf = await sharp(mascotSvg)
  .resize(MASCOT, MASCOT, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const goldBuf = await sharp({
  create: { width: 24, height: 24, channels: 4, background: { r: 212, g: 168, b: 83, alpha: 255 } },
})
  .png()
  .toBuffer();

const mascotUri = `data:image/png;base64,${mascotBuf.toString('base64')}`;
const goldUri = `data:image/png;base64,${goldBuf.toString('base64')}`;

const pulseScale = [
  { t: 0, s: [96, 96, 100] },
  { t: 45, s: [104, 104, 100] },
  { t: 90, s: [96, 96, 100] },
];

function imageLayer({ ind, refId, anchor, position, scaleKf, opacityKf, ip, op }) {
  return {
    ddd: 0,
    ind,
    ty: 2,
    nm: `layer_${ind}`,
    refId,
    sr: 1,
    ks: {
      o: opacityKf ? { a: 1, k: opacityKf } : { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: position },
      a: { a: 0, k: anchor },
      s: scaleKf ? { a: 1, k: scaleKf } : { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip,
    op,
    st: 0,
    bm: 0,
  };
}

const mascotIdle = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 90,
  w: COMP,
  h: COMP,
  nm: 'MascotIdle',
  ddd: 0,
  assets: [
    { id: 'mascot', w: MASCOT, h: MASCOT, u: '', p: mascotUri, e: 1 },
  ],
  layers: [
    imageLayer({
      ind: 1,
      refId: 'mascot',
      anchor: [MASCOT / 2, MASCOT / 2, 0],
      position: [COMP / 2, COMP / 2, 0],
      scaleKf: pulseScale.map((k) => ({
        t: k.t,
        s: k.s,
        i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
        o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
      })),
      ip: 0,
      op: 90,
    }),
  ],
};

const burstParticles = [
  { x: COMP / 2 - 40, y: COMP / 2 - 30, dx: -30, dy: -40 },
  { x: COMP / 2 + 40, y: COMP / 2 - 25, dx: 35, dy: -35 },
  { x: COMP / 2 - 35, y: COMP / 2 + 35, dx: -25, dy: 30 },
  { x: COMP / 2 + 38, y: COMP / 2 + 30, dx: 28, dy: 32 },
];

const celebrateLayers = [
  imageLayer({
    ind: 1,
    refId: 'mascot',
    anchor: [MASCOT / 2, MASCOT / 2, 0],
    position: [COMP / 2, COMP / 2, 0],
    scaleKf: [
      { t: 0, s: [70, 70, 100] },
      { t: 12, s: [110, 110, 100] },
      { t: 24, s: [100, 100, 100] },
    ],
    ip: 0,
    op: 36,
  }),
  ...burstParticles.map((p, i) =>
    imageLayer({
      ind: i + 2,
      refId: 'gold',
      anchor: [12, 12, 0],
      position: [p.x, p.y, 0],
      scaleKf: [
        { t: 6, s: [40, 40, 100] },
        { t: 18, s: [100, 100, 100] },
        { t: 30, s: [60, 60, 100] },
      ],
      opacityKf: [
        { t: 6, s: [0], e: [0] },
        { t: 12, s: [100], e: [0] },
        { t: 30, s: [0], e: [0] },
      ],
      ip: 0,
      op: 36,
    })
  ),
];

const celebrateBurst = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 36,
  w: COMP,
  h: COMP,
  nm: 'CelebrateBurst',
  ddd: 0,
  assets: [
    { id: 'mascot', w: MASCOT, h: MASCOT, u: '', p: mascotUri, e: 1 },
    { id: 'gold', w: 24, h: 24, u: '', p: goldUri, e: 1 },
  ],
  layers: celebrateLayers,
};

fs.mkdirSync(outDir, { recursive: true });
const idlePath = path.join(outDir, 'mascot-idle.json');
const burstPath = path.join(outDir, 'celebrate-burst.json');
fs.writeFileSync(idlePath, JSON.stringify(mascotIdle), 'utf8');
fs.writeFileSync(burstPath, JSON.stringify(celebrateBurst), 'utf8');
console.log('OK:', path.relative(root, idlePath));
console.log('OK:', path.relative(root, burstPath));
