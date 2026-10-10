import { afterEach, expect, it, vi } from 'vitest';
import { Scene, type Sprite, NearestFilter } from 'three';
import { createGoalPosts } from '../../rendering/goalPost';
import { mockCanvas } from '../helpers/canvas';
afterEach(() => vi.unstubAllGlobals());
it('keeps both posts upright, pixelated and anchored to the end boundaries', () => {
  const canvases = mockCanvas();
  const scene = new Scene();
  createGoalPosts(scene);
  expect(scene.children.map((p) => p.position.x)).toEqual([-60, 60]);
  for (const post of scene.children as Sprite[]) {
    expect(post.scale.y).toBe(post.scale.x * 2);
    expect(post.center.y).toBe(0);
    expect(post.material.rotation).toBe(0);
    expect(post.material.map!.magFilter).toBe(NearestFilter);
  }
  expect(canvases[0].calls.filter((c) => c.color === '#ffe17a').map((c) => c.box)).toContainEqual([
    4, 44, 24, 2,
  ]);
});
