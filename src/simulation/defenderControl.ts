import type { PlayState } from './play';
import { finishPlay } from './play';
import { inputVelocity } from './running';
import type { Input } from './update';
import { containAthlete } from './bounds';
export function switchDefender(state: PlayState) {
  if (state.controlSide !== 'defense' || state.phase === 'finished') return;
  const target = state.athletes.find((p) => p.id === state.carrier) ?? state.ball;
  const options = state.athletes.filter(
    (p) => p.team === 'away' && p.id !== state.selectedDefender,
  );
  options.sort(
    (a, b) =>
      Math.hypot(a.x - target.x, a.z - target.z) - Math.hypot(b.x - target.x, b.z - target.z),
  );
  state.selectedDefender = options[0].id;
}
export function moveDefender(state: PlayState, input: Input, dt: number) {
  if (state.controlSide !== 'defense' || ['ready', 'finished'].includes(state.phase)) return;
  const defender = state.athletes.find((p) => p.id === state.selectedDefender)!;
  const velocity = inputVelocity(input, defender.speed);
  defender.x += velocity.x * dt;
  defender.z += velocity.z * dt;
  containAthlete(defender);
}
export function attemptTackle(state: PlayState) {
  if (state.controlSide !== 'defense' || state.phase !== 'live' || !state.carrier) return;
  const defender = state.athletes.find((p) => p.id === state.selectedDefender)!;
  const carrier = state.athletes.find((p) => p.id === state.carrier)!;
  if (Math.hypot(defender.x - carrier.x, defender.z - carrier.z) > 2.2) return;
  state.ball = { x: carrier.x, z: carrier.z, height: 1.5 };
  finishPlay(state, 'Tackle do defensor controlado', 'tackle', carrier.id);
}
