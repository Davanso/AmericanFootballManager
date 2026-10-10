import { decodeClub, SAVE_KEY } from './club';
import type { ClubSave } from './club';
import { decodeCampaign, CAMPAIGN_KEY } from './campaign';
import type { Campaign } from './campaign';
export interface Backup {
  format: 'afm-save';
  version: 1;
  club: ClubSave;
  campaign: Campaign;
}
export function exportBackup(club: ClubSave, campaign: Campaign) {
  return JSON.stringify({ format: 'afm-save', version: 1, club, campaign }, null, 2);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => JSON.stringify(key) + ':' + canonical(item))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
export function parseBackup(raw: string): Backup | undefined {
  if (raw.length > 1000000) return;
  try {
    const data = JSON.parse(raw);
    if (
      !data ||
      data.format !== 'afm-save' ||
      data.version !== 1 ||
      data.club?.version !== 1 ||
      data.campaign?.version !== 1
    )
      return;
    const club = decodeClub(JSON.stringify(data.club));
    const campaign = decodeCampaign(JSON.stringify(data.campaign));
    if (
      canonical(club) !== canonical(data.club) ||
      canonical(campaign) !== canonical(data.campaign)
    )
      return;
    return { format: 'afm-save', version: 1, club, campaign };
  } catch {
    return;
  }
}
export type BackupStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function restoreBackup(
  backup: Backup,
  storage: BackupStorage,
): 'saved' | 'failed' | 'partialFailure' {
  let previousClub: string | null;
  let previousCampaign: string | null;
  try {
    previousClub = storage.getItem(SAVE_KEY);
    previousCampaign = storage.getItem(CAMPAIGN_KEY);
  } catch {
    return 'failed';
  }
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(backup.club));
    storage.setItem(CAMPAIGN_KEY, JSON.stringify(backup.campaign));
    return 'saved';
  } catch {
    try {
      if (previousClub === null) storage.removeItem(SAVE_KEY);
      if (previousClub !== null) storage.setItem(SAVE_KEY, previousClub);
      if (previousCampaign === null) storage.removeItem(CAMPAIGN_KEY);
      if (previousCampaign !== null) storage.setItem(CAMPAIGN_KEY, previousCampaign);
      return 'failed';
    } catch {
      return 'partialFailure';
    }
  }
}
