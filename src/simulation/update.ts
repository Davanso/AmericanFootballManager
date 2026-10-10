import { flagFacemask } from './penalties';
import { resolvePass } from './passResolution';
import { updatePunt } from './punting';
import { attackInput } from '../ai/quarterback';
import { moveDefender } from './defenderControl';
import { containAthlete, ATHLETE_LIMIT } from './bounds';
import { controlledCarrier, inputVelocity, updateHandoff } from './running';
import { updateKick } from './kicking';
import { updateBots } from '../ai/movement';
import { finishPlay, throwPass } from './play';
import type { PlayState } from './play';
export interface Input {
  x: number;
  z: number;
}

function qbCommittedToRun(state: PlayState) {
  const qb = state.athletes.find((player) => player.id === 'qb')!;
  return qb.x >= state.lineOfScrimmage || Math.abs(qb.z) > 7;
}

function followCarrier(state: PlayState) {
  const carrier = state.athletes.find((athlete) => athlete.id === state.carrier);
  if (!carrier) return;
  state.ball = { x: carrier.x, z: carrier.z, height: 1.5 };
  if (Math.abs(carrier.z) >= ATHLETE_LIMIT) return finishPlay(state, 'Fora de campo');
  if (carrier.x >= 50) return finishPlay(state, 'Touchdown! +6 pontos', 'touchdown');
  const tackled = state.athletes.some(
    (athlete) =>
      athlete.team === 'away' &&
      !(state.controlSide === 'defense' && athlete.id === state.selectedDefender) &&
      Math.hypot(athlete.x - carrier.x, athlete.z - carrier.z) < 1.5,
  );
  if (!tackled) return;
  const facemask = flagFacemask(state);
  if (carrier.id === 'qb' && carrier.x < state.lineOfScrimmage)
    return finishPlay(state, 'Sack! A defesa chegou ao quarterback.', 'tackle', carrier.id);
  finishPlay(
    state,
    `Tackle · avanço de ${Math.round(carrier.x - state.lineOfScrimmage)} jardas`,
    'tackle',
    carrier.id,
  );
  if (facemask) state.result = 'FLAG · facemask · defesa · 15 jardas / primeira descida';
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
  resolvePass(state, receiver);
}
export function updatePlay(state: PlayState, input: Input, dt: number) {
  if (state.pendingPenalty || state.phase === 'ready' || state.phase === 'finished') return;
  moveDefender(state, input, dt);
  if (state.controlSide === 'defense') input = attackInput(state);
  state.elapsed += dt;
  state.gameSeconds = Math.max(0, state.gameSeconds - dt);
  if (
    !state.matchPlay &&
    state.lateGame &&
    state.gameSeconds === 0 &&
    state.phase !== 'kickFlight'
  ) {
    state.drive.status = 'turnover';
    return finishPlay(state, 'Tempo esgotado · fim do cenário');
  }
  if (state.phase === 'puntFlight') return updatePunt(state, dt);
  if (state.phase.startsWith('kick')) {
    if (state.controlSide === 'defense' && state.phase === 'kickAim') state.phase = 'kickPower';
    if (state.controlSide === 'defense' && state.phase === 'kickPower') {
      state.kick = { angle: 0, power: Math.min(0.95, (77 - state.lineOfScrimmage) / 65) };
      state.passOrigin = { x: state.lineOfScrimmage - 7, z: 0 };
      state.phase = 'kickFlight';
      state.flight = 0;
    }
    return updateKick(state, dt);
  }
  if ((state.kind === 'kick' || state.kind === 'punt') && state.phase === 'snap') {
    const t = Math.min(1, state.elapsed / 0.6);
    state.ball = { x: state.lineOfScrimmage - 7 * t, z: 0, height: 0.8 + Math.sin(t * Math.PI) };
    if (t === 1) state.phase = state.kind === 'punt' ? 'puntFlight' : 'kickAim';
    return;
  }
  const controlled = controlledCarrier(state);
  if (controlled) state.velocity = inputVelocity(input, controlled.speed);
  if (state.phase === 'live' && state.carrier === 'qb' && state.kind !== 'run') {
    const magnitude = Math.hypot(input.x, input.z);
    state.velocity =
      magnitude > 0
        ? {
            x: (input.x / magnitude) * state.athletes.find((p) => p.id === 'qb')!.speed,
            z: (input.z / magnitude) * state.athletes.find((p) => p.id === 'qb')!.speed,
          }
        : { x: 0, z: 0 };
    if (qbCommittedToRun(state)) state.scrambling = true;
  }
  if (state.carrier && state.carrier !== 'qb' && state.kind !== 'run')
    state.velocity = { x: 8, z: 0 };
  const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
  updateBots(state, dt);
  state.athletes.forEach(containAthlete);
  if (state.phase === 'snap') {
    const t = Math.min(1, state.elapsed / 0.4);
    state.ball.height = 1 + Math.sin(t * Math.PI) * 0.6;
    state.ball.x = state.lineOfScrimmage + (qb.x - state.lineOfScrimmage) * t;
    if (t < 1) return;
    state.carrier = 'qb';
    state.phase = state.kind === 'run' ? 'handoff' : 'live';
    return;
  }
  if (state.phase === 'handoff') {
    updateHandoff(state, dt);
    state.athletes.forEach(containAthlete);
    if (state.carrier === 'rb') followCarrier(state);
    return;
  }
  if (state.phase === 'pass') return updatePass(state, dt);
  if (controlled && controlled.id === 'rb') {
    controlled.x += state.velocity.x * dt;
    controlled.z += state.velocity.z * dt;
  }
  if (state.carrier === 'qb') {
    const magnitude = Math.hypot(input.x, input.z);
    if (magnitude > 0) {
      qb.x += (input.x / magnitude) * state.athletes.find((p) => p.id === 'qb')!.speed * dt;
      qb.z += (input.z / magnitude) * state.athletes.find((p) => p.id === 'qb')!.speed * dt;
    }
    state.decision = Math.max(0, state.decision - dt);
    if (state.decision === 0 && qb.x < state.lineOfScrimmage) throwPass(state, 'wr1');
  }
  state.athletes.forEach(containAthlete);
  followCarrier(state);
  if (state.elapsed > 15) finishPlay(state, 'Treino encerrado · limite de 15 segundos');
}
