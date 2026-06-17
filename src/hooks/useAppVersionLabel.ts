import { useCallback, useEffect, useState } from 'react';
import { getAppVersionLabel } from '../constants/version';

function resolveVersionJsonUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}version.json`;
}

async function fetchVersionLabel(): Promise<string | null> {
  try {
    const res = await fetch(`${resolveVersionJsonUrl()}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    if (!data.version?.trim()) return null;
    return `v${data.version.trim()}`;
  } catch {
    return null;
  }
}

/**
 * Versión visible en la UI.
 * Fuente de verdad en runtime: `public/version.json` (en dev, Vite la sirve desde package.json).
 * Fallback inicial: módulo generado `src/generated/appVersion.ts`.
 */
export function useAppVersionLabel(): string {
  const [label, setLabel] = useState(getAppVersionLabel);

  const syncFromServer = useCallback(async () => {
    const fromJson = await fetchVersionLabel();
    if (fromJson) setLabel(fromJson);
  }, []);

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const onFocus = () => {
      void syncFromServer();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [syncFromServer]);

  return label;
}
