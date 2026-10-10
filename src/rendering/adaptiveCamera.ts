import type * as THREE from 'three';
import type { PlayState } from '../simulation/play';

export function createAdaptiveCamera(camera: THREE.OrthographicCamera) {
  let center = -22;
  let halfHeight = 30;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(state: PlayState, aspect: number, dt: number) {
    const relevant = state.athletes.filter(
      (athlete) => athlete.role === 'qb' || athlete.role === 'receiver',
    );
    const min = Math.min(state.ball.x, ...relevant.map((athlete) => athlete.x));
    const max = Math.max(state.ball.x, ...relevant.map((athlete) => athlete.x));
    const desiredCenter = (min + max) / 2 + 3;
    const desiredHeight = Math.max(
      30 + Math.min(14, Math.max(0, max - min - 20) * 0.18),
      (max - min + 18) / (2 * aspect),
    );
    const blend = state.phase === 'ready' || reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    center += (desiredCenter - center) * blend;
    halfHeight += (desiredHeight - halfHeight) * blend;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(center + 3, 125, 100);
    camera.lookAt(center, 9, -3);
    camera.updateProjectionMatrix();
  }
  return { update };
}
