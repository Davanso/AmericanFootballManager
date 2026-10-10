import { describe, expect, it } from 'vitest';
import { createPlay, startPlay } from '../../simulation/play';
import { createDrive } from '../../simulation/drive';
import { ATHLETE_LIMIT } from '../../simulation/bounds';
import { updatePlay } from '../../simulation/update';

describe('field boundaries', () => {
  it('contains every formation and bot at both ends of the field', { timeout: 15000 }, () => {
    for (const spot of [-49, -19, 30, 49]) {
      for (const kind of ['short', 'deep', 'run', 'kick'] as const) {
        const state = createPlay(createDrive(0, spot), kind);
        startPlay(state);
        for (let i = 0; i < 900; i++) {
          updatePlay(state, { x: -1, z: -1 }, 1 / 60);
          for (const athlete of state.athletes) {
            expect(Math.abs(athlete.x)).toBeLessThanOrEqual(57.5);
            expect(Math.abs(athlete.z)).toBeLessThanOrEqual(ATHLETE_LIMIT);
          }
        }
      }
    }
  });
  it('ends a ball carrier run at the boundary instead of leaving the field', () => {
    const state = createPlay();
    state.phase = 'live';
    state.carrier = 'qb';
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    qb.z = ATHLETE_LIMIT - 0.01;
    updatePlay(state, { x: 0, z: 1 }, 1 / 60);
    expect(state.result).toBe('Fora de campo');
    expect(qb.z).toBe(ATHLETE_LIMIT);
  });
});
