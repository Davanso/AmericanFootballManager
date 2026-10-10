import { advanceDrive, createDrive } from './drive';
import type { Drive } from './drive';
import type { DefensivePlan } from '../data/defensivePlans';
import { containAthlete } from './bounds';

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
export type PlayKind = 'short' | 'deep' | 'run' | 'kick' | 'punt';
export type Phase =
  | 'kickAim'
  | 'kickPower'
  | 'kickFlight'
  | 'puntFlight'
  | 'ready'
  | 'snap'
  | 'handoff'
  | 'live'
  | 'pass'
  | 'finished';
export interface PlayState {
  matchPlay?: boolean;
  controlSide: 'offense' | 'defense';
  selectedDefender: string;
  defensePlan: DefensivePlan;
  defenseReads: Record<string, number>;
  kind: PlayKind;
  lateGame: boolean;
  gameSeconds: number;
  kick: { angle: number; power: number };
  drive: Drive;
  lineOfScrimmage: number;
  firstDownLine: number;
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
  outcome: 'none' | 'tackle' | 'incomplete' | 'touchdown' | 'fieldGoal' | 'other';
  fallen: string;
}
export const RECEIVERS = ['wr1', 'wr2', 'wr3'];
export const DECISION_SECONDS = 5;

export function createPlay(
  previousDrive = createDrive(),
  kind: PlayKind = 'short',
  lateGame = false,
  gameSeconds = lateGame ? 20 : 120,
  defenseReads: Record<string, number> = {},
  defensePlan: DefensivePlan = 'man',
  controlSide: 'offense' | 'defense' = 'offense',
): PlayState {
  const drive =
    previousDrive.status === 'active' ? { ...previousDrive } : createDrive(previousDrive.score);
  const offset = drive.spot + 19;
  const athletes: Athlete[] = [];
  const add = (
    id: string,
    team: Athlete['team'],
    role: Athlete['role'],
    x: number,
    z: number,
    route: Position[] = [],
  ) => {
    athletes.push({
      id,
      team,
      role,
      x: Math.min(58, x + offset),
      z,
      route: route.map((point) => ({ x: Math.min(53, point.x + offset), z: point.z })),
      waypoint: 0,
      speed: 7,
    });
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
  if (kind === 'deep') {
    for (const athlete of athletes.filter((player) => player.role === 'receiver')) {
      athlete.route = [
        { x: Math.min(53, drive.spot + 30), z: athlete.z },
        { x: Math.min(55, drive.spot + 40), z: athlete.z * 0.7 },
      ];
    }
  }
  if (kind === 'run') {
    const qb = athletes.find((player) => player.id === 'qb')!;
    qb.x = drive.spot - 3;
    const rb = athletes.find((player) => player.id === 'rb')!;
    rb.x = drive.spot - 7;
    rb.z = 0;
    rb.route = [
      { x: drive.spot - 3.8, z: 0 },
      { x: Math.min(53, drive.spot + 12), z: 0 },
    ];
    athletes
      .filter((player) => player.role === 'receiver')
      .forEach((player) => {
        player.route = [];
      });
  }
  if (kind === 'kick' || kind === 'punt') {
    const qb = athletes.find((athlete) => athlete.id === 'qb')!;
    qb.x = drive.spot - 7;
    const kicker = athletes.find((athlete) => athlete.id === 'rb')!;
    kicker.x = drive.spot - 10;
    kicker.z = 3;
  }
  athletes.forEach(containAthlete);
  return {
    controlSide,
    selectedDefender: 'zone0',
    defensePlan,
    defenseReads: { ...defenseReads },
    kind,
    lateGame,
    gameSeconds,
    kick: { angle: 0, power: 0.8 },
    drive,
    lineOfScrimmage: drive.spot,
    firstDownLine: drive.target,
    phase: 'ready',
    elapsed: 0,
    decision: DECISION_SECONDS,
    athletes,
    ball: { x: drive.spot, z: 0, height: 1 },
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
  state.result =
    state.drive.attempt === 'twoPoint'
      ? outcome === 'touchdown'
        ? 'Conversão! +2 pontos'
        : 'Conversão de dois pontos falhou'
      : result;
  state.outcome = outcome;
  state.fallen = fallen;
  state.drive = advanceDrive(state.drive, state.ball.x, outcome === 'incomplete');
}
export function throwPass(state: PlayState, target: string) {
  if (state.kind === 'run' || state.phase !== 'live' || state.carrier !== 'qb') return;
  const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
  if (qb.x >= state.lineOfScrimmage) return;
  if (!RECEIVERS.includes(target)) return;
  state.phase = 'pass';
  state.target = target;
  state.defenseReads[target] = (state.defenseReads[target] ?? 0) + 1;
  state.carrier = '';
  state.flight = 0;
  state.passOrigin = { x: qb.x, z: qb.z };
}
