import { it, expect } from 'vitest';
import {
  SLOTS,
  ROSTER,
  defaultLineup,
  decodeLineup,
  selectStarter,
  applyLineup,
  lineupAppearance,
} from '../../management/roster';
import { createPlay } from '../../simulation/play';
it('covers all non-quarterback formation slots and offers reserves', () => {
  expect(SLOTS).toHaveLength(21);
  expect(ROSTER).toHaveLength(42);
  expect(new Set(Object.values(defaultLineup())).size).toBe(21);
});
it('swaps occupied starters and rejects incompatible positions', () => {
  const lineup = defaultLineup();
  const next = selectStarter(lineup, 'wr1', 'wr2-0');
  expect(next.wr2).toBe('wr1-0');
  expect(next.wr1).toBe('wr2-0');
  expect(lineup.wr1).toBe('wr1-0');
  expect(selectStarter(lineup, 'rb', 'ol0-0')).toBe(lineup);
});
it('repairs malformed lineup without duplicated athletes', () => {
  const lineup = decodeLineup({ wr1: 'wr2-0', wr2: 'wr2-0', rb: 'missing' });
  expect(new Set(Object.values(lineup)).size).toBe(21);
  expect(lineup.rb).toBe('rb-0');
  expect(decodeLineup(null)).toEqual(defaultLineup());
});
it('applies selected attributes to the Wolves unit only', () => {
  const lineup = selectStarter(defaultLineup(), 'rb', 'rb-1');
  const state = createPlay();
  applyLineup(state, lineup);
  expect(state.athletes.find((a) => a.id === 'rb')!.speed).toBeCloseTo(7.9);
  expect(state.athletes.find((a) => a.id === 'rush0')!.attributes).toBeUndefined();
  const defense = createPlay();
  defense.matchPlay = true;
  defense.controlSide = 'defense';
  applyLineup(defense, lineup);
  expect(defense.athletes.find((a) => a.id === 'cover0')!.attributes).toBeDefined();
  expect(defense.athletes.find((a) => a.id === 'wr1')!.attributes).toBeUndefined();
});
it('passes selected numbers and identity into appearance data', () => {
  expect(lineupAppearance(selectStarter(defaultLineup(), 'rb', 'rb-1')).rb.number).toBe(39);
});
