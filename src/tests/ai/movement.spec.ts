import { it, expect } from 'vitest';
import { moveToward } from '../../ai/movement';
import { createPlay } from '../../simulation/play';
it('scales bot movement with attributes and preserves base training speed', () => {
  const player = createPlay().athletes[0];
  player.x = 0;
  player.z = 0;
  moveToward(player, { x: 100, z: 0 }, 7, 1);
  expect(player.x).toBe(7);
  player.x = 0;
  player.speed = 9;
  player.attributes = { speed: 9, catching: 1, shortPass: 1, longPass: 1 };
  moveToward(player, { x: 100, z: 0 }, 7, 1);
  expect(player.x).toBe(9);
});
