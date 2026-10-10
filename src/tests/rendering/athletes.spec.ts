import { afterEach, expect, it, vi } from 'vitest';
import { Scene, type Mesh, type MeshBasicMaterial } from 'three';
import { createAthletes } from '../../rendering/athletes';
import { PASS_TARGETS } from '../../data/passTargets';
import { createPlay } from '../../simulation/play';
import { mockCanvas } from '../helpers/canvas';
afterEach(() => vi.unstubAllGlobals());
it('matches receiver route and arrow colors and hides routes at snap for both plays', () => {
  mockCanvas();
  for (const kind of ['short', 'deep'] as const) {
    const scene = new Scene();
    const state = createPlay(undefined, kind);
    const athletes = createAthletes(scene, state);
    for (const target of PASS_TARGETS) {
      const route = scene.getObjectByName(`route:${target.id}`)!;
      const colors = route.children.map((p) =>
        ((p as Mesh).material as MeshBasicMaterial).color.getHexString(),
      );
      expect(
        colors
          .filter((color) => color !== '163b32')
          .every((color) => color === target.color.slice(1)),
      ).toBe(true);
      expect(colors.at(-1)).toBe(target.color.slice(1));
      expect(route.parent!.visible).toBe(true);
    }
    state.phase = 'snap';
    athletes.render(state);
    expect(scene.getObjectByName('route:wr1')!.parent!.visible).toBe(false);
    athletes.dispose();
  }
});

it('draws only the RB route for a run and removes it at snap', () => {
  mockCanvas();
  const scene = new Scene();
  const state = createPlay(undefined, 'run');
  const athletes = createAthletes(scene, state);
  expect(scene.getObjectByName('route:wr1')).toBeUndefined();
  const route = scene.getObjectByName('route:rb')!;
  expect(route.parent!.visible).toBe(true);
  expect(((route.children.at(-1) as Mesh).material as MeshBasicMaterial).color.getHexString()).toBe(
    'b7ef8c',
  );
  state.phase = 'snap';
  athletes.render(state);
  expect(route.parent!.visible).toBe(false);
  athletes.dispose();
});
