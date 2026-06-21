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
  activo?: boolean;
};

export type LogroVista = AchievementRow & { unlocked: boolean; progressLabel?: string };

export function useLogrosUsuario() {
  const { user, profile } = useAuthContext();
  const { misiones, loading: loadingMisiones } = useMisionesAlumno();
  const [rows, setRows] = useState<AchievementRow[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
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
      totalMisiones,
      misionesCompletas,
      hasAnyProgress,
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
          .select('id, slug, title, description, icon, orden, activo')
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
    async function loadUnlocked() {
      if (!user || profile?.role !== 'estudiante') {
        setUnlockedIds(new Set());
        return;
      }
      const { data, error: e } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);
      if (cancelled) return;
      if (e?.code === '42P01') {
        setUnlockedIds(new Set());
        return;
      }
      setUnlockedIds(new Set((data ?? []).map((x: { achievement_id: string }) => x.achievement_id)));
    }
    void loadUnlocked();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role]);

  useEffect(() => {
    let cancelled = false;
    async function syncUnlocked() {
      if (!user || profile?.role !== 'estudiante' || rows.length === 0) return;
      const toUnlock = rows.filter(
        (r) => flags[r.slug as 'nature' | 'explorer' | 'historian']
      );
      if (toUnlock.length === 0) return;
      try {
        for (const a of toUnlock) {
          if (cancelled || unlockedIds.has(a.id)) continue;
          const { error } = await supabase.from('user_achievements').insert({
            user_id: user.id,
            achievement_id: a.id,
          });
          if (error && (error as { code?: string }).code !== '23505') break;
          if (!error) {
            setUnlockedIds((prev) => new Set([...prev, a.id]));
          }
        }
      } catch {
        // fallback: flags calculados
      }
    }
    void syncUnlocked();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role, rows, flags, unlockedIds]);

  const logros: LogroVista[] = useMemo(() => {
    return rows
      .filter((r) => r.activo !== false)
      .map((r) => {
        const unlockedDb = unlockedIds.has(r.id);
        const slugFlag = r.slug as 'nature' | 'explorer' | 'historian';
        const unlockedCalc =
          slugFlag === 'nature'
            ? flags.hasAnyProgress
            : slugFlag === 'explorer'
              ? flags.misionesCompletas >= 1
              : slugFlag === 'historian'
                ? flags.totalMisiones > 0 && flags.misionesCompletas === flags.totalMisiones
                : false;
        const unlocked = unlockedDb || unlockedCalc;
        let progressLabel: string | undefined;
        if (!unlocked) {
          if (r.slug === 'explorer') progressLabel = `${Math.min(flags.misionesCompletas, 1)}/1 misión`;
          else if (r.slug === 'historian')
            progressLabel =
              flags.totalMisiones > 0
                ? `${flags.misionesCompletas}/${flags.totalMisiones} misiones`
                : 'Sin misiones publicadas';
          else if (r.slug === 'nature' && !flags.hasAnyProgress)
            progressLabel = 'Completa tu primera actividad';
        }
        return { ...r, unlocked, progressLabel };
      });
  }, [rows, unlockedIds, flags]);

  const loading = loadingMisiones || loadingDb;

  return { logros, loading, error, flags };
}
