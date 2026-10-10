import * as THREE from 'three';

export function createGoalPosts(scene: THREE.Scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#85632b';
  ctx.fillRect(3, 2, 4, 46);
  ctx.fillRect(25, 2, 4, 46);
  ctx.fillRect(3, 44, 26, 4);
  ctx.fillRect(14, 48, 4, 14);
  ctx.fillStyle = '#ffe17a';
  ctx.fillRect(4, 2, 2, 44);
  ctx.fillRect(26, 2, 2, 44);
  ctx.fillRect(4, 44, 24, 2);
  ctx.fillRect(15, 46, 2, 15);
  ctx.fillStyle = '#193c4d';
  ctx.fillRect(12, 55, 8, 9);
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  for (const x of [-60, 60]) {
    const post = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthTest: false }));
    post.name = 'goalPost';
    post.center.set(0.5, 0);
    post.position.set(x, 0.2, 0);
    post.scale.set(5, 10, 1);
    post.renderOrder = 3;
    scene.add(post);
  }
}
