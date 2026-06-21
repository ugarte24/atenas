import { supabase } from './supabase';
import { CHEST_XP_REWARD, getAdventureBonusXp, getLocalOpenedChestIds } from './adventureMapRewards';

export type UserRewardsSnapshot = {
  openedChestIds: Set<string>;
  bonusXp: number;
  completedDailyKeys: Set<string>;
};

const MIGRATION_KEY = 'atenas-rewards-migrated-v1';

export function todayLocalYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function weekKeyLocal(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const da = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function dispatchRewardsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('atenas:rewards-changed'));
  }
}

export async function fetchUserRewards(userId: string): Promise<UserRewardsSnapshot> {
  const today = todayLocalYmd();
  const [mapRes, dailyRes] = await Promise.all([
    supabase.from('user_map_rewards').select('chest_id, xp_bonus').eq('user_id', userId),
    supabase
      .from('user_daily_missions')
      .select('mission_key, xp_awarded, mission_date')
      .eq('user_id', userId),
  ]);

  if (mapRes.error?.code === '42P01' || dailyRes.error?.code === '42P01') {
    return {
      openedChestIds: getLocalOpenedChestIds(),
      bonusXp: getAdventureBonusXp(),
      completedDailyKeys: new Set<string>(),
    };
  }

  const openedChestIds = new Set(
    ((mapRes.data ?? []) as { chest_id: string }[]).map((r) => r.chest_id)
  );
  const mapXp = ((mapRes.data ?? []) as { xp_bonus: number }[]).reduce(
    (s, r) => s + (r.xp_bonus ?? 0),
    0
  );
  const dailyRows = (dailyRes.data ?? []) as {
    mission_key: string;
    xp_awarded: number;
    mission_date: string;
  }[];
  const dailyXp = dailyRows.reduce((s, r) => s + (r.xp_awarded ?? 0), 0);
  const completedDailyKeys = new Set(
    dailyRows.filter((r) => r.mission_date === today).map((r) => r.mission_key)
  );

  return {
    openedChestIds,
    bonusXp: mapXp + dailyXp,
    completedDailyKeys,
  };
}

export async function migrateLocalRewardsToSupabase(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY) === '1') return;

  const localChests = getLocalOpenedChestIds();
  const localBonus = getAdventureBonusXp();
  let migrated = false;

  for (const chestId of localChests) {
    const { error } = await supabase.from('user_map_rewards').upsert(
      {
        user_id: userId,
        chest_id: chestId,
        xp_bonus: CHEST_XP_REWARD,
      },
      { onConflict: 'user_id,chest_id', ignoreDuplicates: true }
    );
    if (!error || (error as { code?: string }).code === '42P01') {
      migrated = true;
    }
  }

  if (localBonus > localChests.size * CHEST_XP_REWARD) {
    const extra = localBonus - localChests.size * CHEST_XP_REWARD;
    if (extra > 0) {
      await supabase.from('user_map_rewards').upsert(
        {
          user_id: userId,
          chest_id: 'legacy-bonus-xp',
          xp_bonus: extra,
        },
        { onConflict: 'user_id,chest_id', ignoreDuplicates: true }
      );
    }
  }

  if (migrated || localBonus > 0) {
    localStorage.setItem(MIGRATION_KEY, '1');
  }
}

export async function recordChestOpen(
  userId: string,
  chestId: string,
  xpBonus: number = CHEST_XP_REWARD
): Promise<boolean> {
  const { error } = await supabase.from('user_map_rewards').upsert(
    {
      user_id: userId,
      chest_id: chestId,
      xp_bonus: xpBonus,
      opened_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,chest_id' }
  );

  if (error?.code === '42P01') {
    const { markChestOpenedLocal, addAdventureBonusXpLocal } = await import('./adventureMapRewards');
    markChestOpenedLocal(chestId);
    addAdventureBonusXpLocal(xpBonus);
    return true;
  }

  if (error) return false;
  dispatchRewardsChanged();
  return true;
}

export async function recordMissionReward(
  userId: string,
  missionKey: string,
  xpAwarded: number,
  missionDate: string = todayLocalYmd()
): Promise<boolean> {
  const { error } = await supabase.from('user_daily_missions').upsert(
    {
      user_id: userId,
      mission_key: missionKey,
      mission_date: missionDate,
      xp_awarded: xpAwarded,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,mission_key,mission_date', ignoreDuplicates: true }
  );

  if (error?.code === '42P01') {
    const { addAdventureBonusXpLocal } = await import('./adventureMapRewards');
    addAdventureBonusXpLocal(xpAwarded);
    return true;
  }

  if (error) return false;
  dispatchRewardsChanged();
  return true;
}

export async function fetchAulaMeetUrl(): Promise<string | null> {
  const { data, error } = await supabase.from('aula_config').select('meet_url').eq('id', 1).maybeSingle();
  if (error?.code === '42P01') return null;
  const url = (data as { meet_url?: string | null } | null)?.meet_url;
  return url && url.trim() ? url.trim() : null;
}
