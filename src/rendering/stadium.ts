import * as THREE from 'three';
import { createGoalPosts } from './goalPost';

function textPlane(text: string, width: number, height: number, color = '#eee5cc') {
  const canvas = document.createElement('canvas');
  canvas.width = text.length <= 2 ? 128 : 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 96px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, 69, canvas.width - 12);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
}

export function decorateField(scene: THREE.Scene) {
  for (let yard = -50; yard <= 50; yard += 10) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 53.33),
      new THREE.MeshBasicMaterial({ color: '#eee5cc' }),
    );
    stripe.name = 'yardLine';
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(yard, 0.06, 0);
    scene.add(stripe);
  }
  for (let yard = -40; yard <= 40; yard += 10) {
    const value = 50 - Math.abs(yard);
    for (const side of [-1, 1]) {
      const number = textPlane(String(value), 5.2, 3.6);
      number.rotation.x = -Math.PI / 2;
      number.position.set(yard, 0.07, side * 19);
      scene.add(number);
    }
  }
  for (const [x, name] of [
    [-55, 'AURORA WOLVES'],
    [55, 'CRIMSON HAWKS'],
  ] as const) {
    const label = textPlane(name, 47, 5);
    label.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    label.position.set(x, 0.07, 0);
    scene.add(label);
  }
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 53.33),
    new THREE.MeshBasicMaterial({ color: '#f4d575' }),
  );
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.2;
  scene.add(line);
  const targetLine = line.clone();
  targetLine.material = new THREE.MeshBasicMaterial({
    color: '#d3e6ee',
    transparent: true,
    opacity: 0.8,
  });
  targetLine.position.x = 17;
  scene.add(targetLine);
  createGoalPosts(scene);
  return (_lineOfScrimmage: number, target: number, showTarget = false) => {
    line.position.x = target;
    targetLine.visible = showTarget;
  };
}
