import { expect, it } from 'vitest';
import { createPlay, startPlay } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';
import { switchDefender, attemptTackle } from '../../simulation/defenderControl';
it('moves only the selected defender with normalized input and keeps all bots active', () => {
  const state = createPlay();
  state.controlSide = 'defense';
  startPlay(state);
  const d = state.athletes.find((p) => p.id === state.selectedDefender)!;
  const before = { x: d.x, z: d.z };
  updatePlay(state, { x: 1, z: 1 }, 1 / 60);
  expect(Math.hypot(d.x - before.x, d.z - before.z)).toBeCloseTo(7 / 60);
  const id = state.selectedDefender;
  switchDefender(state);
  expect(state.selectedDefender).not.toBe(id);
});
it('lets the bot quarterback make a pass without player passing input', () => {
  const state = createPlay();
  state.controlSide = 'defense';
  startPlay(state);
  for (let i = 0; i < 160; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
  expect(state.target).not.toBe('');
});
it('requires a close manual tackle and freezes its result', () => {
  const state = createPlay();
  state.controlSide = 'defense';
  state.phase = 'live';
  state.carrier = 'qb';
  attemptTackle(state);
  expect(state.phase).toBe('live');
  const qb = state.athletes.find((p) => p.id === 'qb')!;
  const d = state.athletes.find((p) => p.id === state.selectedDefender)!;
  d.x = qb.x;
  d.z = qb.z;
  attemptTackle(state);
  expect(state.outcome).toBe('tackle');
  expect(state.fallen).toBe('qb');
  expect(state.drive.down).toBe(2);
});
