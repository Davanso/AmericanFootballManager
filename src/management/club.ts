import { decodeEra } from '../data/eras';
import type { EraId } from '../data/eras';
import { defaultTraining, decodeTraining } from './training';
import type { TrainingState } from './training';
import { defaultLineup, decodeLineup } from './roster';
import type { QBProfile } from '../data/playerAttributes';
export const QUARTERBACKS: { id: string; name: string; number: number; profile: QBProfile }[] = [
  { id: 'miller', name: 'Jack Miller', number: 12, profile: 'balanced' },
  { id: 'reyes', name: 'Marcus Reyes', number: 7, profile: 'mobile' },
  { id: 'walker', name: 'Dean Walker', number: 16, profile: 'deep' },
];
export interface ClubSave {
  era: EraId;
  training: TrainingState;
  lineup: Record<string, string>;
  version: 1;
  starter: string;
  periodSeconds: number;
  replaySpeed: number;
}
export const SAVE_KEY = 'afm.club.v1';
export function defaultClub(): ClubSave {
  return {
    era: '1980s',
    training: defaultTraining(),
    lineup: defaultLineup(),
    version: 1,
    starter: 'miller',
    periodSeconds: 60,
    replaySpeed: 1,
  };
}
export function decodeClub(raw: string | null): ClubSave {
  if (!raw) return defaultClub();
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return defaultClub();
    return {
      era: decodeEra(value.era),
      training: decodeTraining(value.training),
      lineup: decodeLineup(value.lineup),
      version: 1,
      starter: QUARTERBACKS.some((p) => p.id === value.starter) ? value.starter : 'miller',
      periodSeconds: [60, 120, 180].includes(value.periodSeconds) ? value.periodSeconds : 60,
      replaySpeed: [0.5, 1, 2].includes(value.replaySpeed) ? value.replaySpeed : 1,
    };
  } catch {
    return defaultClub();
  }
}
export function loadClub(): ClubSave {
  try {
    return decodeClub(localStorage.getItem(SAVE_KEY));
  } catch {
    return defaultClub();
  }
}
export function saveClub(club: ClubSave): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(club));
    return true;
  } catch {
    return false;
  }
}
export function startingQB(club: ClubSave) {
  return QUARTERBACKS.find((p) => p.id === club.starter) ?? QUARTERBACKS[0];
}
