import { afterEach, expect, it, vi } from 'vitest';
import { Scene, type Mesh, type MeshBasicMaterial, type PlaneGeometry } from 'three';
import { decorateField } from '../../rendering/stadium';
import { mockCanvas } from '../helpers/canvas';
afterEach(() => vi.unstubAllGlobals());
it('preserves white markings every ten yards independently of tactical indicators', () => {
  mockCanvas();
  const scene = new Scene();
  const update = decorateField(scene);
  const stripes = scene.children.filter((p) => p.name === 'yardLine') as Mesh[];
  expect(stripes.map((p) => p.position.x)).toEqual([
    -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50,
  ]);
  for (const stripe of stripes) {
    expect((stripe.material as MeshBasicMaterial).color.getHexString()).toBe('eee5cc');
    expect((stripe.geometry as PlaneGeometry).parameters).toMatchObject({
      width: 0.22,
      height: 53.33,
    });
  }
  update(-19, -9, false);
  expect(stripes.every((p) => p.visible)).toBe(true);
  update(30, 40, true);
  expect(stripes.every((p) => p.visible)).toBe(true);
});

it('swaps end zone labels when the Hawks attack in the normalized direction', () => {
  mockCanvas();
  const scene = new Scene();
  const update = decorateField(scene);
  update(0, 10, false, true);
  expect(scene.getObjectByName('endzone:AURORA WOLVES')!.position.x).toBe(55);
  expect(scene.getObjectByName('endzone:CRIMSON HAWKS')!.position.x).toBe(-55);
  update(0, 10, false, false);
  expect(scene.getObjectByName('endzone:AURORA WOLVES')!.position.x).toBe(-55);
});
