import type { Athlete } from './play';
export const FIELD_HALF_WIDTH = 26.665;
export const ATHLETE_LIMIT = 24.3;
export function containAthlete(player: Athlete) {
  player.x = Math.max(-57.5, Math.min(57.5, player.x));
  player.z = Math.max(-ATHLETE_LIMIT, Math.min(ATHLETE_LIMIT, player.z));
}
