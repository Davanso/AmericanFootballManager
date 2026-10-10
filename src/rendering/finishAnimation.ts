import type { PlayState } from '../simulation/play';

export function ballPresentation(state: PlayState, seconds: number) {
  if (state.outcome !== 'incomplete') return { ...state.ball };
  const t = Math.min(seconds, 2);
  if (t < 0.2) return { ...state.ball, height: state.ball.height * (1 - t / 0.2) + 0.3 };
  const bounce = Math.abs(Math.sin((t - 0.2) * 12)) * 2.3 * Math.exp(-(t - 0.2) * 2.1);
  return {
    x: state.ball.x + Math.min(2, t * 1.4),
    z: state.ball.z + Math.min(1, t * 0.7),
    height: 0.3 + (seconds < 2 ? bounce : 0),
  };
}

export function fallPresentation(seconds: number) {
  const t = Math.min(1, seconds / 0.55);
  return { rotation: (-Math.PI / 2) * t, height: 3.1 - 2 * t, scaleY: 5.5 - 1.2 * t };
}
