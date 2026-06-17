/** Versión semver desde `package.json` (se incrementa en `npm run dev` / `npm run build`). */
export const APP_VERSION = __APP_VERSION__;

export function getAppVersionLabel(): string {
  return `v${APP_VERSION}`;
}
