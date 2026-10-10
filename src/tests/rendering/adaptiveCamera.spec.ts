import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrthographicCamera, Vector3 } from 'three';
import { createAdaptiveCamera } from '../../rendering/adaptiveCamera';
import { createPlay } from '../../simulation/play';

afterEach(() => vi.unstubAllGlobals());

describe('field camera', () => {
  it('keeps yard lines nearly level at desktop and mobile aspect ratios', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    for (const aspect of [0.8, 1.8, 2.4]) {
      const camera = new OrthographicCamera(-80, 80, 55, -55, 0.1, 500);
      createAdaptiveCamera(camera).update(createPlay(), aspect, 1);
      camera.updateMatrixWorld();
      const left = new Vector3(-40, 0, 0).project(camera);
      const right = new Vector3(40, 0, 0).project(camera);
      const slope = Math.abs((right.y - left.y) / ((right.x - left.x) * aspect));
      expect(slope).toBeLessThan(0.03);
    }
  });
});
