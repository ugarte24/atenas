import { useCallback, useEffect, useState } from 'react';
import { getAppVersionLabel } from '../constants/version';

const SYNC_INTERVAL_MS = 60_000;

function resolveVersionJsonUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}version.json`;
}

function formatVersionLabel(version: string): string {
  const trimmed = version.trim();
  if (!trimmed) return getAppVersionLabel();
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

/** Versión inyectada en index.html al cargar la página (build / dev). */
function readInlineVersionLabel(): string | null {
  if (typeof window === 'undefined') return null;

  const inline = (window as Window & { __ATENAS_VERSION__?: string }).__ATENAS_VERSION__;
  if (inline?.trim()) return formatVersionLabel(inline);

  const meta = document.querySelector('meta[name="atenas-version"]')?.getAttribute('content');
  if (meta?.trim()) return formatVersionLabel(meta);

  return null;
}

function getInitialVersionLabel(): string {
  return readInlineVersionLabel() ?? getAppVersionLabel();
}

async function fetchVersionLabel(): Promise<string | null> {
  try {
    const res = await fetch(`${resolveVersionJsonUrl()}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    if (!data.version?.trim()) return null;
    return formatVersionLabel(data.version);
  } catch {
    return null;
  }
}

/**
 * Versión visible en la UI.
 * Prioridad: version.json en runtime → meta / window.__ATENAS_VERSION__ → appVersion.ts empaquetado.
 * Se re-sincroniza al montar, al volver a la pestaña y periódicamente.
 */
export function useAppVersionLabel(): string {
  const [label, setLabel] = useState(getInitialVersionLabel);

  const syncFromServer = useCallback(async () => {
    const fromJson = await fetchVersionLabel();
    if (fromJson) {
      setLabel((prev) => (prev === fromJson ? prev : fromJson));
      return;
    }
    const inline = readInlineVersionLabel();
    if (inline) setLabel((prev) => (prev === inline ? prev : inline));
  }, []);

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncFromServer();
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    const intervalId = window.setInterval(() => {
      void syncFromServer();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(intervalId);
    };
  }, [syncFromServer]);

  return label;
}
