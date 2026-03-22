/**
 * Con `vite` `base: './'`, la raíz de despliegue no está en `import.meta.env` como path absoluto.
 * La deducimos del `<script src=".../assets/index-*.js">` del documento (misma en localhost y en producción).
 */

/** Prefijo de ruta de la app: `/` o `/<repo>` (ej. `/atenas`). */
export function getAppPathPrefix(): string {
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
