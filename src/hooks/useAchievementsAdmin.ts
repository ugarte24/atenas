import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type AchievementAdmin = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  orden: number;
  activo: boolean;
  desbloqueos: number;
};

export function useAchievementsAdmin() {
  const [items, setItems] = useState<AchievementAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: achievements, error: e1 } = await supabase
      .from('achievements')
      .select('id, slug, title, description, icon, orden, activo')
      .order('orden');
    if (e1) {
      setError(e1.message);
      setLoading(false);
      return;
    }
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
      (achievements ?? []).map((a) => ({
        ...(a as Omit<AchievementAdmin, 'desbloqueos'>),
        activo: (a as { activo?: boolean }).activo ?? true,
        desbloqueos: byAchievement.get((a as { id: string }).id) ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActivo = useCallback(
    async (id: string, activo: boolean) => {
      const { error: e } = await supabase.from('achievements').update({ activo }).eq('id', id);
      if (e) throw new Error(e.message);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, activo } : i)));
    },
    []
  );

  return { items, loading, error, refresh, setActivo };
}
