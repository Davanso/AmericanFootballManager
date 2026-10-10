import { coverageTarget } from './passCoverage';
import type { Athlete, Position, PlayState } from '../simulation/play';
import {
  assignBlocks,
  defensiveRunTarget,
  screeningPosition,
  separateAthletes,
} from './runSupport';

export function moveToward(athlete: Athlete, target: Position, speed: number, dt: number) {
  const dx = target.x - athlete.x;
  const dz = target.z - athlete.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 0.01) return;
  const step = Math.min(speed * dt, distance);
  athlete.x += (dx / distance) * step;
  athlete.z += (dz / distance) * step;
}
function runRoute(athlete: Athlete, dt: number) {
  const point = athlete.route[athlete.waypoint];
  if (!point) return;
  moveToward(athlete, point, athlete.speed, dt);
  if (Math.hypot(point.x - athlete.x, point.z - athlete.z) < 0.1) athlete.waypoint++;
}
export function updateBots(state: PlayState, dt: number) {
  const carrier = state.athletes.find(
    (athlete) =>
      athlete.id === (state.kind === 'run' && state.phase === 'handoff' ? 'rb' : state.carrier),
  );
  const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
  const running =
    carrier &&
    ((state.kind === 'run' && state.phase === 'handoff') ||
      state.scrambling ||
      carrier.id !== 'qb');
  const assignments = running ? assignBlocks(state, carrier) : new Map<string, Athlete>();
  for (const athlete of state.athletes) {
    if (athlete.role === 'qb' && (state.kind !== 'run' || state.phase !== 'live')) continue;
    if (state.kind === 'run' && athlete.id === 'rb') continue;
    if (athlete.id === state.carrier) {
      moveToward(athlete, { x: 55, z: athlete.z }, 8, dt);
      continue;
    }
    if (running && athlete.team === 'home') {
      const threat = assignments.get(athlete.id);
      if (threat) moveToward(athlete, screeningPosition(threat, carrier), 6.5, dt);
      continue;
    }
    if (running && athlete.team === 'away') {
      const blocked = [...assignments.entries()].some(
        ([id, threat]) =>
          threat.id === athlete.id &&
          state.athletes.some(
            (player) =>
              player.id === id && Math.hypot(player.x - athlete.x, player.z - athlete.z) < 2,
          ),
      );
      moveToward(athlete, defensiveRunTarget(athlete, carrier, state), blocked ? 2.8 : 7.3, dt);
      continue;
    }
    if (athlete.role === 'receiver') {
      runRoute(athlete, dt);
      continue;
    }
    if (athlete.role === 'blocker') {
      const rushers = state.athletes.filter((player) => player.id.startsWith('rush'));
      const nearest = rushers.reduce((best, player) =>
        Math.hypot(player.x - athlete.x, player.z - athlete.z) <
        Math.hypot(best.x - athlete.x, best.z - athlete.z)
          ? player
          : best,
      );
      if (state.elapsed < 2.8) moveToward(athlete, screeningPosition(nearest, qb), 1.2, dt);
      continue;
    }
    if (athlete.id.startsWith('rush')) {
      // Blocking slows pressure without stopping the defense after the snap.
      const blocked =
        state.elapsed < 2.8 &&
        state.athletes.some(
          (player) =>
            player.role === 'blocker' &&
            Math.hypot(player.x - athlete.x, player.z - athlete.z) < 2.8,
        );
      moveToward(athlete, qb, blocked ? 1.1 : 4.2, dt);
      continue;
    }
    moveToward(
      athlete,
      coverageTarget(athlete, state),
      athlete.id.startsWith('cover') ? 7.1 : 6.7,
      dt,
    );
  }
  separateAthletes(state, dt);
}
