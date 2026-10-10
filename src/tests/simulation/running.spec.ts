import { expect, it } from 'vitest';
import { createPlay, startPlay, throwPass, finishPlay } from '../../simulation/play';
import { createDrive } from '../../simulation/drive';
import { updatePlay } from '../../simulation/update';
import { chooseConversion } from '../../simulation/conversion';
function advance(state: ReturnType<typeof createPlay>, seconds: number, input = { x: 0, z: 0 }) {
  for (let i = 0; i < Math.round(seconds * 60); i++) updatePlay(state, input, 1 / 60);
}
function run(spot = -19) {
  const state = createPlay(createDrive(0, spot), 'run');
  state.athletes
    .filter((p) => p.team === 'away')
    .forEach((p) => {
      p.x = -49;
      p.z = 24;
      p.speed = 0;
    });
  startPlay(state);
  return state;
}
it('snaps to the QB, animates the handoff, then gives sole possession to the RB', () => {
  const state = run();
  advance(state, 0.5);
  expect(state.phase).toBe('handoff');
  expect(state.carrier).toBe('qb');
  const qb = state.athletes.find((p) => p.id === 'qb')!;
  expect(state.ball.x).toBeLessThan(qb.x);
  expect(state.ball.x).toBeGreaterThan(state.athletes.find((p) => p.id === 'rb')!.x);
  throwPass(state, 'wr1');
  expect(state.phase).toBe('handoff');
  advance(state, 0.55);
  expect(state.phase).toBe('live');
  expect(state.carrier).toBe('rb');
  const rb = state.athletes.find((p) => p.id === 'rb')!;
  expect(state.ball.x).toBeCloseTo(rb.x);
  expect(state.ball.z).toBeCloseTo(rb.z);
  const x = rb.x;
  advance(state, 0.5);
  expect(rb.x).toBeCloseTo(x);
  throwPass(state, 'wr1');
  expect(state.phase).toBe('live');
});
it('normalizes manual RB movement and prevents the QB or bots moving the carrier', () => {
  const state = run();
  advance(state, 1.05);
  const rb = state.athletes.find((p) => p.id === 'rb')!;
  const before = { x: rb.x, z: rb.z };
  advance(state, 0.5, { x: 1, z: 1 });
  expect(Math.hypot(rb.x - before.x, rb.z - before.z)).toBeCloseTo(3.5, 4);
  expect(state.ball.x).toBeCloseTo(rb.x);
  expect(state.velocity.x).toBeCloseTo(7 / Math.sqrt(2));
});
it('ends a manual run at the sideline and repositions the next play at that spot', () => {
  const state = run();
  advance(state, 1.05);
  const rb = state.athletes.find((p) => p.id === 'rb')!;
  rb.z = -24.2;
  advance(state, 0.1, { x: 1, z: -1 });
  expect(state.result).toBe('Fora de campo');
  expect(state.drive.down).toBe(2);
  const next = createPlay(state.drive, 'run');
  expect(next.lineOfScrimmage).toBeCloseTo(rb.x);
  expect(next.athletes.find((p) => p.id === 'rb')!.x).toBeCloseTo(rb.x - 7);
});
it('allows the defense to tackle the runner and awards touchdown only once', () => {
  const tackled = run();
  advance(tackled, 1.05);
  const rb = tackled.athletes.find((p) => p.id === 'rb')!;
  const defender = tackled.athletes.find((p) => p.id === 'rush0')!;
  defender.x = rb.x;
  defender.z = rb.z;
  advance(tackled, 1 / 60);
  expect(tackled.outcome).toBe('tackle');
  expect(tackled.fallen).toBe('rb');
  const state = run(45);
  advance(state, 1.05);
  advance(state, 2, { x: 1, z: 0 });
  expect(state.outcome).toBe('touchdown');
  expect(state.drive.score).toBe(6);
  advance(state, 2, { x: 1, z: 0 });
  expect(state.drive.score).toBe(6);
});
it('supports a two-point run without awarding a second six-point touchdown', () => {
  const td = createPlay();
  td.ball.x = 50;
  finishPlay(td, 'TD', 'touchdown');
  const attempt = chooseConversion(td, 'twoPoint');
  const state = createPlay(attempt.drive, 'run');
  state.athletes
    .filter((p) => p.team === 'away')
    .forEach((p) => {
      p.x = -49;
      p.z = 24;
    });
  startPlay(state);
  advance(state, 1.05);
  advance(state, 2, { x: 1, z: 0 });
  expect(state.drive.score).toBe(8);
  expect(state.drive.status).toBe('turnover');
});
