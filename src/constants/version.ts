import { APP_VERSION } from '../generated/appVersion';

export { APP_VERSION };

export function getAppVersionLabel(): string {
  return `v${APP_VERSION}`;
}
