import { ERAS } from '../data/eras';
import type { EraId } from '../data/eras';
import { createEraBanner } from './eraBanner';
import * as THREE from 'three';

export function createStadiumBackdrop(
  scene: THREE.Scene,
  texture: THREE.Texture,
  era: EraId = '1980s',
) {
  texture.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: ERAS[era].stadiumTint,
      map: texture,
      depthTest: false,
      depthWrite: false,
    }),
  );
  backdrop.name = 'stadiumBackdrop';
  backdrop.center.set(0.5, 0);
  backdrop.renderOrder = -10;
  scene.add(backdrop);
  if (era !== '1980s') scene.add(createEraBanner(era));
  return (camera: THREE.OrthographicCamera) => {
    const width = camera.right - camera.left;
    backdrop.scale.set(width, width / 3, 1);
    // Anchor the illustration's grass edge directly to the far sideline.
    backdrop.position.set(camera.position.x, 0.01, -26.665);
  };
}
