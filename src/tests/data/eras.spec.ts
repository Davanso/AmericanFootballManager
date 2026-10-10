import { it, expect } from 'vitest';
import { ERAS, decodeEra } from '../../data/eras';
import { playerAppearance } from '../../data/playerAppearance';
it('defaults unknown epochs to the original art and selects supported years', () => {
  expect(decodeEra('future')).toBe('1980s');
  expect(decodeEra('1990s')).toBe('1990s');
  expect(ERAS['2000s'].year).toBe(2005);
  expect(ERAS['1980s'].stadiumTint).toBe('#ffffff');
});
it('preserves identities and varies hair by presentation without changing rules', () => {
  const retro = playerAppearance('qb', 'home');
  const modern = playerAppearance('qb', 'home', '2000s');
  expect(retro.number).toBe(modern.number);
  expect(retro.skin).toBe(modern.skin);
  expect(modern.mullet).toBe(false);
  expect(modern.moustache).toBe(false);
});
