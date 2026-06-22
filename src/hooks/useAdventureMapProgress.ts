import { useEffect, useMemo, useState } from 'react';
import type { Unidad } from '../types';
import type { UnitAdventureProgress } from '../lib/adventureMapTypes';
import {
  EMPTY_PROGRESS,
  fetchAdventureProgressForUnits,
} from '../lib/adventureMapProgress';
import { resolveAdventureMapNavigation } from '../lib/adventureMapNavigation';
import { useMapRewards } from './useMapRewards';

function buildPreviewProgress(
  unidades: Unidad[]
): Record<string, UnitAdventureProgress> {
  return Object.fromEntries(unidades.map((u) => [u.id, { ...EMPTY_PROGRESS }]));
}

function progressMapsEqual(
  a: Record<string, UnitAdventureProgress>,
  b: Record<string, UnitAdventureProgress>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => keysB.includes(k));
}

export function useAdventureMapProgress(
  unidades: Unidad[],
  userId: string | undefined,
  enabled: boolean
) {
  const [progressByUnit, setProgressByUnit] = useState<Record<string, UnitAdventureProgress>>({});
  const [loading, setLoading] = useState(false);
  const unidadIdsKey = useMemo(() => unidades.map((u) => u.id).join('|'), [unidades]);

  useEffect(() => {
    if (!enabled || !userId || unidades.length === 0) {
      const preview = buildPreviewProgress(unidades);
      setProgressByUnit((prev) => (progressMapsEqual(prev, preview) ? prev : preview));
      return;
    }

    let cancel = false;
    setLoading(true);
    void (async () => {
      try {
        const map = await fetchAdventureProgressForUnits(
          userId,
          unidades.map((u) => u.id)
        );
        if (!cancel) setProgressByUnit(map);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [enabled, userId, unidadIdsKey]);

  const { openedChestIds } = useMapRewards(enabled);

  const navigation = useMemo(
    () => resolveAdventureMapNavigation(unidades, progressByUnit, !enabled, openedChestIds),
    [unidades, progressByUnit, enabled, openedChestIds]
  );

  return { progressByUnit, loading, ...navigation };
}
