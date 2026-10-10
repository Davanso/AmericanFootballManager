import { zoneAnchor } from './defensivePlan';
import type { Athlete, PlayState, Position } from '../simulation/play';

function routeLead(receiver: Athlete): Position {
  const point = receiver.route[receiver.waypoint];
  if (!point) return receiver;
  const distance = Math.max(0.01, Math.hypot(point.x - receiver.x, point.z - receiver.z));
  return {
    x: receiver.x + ((point.x - receiver.x) / distance) * 1.4,
    z: receiver.z + ((point.z - receiver.z) / distance) * 1.4,
  };
}

export function coverageTarget(defender: Athlete, state: PlayState) {
  const receivers = state.athletes.filter((player) => player.role === 'receiver');
  if (defender.id.startsWith('cover') && state.defensePlan !== 'zone') {
    const receiver = receivers[Number(defender.id.slice(-1))];
    const lead = routeLead(receiver);
    const previous = Math.max(
      0,
      (state.defenseReads[receiver.id] ?? 0) - (state.target === receiver.id ? 1 : 0),
    );
    return { x: lead.x + Math.max(0.4, 2.2 - previous * 0.9), z: lead.z + 0.4 };
  }
  const anchor = zoneAnchor(defender, state);
  const threat = receivers
    .filter(
      (receiver) =>
        receiver.x > state.lineOfScrimmage + 5 &&
        Math.abs(receiver.z - anchor.z) < 13 &&
        Math.abs(receiver.x - anchor.x) < 15,
    )
    .sort((a, b) => {
      const priority = (receiver: Athlete) =>
        Math.hypot(receiver.x - anchor.x, receiver.z - anchor.z) -
        Math.min(3, state.defenseReads[receiver.id] ?? 0) * 2;
      return priority(a) - priority(b);
    })[0];
  if (!threat) return anchor;
  const lead = routeLead(threat);
  return state.defensePlan === 'zone'
    ? {
        x: Math.max(anchor.x - 7, Math.min(anchor.x + 7, lead.x)),
        z: Math.max(anchor.z - 7, Math.min(anchor.z + 7, lead.z)),
      }
    : lead;
}
