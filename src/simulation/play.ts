export interface Position {
  x: number;
  z: number;
}
export interface Athlete extends Position {
  id: string;
  team: 'home' | 'away';
  role: 'qb' | 'receiver' | 'blocker' | 'defender';
  route: Position[];
  waypoint: number;
  speed: number;
}
export type Phase = 'ready' | 'snap' | 'live' | 'pass' | 'finished';
export interface PlayState {
  phase: Phase;
  elapsed: number;
  decision: number;
  athletes: Athlete[];
  ball: Position & { height: number };
  carrier: string;
  target: string;
  flight: number;
  passOrigin: Position;
  result: string;
  scrambling: boolean;
  velocity: Position;
  outcome: 'none' | 'tackle' | 'incomplete' | 'other';
  fallen: string;
}
export const RECEIVERS = ['wr1', 'wr2', 'wr3'];
export const DECISION_SECONDS = 5;

export function createPlay(): PlayState {
  const athletes: Athlete[] = [];
  const add = (
    id: string,
    team: Athlete['team'],
    role: Athlete['role'],
    x: number,
    z: number,
    route: Position[] = [],
  ) => {
    athletes.push({ id, team, role, x, z, route, waypoint: 0, speed: 7 });
  };
  add('qb', 'home', 'qb', -24, 0);
  for (let i = 0; i < 5; i++) add(`ol${i}`, 'home', 'blocker', -19, (i - 2) * 3);
  add('wr1', 'home', 'receiver', -20, -21, [
    { x: -4, z: -21 },
    { x: 14, z: -13 },
  ]);
  add('wr2', 'home', 'receiver', -20, 20, [
    { x: -8, z: 20 },
    { x: 9, z: 5 },
  ]);
  add('wr3', 'home', 'receiver', -21, 10, [
    { x: -5, z: 10 },
    { x: 16, z: 10 },
  ]);
  add('rb', 'home', 'blocker', -27, 4);
  add('fb', 'home', 'blocker', -25, -5);
  for (let i = 0; i < 4; i++) add(`rush${i}`, 'away', 'defender', -16, (i - 1.5) * 4);
  for (let i = 0; i < 3; i++) add(`cover${i}`, 'away', 'defender', -8, [-20, 19, 9][i]);
  for (let i = 0; i < 4; i++)
    add(`zone${i}`, 'away', 'defender', i < 2 ? -7 : 6, (i % 2 === 0 ? -1 : 1) * 8);
  return {
    phase: 'ready',
    elapsed: 0,
    decision: DECISION_SECONDS,
    athletes,
    ball: { x: -19, z: 0, height: 1 },
    carrier: '',
    target: '',
    flight: 0,
    passOrigin: { x: 0, z: 0 },
    result: '',
    scrambling: false,
    velocity: { x: 0, z: 0 },
    outcome: 'none',
    fallen: '',
  };
}

export function startPlay(state: PlayState) {
  if (state.phase !== 'ready') return;
  state.phase = 'snap';
}
export function finishPlay(
  state: PlayState,
  result: string,
  outcome: PlayState['outcome'] = 'other',
  fallen = '',
) {
  if (state.phase === 'finished') return;
  state.phase = 'finished';
  state.result = result;
  state.outcome = outcome;
  state.fallen = fallen;
}
export function throwPass(state: PlayState, target: string) {
  if (state.phase !== 'live' || state.carrier !== 'qb') return;
  const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
  if (qb.x >= -19) return;
  if (!RECEIVERS.includes(target)) return;
  state.phase = 'pass';
  state.target = target;
  state.carrier = '';
  state.flight = 0;
  state.passOrigin = { x: qb.x, z: qb.z };
}
