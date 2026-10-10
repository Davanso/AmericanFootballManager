import * as THREE from 'three';
import type { PlayState } from '../simulation/play';

export function createTouchdownEffect(scene: THREE.Scene) {
  const group = new THREE.Group();
  const colors = ['#ffd56c', '#fff4c6', '#54d6b7', '#e66e52'];
  for (let i = 0; i < 48; i++) {
    const particle = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.8),
      new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide }),
    );
    group.add(particle);
  }
  scene.add(group);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seconds = 0;
  let previous: PlayState | undefined;
  return (state: PlayState, dt: number) => {
    if (previous !== state || state.outcome !== 'touchdown') seconds = 0;
    previous = state;
    group.visible = state.outcome === 'touchdown' && !reducedMotion && seconds < 4;
    if (!group.visible) return;
    seconds += dt;
    group.position.set(state.ball.x, 0, state.ball.z);
    group.children.forEach((particle, i) => {
      const angle = i * 2.4;
      const speed = 2 + (i % 7) * 0.7;
      particle.position.set(
        Math.cos(angle) * speed * seconds,
        Math.max(0.2, 5 + (8 + (i % 5)) * seconds - 4 * seconds * seconds),
        Math.sin(angle) * speed * seconds,
      );
      particle.rotation.set(seconds * 3 + i, seconds * 2, seconds + angle);
    });
  };
}
