/**
 * Base de la app para rutas públicas y React Router.
 * Si Vite usa base absoluta (`/atenas/`), viene en `import.meta.env.BASE_URL`.
 * Si no (base `/` en dev), el script en `/assets/` basta.
 */

/** Prefijo de ruta de la app: `/` o `/<repo>` (ej. `/atenas`). */
export function getAppPathPrefix(): string {
  const fromVite = import.meta.env.BASE_URL;
  if (fromVite && fromVite !== './') {
    const p = fromVite.replace(/\/$/, '') || '/';
    return p;
  }
  return getAppPathPrefixFromScript();
}

function getAppPathPrefixFromScript(): string {
  if (typeof document === 'undefined') return '/';
  const el =
    (document.querySelector('script[type="module"][src*="/assets/"]') as HTMLScriptElement | null) ??
    (document.querySelector('script[src*="/assets/"]') as HTMLScriptElement | null);
  if (!el?.src) return '/';
  return parsePathPrefixFromScriptSrc(el.src);
}

function parsePathPrefixFromScriptSrc(src: string): string {
  const u = new URL(src);
  const i = u.pathname.indexOf('/assets/');
  if (i === -1) return '/';
  const prefix = u.pathname.slice(0, i);
  return prefix === '' ? '/' : prefix;
}

/** `basename` para `BrowserRouter` (sin barra final; `/` en raíz). */
export function getRouterBasename(): string {
  const p = getAppPathPrefix();
  return p === '/' ? '/' : p;
}
