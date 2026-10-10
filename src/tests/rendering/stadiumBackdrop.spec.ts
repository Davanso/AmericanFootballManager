import { afterEach, expect, it, vi } from 'vitest';
import { OrthographicCamera, Scene, type Sprite, Texture, Vector3 } from 'three';
import { createStadiumBackdrop } from '../../rendering/stadiumBackdrop';
import { createAdaptiveCamera } from '../../rendering/adaptiveCamera';
import { createPlay } from '../../simulation/play';
afterEach(() => vi.unstubAllGlobals());
it('joins stadium and far sideline without gaps or stretching at every camera size', () => {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  const scene = new Scene();
  const update = createStadiumBackdrop(scene, new Texture());
  const sprite = scene.getObjectByName('stadiumBackdrop') as Sprite;
  for (const aspect of [0.8, 1.8, 2.4]) {
    for (const kind of ['short', 'deep', 'kick'] as const) {
      const camera = new OrthographicCamera(-80, 80, 55, -55, 0.1, 500);
      createAdaptiveCamera(camera).update(createPlay(undefined, kind), aspect, 1);
      camera.updateMatrixWorld();
      update(camera);
      expect(sprite.scale.x / sprite.scale.y).toBeCloseTo(3);
      expect(sprite.scale.x).toBeCloseTo(camera.right - camera.left);
      const seam = new Vector3(camera.position.x, 0.01, -26.665).project(camera);
      expect(sprite.position.clone().project(camera).y).toBeCloseTo(seam.y, 8);
      expect(seam.y).toBeLessThan(1);
      expect(seam.y).toBeGreaterThan(-1);
      expect(sprite.center.y).toBe(0);
      expect(sprite.renderOrder).toBeLessThan(0);
    }
  }
});
