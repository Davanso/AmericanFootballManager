import { it, expect } from 'vitest';
import { gameClock } from '../../ui/gameClock';
it('keeps all clocks consistent at fractional minute boundaries', () => {
  expect(gameClock(119.9)).toBe('2:00');
  expect(gameClock(59.9)).toBe('1:00');
  expect(gameClock(0)).toBe('0:00');
  expect(gameClock(-1)).toBe('0:00');
});
