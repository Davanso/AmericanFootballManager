import type { PlayState, Position } from './play';
import { moveToward } from '../ai/movement';

export function controlledCarrier(state: PlayState) {
  if (state.phase !== 'live') return;
  const id = state.kind === 'run' ? 'rb' : 'qb';
  if (state.carrier !== id) return;
  return state.athletes.find((player) => player.id === id);
}

export function inputVelocity(input: Position, speed: number) {
  const length = Math.hypot(input.x, input.z);
  if (!length) return { x: 0, z: 0 };
  return { x: (input.x / length) * speed, z: (input.z / length) * speed };
}

export function updateHandoff(state: PlayState, dt: number) {
  const qb = state.athletes.find((player) => player.id === 'qb')!;
  const rb = state.athletes.find((player) => player.id === 'rb')!;
  state.flight = Math.min(1, state.flight + dt / 0.55);
  moveToward(rb, { x: qb.x - 0.8, z: qb.z }, 7, dt);
  state.ball = {
    x: qb.x + (rb.x - qb.x) * state.flight,
    z: qb.z + (rb.z - qb.z) * state.flight,
    height: 1.5,
  };
  if (state.flight < 1) return;
  state.carrier = 'rb';
  state.phase = 'live';
  state.scrambling = true;
  state.result = 'RB · #34 · WASD ou setas para correr';
}
