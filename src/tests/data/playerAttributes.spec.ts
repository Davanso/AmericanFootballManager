import { expect, it } from 'vitest';
import { applyRoster } from '../../data/playerAttributes';
import { createPlay } from '../../simulation/play';
it('distinguishes mobile QBs, long pass specialists and varied player speeds', () => {
  const mobile = createPlay();
  applyRoster(mobile, 'mobile');
  const deep = createPlay();
  applyRoster(deep, 'deep');
  const m = mobile.athletes.find((p) => p.id === 'qb')!;
  const d = deep.athletes.find((p) => p.id === 'qb')!;
  expect(m.speed).toBeGreaterThan(d.speed);
  expect(d.attributes!.longPass).toBeGreaterThan(m.attributes!.longPass);
  expect(new Set(mobile.athletes.map((p) => p.speed)).size).toBeGreaterThan(3);
});
