import type { PlayerAttributes } from '../data/playerAttributes';
import { playerAppearance } from '../data/playerAppearance';
import type { PlayState } from '../simulation/play';
export type PositionGroup = 'RB' | 'FB' | 'WR' | 'OL' | 'DL' | 'CB' | 'LB';
export const SLOTS: { id: string; position: PositionGroup; label: string }[] = [
  { id: 'rb', position: 'RB', label: 'Running back' },
  { id: 'fb', position: 'FB', label: 'Fullback' },
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `wr${i + 1}`,
    position: 'WR' as const,
    label: `Recebedor ${i + 1}`,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `ol${i}`,
    position: 'OL' as const,
    label: `Linha ofensiva ${i + 1}`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `rush${i}`,
    position: 'DL' as const,
    label: `Linha defensiva ${i + 1}`,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `cover${i}`,
    position: 'CB' as const,
    label: `Cornerback ${i + 1}`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `zone${i}`,
    position: 'LB' as const,
    label: `Linebacker ${i + 1}`,
  })),
];
export interface RosterPlayer {
  id: string;
  name: string;
  number: number;
  position: PositionGroup;
  attributes: PlayerAttributes;
}
const NAMES = [
  'Carter',
  'Hayes',
  'Brooks',
  'Bennett',
  'Coleman',
  'Sullivan',
  'Dawson',
  'Reed',
  'Grant',
  'Lewis',
  'Foster',
  'Mitchell',
  'Stone',
  'Harris',
  'Price',
  'Bell',
  'Morgan',
  'Porter',
  'West',
  'Ford',
  'Bishop',
];
export const ROSTER: RosterPlayer[] = SLOTS.flatMap((slot, index) =>
  [0, 1].map((reserve) => ({
    id: `${slot.id}-${reserve}`,
    name: `${reserve ? 'Calvin' : 'Mike'} ${slot.id.startsWith('wr') ? NAMES[Number(slot.id.slice(2)) - 1] : NAMES[index]}`,
    number: reserve
      ? playerAppearance(slot.id, 'home').number + 5
      : playerAppearance(slot.id, 'home').number,
    position: slot.position,
    attributes: {
      speed: (slot.position === 'OL' ? 5.6 : slot.position === 'DL' ? 6.1 : 7.3) + reserve * 0.6,
      shortPass: 0.5,
      longPass: 0.4,
      catching: reserve ? 0.87 : 0.96,
    },
  })),
);
export function defaultLineup(): Record<string, string> {
  return Object.fromEntries(SLOTS.map((s) => [s.id, `${s.id}-0`]));
}
export function selectStarter(lineup: Record<string, string>, slot: string, playerId: string) {
  const target = SLOTS.find((s) => s.id === slot);
  const player = ROSTER.find((p) => p.id === playerId);
  if (!target || !player || target.position !== player.position) return lineup;
  const next = { ...lineup };
  const occupied = SLOTS.find((s) => s.id !== slot && next[s.id] === playerId);
  if (occupied) next[occupied.id] = next[slot];
  next[slot] = playerId;
  return next;
}
export function decodeLineup(value: unknown) {
  let lineup = defaultLineup();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return lineup;
  for (const slot of SLOTS) {
    const id = (value as Record<string, unknown>)[slot.id];
    if (typeof id === 'string') lineup = selectStarter(lineup, slot.id, id);
  }
  return lineup;
}
export function selectedPlayer(lineup: Record<string, string>, slot: string) {
  return ROSTER.find((p) => p.id === lineup[slot]) ?? ROSTER.find((p) => p.id === `${slot}-0`)!;
}
export function applyLineup(state: PlayState, lineup: Record<string, string>) {
  const team = state.matchPlay && state.controlSide === 'defense' ? 'away' : 'home';
  for (const slot of SLOTS) {
    const athlete = state.athletes.find((a) => a.id === slot.id && a.team === team);
    if (!athlete) continue;
    const player = selectedPlayer(lineup, slot.id);
    athlete.attributes = { ...player.attributes };
    athlete.speed = player.attributes.speed;
  }
}
export function lineupAppearance(lineup: Record<string, string>) {
  return Object.fromEntries(
    SLOTS.map((slot) => {
      const player = selectedPlayer(lineup, slot.id);
      return [slot.id, { ...playerAppearance(player.id, 'home'), number: player.number }];
    }),
  );
}
