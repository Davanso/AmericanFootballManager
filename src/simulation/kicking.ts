import type { PlayState } from './play';
export const KICK_TARGET = 17;
export function showKickTarget(state: PlayState) {
  return (
    !state.drive.attempt &&
    state.lateGame &&
    state.lineOfScrimmage >= 0 &&
    state.gameSeconds <= 30 &&
    state.gameSeconds > 0 &&
    state.phase !== 'finished'
  );
}
export function confirmKick(state: PlayState) {
  if (state.phase === 'kickAim') {
    state.phase = 'kickPower';
    return;
  }
  if (state.phase !== 'kickPower') return;
  state.phase = 'kickFlight';
  state.flight = 0;
  state.passOrigin = { x: state.lineOfScrimmage - 7, z: 0 };
}
export function kickPoint(origin: number, angle: number, power: number, t: number) {
  const range = 65 * power;
  return {
    x: origin + range * t,
    z: Math.tan(angle) * range * t,
    height: Math.max(0.3, Math.sin(t * Math.PI) * 17),
  };
}
export function kickIsGood(origin: number, angle: number, power: number) {
  const t = (60 - origin) / (65 * power);
  if (t <= 0 || t >= 1) return false;
  const point = kickPoint(origin, angle, power, t);
  return Math.abs(point.z) < 3.05 && point.height > 3.05;
}
export function updateKick(state: PlayState, dt: number) {
  if (state.phase === 'kickAim') {
    state.kick.angle = Math.sin(state.elapsed * 2.5) * 0.18;
    return;
  }
  if (state.phase === 'kickPower') {
    state.kick.power = 0.3 + (Math.sin(state.elapsed * 3) + 1) * 0.35;
    return;
  }
  if (state.phase !== 'kickFlight') return;
  state.flight = Math.min(1, state.flight + dt / 2);
  const kicker = state.athletes.find((athlete) => athlete.id === 'rb')!;
  kicker.x = Math.min(state.passOrigin.x - 0.5, kicker.x + 10 * dt);
  kicker.z = Math.max(0, kicker.z - 15 * dt);
  state.ball = kickPoint(
    state.passOrigin.x,
    state.kick.angle,
    state.kick.power,
    Math.max(0, (state.flight - 0.12) / 0.88),
  );
  if (state.flight < 1) return;
  const good = kickIsGood(state.passOrigin.x, state.kick.angle, state.kick.power);
  state.phase = 'finished';
  state.outcome = 'fieldGoal';
  const points = state.drive.attempt === 'extraPoint' ? 1 : 3;
  state.result = good
    ? `${points === 1 ? 'Extra point' : 'Field goal'}! +${points} pontos`
    : 'Chute perdido · fora das traves ou curto';
  state.drive = {
    ...state.drive,
    score: state.drive.score + (good ? points : 0),
    status: 'turnover',
  };
}
