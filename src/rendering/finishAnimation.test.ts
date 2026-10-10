import { describe, expect, it } from 'vitest';
import { createPlay, finishPlay } from '../simulation/play';
import { ballPresentation, fallPresentation } from './finishAnimation';

describe('end-of-play presentation', () => {
  it('bounces an incomplete ball and settles without changing simulation state', () => {
    const state = createPlay();
    finishPlay(state, 'Passe incompleto', 'incomplete');
    const snapshot = JSON.stringify(state);
    expect(ballPresentation(state, 0.33).height).toBeGreaterThan(
      ballPresentation(state, 0.2).height,
    );
    expect(ballPresentation(state, 3).height).toBe(0.3);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
  it('lays the tackled athlete down and keeps the final pose', () => {
    expect(fallPresentation(0).rotation).toBeCloseTo(0);
    expect(fallPresentation(1).rotation).toBeCloseTo(-Math.PI / 2);
    expect(fallPresentation(1).height).toBeLessThan(fallPresentation(0).height);
    expect(fallPresentation(3)).toEqual(fallPresentation(1));
  });
});
