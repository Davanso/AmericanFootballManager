import { expect, it } from 'vitest';
import { createPlay, startPlay } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';
import { isPassRusher } from '../../ai/defensivePlan';
import { coverageTarget } from '../../ai/passCoverage';
it('uses four rushers normally and six during a blitz', () => {
  const state = createPlay();
  expect(state.athletes.filter((p) => isPassRusher(p, state))).toHaveLength(4);
  state.defensePlan = 'blitz';
  expect(state.athletes.filter((p) => isPassRusher(p, state))).toHaveLength(6);
});
it('keeps zone coverage inside its sector instead of following a receiver across the field', () => {
  const state = createPlay(undefined, 'short', false, 120, {}, 'zone');
  const receiver = state.athletes.find((p) => p.id === 'wr1')!;
  receiver.x = 0;
  receiver.z = 20;
  const defender = state.athletes.find((p) => p.id === 'cover0')!;
  const zone = coverageTarget(defender, state);
  expect(zone.z).toBeLessThan(0);
  state.defensePlan = 'man';
  expect(coverageTarget(defender, state).z).toBeGreaterThan(0);
});
it('brings extra blitz defenders closer to the QB while normal coverage protects space', () => {
  const states = ['man', 'blitz'].map((plan) => {
    const state = createPlay();
    state.defensePlan = plan as 'man' | 'blitz';
    startPlay(state);
    for (let i = 0; i < 90; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    return state;
  });
  const distance = (state: ReturnType<typeof createPlay>) => {
    const qb = state.athletes.find((p) => p.id === 'qb')!;
    const d = state.athletes.find((p) => p.id === 'zone0')!;
    return Math.hypot(d.x - qb.x, d.z - qb.z);
  };
  expect(distance(states[1])).toBeLessThan(distance(states[0]));
});
