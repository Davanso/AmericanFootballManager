import { describe, expect, it } from 'vitest';
import { confirmKick, kickIsGood, showKickTarget } from '../../simulation/kicking';
import { createPlay, startPlay } from '../../simulation/play';
import { createDrive } from '../../simulation/drive';
import { updatePlay } from '../../simulation/update';

describe('field goal', () => {
  it('shows range only in the final-game scenario before time expires', () => {
    expect(showKickTarget(createPlay())).toBe(false);
    const state = createPlay(createDrive(0, 30), 'short', true);
    expect(showKickTarget(state)).toBe(true);
    state.gameSeconds = 31;
    expect(showKickTarget(state)).toBe(false);
    state.gameSeconds = 0;
    expect(showKickTarget(state)).toBe(false);
  });
  it('requires both enough power and alignment between the uprights', () => {
    expect(kickIsGood(23, 0, 0.8)).toBe(true);
    expect(kickIsGood(23, 0.18, 0.8)).toBe(false);
    expect(kickIsGood(23, 0, 0.3)).toBe(false);
  });
  it('snaps to holder, locks direction then power, and scores three only once', () => {
    const state = createPlay(createDrive(0, 30), 'kick');
    startPlay(state);
    for (let i = 0; i < 40; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    expect(state.phase).toBe('kickAim');
    expect(state.ball.x).toBe(23);
    state.kick.angle = 0;
    confirmKick(state);
    expect(state.phase).toBe('kickPower');
    state.kick.power = 0.8;
    confirmKick(state);
    for (let i = 0; i < 180; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    expect(state.result).toContain('+3');
    expect(state.drive.score).toBe(3);
    for (let i = 0; i < 60; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    expect(state.drive.score).toBe(3);
  });
  it('ends an expired aiming scenario but lets an already launched kick finish', () => {
    const state = createPlay(createDrive(0, 30), 'kick', true, 0.01);
    startPlay(state);
    updatePlay(state, { x: 0, z: 0 }, 0.02);
    expect(state.phase).toBe('finished');
    const launched = createPlay(createDrive(0, 30), 'kick', true, 0.01);
    launched.phase = 'kickPower';
    launched.kick.power = 0.8;
    confirmKick(launched);
    for (let i = 0; i < 180; i++) updatePlay(launched, { x: 0, z: 0 }, 1 / 60);
    expect(launched.drive.score).toBe(3);
  });
  it('long pass routes differ from the short play and remain inside the field', () => {
    const short = createPlay();
    const deep = createPlay(undefined, 'deep');
    const receiver = (state: typeof short) => state.athletes.find((player) => player.id === 'wr1')!;
    expect(receiver(deep).route[0].x).toBeGreaterThan(receiver(short).route[0].x);
    expect(receiver(deep).route.every((point) => point.x <= 55)).toBe(true);
  });
});
