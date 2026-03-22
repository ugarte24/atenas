import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// `base: './'` → scripts como `./assets/*.js`: funcionan en GitHub Pages (/repo/) y en raíz (Vercel)
// sin mezclar `/atenas/` con un host que sirve solo en `/`.
// Opcional: VITE_BASE_PATH=/algo/ sobrescribe (p. ej. CI).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || './';

  return {
    plugins: [react()],
    base,
    server: {
      port: 8080,
    },
  };
});
