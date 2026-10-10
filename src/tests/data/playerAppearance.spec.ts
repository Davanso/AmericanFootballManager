import { expect, it } from 'vitest';
import { playerAppearance } from '../../data/playerAppearance';
import { createPlay } from '../../simulation/play';
it('gives each team unique jerseys and varied skin, cleats and retro details', () => {
  for (const team of ['home', 'away'] as const) {
    const players = createPlay()
      .athletes.filter((a) => a.team === team)
      .map((a) => playerAppearance(a.id, team));
    expect(new Set(players.map((p) => p.number)).size).toBe(11);
    expect(new Set(players.map((p) => p.skin)).size).toBeGreaterThan(2);
    expect(new Set(players.map((p) => p.cleats)).size).toBe(3);
    expect(players.some((p) => p.moustache)).toBe(true);
    expect(players.some((p) => p.mullet)).toBe(true);
  }
});
