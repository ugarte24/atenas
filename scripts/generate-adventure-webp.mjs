/**
 * Genera WebP del Adventure Map.
 * PNG pintado → WebP 800×1960 (viewBox 400×980 @2x).
 * Si el PNG ya tiene ratio ~400:980 usa fill; si es apaisado, cover con crop por mundo.
 * Ejecutar: npm run adventure:assets | npm run adventure:calibrate
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgDir = path.join(root, 'public', 'adventure', 'svg');
const outDir = path.join(root, 'public', 'adventure');

const SCENE_W = 400;
const SCENE_H = 980;
const SCALE = 2;

const chestSpriteSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 128" width="384" height="128">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>
  <!-- Frame 0: cerrado -->
  <g transform="translate(64 72)">
    <ellipse cx="0" cy="14" rx="18" ry="5" fill="#000" opacity="0.2"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 20 14 L -20 14 Z" fill="#92400e"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 0 16 Z" fill="#b45309"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 0 10 Z" fill="url(#cg)"/>
    <rect x="-20" y="8" width="40" height="4" fill="#ca8a04"/>
    <rect x="-3" y="2" width="6" height="8" rx="1" fill="#fbbf24"/>
  </g>
  <!-- Frame 1: abriendo -->
  <g transform="translate(192 72)">
    <ellipse cx="0" cy="14" rx="18" ry="5" fill="#000" opacity="0.2"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 20 14 L -20 14 Z" fill="#92400e"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 0 16 Z" fill="#b45309"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 20 -2 L 0 -14 L -20 -2 Z" fill="#f59e0b"/>
    <rect x="-20" y="8" width="40" height="4" fill="#ca8a04"/>
    <rect x="-3" y="2" width="6" height="8" rx="1" fill="#fbbf24"/>
    <circle cx="0" cy="-6" r="4" fill="#fef08a" opacity="0.8"/>
  </g>
  <!-- Frame 2: abierto -->
  <g transform="translate(320 72)">
    <ellipse cx="0" cy="14" rx="18" ry="5" fill="#000" opacity="0.2"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 20 14 L -20 14 Z" fill="#92400e"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 0 16 Z" fill="#b45309"/>
    <path d="M -20 4 L 0 -8 L 20 4 L 20 -2 L 0 -18 L -20 -2 Z" fill="#fbbf24"/>
    <rect x="-20" y="8" width="40" height="4" fill="#ca8a04"/>
    <circle cx="-6" cy="0" r="3" fill="#fde047"/>
    <circle cx="4" cy="2" r="2.5" fill="#fde047"/>
    <circle cx="0" cy="-4" r="2" fill="#fef08a"/>
  </g>
</svg>`;

function worldIslandSvg(worldId) {
  const oceans = {
    1: ['#0ea5e9', '#0369a1'],
    2: ['#38bdf8', '#0369a1'],
    3: ['#f97316', '#7c2d12'],
  };
  const [o1, o2] = oceans[worldId];
  const extras = {
    1: `<ellipse cx="110" cy="480" rx="55" ry="22" fill="#22c55e" opacity="0.6"/>
        <ellipse cx="290" cy="460" rx="48" ry="20" fill="#16a34a" opacity="0.55"/>
        <ellipse cx="250" cy="560" rx="38" ry="18" fill="#0891b2" opacity="0.85"/>
        <rect x="241" y="374" width="28" height="16" fill="#d6b88a" stroke="#92400e"/>
        <path d="M 238 376 L 255 362 L 272 376 Z" fill="#c2410c"/>`,
    2: `<path d="M 240 420 L 310 280 L 360 380 L 340 450 L 260 460 Z" fill="#64748b"/>
        <path d="M 200 380 Q 195 520 190 640 Q 180 690 200 730" stroke="#0284c7" stroke-width="16" fill="none"/>
        <rect x="258" y="310" width="24" height="18" fill="#d6b88a"/>`,
    3: `<path d="M 0 680 L 30 520 L 150 450 L 320 470 L 400 580 L 400 680 Z" fill="#92400e"/>
        <rect x="300" y="380" width="20" height="55" fill="#f5f5f4"/>
        <path d="M 288 380 L 310 366 L 332 380 Z" fill="#ef4444"/>
        <rect x="235" y="300" width="12" height="40" fill="#d6d3d1"/>`,
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}" width="${SCENE_W}" height="${SCENE_H}">
  <defs>
    <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${o1}"/>
      <stop offset="100%" stop-color="${o2}"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>
  <rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#ocean)" opacity="0"/>
  <rect x="0" y="680" width="${SCENE_W}" height="300" fill="url(#ocean)"/>
  <ellipse cx="200" cy="720" rx="175" ry="22" fill="#002d62" opacity="0.2"/>
  <path d="M 12 680 C 20 580 60 480 120 420 C 180 360 260 350 320 400 C 370 440 395 520 388 620 C 382 680 340 730 280 760 C 220 790 140 790 80 760 C 40 740 12 710 12 680 Z" fill="url(#sand)" stroke="#ca8a04" stroke-width="2"/>
  <path d="M 28 660 C 35 560 72 470 130 420 C 188 370 268 365 318 410 C 358 445 375 530 368 610 C 362 660 328 700 268 720 C 208 740 128 735 78 710 C 48 695 28 675 28 660 Z" fill="url(#grass)" stroke="#166534" stroke-width="2"/>
  ${extras[worldId]}
</svg>`;
}

function worldFarSvg(worldId) {
  const paths = {
    1: 'M 0 380 L 60 320 L 140 350 L 220 300 L 300 340 L 400 310 L 400 420 L 0 420 Z',
    2: 'M 0 320 L 80 180 L 160 260 L 240 140 L 320 220 L 400 160 L 400 380 L 0 380 Z',
    3: 'M 0 300 L 100 200 L 200 280 L 300 180 L 400 240 L 400 360 L 0 360 Z',
  };
  const fills = { 1: '#047857', 2: '#64748b', 3: '#7c2d12' };
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}">
  <path d="${paths[worldId]}" fill="${fills[worldId]}" opacity="0.35"/>
</svg>`;
}

function worldFgSvg(worldId) {
  const content = {
    1: `<g transform="translate(340 620)"><rect x="-2" y="0" width="4" height="24" fill="#78350f"/><path d="M 0 0 Q -16 6 -14 18 Q -7 9 0 0" fill="#166534"/></g>
        <g transform="translate(55 640)"><rect x="-2" y="0" width="4" height="24" fill="#78350f"/><path d="M 0 0 Q 16 6 14 18 Q 7 9 0 0" fill="#15803d"/></g>`,
    2: `<g transform="translate(70 520)"><rect x="-2" y="8" width="4" height="14" fill="#78350f"/><path d="M 0 -8 L -14 10 L 14 10 Z" fill="#15803d"/></g>`,
    3: `<g transform="translate(60 620) scale(0.75)"><rect x="-2" y="0" width="4" height="24" fill="#78350f"/></g>`,
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}">
  ${content[worldId]}
</svg>`;
}

const convivenciaPremiumSvg = path.join(__dirname, 'adventure', 'convivencia-island.svg');
const paintedWorldPng = {
  1: path.join(__dirname, 'adventure', 'convivencia-island-painted.png'),
  2: path.join(__dirname, 'adventure', 'territorio-island-painted.png'),
  3: path.join(__dirname, 'adventure', 'historia-island-painted.png'),
};

const PAINTED_CROP_POSITION = {
  1: 'centre',
  2: 'centre',
  3: 'centre',
};

async function paintedPngToWebp(pngPath, outPath, worldId) {
  const meta = await sharp(pngPath).metadata();
  const targetW = SCENE_W * SCALE;
  const targetH = SCENE_H * SCALE;
  const targetRatio = targetW / targetH;
  const sourceRatio = meta.width / meta.height;

  let pipeline = sharp(pngPath);
  if (Math.abs(sourceRatio - targetRatio) < 0.05) {
    pipeline = pipeline.resize(targetW, targetH, { fit: 'fill' });
  } else {
    pipeline = pipeline.resize(targetW, targetH, {
      fit: 'cover',
      position: PAINTED_CROP_POSITION[worldId] ?? 'centre',
    });
  }
  await pipeline.webp({ quality: 92, effort: 6 }).toFile(outPath);
}

async function svgToWebp(svgPath, outPath, width, height, opts = {}) {
  const { density = 144, quality = 82 } = opts;
  const svg = fs.readFileSync(svgPath);
  await sharp(svg, { density })
    .resize(width, height, { fit: 'fill' })
    .webp({ quality, effort: 4 })
    .toFile(outPath);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeSvg(name, content) {
  const p = path.join(svgDir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

ensureDir(svgDir);
ensureDir(outDir);

writeSvg('chest-sprite.svg', chestSpriteSvg);

if (fs.existsSync(paintedWorldPng[1])) {
  await paintedPngToWebp(paintedWorldPng[1], path.join(outDir, 'world-1-island.webp'), 1);
  console.log('OK: world-1-island.webp desde ilustración pintada');
} else if (fs.existsSync(convivenciaPremiumSvg)) {
  fs.copyFileSync(convivenciaPremiumSvg, path.join(svgDir, 'world-1-island.svg'));
} else {
  writeSvg('world-1-island.svg', worldIslandSvg(1));
}

for (const id of [2, 3]) {
  if (fs.existsSync(paintedWorldPng[id])) {
    await paintedPngToWebp(paintedWorldPng[id], path.join(outDir, `world-${id}-island.webp`), id);
    console.log(`OK: world-${id}-island.webp desde ilustración pintada`);
  } else {
    writeSvg(`world-${id}-island.svg`, worldIslandSvg(id));
  }
  writeSvg(`world-${id}-far.svg`, worldFarSvg(id));
  writeSvg(`world-${id}-fg.svg`, worldFgSvg(id));
}
writeSvg('world-1-far.svg', worldFarSvg(1));
writeSvg('world-1-fg.svg', worldFgSvg(1));

await svgToWebp(
  path.join(svgDir, 'chest-sprite.svg'),
  path.join(outDir, 'chest-sprite.webp'),
  128 * 3 * SCALE,
  128 * SCALE
);

for (const id of [1, 2, 3]) {
  if (fs.existsSync(paintedWorldPng[id])) continue;
  const islandOpts = id === 1 ? { density: 192, quality: 90 } : {};
  await svgToWebp(
    path.join(svgDir, `world-${id}-island.svg`),
    path.join(outDir, `world-${id}-island.webp`),
    SCENE_W * SCALE,
    SCENE_H * SCALE,
    islandOpts
  );
  await svgToWebp(
    path.join(svgDir, `world-${id}-far.svg`),
    path.join(outDir, `world-${id}-far.webp`),
    SCENE_W * SCALE,
    SCENE_H * SCALE
  );
  await svgToWebp(
    path.join(svgDir, `world-${id}-fg.svg`),
    path.join(outDir, `world-${id}-fg.webp`),
    SCENE_W * SCALE,
    SCENE_H * SCALE
  );
}

console.log('OK: Adventure Map WebP generados en public/adventure/');
