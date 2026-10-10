import type { PlayState, Athlete } from './play';
import { finishPlay } from './play';
import { nextRandom } from './random';
export function passChance(state: PlayState, receiver: Athlete) {
  const qb = state.athletes.find((p) => p.id === 'qb')!;
  if (!qb.attributes) return 1;
  const range = Math.hypot(receiver.x - state.passOrigin.x, receiver.z - state.passOrigin.z);
  const precision = range > 25 ? qb.attributes.longPass : qb.attributes.shortPass;
  const pressure = Math.min(
    ...state.athletes
      .filter((p) => p.team === 'away')
      .map((p) => Math.hypot(p.x - qb.x, p.z - qb.z)),
  );
  return Math.max(
    0.15,
    Math.min(
      0.98,
      precision * (receiver.attributes?.catching ?? 1) -
        (pressure < 5 ? 0.18 : 0) -
        (Math.hypot(state.velocity.x, state.velocity.z) > 1 ? 0.1 : 0),
    ),
  );
}
export function resolvePass(state: PlayState, receiver: Athlete) {
  const defenders = state.athletes
    .filter((p) => p.team === 'away')
    .sort(
      (a, b) =>
        Math.hypot(a.x - receiver.x, a.z - receiver.z) -
        Math.hypot(b.x - receiver.x, b.z - receiver.z),
    );
  const nearest = defenders[0];
  const covered = nearest && Math.hypot(nearest.x - receiver.x, nearest.z - receiver.z) < 2.2;
  if (covered && state.qbProfile && nextRandom(state) < 0.35) {
    state.ball = { x: nearest.x, z: nearest.z, height: 1.5 };
    state.drive = {
      ...state.drive,
      spot: Math.max(-49, Math.min(49, nearest.x)),
      status: 'turnover',
    };
    finishPlay(state, 'Interceptação · a defesa ficou com a bola', 'interception');
    return;
  }
  if (covered || (state.qbProfile && nextRandom(state) > passChance(state, receiver))) {
    finishPlay(
      state,
      covered
        ? 'Passe incompleto · cobertura próxima ao recebedor'
        : 'Passe incompleto · precisão ou recepção',
      'incomplete',
    );
    return;
  }
  state.carrier = receiver.id;
  state.phase = 'live';
}
