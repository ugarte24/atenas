/** Versión semver desde `package.json` (inyectada en build por Vite). */
export const APP_VERSION = __APP_VERSION__;

export function getAppVersionLabel(): string {
  return `v${APP_VERSION}`;
}
