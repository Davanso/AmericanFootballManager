import { describe, expect, it } from 'vitest';
import { createPlay, startPlay } from '../../simulation/play';
import { updatePlay } from '../../simulation/update';
import { assignBlocks, defensiveRunTarget } from '../../ai/runSupport';

describe('run support', () => {
  it('assigns different defenders to offensive support players', () => {
    const state = createPlay();
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    const assignments = assignBlocks(state, qb);
    expect(assignments.size).toBe(10);
    expect(new Set([...assignments.values()].map((athlete) => athlete.id)).size).toBe(10);
    expect(assignments.has('qb')).toBe(false);
  });
  it('assigns pursuit and distinct containment lanes', () => {
    const state = createPlay();
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    const targets = state.athletes
      .filter((athlete) => athlete.team === 'away')
      .map((athlete) => defensiveRunTarget(athlete, qb, state));
    expect(targets.filter((point) => point.x === qb.x && point.z === qb.z)).toHaveLength(2);
    expect(new Set(targets.map((point) => `${point.x}:${point.z}`)).size).toBeGreaterThan(3);
  });
  it('switches receivers from routes to blocking when the QB runs', () => {
    const state = createPlay();
    startPlay(state);
    for (let i = 0; i < 30; i++) updatePlay(state, { x: 0, z: 0 }, 1 / 60);
    const receiver = state.athletes.find((athlete) => athlete.id === 'wr1')!;
    const x = receiver.x;
    updatePlay(state, { x: 0, z: -1 }, 1 / 60);
    expect(state.scrambling).toBe(true);
    expect(receiver.x).not.toBe(x);
    expect(state.velocity.z).toBe(-7);
  });
});
