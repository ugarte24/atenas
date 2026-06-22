import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import {
  fetchUserRewards,
  migrateLocalRewardsToSupabase,
  recordChestOpen,
  recordMissionReward,
  type UserRewardsSnapshot,
} from '../lib/mapRewardsApi';

const EMPTY: UserRewardsSnapshot = {
  openedChestIds: new Set(),
  bonusXp: 0,
  completedDailyKeys: new Set(),
};

export function useMapRewards(enabled = true) {
  const { user, profile } = useAuthContext();
  const isStudent = enabled && profile?.role === 'estudiante' && !!user;
  const [snapshot, setSnapshot] = useState<UserRewardsSnapshot>(EMPTY);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isStudent || !user) {
      setSnapshot((prev) =>
        prev.bonusXp === 0 &&
        prev.openedChestIds.size === 0 &&
        prev.completedDailyKeys.size === 0
          ? prev
          : EMPTY
      );
      setLoading((prev) => (prev ? false : prev));
      return;
    }
    setLoading(true);
    try {
      await migrateLocalRewardsToSupabase(user.id);
      const data = await fetchUserRewards(user.id);
      setSnapshot(data);
    } finally {
      setLoading(false);
    }
  }, [isStudent, user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('atenas:rewards-changed', onChange);
    window.addEventListener('atenas:bonus-xp-changed', onChange);
    return () => {
      window.removeEventListener('atenas:rewards-changed', onChange);
      window.removeEventListener('atenas:bonus-xp-changed', onChange);
    };
  }, [reload]);

  const openChest = useCallback(
    async (chestId: string, xpBonus: number) => {
      if (!user) return false;
      const ok = await recordChestOpen(user.id, chestId, xpBonus);
      if (ok) await reload();
      return ok;
    },
    [user, reload]
  );

  const awardMission = useCallback(
    async (missionKey: string, xp: number) => {
      if (!user) return false;
      if (snapshot.completedDailyKeys.has(missionKey)) return true;
      const ok = await recordMissionReward(user.id, missionKey, xp);
      if (ok) await reload();
      return ok;
    },
    [user, snapshot.completedDailyKeys, reload]
  );

  return {
    openedChestIds: snapshot.openedChestIds,
    bonusXp: snapshot.bonusXp,
    completedDailyKeys: snapshot.completedDailyKeys,
    loading,
    openChest,
    awardMission,
    reload,
  };
}
