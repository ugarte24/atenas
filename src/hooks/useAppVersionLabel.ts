import { useCallback, useEffect, useState } from 'react';
import { getAppVersionLabel } from '../constants/version';

const SYNC_INTERVAL_MS = 30_000;
const RETRY_DELAYS_MS = [0, 2_000, 5_000, 15_000] as const;

function resolveVersionJsonUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const relative = `${prefix}version.json`;
  if (typeof window !== 'undefined') {
    return new URL(relative, window.location.origin).href;
  }
  return relative;
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

function nudgeServiceWorkerUpdate(): void {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => void reg.update());
  });
}

async function fetchVersionLabel(): Promise<string | null> {
  const baseUrl = resolveVersionJsonUrl();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(`${baseUrl}?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { version?: string };
      if (!data.version?.trim()) continue;
      return formatVersionLabel(data.version);
    } catch {
      // reintento
    }
  }

  return null;
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
      setLabel((prev) => {
        if (prev !== fromJson) nudgeServiceWorkerUpdate();
        return prev === fromJson ? prev : fromJson;
      });
      return;
    }
    const inline = readInlineVersionLabel();
    if (inline) setLabel((prev) => (prev === inline ? prev : inline));
  }, []);

  useEffect(() => {
    const timeoutIds = RETRY_DELAYS_MS.map((delay) =>
      window.setTimeout(() => {
        void syncFromServer();
      }, delay)
    );

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
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
