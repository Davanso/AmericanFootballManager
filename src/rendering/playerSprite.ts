import * as THREE from 'three';
import { playerAppearance } from '../data/playerAppearance';

const DIGITS = [
  '111101101101111',
  '010110010010111',
  '111001111100111',
  '111001111001111',
  '101101111001001',
  '111100111001111',
  '111100111101111',
  '111001001001001',
  '111101111101111',
  '111101111001111',
];

export function createPlayerTexture(team: 'home' | 'away', frame: number, id = 'qb') {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;
  const appearance = playerAppearance(id, team);
  const primary = team === 'home' ? '#e4b446' : '#b94f42';
  const dark = team === 'home' ? '#99792f' : '#733932';
  const stride = frame < 4 ? [0, 2, 0, -2][frame] : 0;
  const rect = (color: string, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // Broad pads, tall socks and striped helmets establish the 1980s silhouette.
  rect('#20362d', 8 - stride, 27, 7, 11);
  rect('#20362d', 19 + stride, frame === 7 ? 26 : 27, frame === 7 ? 11 : 7, frame === 7 ? 6 : 11);
  rect('#e8ddbb', 9 - stride, 28, 5, 6);
  rect('#e8ddbb', 20 + stride, frame === 7 ? 27 : 28, frame === 7 ? 9 : 5, 5);
  rect(primary, 9 - stride, 34, 5, 2);
  rect(primary, 20 + stride, 34, 5, 2);
  rect(appearance.cleats, 7 - stride, 37, 8, 2);
  rect(appearance.cleats, frame === 7 ? 25 : 19 + stride, frame === 7 ? 30 : 37, 8, 2);
  rect('#20362d', 5, 16, 23, 7);
  rect('#20362d', 9, 22, 15, 8);
  rect(primary, 6, 17, 21, 5);
  rect(primary, 10, 21, 13, 7);
  rect(dark, 22, 18, 4, 9);
  rect('#fff0cc', 7, 18, 4, 2);
  rect('#fff0cc', 23, 18, 3, 2);
  const leftY = frame === 4 ? 27 : frame === 5 ? 23 : 23 + stride;
  const rightY = frame === 6 ? 8 : frame === 5 ? 23 : 23 - stride;
  rect('#20362d', 4, 21, 5, 9);
  rect(appearance.skin, 5, leftY, 4, 5);
  rect('#fff0cc', 5, leftY, 4, 1);
  rect(appearance.skin, frame === 5 ? 19 : 25, rightY, 4, 6);
  rect('#fff0cc', frame === 5 ? 19 : 25, rightY + 4, 4, 1);
  rect('#20362d', 8, 3, 17, 12);
  rect(primary, 9, 4, 15, 9);
  rect(primary, 11, 2, 10, 2);
  rect(dark, 21, 5, 3, 8);
  rect('#fff0cc', 15, 3, 2, 7);
  rect(appearance.hair, 8, 12, 4, appearance.mullet ? 6 : 2);
  rect(appearance.skin, 15, 10, 9, 6);
  rect('#20362d', 21, 11, 2, 1);
  if (appearance.moustache) rect(appearance.hair, 19, 14, 4, 1);
  rect('#e1dfc4', 24, 10, 2, 7);
  rect('#e1dfc4', 18, 16, 8, 1);
  const number = String(appearance.number).padStart(2, '0');
  [...number].forEach((digit, index) => {
    [...DIGITS[Number(digit)]].forEach((pixel, offset) => {
      if (pixel === '1')
        rect('#fff0cc', 12 + index * 4 + (offset % 3), 22 + Math.floor(offset / 3), 1, 1);
    });
  });
  if (frame === 5 || frame === 6) {
    const x = frame === 6 ? 24 : 16;
    const y = frame === 6 ? 7 : 26;
    rect('#714327', x, y, 7, 3);
    rect('#fff0cc', x + 2, y + 1, 3, 1);
  }
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
