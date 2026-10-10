import { describe, expect, it } from 'vitest';
import { advanceDrive, createDrive, downLabel } from '../../simulation/drive';
import { createPlay, finishPlay, startPlay, throwPass } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';

describe('drive progression', () => {
  it('keeps the original line to gain after short gains and sacks', () => {
    const second = advanceDrive(createDrive(), -14, false);
    expect(downLabel(second)).toBe('2nd to 5');
    const third = advanceDrive(second, -18, false);
    expect(downLabel(third)).toBe('3rd to 9');
    expect(third.target).toBe(-9);
  });

  it('returns incomplete passes to the snap spot and consumes a down', () => {
    const drive = advanceDrive(createDrive(), 25, true);
    expect(drive.spot).toBe(-19);
    expect(downLabel(drive)).toBe('2nd to 10');
  });

  it('resets the downs and line to gain on conversion', () => {
    const drive = advanceDrive(createDrive(), -7, false);
    expect(drive.spot).toBe(-7);
    expect(downLabel(drive)).toBe('1st to 10');
  });

  it('keeps goal to go even after a loss of yardage', () => {
    const goal = advanceDrive(createDrive(0, 30), 44, false);
    expect(downLabel(goal)).toBe('1st to GOAL');
    expect(downLabel(advanceDrive(goal, 35, false))).toBe('2nd to GOAL');
  });

  it('ends the drive on a failed fourth down but allows a fourth down conversion', () => {
    const fourth = { ...createDrive(), down: 4 };
    expect(advanceDrive(fourth, -10, false).status).toBe('turnover');
    expect(advanceDrive(fourth, -9, false).status).toBe('active');
    expect(advanceDrive(fourth, -9, false).down).toBe(1);
  });

  it('moves the formation, ball, routes and snap to the next spot', () => {
    const first = createPlay();
    first.ball.x = -14;
    finishPlay(first, 'Fora de campo');
    const next = createPlay(first.drive);
    expect(next.lineOfScrimmage).toBe(-14);
    expect(next.firstDownLine).toBe(-9);
    expect(next.ball.x).toBe(-14);
    expect(next.athletes.find((athlete) => athlete.id === 'qb')!.x).toBe(-19);
    expect(next.athletes.find((athlete) => athlete.id === 'wr1')!.route[0].x).toBe(1);
    startPlay(next);
    updatePlay(next, { x: 0, z: 0 }, 0.2);
    expect(next.ball.x).toBeCloseTo(-16.5);
  });

  it('uses the relocated line of scrimmage to reject forward passes', () => {
    const state = createPlay(createDrive(0, 30));
    state.phase = 'live';
    state.carrier = 'qb';
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    throwPass(state, 'wr1');
    expect(state.phase).toBe('pass');
    state.phase = 'live';
    state.carrier = 'qb';
    qb.x = 30;
    throwPass(state, 'wr1');
    expect(state.phase).toBe('live');
  });

  it('scores a touchdown through a goal-line pass and never awards it twice', () => {
    const state = createPlay(createDrive(0, 45));
    state.athletes
      .filter((player) => player.team === 'away')
      .forEach((player) => {
        player.x = -30;
      });
    startPlay(state);
    for (let i = 0; i < 25; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    throwPass(state, 'wr1');
    for (let i = 0; i < 120; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    expect(state.outcome).toBe('touchdown');
    expect(state.drive.score).toBe(6);
    finishPlay(state, 'Touchdown!', 'touchdown');
    expect(state.drive.score).toBe(6);
    const next = createPlay(state.drive);
    expect(next.drive.score).toBe(6);
    expect(downLabel(next.drive)).toBe('1st to 10');
    expect(next.lineOfScrimmage).toBe(-19);
  });
});
