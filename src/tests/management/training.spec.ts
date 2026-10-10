import { it, expect } from 'vitest';
import {
  defaultTraining,
  decodeTraining,
  trainPlayer,
  nextTrainingWeek,
  trainedAttributes,
  applyTraining,
} from '../../management/training';
import { defaultClub } from '../../management/club';
import { createPlay } from '../../simulation/play';
import { applyRoster } from '../../data/playerAttributes';
import { applyLineup } from '../../management/roster';
it('spends sessions without mutating the original and preserves gains between weeks', () => {
  const original = defaultTraining();
  let state = original;
  for (let i = 0; i < 3; i++) state = trainPlayer(state, 'miller', 'speed');
  expect(state.remaining).toBe(0);
  expect(original.remaining).toBe(3);
  expect(trainPlayer(state, 'miller', 'speed')).toBe(state);
  const next = nextTrainingWeek(state);
  expect(next.remaining).toBe(3);
  expect(next.week).toBe(2);
  expect(next.progress.miller.speed).toBe(3);
});
it('rejects unknown athletes and non-QB passing drills', () => {
  const state = defaultTraining();
  expect(trainPlayer(state, 'missing', 'speed')).toBe(state);
  expect(trainPlayer(state, 'rb-0', 'longPass')).toBe(state);
});
it('caps progression and derived attributes', () => {
  let state = defaultTraining();
  for (let i = 0; i < 12; i++) {
    state = nextTrainingWeek(state);
    state = trainPlayer(state, 'miller', 'shortPass');
  }
  expect(state.progress.miller.shortPass).toBe(10);
  const attributes = trainedAttributes(
    { speed: 7, shortPass: 0.98, longPass: 0.8, catching: 0.95 },
    state,
    'miller',
  );
  expect(attributes.shortPass).toBe(0.99);
});
it('normalizes malformed progress and migrates missing training', () => {
  expect(decodeTraining(null)).toEqual(defaultTraining());
  const state = decodeTraining({
    week: -9,
    remaining: 90,
    progress: {
      miller: { speed: 500, shortPass: -5, longPass: null, catching: 1 },
      intruder: { speed: 5 },
    },
  });
  expect(state.week).toBe(1);
  expect(state.remaining).toBe(3);
  expect(state.progress.miller.speed).toBe(10);
  expect(state.progress.intruder).toBeUndefined();
});
it('applies gains without accumulating them on repeated snap attempts', () => {
  const club = defaultClub();
  club.training = trainPlayer(club.training, 'miller', 'speed');
  const play = createPlay();
  applyRoster(play, 'balanced');
  for (let i = 0; i < 2; i++) {
    applyLineup(play, club.lineup);
    applyTraining(play, club);
  }
  expect(play.athletes.find((a) => a.id === 'qb')!.speed).toBeCloseTo(7.1);
});
it('keeps opposing QB attributes untouched while playing defense', () => {
  const club = defaultClub();
  club.training = trainPlayer(club.training, 'miller', 'speed');
  const play = createPlay();
  play.matchPlay = true;
  play.controlSide = 'defense';
  applyRoster(play, 'deep');
  applyLineup(play, club.lineup);
  applyTraining(play, club);
  expect(play.athletes.find((a) => a.id === 'qb')!.speed).toBe(6);
});
