import type { PlayState } from '../simulation/play';
import { throwPass } from '../simulation/play';
export function attackInput(state: PlayState) {
  if (state.phase !== 'live') return { x: 0, z: 0 };
  const carrier = state.athletes.find((p) => p.id === state.carrier);
  if (!carrier) return { x: 0, z: 0 };
  const defenders = state.athletes.filter((p) => p.team === 'away');
  const nearest = defenders.reduce((best, p) =>
    Math.hypot(p.x - carrier.x, p.z - carrier.z) <
    Math.hypot(best.x - carrier.x, best.z - carrier.z)
      ? p
      : best,
  );
  if (carrier.id !== 'qb' || state.kind === 'run')
    return {
      x: 1,
      z: Math.abs(nearest.z - carrier.z) < 3 ? (carrier.z >= nearest.z ? 0.5 : -0.5) : 0,
    };
  if (state.elapsed < 0.9) return { x: 0, z: 0 };
  const receivers = state.athletes.filter((p) => p.role === 'receiver');
  const separation = (receiver: typeof carrier) =>
    Math.min(...defenders.map((p) => Math.hypot(p.x - receiver.x, p.z - receiver.z)));
  receivers.sort((a, b) => separation(b) - separation(a));
  if (
    carrier.x < state.lineOfScrimmage &&
    (separation(receivers[0]) > 3.2 || state.elapsed > 2.4)
  ) {
    throwPass(state, receivers[0].id);
    return { x: 0, z: 0 };
  }
  const pressure = Math.hypot(nearest.x - carrier.x, nearest.z - carrier.z);
  return pressure < 5 ? { x: 1, z: carrier.z >= nearest.z ? 0.5 : -0.5 } : { x: 0, z: 0 };
}
