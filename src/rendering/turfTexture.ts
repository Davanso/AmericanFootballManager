import * as THREE from 'three';

export function createTurfTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#326e3d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let stripe = 0; stripe < 24; stripe++) {
    ctx.fillStyle = stripe % 2 === 0 ? '#48844b' : '#407b43';
    ctx.fillRect((stripe * canvas.width) / 24, 0, canvas.width / 24 + 1, canvas.height);
  }
  // A fixed seed keeps the grass identical across reloads.
  let seed = 1985;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let blade = 0; blade < 65000; blade++) {
    ctx.fillStyle = blade % 2 === 0 ? '#ffffff0c' : '#163d2512';
    ctx.fillRect(random() * canvas.width, random() * canvas.height, 1, 2);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}
