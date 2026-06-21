import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ACHIEVEMENTS_ACTIVO_MIGRATION,
  fetchAchievementCatalog,
  type AchievementCatalogRow,
} from '../lib/achievementsCatalog';

export type AchievementAdmin = AchievementCatalogRow & {
  desbloqueos: number;
};

export function useAchievementsAdmin() {
  const [items, setItems] = useState<AchievementAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActivoColumn, setHasActivoColumn] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: achievements, hasActivoColumn: hasCol, error: e1 } = await fetchAchievementCatalog();
    if (e1) {
      setError(e1);
      setLoading(false);
      return;
    }
    setHasActivoColumn(hasCol);

    const { data: counts, error: e2 } = await supabase.from('user_achievements').select('achievement_id');
    if (e2) {
      setError(e2.message);
      setLoading(false);
      return;
    }
    const byAchievement = new Map<string, number>();
    for (const row of counts ?? []) {
      const id = (row as { achievement_id: string }).achievement_id;
      byAchievement.set(id, (byAchievement.get(id) ?? 0) + 1);
    }
    setItems(
      achievements.map((a) => ({
        ...a,
        desbloqueos: byAchievement.get(a.id) ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActivo = useCallback(
    async (id: string, activo: boolean) => {
      if (!hasActivoColumn) {
        throw new Error(
          `Falta la columna activo. Ejecuta ${ACHIEVEMENTS_ACTIVO_MIGRATION} en Supabase.`
        );
      }
      const { error: e } = await supabase.from('achievements').update({ activo }).eq('id', id);
      if (e) throw new Error(e.message);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, activo } : i)));
    },
    [hasActivoColumn]
  );

  return { items, loading, error, refresh, setActivo, hasActivoColumn };
}
