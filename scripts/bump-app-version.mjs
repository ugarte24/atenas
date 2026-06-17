/**
 * Incrementa el patch en package.json (y package-lock.json) antes de dev/build.
 * Escribe public/version.json para que la UI lea la versión en tiempo de ejecución.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');
const versionJsonPath = path.join(root, 'public', 'version.json');
const generatedTsPath = path.join(root, 'src', 'generated', 'appVersion.ts');

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

fs.mkdirSync(path.dirname(versionJsonPath), { recursive: true });
fs.writeFileSync(versionJsonPath, `${JSON.stringify({ version: pkg.version }, null, 2)}\n`);

fs.mkdirSync(path.dirname(generatedTsPath), { recursive: true });
fs.writeFileSync(
  generatedTsPath,
  `/** Generado por scripts/bump-app-version.mjs — no editar a mano. */\nexport const APP_VERSION = '${pkg.version}';\n`
);

console.log(`Versión ATENAS actualizada: v${pkg.version}`);
