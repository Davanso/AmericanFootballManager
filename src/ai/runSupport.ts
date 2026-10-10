import type { Athlete, PlayState, Position } from '../simulation/play';

const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.z - b.z);

export function screeningPosition(threat: Athlete, carrier: Athlete): Position {
  const length = Math.max(0.01, distance(threat, carrier));
  return {
    x: threat.x + ((carrier.x - threat.x) / length) * 1.8,
    z: threat.z + ((carrier.z - threat.z) / length) * 1.8,
  };
}

export function assignBlocks(state: PlayState, carrier: Athlete) {
  const available = state.athletes.filter((athlete) => athlete.team === 'away');
  const support = state.athletes.filter(
    (athlete) => athlete.team === 'home' && athlete.id !== carrier.id,
  );
  support.sort((a, b) => distance(a, carrier) - distance(b, carrier));
  const assignments = new Map<string, Athlete>();
  for (const blocker of support) {
    if (!available.length) break;
    available.sort(
      (a, b) =>
        distance(a, blocker) +
        distance(a, carrier) * 0.4 -
        distance(b, blocker) -
        distance(b, carrier) * 0.4,
    );
    const defender = available.shift()!;
    assignments.set(blocker.id, defender);
  }
  return assignments;
}

export function defensiveRunTarget(defender: Athlete, carrier: Athlete, state: PlayState) {
  const ranked = state.athletes
    .filter((athlete) => athlete.team === 'away')
    .sort((a, b) => distance(a, carrier) - distance(b, carrier));
  const rank = ranked.findIndex((athlete) => athlete.id === defender.id);
  if (rank < 2)
    return { x: carrier.x + state.velocity.x * 0.15, z: carrier.z + state.velocity.z * 0.15 };
  const side = defender.z >= carrier.z ? 1 : -1;
  // Secondary defenders close escape lanes instead of following the same point.
  return {
    x: Math.min(49, carrier.x + 3 + (rank % 3) * 2 + Math.max(0, state.velocity.x) * 0.3),
    z: Math.max(-25, Math.min(25, carrier.z + side * (2 + (rank % 3) * 2))),
  };
}

export function separateAthletes(state: PlayState, dt: number) {
  for (let i = 0; i < state.athletes.length; i++) {
    for (let j = i + 1; j < state.athletes.length; j++) {
      const a = state.athletes[i];
      const b = state.athletes[j];
      if (a.team !== b.team || a.id === state.carrier || b.id === state.carrier) continue;
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      const length = Math.hypot(dx, dz);
      if (length >= 2.8) continue;
      const push = Math.min((2.8 - length) * 0.5, dt * 3);
      const nx = length > 0.01 ? dx / length : 0;
      const nz = length > 0.01 ? dz / length : 1;
      a.x += nx * push;
      a.z += nz * push;
      b.x -= nx * push;
      b.z -= nz * push;
    }
  }
}
