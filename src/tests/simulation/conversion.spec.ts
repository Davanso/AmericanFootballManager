import { expect, it } from 'vitest';
import { chooseConversion, needsConversion } from '../../simulation/conversion';
import { createPlay, finishPlay, startPlay } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';
import { confirmKick } from '../../simulation/kicking';
function touchdown() {
  const state = createPlay();
  state.ball.x = 50;
  finishPlay(state, 'Touchdown', 'touchdown');
  return state;
}
it('requires a touchdown and preserves six points while preparing a single extra point', () => {
  expect(chooseConversion(createPlay(), 'extraPoint').drive.score).toBe(0);
  const td = touchdown();
  expect(needsConversion(td)).toBe(true);
  const state = chooseConversion(td, 'extraPoint');
  expect(state.drive.score).toBe(6);
  expect(state.lineOfScrimmage).toBe(48);
  startPlay(state);
  for (let i = 0; i < 40; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
  confirmKick(state);
  state.kick.angle = 0;
  state.kick.power = 0.7;
  confirmKick(state);
  for (let i = 0; i < 150; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
  expect(state.drive.score).toBe(7);
  expect(state.result).toContain('Extra point');
  updatePlay(state, { x: 0, z: 0 }, 1);
  expect(state.drive.score).toBe(7);
  expect(needsConversion(state)).toBe(false);
});
it('ends a failed extra point without changing the touchdown score', () => {
  const state = chooseConversion(touchdown(), 'extraPoint');
  state.phase = 'kickFlight';
  state.passOrigin = { x: 41, z: 0 };
  state.kick = { angle: 0.18, power: 0.9 };
  updatePlay(state, { x: 0, z: 0 }, 2);
  expect(state.drive.score).toBe(6);
  expect(state.phase).toBe('finished');
});
it('awards exactly two for a conversion and gives no extra down after failure', () => {
  for (const success of [true, false]) {
    const state = chooseConversion(touchdown(), 'twoPoint');
    expect(state.kind).toBe('short');
    state.ball.x = success ? 50 : 49;
    finishPlay(state, 'result', success ? 'touchdown' : 'tackle');
    expect(state.drive.score).toBe(success ? 8 : 6);
    expect(state.drive.status).toBe('turnover');
    expect(needsConversion(state)).toBe(false);
    finishPlay(state, 'again', 'touchdown');
    expect(state.drive.score).toBe(success ? 8 : 6);
  }
});
