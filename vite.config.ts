import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
    version?: string;
  };
  return pkg.version ?? '0.0.0';
}

// https://vite.dev/config/
// GitHub Pages: `VITE_BASE_PATH=/atenas/` en .env.production → `/atenas/assets/*.js` (absolutos).
// Evita el fallo de `./assets/` cuando la URL es …/atenas sin barra final (MIME text/html).
// `npm run dev` no carga .env.production → base `/`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // CI (GitHub Actions) puede fijar VITE_BASE_PATH=/repo/ y debe ganar a .env.production
  const raw = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/';
  const base = raw === '/' ? '/' : raw.endsWith('/') ? raw : `${raw}/`;

  return {
    plugins: [react()],
    base,
    define: {
      __APP_VERSION__: JSON.stringify(readPackageVersion()),
    },
    server: {
      port: 8080,
    },
  };
});
