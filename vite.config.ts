import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(rootDir, 'package.json');

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string };
  return pkg.version ?? '0.0.0';
}

/** Inyecta la versión en index.html (meta + inline) para que la UI no dependa solo del JS en caché. */
function atenasVersionHtmlPlugin(): Plugin {
  return {
    name: 'atenas-version-html',
    transformIndexHtml() {
      const version = readPackageVersion();
      return [
        {
          tag: 'meta',
          attrs: { name: 'atenas-version', content: version },
          injectTo: 'head',
        },
        {
          tag: 'script',
          children: `window.__ATENAS_VERSION__=${JSON.stringify(version)};`,
          injectTo: 'head',
        },
      ];
    },
  };
}

/** En dev, version.json siempre refleja package.json (evita JS empaquetado desactualizado). */
function atenasLiveVersionPlugin(): Plugin {
  return {
    name: 'atenas-live-version',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0] ?? '';
        if (!pathname.endsWith('/version.json') && pathname !== '/version.json') {
          next();
          return;
        }
        const version = readPackageVersion();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ version }));
      });
    },
  };
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
    plugins: [react(), atenasVersionHtmlPlugin(), mode === 'development' ? atenasLiveVersionPlugin() : null].filter(
      Boolean
    ),
    base,
    server: {
      port: 8080,
    },
  };
});
