import { afterEach, it, expect, vi } from 'vitest';
import {
  defaultCampaign,
  startCampaignMatch,
  captureMatch,
  decodeCampaign,
  saveCampaign,
  loadCampaign,
} from '../../management/campaign';
import { defaultClub } from '../../management/club';
import { createMatch } from '../../simulation/match';
afterEach(() => vi.unstubAllGlobals());
it('snapshots roster and match independently and resumes the exact clock', () => {
  const club = defaultClub();
  const match = createMatch();
  let campaign = startCampaignMatch(defaultCampaign(), match, club);
  match.remaining = 45;
  match.play.gameSeconds = 45;
  campaign = captureMatch(campaign, match);
  club.starter = 'reyes';
  expect(campaign.active!.club.starter).toBe('miller');
  expect(decodeCampaign(JSON.stringify(campaign)).active!.session.remaining).toBe(45);
});
it('archives a finished match exactly once and keeps twenty recent results', () => {
  let campaign = defaultCampaign();
  for (let i = 0; i < 22; i++) {
    const match = createMatch();
    campaign = startCampaignMatch(campaign, match, defaultClub());
    match.finished = true;
    match.scores = { wolves: 7, hawks: 3 };
    campaign = captureMatch(campaign, match);
    campaign = captureMatch(campaign, match);
  }
  expect(campaign.results).toHaveLength(20);
  expect(campaign.results[0].id).toBe(3);
  expect(campaign.active).toBeUndefined();
});
it('recovers malformed campaigns and drops corrupt active sessions', () => {
  for (const raw of [null, '{', 'null', '{"version":2}'])
    expect(decodeCampaign(raw)).toEqual(defaultCampaign());
  const campaign = startCampaignMatch(defaultCampaign(), createMatch(), defaultClub());
  campaign.active!.session.play.athletes = [];
  expect(decodeCampaign(JSON.stringify(campaign)).active).toBeUndefined();
});
it('handles unavailable storage', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  });
  expect(loadCampaign()).toEqual(defaultCampaign());
  expect(saveCampaign(defaultCampaign())).toBe(false);
});
