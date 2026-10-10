import { expect, it } from 'vitest';
import { createPlay } from '../../simulation/play';
import { applyRoster } from '../../data/playerAttributes';
import { passChance, resolvePass } from '../../simulation/passResolution';
import { nextRandom } from '../../simulation/random';
it('makes long pass specialists more accurate and reduces accuracy under pressure', () => {
  const state = createPlay();
  const receiver = state.athletes.find((p) => p.id === 'wr1')!;
  receiver.x = 20;
  state.passOrigin = { x: -24, z: 0 };
  applyRoster(state, 'mobile');
  const mobile = passChance(state, receiver);
  applyRoster(state, 'deep');
  expect(passChance(state, receiver)).toBeGreaterThan(mobile);
  const qb = state.athletes.find((p) => p.id === 'qb')!;
  const defender = state.athletes.find((p) => p.id === 'rush0')!;
  const before = passChance(state, receiver);
  defender.x = qb.x;
  defender.z = qb.z;
  expect(passChance(state, receiver)).toBeLessThan(before);
});
it('reproduces random outcomes for the same seed', () => {
  const a = createPlay();
  const b = createPlay();
  expect(Array.from({ length: 20 }, () => nextRandom(a))).toEqual(
    Array.from({ length: 20 }, () => nextRandom(b)),
  );
});
it('allows an interception in tight coverage without awarding offensive points', () => {
  const state = createPlay();
  applyRoster(state, 'balanced');
  state.phase = 'pass';
  state.randomState = 1;
  const receiver = state.athletes.find((p) => p.id === 'wr1')!;
  const defender = state.athletes.find((p) => p.id === 'cover0')!;
  defender.x = receiver.x;
  defender.z = receiver.z;
  resolvePass(state, receiver);
  expect(state.outcome).toBe('interception');
  expect(state.drive.status).toBe('turnover');
  expect(state.drive.score).toBe(0);
});
