import { afterEach, expect, it, vi } from 'vitest';
import { NearestFilter } from 'three';
import { createPlayerTexture } from '../../rendering/playerSprite';
import { mockCanvas } from '../helpers/canvas';
afterEach(() => vi.unstubAllGlobals());
it('renders hard pixels for all poses with distinct movement and player identities', () => {
  const canvases = mockCanvas();
  for (let frame = 0; frame < 8; frame++) {
    const map = createPlayerTexture('home', frame, 'wr1');
    expect(map.magFilter).toBe(NearestFilter);
  }
  createPlayerTexture('home', 0, 'wr2');
  for (const canvas of canvases) {
    expect([canvas.width, canvas.height]).toEqual([32, 40]);
    expect(canvas.calls.every((call) => call.box.every(Number.isInteger))).toBe(true);
  }
  expect(canvases[0].calls).not.toEqual(canvases[1].calls);
  expect(canvases[0].calls).not.toEqual(canvases[8].calls);
  expect(canvases[5].calls).not.toEqual(canvases[6].calls);
});
