import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pngPath = path.join(__dirname, '../public/favicon.png');
const outPath = path.join(__dirname, '../public/favicon.svg');

const png = fs.readFileSync(pngPath);
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="ATENAS" style="background-color:#1F2D2A">
  <title>ATENAS</title>
  <rect width="512" height="512" fill="#1F2D2A"/>
  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" xlink:href="${dataUrl}" href="${dataUrl}"/>
</svg>
`;

fs.writeFileSync(outPath, svg);
console.log('OK', outPath, 'size', fs.statSync(outPath).size);
