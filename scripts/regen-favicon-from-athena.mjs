/**
 * Regenera public/favicon.png desde el JPEG de referencia (cabeza Atenea).
 * Fuente: public/athena-favicon-source.jpg
 * Uso: node scripts/regen-favicon-from-athena.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'public', 'athena-favicon-source.jpg');
const out = path.join(root, 'public', 'favicon.png');

if (!fs.existsSync(src)) {
  console.error('Falta:', src);
  process.exit(1);
}

execSync(
  `npx --yes sharp-cli --input "${src}" --output "${out}" resize 512 512 --fit cover`,
  { stdio: 'inherit', cwd: root }
);
execSync('node scripts/embed-favicon-png-in-svg.mjs', { stdio: 'inherit', cwd: root });
console.log('OK: favicon.png + favicon.svg (PNG embebido).');
