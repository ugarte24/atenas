/**
 * Incrementa el patch en package.json (y package-lock.json) antes de dev/build local.
 * Escribe public/version.json y src/generated/appVersion.ts.
 *
 * En CI (GitHub Actions): NO incrementa — usa la versión ya commiteada en el repo,
 * para que producción y git coincidan.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');
const versionJsonPath = path.join(root, 'public', 'version.json');
const generatedTsPath = path.join(root, 'src', 'generated', 'appVersion.ts');

function writeVersionArtifacts(version) {
  fs.mkdirSync(path.dirname(versionJsonPath), { recursive: true });
  fs.writeFileSync(versionJsonPath, `${JSON.stringify({ version }, null, 2)}\n`);

  fs.mkdirSync(path.dirname(generatedTsPath), { recursive: true });
  fs.writeFileSync(
    generatedTsPath,
    `/** Generado por scripts/bump-app-version.mjs — no editar a mano. */\nexport const APP_VERSION = '${version}';\n`
  );
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map((n) => Number.parseInt(n, 10));

if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error(`Versión inválida en package.json: ${pkg.version}`);
  process.exit(1);
}

if (process.env.CI === 'true') {
  writeVersionArtifacts(pkg.version);
  console.log(`Versión ATENAS (CI, sin bump): v${pkg.version}`);
  process.exit(0);
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

writeVersionArtifacts(pkg.version);

console.log(`Versión ATENAS actualizada: v${pkg.version}`);
