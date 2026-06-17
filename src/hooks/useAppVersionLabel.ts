import { useEffect, useState } from 'react';
import { getAppVersionLabel } from '../constants/version';

/**
 * Versión visible en la UI. Lee `public/version.json` en runtime
 * (se actualiza en cada `npm run dev` / `build`) con fallback al valor compilado.
 */
export function useAppVersionLabel(): string {
  const [label, setLabel] = useState(getAppVersionLabel);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const base = import.meta.env.BASE_URL;
        const url = `${base}version.json`.replace(/\/{2,}/g, '/');
        const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (!cancelled && data.version) {
          setLabel(`v${data.version}`);
        }
      } catch {
        /* fallback compilado */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return label;
}
