import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// GitHub Pages (proyecto): la app vive en https://<usuario>.github.io/<repo>/
// → VITE_BASE_PATH=/<repo>/ en .env.production para que emblema, assets y rutas coincidan.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    plugins: [react()],
    base,
    server: {
      port: 8080,
    },
  };
});
