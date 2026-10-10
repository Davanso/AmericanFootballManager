import type { PlayState } from './play';
import type { Drive } from './drive';
import { createPlay } from './play';
import { createDrive } from './drive';
import { nextRandom } from './random';
import { applyRoster } from '../data/playerAttributes';
export interface Penalty {
  kind: 'falseStart' | 'facemask';
  original: Drive;
  spot: number;
}
export function tryFalseStart(state: PlayState) {
  if (!state.flagsEnabled || state.flagChecked || state.drive.attempt) return false;
  state.flagChecked = true;
  if (nextRandom(state) >= 0.02) return false;
  state.pendingPenalty = {
    kind: 'falseStart',
    original: { ...state.drive },
    spot: state.drive.spot,
  };
  state.result = 'FLAG · false start · ataque · 5 jardas';
  return true;
}
export function flagFacemask(state: PlayState) {
  if (
    !state.flagsEnabled ||
    state.pendingPenalty ||
    state.drive.attempt ||
    nextRandom(state) >= 0.025
  )
    return false;
  state.pendingPenalty = { kind: 'facemask', original: { ...state.drive }, spot: state.ball.x };
  return true;
}
export function resolvePenalty(state: PlayState, accept: boolean) {
  const flag = state.pendingPenalty;
  if (!flag) return state;
  if (!accept) {
    state.pendingPenalty = undefined;
    state.flagChecked = true;
    return state;
  }
  const original = flag.original;
  const spot =
    flag.kind === 'falseStart'
      ? original.spot - Math.min(5, (original.spot + 50) / 2)
      : flag.spot + Math.min(15, (50 - flag.spot) / 2);
  const drive =
    flag.kind === 'falseStart'
      ? { ...original, spot }
      : createDrive(original.score, Math.min(49, spot));
  const next = createPlay(
    drive,
    state.kind,
    state.lateGame,
    state.gameSeconds,
    state.defenseReads,
    state.defensePlan,
    state.controlSide,
  );
  next.matchPlay = state.matchPlay;
  next.flagsEnabled = state.flagsEnabled;
  next.flagChecked = true;
  next.randomState = state.randomState;
  if (state.qbProfile) applyRoster(next, state.qbProfile);
  next.result =
    flag.kind === 'falseStart'
      ? 'False start aceito · repetir a descida'
      : 'Facemask aceito · primeira descida';
  return next;
}
