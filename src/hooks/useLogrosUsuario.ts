import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from './useMisiones';

export type AchievementRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  orden: number;
};

export type LogroVista = AchievementRow & { unlocked: boolean };

export function useLogrosUsuario() {
  const { user, profile } = useAuthContext();
  const { misiones, loading: loadingMisiones } = useMisionesAlumno();
  const [rows, setRows] = useState<AchievementRow[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flags = useMemo(() => {
    const conTemas = misiones.filter((m) => m.totalPasos > 0);
    const totalMisiones = conTemas.length;
    const misionesCompletas = conTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length;
    const hasAnyProgress = misiones.some((m) => m.pasosCompletados > 0);
    return {
      nature: hasAnyProgress,
      explorer: misionesCompletas >= 1,
      historian: totalMisiones > 0 && misionesCompletas === totalMisiones,
    };
  }, [misiones]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingDb(true);
      setError(null);
      try {
        const { data, error: e } = await supabase
          .from('achievements')
          .select('id, slug, title, description, icon, orden')
          .order('orden', { ascending: true });
        if (e) throw e;
        if (!cancelled) setRows((data as AchievementRow[]) ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los logros');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoadingDb(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function syncUnlocked() {
      if (!user || profile?.role !== 'estudiante' || rows.length === 0) return;
      const toUnlock = rows.filter((r) => flags[r.slug as keyof typeof flags]);
      if (toUnlock.length === 0) return;
      try {
        const { data: existing, error: e0 } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);
        if (e0) return;
        const have = new Set((existing ?? []).map((x: { achievement_id: string }) => x.achievement_id));
        for (const a of toUnlock) {
          if (cancelled || have.has(a.id)) continue;
          const { error } = await supabase.from('user_achievements').insert({
            user_id: user.id,
            achievement_id: a.id,
          });
          if (error && (error as { code?: string }).code !== '23505') break;
        }
      } catch {
        // Tablas nuevas pueden no existir aún: la UI usa flags calculados
      }
    }
    void syncUnlocked();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role, rows, flags]);

  const logros: LogroVista[] = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      unlocked: flags[r.slug as keyof typeof flags] ?? false,
    }));
  }, [rows, flags]);

  const loading = loadingMisiones || loadingDb;

  return { logros, loading, error, flags };
}
