import { afterEach, it, expect, vi } from 'vitest';
import { createEraBanner } from '../../rendering/eraBanner';
import { mockCanvas } from '../helpers/canvas';
import { NearestFilter } from 'three';
afterEach(() => vi.unstubAllGlobals());
it('keeps pixel geometry and gives the two later eras distinct signage', () => {
  const canvases = mockCanvas();
  const nineties = createEraBanner('1990s');
  const modern = createEraBanner('2000s');
  expect(nineties.scale.x / nineties.scale.y).toBe(16);
  expect(modern.position.z).toBe(-26.665);
  expect(modern.material.map!.magFilter).toBe(NearestFilter);
  expect(canvases[0].calls).not.toEqual(canvases[1].calls);
  expect(canvases[1].calls.every((c) => c.box.every(Number.isInteger))).toBe(true);
});
