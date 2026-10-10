import * as THREE from 'three';
import type { Position } from '../simulation/play';

export function createRoute(points: Position[], color: string) {
  const group = new THREE.Group();
  for (let index = 1; index < points.length; index++) {
    const start = points[index - 1];
    const end = points[index];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz);
    for (const [width, y, tint] of [
      [0.9, 0.12, '#163b32'],
      [0.45, 0.16, color],
    ] as const) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(length, width),
        new THREE.MeshBasicMaterial({ color: tint }),
      );
      strip.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx));
      strip.position.set((start.x + end.x) / 2, y, (start.z + end.z) / 2);
      group.add(strip);
    }
  }
  const end = points[points.length - 1];
  const previous = points[points.length - 2];
  const angle = Math.atan2(end.z - previous.z, end.x - previous.x);
  const shape = new THREE.Shape();
  shape.moveTo(1.8, 0);
  shape.lineTo(-1, 1.2);
  shape.lineTo(-1, -1.2);
  shape.closePath();
  const arrow = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
  );
  arrow.rotation.set(-Math.PI / 2, 0, -angle);
  arrow.position.set(end.x, 0.2, end.z);
  group.add(arrow);
  return group;
}
