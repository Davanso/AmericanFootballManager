import type { PlayState } from './play';
export function updatePunt(state: PlayState, dt: number) {
  state.flight = Math.min(1, state.flight + dt / 2);
  const origin = state.lineOfScrimmage - 7;
  const landing = Math.min(55, state.lineOfScrimmage + 38);
  state.ball = {
    x: origin + (landing - origin) * state.flight,
    z: 0,
    height: Math.max(0.3, Math.sin(state.flight * Math.PI) * 16),
  };
  if (state.flight < 1) return;
  state.drive = { ...state.drive, spot: landing >= 50 ? 30 : landing, status: 'turnover' };
  state.phase = 'finished';
  state.result = landing >= 50 ? 'Punt · touchback' : 'Punt · troca de posse';
}
