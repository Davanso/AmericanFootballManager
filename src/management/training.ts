import type { ClubSave } from './club';
import { ROSTER } from './roster';
import type { PlayerAttributes } from '../data/playerAttributes';
import { QB_PROFILES } from '../data/playerAttributes';
import type { PlayState } from '../simulation/play';
export const FOCUSES = {
  speed: 'Velocidade',
  catching: 'Recepção',
  shortPass: 'Passe curto',
  longPass: 'Passe longo',
};
export type TrainingFocus = keyof typeof FOCUSES;
export type Progress = Record<TrainingFocus, number>;
export interface TrainingState {
  week: number;
  remaining: number;
  progress: Record<string, Progress>;
}
export const TRAINABLE_IDS = ['miller', 'reyes', 'walker', ...ROSTER.map((p) => p.id)];
export function emptyProgress(): Progress {
  return { speed: 0, catching: 0, shortPass: 0, longPass: 0 };
}
export function defaultTraining(): TrainingState {
  return { week: 1, remaining: 3, progress: {} };
}
function bounded(value: unknown, max: number, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(max, Math.floor(value)))
    : fallback;
}
export function decodeTraining(value: unknown): TrainingState {
  if (!value || typeof value !== 'object') return defaultTraining();
  const data = value as Partial<TrainingState>;
  const progress: Record<string, Progress> = {};
  for (const id of TRAINABLE_IDS) {
    const entry = data.progress?.[id];
    if (!entry || typeof entry !== 'object') continue;
    progress[id] = Object.fromEntries(
      Object.keys(FOCUSES).map((key) => [key, bounded(entry[key as TrainingFocus], 10)]),
    ) as Progress;
  }
  return {
    week: bounded(data.week, 9999, 1) || 1,
    remaining: bounded(data.remaining, 3, 3),
    progress,
  };
}
export function trainPlayer(
  training: TrainingState,
  id: string,
  focus: TrainingFocus,
): TrainingState {
  if (!TRAINABLE_IDS.includes(id) || !Object.hasOwn(FOCUSES, focus) || training.remaining <= 0)
    return training;
  if (
    (focus === 'shortPass' || focus === 'longPass') &&
    !['miller', 'reyes', 'walker'].includes(id)
  )
    return training;
  const current = training.progress[id] ?? emptyProgress();
  if (current[focus] >= 10) return training;
  return {
    ...training,
    remaining: training.remaining - 1,
    progress: { ...training.progress, [id]: { ...current, [focus]: current[focus] + 1 } },
  };
}
export function nextTrainingWeek(training: TrainingState): TrainingState {
  if (training.week >= 9999) return training;
  return { ...training, week: training.week + 1, remaining: 3 };
}
export function trainedAttributes(
  base: PlayerAttributes,
  training: TrainingState,
  id: string,
): PlayerAttributes {
  const progress = training.progress[id] ?? emptyProgress();
  return {
    speed: Math.min(11, base.speed + progress.speed * 0.1),
    catching: Math.min(0.99, base.catching + progress.catching * 0.005),
    shortPass: Math.min(0.99, base.shortPass + progress.shortPass * 0.005),
    longPass: Math.min(0.99, base.longPass + progress.longPass * 0.005),
  };
}
export function applyTraining(state: PlayState, club: ClubSave) {
  const ownTeam = state.matchPlay && state.controlSide === 'defense' ? 'away' : 'home';
  for (const athlete of state.athletes) {
    if (athlete.team !== ownTeam || !athlete.attributes) continue;
    const id = club.lineup[athlete.id];
    if (id) {
      athlete.attributes = trainedAttributes(athlete.attributes, club.training, id);
      athlete.speed = athlete.attributes.speed;
    }
  }
  if (ownTeam !== 'home') return;
  const qb = state.athletes.find((a) => a.id === 'qb')!;
  if (!qb.attributes) return;
  const base = QB_PROFILES[state.qbProfile ?? 'balanced'];
  qb.attributes = trainedAttributes({ ...base, catching: 0.95 }, club.training, club.starter);
  qb.speed = qb.attributes.speed;
}
