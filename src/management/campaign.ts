import type { MatchSession } from '../simulation/match';
import type { ClubSave } from './club';
import { decodeClub } from './club';
import { decodeMatch } from './matchSave';
export interface MatchRecord {
  id: number;
  wolves: number;
  hawks: number;
}
export interface Campaign {
  version: 1;
  nextId: number;
  active?: { id: number; session: MatchSession; club: ClubSave };
  results: MatchRecord[];
}
export const CAMPAIGN_KEY = 'afm.campaign.v1';
export function defaultCampaign(): Campaign {
  return { version: 1, nextId: 1, results: [] };
}
export function decodeCampaign(raw: string | null): Campaign {
  if (!raw || raw.length > 1000000) return defaultCampaign();
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return defaultCampaign();
    const records: MatchRecord[] = Array.isArray(data.results)
      ? data.results
          .filter(
            (r: MatchRecord) =>
              r &&
              Number.isSafeInteger(r.id) &&
              r.id > 0 &&
              Number.isInteger(r.wolves) &&
              r.wolves >= 0 &&
              r.wolves < 1000 &&
              Number.isInteger(r.hawks) &&
              r.hawks >= 0 &&
              r.hawks < 1000,
          )
          .slice(-20)
      : [];
    const results = [
      ...new Map(
        records.map((r) => [r.id, { id: r.id, wolves: r.wolves, hawks: r.hawks }]),
      ).values(),
    ];
    const session = decodeMatch(data.active?.session);
    const active =
      session && !session.finished && Number.isSafeInteger(data.active.id) && data.active.id > 0
        ? { id: data.active.id, session, club: decodeClub(JSON.stringify(data.active.club)) }
        : undefined;
    const nextId = Math.max(
      Number.isSafeInteger(data.nextId) && data.nextId > 0 ? data.nextId : 1,
      ...results.map((r) => r.id + 1),
      active ? active.id + 1 : 1,
    );
    return { version: 1, nextId, results, ...(active ? { active } : {}) };
  } catch {
    return defaultCampaign();
  }
}
export function loadCampaign(): Campaign {
  try {
    return decodeCampaign(localStorage.getItem(CAMPAIGN_KEY));
  } catch {
    return defaultCampaign();
  }
}
export function saveCampaign(campaign: Campaign): boolean {
  try {
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
    return true;
  } catch {
    return false;
  }
}
export function startCampaignMatch(
  campaign: Campaign,
  session: MatchSession,
  club: ClubSave,
): Campaign {
  return {
    ...campaign,
    nextId: campaign.nextId + 1,
    active: { id: campaign.nextId, session: structuredClone(session), club: structuredClone(club) },
  };
}
export function captureMatch(campaign: Campaign, session: MatchSession): Campaign {
  if (!campaign.active) return campaign;
  if (!session.finished)
    return { ...campaign, active: { ...campaign.active, session: structuredClone(session) } };
  const result = { id: campaign.active.id, ...session.scores };
  const { active: _, ...rest } = campaign;
  return {
    ...rest,
    results: [...campaign.results.filter((r) => r.id !== result.id), result].slice(-20),
  };
}
