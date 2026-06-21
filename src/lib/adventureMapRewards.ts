const BONUS_XP_KEY = 'atenas-adventure-bonus-xp';
const CHEST_STORAGE_PREFIX = 'atenas-chest-';

export const CHEST_XP_REWARD = 50;
export const WEEKLY_CHEST_XP = 100;

export function getAdventureBonusXp(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(BONUS_XP_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function addAdventureBonusXpLocal(amount: number): number {
  if (typeof window === 'undefined') return 0;
  const next = getAdventureBonusXp() + amount;
  localStorage.setItem(BONUS_XP_KEY, String(next));
  window.dispatchEvent(new CustomEvent('atenas:bonus-xp-changed', { detail: next }));
  window.dispatchEvent(new CustomEvent('atenas:rewards-changed'));
  return next;
}

/** @deprecated Usar recordChestOpen vía useMapRewards */
export function addAdventureBonusXp(amount: number): number {
  return addAdventureBonusXpLocal(amount);
}

export function getLocalOpenedChestIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const ids = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CHEST_STORAGE_PREFIX) && localStorage.getItem(key) === '1') {
      ids.add(key.slice(CHEST_STORAGE_PREFIX.length));
    }
  }
  return ids;
}

export function markChestOpenedLocal(chestId: string): void {
  localStorage.setItem(`${CHEST_STORAGE_PREFIX}${chestId}`, '1');
}
