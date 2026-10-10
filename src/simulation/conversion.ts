import { createDrive } from './drive';
import { createPlay } from './play';
import type { PlayState } from './play';

export function needsConversion(state: PlayState) {
  return state.phase === 'finished' && state.drive.status === 'touchdown' && !state.drive.attempt;
}

export function chooseConversion(state: PlayState, attempt: 'extraPoint' | 'twoPoint') {
  if (!needsConversion(state)) return state;
  // Both attempts use the two-yard line for the initial 1980s ruleset.
  const drive = { ...createDrive(state.drive.score, 48), target: 50, attempt };
  return createPlay(
    drive,
    attempt === 'extraPoint' ? 'kick' : 'short',
    false,
    120,
    state.defenseReads,
    state.defensePlan,
    state.controlSide,
  );
}
