import { describe, expect, it } from 'vitest';
import { createPlay, startPlay, throwPass } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';

function advance(state: ReturnType<typeof createPlay>, seconds: number, input = { x: 0, z: 0 }) {
  for (let i = 0; i < seconds * 60; i++) updatePlay(state, input, 1 / 60);
}
describe('training play', () => {
  it('moves every defender from the first simulation step of the snap', () => {
    const state = createPlay();
    const positions = state.athletes
      .filter((athlete) => athlete.team === 'away')
      .map((athlete) => ({ id: athlete.id, x: athlete.x, z: athlete.z }));
    startPlay(state);
    updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    expect(state.phase).toBe('snap');
    for (const before of positions) {
      const after = state.athletes.find((athlete) => athlete.id === before.id)!;
      expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0);
    }
  });
  it('moves the QB using normalized input and ends a run at the sideline', () => {
    const state = createPlay();
    startPlay(state);
    advance(state, 0.5);
    advance(state, 1, { x: 0, z: -1 });
    expect(state.athletes.find((athlete) => athlete.id === 'qb')!.z).toBeCloseTo(-7);
    advance(state, 4, { x: 0, z: -1 });
    expect(state.result).toBe('Fora de campo');
  });
  it('uses assisted passing after five seconds when pressure is removed', () => {
    const state = createPlay();
    state.athletes
      .filter((athlete) => athlete.team === 'away')
      .forEach((athlete) => {
        athlete.x = 45;
      });
    startPlay(state);
    advance(state, 5.5);
    expect(state.target).toBe('wr1');
    expect(state.decision).toBe(0);
  });
  it('starts with two teams of eleven and delivers the snap before passing', () => {
    const state = createPlay();
    expect(state.athletes.filter((athlete) => athlete.team === 'home')).toHaveLength(11);
    expect(state.athletes.filter((athlete) => athlete.team === 'away')).toHaveLength(11);
    throwPass(state, 'wr1');
    expect(state.phase).toBe('ready');
    startPlay(state);
    advance(state, 0.5);
    expect(state.carrier).toBe('qb');
    expect(state.ball.x).toBeCloseTo(-24);
  });
  it('completes an early pass and freezes the result after a tackle', () => {
    const state = createPlay();
    startPlay(state);
    advance(state, 0.5);
    throwPass(state, 'wr1');
    advance(state, 1);
    expect(state.carrier).toBe('wr1');
    advance(state, 10);
    expect(state.phase).toBe('finished');
    const snapshot = JSON.stringify(state);
    advance(state, 2);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
  it('ends in a sack when the quarterback stays in the pocket', () => {
    const state = createPlay();
    startPlay(state);
    advance(state, 5);
    expect(state.phase).toBe('finished');
    expect(state.result).toContain('Sack');
  });
  it('rejects a pass beyond the line of scrimmage', () => {
    const state = createPlay();
    startPlay(state);
    advance(state, 0.5);
    state.athletes.find((athlete) => athlete.id === 'qb')!.x = -18;
    throwPass(state, 'wr1');
    expect(state.phase).toBe('live');
    expect(state.carrier).toBe('qb');
  });
  it('marks a tightly covered pass incomplete', () => {
    const state = createPlay();
    startPlay(state);
    advance(state, 0.5);
    throwPass(state, 'wr1');
    const receiver = state.athletes.find((athlete) => athlete.id === 'wr1')!;
    const defender = state.athletes.find((athlete) => athlete.id === 'rush0')!;
    receiver.speed = 0;
    defender.x = receiver.x;
    defender.z = receiver.z;
    state.flight = 0.99;
    advance(state, 1 / 60);
    expect(state.result).toContain('Passe incompleto');
  });
});
