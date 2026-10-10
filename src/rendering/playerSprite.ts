import * as THREE from 'three';

export function createPlayerTexture(team: 'home' | 'away', frame: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;
  const primary = team === 'home' ? '#e9b84c' : '#cd5349';
  const dark = team === 'home' ? '#916c29' : '#7f2e32';
  const stride = [0, 2, 0, -2][frame];
  const fill = (color: string, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };
  // Broad pads, shaded helmets and a mustache establish the retro human silhouette.
  fill('#142d35', 7 - stride, 29, 8, 10);
  fill('#142d35', 18 + stride, 29, 8, 10);
  fill('#eee3ba', 8 - stride, 28, 7, 7);
  fill('#c8bb91', 18 + stride, 28, 7, 7);
  fill('#182f37', 5 - stride, 36 - Math.max(0, stride), 10, 3);
  fill('#182f37', 18 + stride, 36 - Math.max(0, -stride), 10, 3);
  fill('#142d35', 3, 16, 26, 15);
  fill(primary, 5, 17, 22, 11);
  fill(dark, 5, 25, 22, 4);
  fill('#fff0c6', 8, 18, 3, 3);
  fill('#fff0c6', 21, 18, 3, 3);
  fill('#142d35', 1, 20 + stride, 5, 12);
  fill('#db996b', 2, 21 + stride, 4, 9);
  fill('#142d35', 26, 20 - stride, 5, 12);
  fill('#b47753', 26, 21 - stride, 4, 9);
  fill('#142d35', 6, 2, 20, 14);
  fill('#142d35', 9, 0, 14, 18);
  fill(primary, 8, 3, 16, 9);
  fill(dark, 8, 10, 16, 3);
  fill('#fff0c6', 11, 2, 10, 2);
  fill('#f4d88a', 8, 5, 3, 5);
  fill('#e5ab7e', 10, 12, 12, 6);
  fill('#b47753', 19, 12, 3, 6);
  fill('#24333b', 12, 13, 2, 2);
  fill('#24333b', 18, 13, 2, 2);
  fill('#633b28', 13, 16, 7, 2);
  fill('#c8d5c7', 7, 11, 2, 5);
  fill('#c8d5c7', 23, 11, 2, 5);
  fill('#fff0c6', 14, 20, 4, 6);
  fill('#223b43', 15, 21, 2, 3);
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function createKeyTexture(label: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#102e3b';
  ctx.fillRect(2, 2, 44, 44);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 40, 40);
  ctx.fillStyle = color;
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 24, 25);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
