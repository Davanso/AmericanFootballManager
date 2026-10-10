import { updateBots } from '../ai/movement';
import { finishPlay, throwPass } from './play';
import type { PlayState } from './play';
export interface Input {
  x: number;
  z: number;
}

function followCarrier(state: PlayState) {
  const carrier = state.athletes.find((athlete) => athlete.id === state.carrier);
  if (!carrier) return;
  state.ball = { x: carrier.x, z: carrier.z, height: 1.5 };
  if (Math.abs(carrier.z) >= 26) return finishPlay(state, 'Fora de campo');
  if (carrier.x >= 50) return finishPlay(state, 'Touchdown! +6 pontos', 'touchdown');
  const tackled = state.athletes.some(
    (athlete) =>
      athlete.team === 'away' && Math.hypot(athlete.x - carrier.x, athlete.z - carrier.z) < 1.5,
  );
  if (!tackled) return;
  if (carrier.id === 'qb' && carrier.x < state.lineOfScrimmage)
    return finishPlay(state, 'Sack! A defesa chegou ao quarterback.', 'tackle', carrier.id);
  finishPlay(
    state,
    `Tackle · avanço de ${Math.round(carrier.x - state.lineOfScrimmage)} jardas`,
    'tackle',
    carrier.id,
  );
}
function updatePass(state: PlayState, dt: number) {
  state.flight = Math.min(1, state.flight + dt / 0.8);
  const receiver = state.athletes.find((athlete) => athlete.id === state.target)!;
  const t = state.flight;
  state.ball = {
    x: state.passOrigin.x + (receiver.x - state.passOrigin.x) * t,
    z: state.passOrigin.z + (receiver.z - state.passOrigin.z) * t,
    height: 1.5 + Math.sin(t * Math.PI) * 7,
  };
  if (t < 1) return;
  const covered = state.athletes.some(
    (athlete) =>
      athlete.team === 'away' && Math.hypot(athlete.x - receiver.x, athlete.z - receiver.z) < 2.2,
  );
  if (covered)
    return finishPlay(state, 'Passe incompleto · cobertura próxima ao recebedor', 'incomplete');
  state.carrier = receiver.id;
  state.phase = 'live';
}
export function updatePlay(state: PlayState, input: Input, dt: number) {
  if (state.phase === 'ready' || state.phase === 'finished') return;
  state.elapsed += dt;
  if (state.phase === 'live' && state.carrier === 'qb') {
    const magnitude = Math.hypot(input.x, input.z);
    state.velocity =
      magnitude > 0
        ? { x: (input.x / magnitude) * 7, z: (input.z / magnitude) * 7 }
        : { x: 0, z: 0 };
    if (magnitude > 0) state.scrambling = true;
  }
  if (state.carrier && state.carrier !== 'qb') state.velocity = { x: 8, z: 0 };
  const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
  updateBots(state, dt);
  if (state.phase === 'snap') {
    const t = Math.min(1, state.elapsed / 0.4);
    state.ball.x = state.lineOfScrimmage + (qb.x - state.lineOfScrimmage) * t;
    if (t < 1) return;
    state.carrier = 'qb';
    state.phase = 'live';
    return;
  }
  if (state.phase === 'pass') return updatePass(state, dt);
  if (state.carrier === 'qb') {
    const magnitude = Math.hypot(input.x, input.z);
    if (magnitude > 0) {
      qb.x += (input.x / magnitude) * 7 * dt;
      qb.z += (input.z / magnitude) * 7 * dt;
    }
    state.decision = Math.max(0, state.decision - dt);
    if (state.decision === 0 && qb.x < state.lineOfScrimmage) throwPass(state, 'wr1');
  }
  followCarrier(state);
  if (state.elapsed > 15) finishPlay(state, 'Treino encerrado · limite de 15 segundos');
}
