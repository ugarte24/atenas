/**
 * Genera overlays PNG de nodos/ruta sobre WebP para calibrar posiciones.
 * Ejecutar: npm run adventure:calibrate
 */
import sharp from 'sharp';

const layouts = [
  {
    name: 'convivencia',
    file: 'public/adventure/world-1-island.webp',
    pathD: 'M 288 372 Q 228 438 152 510 Q 178 582 200 657 Q 252 692 304 715',
    nodes: [
      ['U1', 288, 372],
      ['U2', 152, 510],
      ['CP', 200, 657],
      ['CH', 304, 715],
    ],
  },
  {
    name: 'territorio',
    file: 'public/adventure/world-2-island.webp',
    pathD:
      'M 82 468 Q 98 532 118 598 Q 138 668 162 732 Q 184 738 206 742 Q 248 752 286 758',
    nodes: [
      ['U3', 82, 468],
      ['U4', 118, 598],
      ['U5', 162, 732],
      ['CP', 206, 742],
      ['CH', 286, 758],
    ],
  },
  {
    name: 'historia',
    file: 'public/adventure/world-3-island.webp',
    pathD: 'M 175 462 Q 170 525 172 590 Q 182 708 198 828',
    nodes: [
      ['U6', 175, 462],
      ['U7', 172, 590],
      ['CH', 198, 828],
    ],
  },
];

for (const l of layouts) {
  const nodeMarkup = l.nodes
    .map(
      ([id, x, y]) =>
        `<circle cx="${x}" cy="${y}" r="14" fill="rgba(255,0,0,0.35)" stroke="red" stroke-width="3"/>` +
        `<text x="${x}" y="${y - 18}" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif" stroke="black" stroke-width="1">${id}</text>`
    )
    .join('');
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1960">
      <g transform="scale(2)">
        <path d="${l.pathD}" fill="none" stroke="lime" stroke-width="3" stroke-dasharray="10 8"/>
        ${nodeMarkup}
      </g>
    </svg>`
  );
  await sharp(l.file)
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toFile(`scripts/adventure/debug-${l.name}-nodes.png`);
  console.log(`OK: scripts/adventure/debug-${l.name}-nodes.png`);
}
