import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// GitHub Pages: `VITE_BASE_PATH=/atenas/` en .env.production → `/atenas/assets/*.js` (absolutos).
// Evita el fallo de `./assets/` cuando la URL es …/atenas sin barra final (MIME text/html).
// `npm run dev` no carga .env.production → base `/`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const raw = env.VITE_BASE_PATH || '/';
  const base = raw === '/' ? '/' : raw.endsWith('/') ? raw : `${raw}/`;

  return {
    plugins: [react()],
    base,
    server: {
      port: 8080,
    },
  };
});
