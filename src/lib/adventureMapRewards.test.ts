import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdventureBonusXp,
  addAdventureBonusXpLocal,
  getLocalOpenedChestIds,
  markChestOpenedLocal,
  CHEST_XP_REWARD,
  WEEKLY_CHEST_XP,
} from './adventureMapRewards';

describe('adventureMapRewards (localStorage fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('acumula bonus XP local', () => {
    expect(getAdventureBonusXp()).toBe(0);
    addAdventureBonusXpLocal(CHEST_XP_REWARD);
    expect(getAdventureBonusXp()).toBe(CHEST_XP_REWARD);
    addAdventureBonusXpLocal(WEEKLY_CHEST_XP);
    expect(getAdventureBonusXp()).toBe(CHEST_XP_REWARD + WEEKLY_CHEST_XP);
  });

  it('registra cofres abiertos en localStorage', () => {
    markChestOpenedLocal('chest-w1');
    expect(getLocalOpenedChestIds().has('chest-w1')).toBe(true);
    expect(getLocalOpenedChestIds().has('chest-w2')).toBe(false);
  });
});
