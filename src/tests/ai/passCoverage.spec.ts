import { expect, it } from 'vitest';
import { createPlay, startPlay, throwPass } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';
import { coverageTarget } from '../../ai/passCoverage';
function advance(state: ReturnType<typeof createPlay>, seconds: number, input = { x: 0, z: 0 }) {
  for (let i = 0; i < seconds * 60; i++) updatePlay(state, input, 1 / 60);
}
it('keeps receivers on their route during small pocket adjustments', () => {
  const state = createPlay();
  startPlay(state);
  advance(state, 0.5);
  advance(state, 0.5, { x: 0, z: 1 });
  expect(state.scrambling).toBe(false);
  const receiver = state.athletes.find((p) => p.id === 'wr1')!;
  expect(receiver.z).toBeCloseTo(-21, 5);
  expect(receiver.x).toBeGreaterThan(-20);
});
it('covers a repeated early pass instead of allowing an automatic completion every down', () => {
  const results = [];
  let reads: Record<string, number> = {};
  for (let attempt = 0; attempt < 4; attempt++) {
    const state = createPlay(undefined, 'short', false, 120, reads);
    startPlay(state);
    advance(state, 0.5);
    throwPass(state, 'wr1');
    advance(state, 1);
    results.push(state.outcome);
    reads = state.defenseReads;
  }
  expect(results[0]).not.toBe('incomplete');
  expect(results.slice(1)).toContain('incomplete');
  expect(reads.wr1).toBe(4);
});
it('zone defenders react to receivers entering their space and man coverage follows cuts', () => {
  const state = createPlay();
  const receiver = state.athletes.find((p) => p.id === 'wr1')!;
  receiver.x = -8;
  receiver.z = -12;
  const zone = state.athletes.find((p) => p.id === 'zone0')!;
  const target = coverageTarget(zone, state);
  expect(Math.hypot(target.x - receiver.x, target.z - receiver.z)).toBeLessThan(2);
  const cover = state.athletes.find((p) => p.id === 'cover0')!;
  receiver.waypoint = 1;
  const cut = coverageTarget(cover, state);
  expect(cut.z).toBeGreaterThan(receiver.z);
});
