/**
 * Incrementa el patch en package.json (y package-lock.json) antes de dev/build.
 * La UI lee la versión vía Vite (`__APP_VERSION__`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map((n) => Number.parseInt(n, 10));

if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error(`Versión inválida en package.json: ${pkg.version}`);
  process.exit(1);
}

parts[2] += 1;
pkg.version = parts.join('.');

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = pkg.version;
  if (lock.packages?.['']) {
    lock.packages[''].version = pkg.version;
  }
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

console.log(`Versión ATENAS actualizada: v${pkg.version}`);
