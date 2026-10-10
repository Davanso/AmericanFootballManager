import * as THREE from 'three';
import { ERAS } from '../data/eras';
import type { EraId } from '../data/eras';
export function createEraBanner(era: EraId) {
  const style = ERAS[era];
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 24;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = style.bannerBackground;
  ctx.fillRect(0, 0, 384, 24);
  ctx.fillStyle = style.bannerText;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(style.banner, 192, 13);
  if (era === '2000s') {
    for (let x = 2; x < 384; x += 4) {
      ctx.fillRect(x, 1, 1, 1);
      ctx.fillRect(x, 22, 1, 1);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  const banner = new THREE.Sprite(
    new THREE.SpriteMaterial({ map, depthTest: false, depthWrite: false }),
  );
  banner.name = 'eraBanner';
  banner.center.set(0.5, 0);
  banner.scale.set(36, 2.25, 1);
  banner.position.set(0, 0.2, -26.665);
  banner.renderOrder = -5;
  return banner;
}
