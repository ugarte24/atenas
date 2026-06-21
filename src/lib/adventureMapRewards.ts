const BONUS_XP_KEY = 'atenas-adventure-bonus-xp';

export const CHEST_XP_REWARD = 50;

export function getAdventureBonusXp(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(BONUS_XP_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function addAdventureBonusXp(amount: number): number {
  if (typeof window === 'undefined') return 0;
  const next = getAdventureBonusXp() + amount;
  localStorage.setItem(BONUS_XP_KEY, String(next));
  window.dispatchEvent(new CustomEvent('atenas:bonus-xp-changed', { detail: next }));
  return next;
}
