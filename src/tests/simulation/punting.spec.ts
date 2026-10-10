import { expect, it } from 'vitest';
import { createPlay, startPlay } from '../../simulation/play';
import { createDrive } from '../../simulation/drive';
import { updatePlay } from '../../simulation/update';
it('flies a punt and ends possession without granting a touchdown', () => {
  const state = createPlay(createDrive(0, -19), 'punt');
  startPlay(state);
  for (let i = 0; i < 200; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
  expect(state.phase).toBe('finished');
  expect(state.drive.status).toBe('turnover');
  expect(state.drive.spot).toBe(19);
  expect(state.drive.score).toBe(0);
});
it('handles a punt into the end zone as a touchback', () => {
  const state = createPlay(createDrive(0, 30), 'punt');
  startPlay(state);
  for (let i = 0; i < 200; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
  expect(state.result).toContain('touchback');
  expect(state.drive.spot).toBe(30);
  expect(state.drive.score).toBe(0);
});
