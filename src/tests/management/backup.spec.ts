import { it, expect } from 'vitest';
import { exportBackup, parseBackup, restoreBackup } from '../../management/backup';
import { defaultClub, SAVE_KEY } from '../../management/club';
import { defaultCampaign, startCampaignMatch, CAMPAIGN_KEY } from '../../management/campaign';
import { createMatch } from '../../simulation/match';
it('round trips the club and a valid active campaign', () => {
  const club = defaultClub();
  const campaign = startCampaignMatch(defaultCampaign(), createMatch(), club);
  const parsed = parseBackup(exportBackup(club, campaign));
  expect(parsed?.club).toEqual(club);
  expect(parsed?.campaign).toEqual(campaign);
});
it('rejects wrong format, oversized files and invalid athletes without changing storage', () => {
  expect(parseBackup('{')).toBeUndefined();
  expect(parseBackup('x'.repeat(1000001))).toBeUndefined();
  const club = defaultClub();
  club.lineup.rb = 'missing';
  expect(parseBackup(exportBackup(club, defaultCampaign()))).toBeUndefined();
  expect(parseBackup('{"format":"other","version":1}')).toBeUndefined();
});
it('restores both stores and rolls back a partial write failure', () => {
  const backup = parseBackup(exportBackup(defaultClub(), defaultCampaign()))!;
  const values = new Map([
    [SAVE_KEY, 'old-club'],
    [CAMPAIGN_KEY, 'old-campaign'],
  ]);
  let fail = true;
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      if (key === CAMPAIGN_KEY && fail) {
        fail = false;
        throw new Error('quota');
      }
      values.set(key, value);
    },
  };
  expect(restoreBackup(backup, storage)).toBe('failed');
  expect(values.get(SAVE_KEY)).toBe('old-club');
  expect(values.get(CAMPAIGN_KEY)).toBe('old-campaign');
  expect(restoreBackup(backup, storage)).toBe('saved');
  expect(JSON.parse(values.get(SAVE_KEY)!)).toEqual(defaultClub());
});
it('reports unrecoverable storage failure', () => {
  const backup = parseBackup(exportBackup(defaultClub(), defaultCampaign()))!;
  const storage = {
    getItem: () => null,
    removeItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  expect(restoreBackup(backup, storage)).toBe('partialFailure');
});
