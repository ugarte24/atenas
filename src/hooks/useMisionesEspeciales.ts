import { useEffect, useMemo, useRef } from 'react';
import { useMisionesAlumno } from './useMisiones';
import { useAdventureMapProgress } from './useAdventureMapProgress';
import { useUnidades } from './useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useMapRewards } from './useMapRewards';
import { buildUnidadesMapHref } from '../lib/adventureMapDeepLinks';
import { WEEKLY_CHEST_XP } from '../lib/adventureMapRewards';
import { weekKeyLocal } from '../lib/mapRewardsApi';
import type { WorldId } from '../lib/adventureMapTypes';

export type MisionEspecial = {
  id: string;
  titulo: string;
  descripcion: string;
  progreso: number;
  total: number;
  completada: boolean;
  targetUrl: string;
  xp: number;
  recompensaClaimed: boolean;
};

function worldProgress(
  unidadIds: string[],
  progressByUnit: Record<string, { progressPct: number }>
): number {
  if (unidadIds.length === 0) return 0;
  const sum = unidadIds.reduce((s, id) => s + (progressByUnit[id]?.progressPct ?? 0), 0);
  return Math.round(sum / unidadIds.length);
}

export function useMisionesEspeciales() {
  const { user, profile } = useAuthContext();
  const { unidades } = useUnidades();
  const { misiones } = useMisionesAlumno();
  const enabled = profile?.role === 'estudiante';
  const { progressByUnit } = useAdventureMapProgress(unidades, user?.id, enabled);
  const { openChest, openedChestIds } = useMapRewards(enabled);
  const awardedRef = useRef<Set<string>>(new Set());

  const weeklyChestId = `weekly-${weekKeyLocal()}`;

  const misionesEspeciales = useMemo((): MisionEspecial[] => {
    const byOrden = [...unidades].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const w1 = byOrden.slice(0, 2).map((u) => u.id);
    const w2 = byOrden.slice(2, 5).map((u) => u.id);
    const w3 = byOrden.slice(5, 7).map((u) => u.id);

    const pct1 = worldProgress(w1, progressByUnit);
    const pct2 = worldProgress(w2, progressByUnit);
    const pct3 = worldProgress(w3, progressByUnit);

    const defs = [
      {
        id: 'special-convivencia',
        titulo: 'Guardián de Convivencia',
        descripcion: 'Completa al 100% las unidades del mundo Convivencia.',
        progreso: pct1,
        world: 1 as WorldId,
      },
      {
        id: 'special-territorio',
        titulo: 'Explorador de Territorio',
        descripcion: 'Completa al 100% las unidades del mundo Territorio.',
        progreso: pct2,
        world: 2 as WorldId,
      },
      {
        id: 'special-historia',
        titulo: 'Cronista del Abya Yala',
        descripcion: 'Completa al 100% las unidades del mundo Historia.',
        progreso: pct3,
        world: 3 as WorldId,
      },
    ];

    return defs.map((d) => ({
      id: d.id,
      titulo: d.titulo,
      descripcion: d.descripcion,
      progreso: d.progreso,
      total: 100,
      completada: d.progreso >= 100,
      targetUrl: buildUnidadesMapHref(d.world),
      xp: 75,
      recompensaClaimed: openedChestIds.has(d.id),
    }));
  }, [unidades, progressByUnit, openedChestIds]);

  useEffect(() => {
    for (const m of misionesEspeciales) {
      if (m.completada && !m.recompensaClaimed && !awardedRef.current.has(m.id)) {
        awardedRef.current.add(m.id);
        void openChest(m.id, m.xp);
      }
    }
  }, [misionesEspeciales, openChest]);

  const semanalesCompletas = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0 && m.pasosCompletados >= m.totalPasos).length,
    [misiones]
  );
  const semanalesTotal = useMemo(
    () => misiones.filter((m) => m.totalPasos > 0).length,
    [misiones]
  );
  const weeklyChestClaimed = openedChestIds.has(weeklyChestId);
  const weeklyChestReady =
    semanalesTotal > 0 && semanalesCompletas >= semanalesTotal && !weeklyChestClaimed;

  const claimWeeklyChest = async () => {
    if (!weeklyChestReady) return false;
    return openChest(weeklyChestId, WEEKLY_CHEST_XP);
  };

  return {
    misionesEspeciales,
    semanalesCompletas,
    semanalesTotal,
    weeklyChestReady,
    weeklyChestClaimed,
    weeklyChestXp: WEEKLY_CHEST_XP,
    claimWeeklyChest,
  };
}
