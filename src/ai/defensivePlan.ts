import type { Athlete, PlayState } from '../simulation/play';
export function isPassRusher(athlete: Athlete, state: PlayState) {
  return (
    athlete.id.startsWith('rush') ||
    (state.defensePlan === 'blitz' && ['zone0', 'zone1'].includes(athlete.id))
  );
}
export function zoneAnchor(defender: Athlete, state: PlayState) {
  const index = Number(defender.id.slice(-1));
  if (defender.id.startsWith('cover'))
    return { x: Math.min(49, state.lineOfScrimmage + 9), z: [-19, 19, 0][index] };
  return {
    x: Math.min(49, state.lineOfScrimmage + (index < 2 ? 10 : 22)),
    z: index % 2 === 0 ? -12 : 12,
  };
}
