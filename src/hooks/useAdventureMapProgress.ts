import { useEffect, useMemo, useState } from 'react';
import type { Unidad } from '../types';
import type { UnitAdventureProgress } from '../lib/adventureMapTypes';
import {
  EMPTY_PROGRESS,
  fetchAdventureProgressForUnits,
} from '../lib/adventureMapProgress';
import { resolveAdventureMapNavigation } from '../lib/adventureMapNavigation';
import { useMapRewards } from './useMapRewards';

export function useAdventureMapProgress(
  unidades: Unidad[],
  userId: string | undefined,
  enabled: boolean
) {
  const [progressByUnit, setProgressByUnit] = useState<Record<string, UnitAdventureProgress>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId || unidades.length === 0) {
      setProgressByUnit(
        Object.fromEntries(unidades.map((u) => [u.id, { ...EMPTY_PROGRESS }]))
      );
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
  }, [enabled, userId, unidades]);

  const { openedChestIds } = useMapRewards(enabled);

  const navigation = useMemo(
    () => resolveAdventureMapNavigation(unidades, progressByUnit, !enabled, openedChestIds),
    [unidades, progressByUnit, enabled, openedChestIds]
  );

  return { progressByUnit, loading, ...navigation };
}
