import * as THREE from 'three';

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
  for (const [x, color] of [
    [-19, '#64d7ee'],
    [-9, '#f2cf6c'],
  ] as const) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 53.33),
      new THREE.MeshBasicMaterial({ color }),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.085, 0);
    scene.add(line);
  }
}

export function createStadium(scene: THREE.Scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const fill = (color: string, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };
  ctx.scale(2, 2);
  const sky = ctx.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#92c8db');
  sky.addColorStop(1, '#d4e1bc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 24; i++) {
    const x = i * 45;
    fill('#34593c', x + 16, 37, 8, 100);
    fill('#426f45', x, 25 + (i % 3) * 8, 40, 70);
    fill('#63924d', x + 5, 16 + (i % 3) * 8, 29, 48);
    fill('#86a953', x + 9, 20 + (i % 3) * 8, 12, 20);
  }
  fill('#563c34', 270, 72, 484, 92);
  fill('#a96f4e', 278, 81, 468, 80);
  fill('#283f44', 265, 64, 494, 13);
  fill('#e4c596', 278, 100, 468, 5);
  for (let row = 0; row < 5; row++)
    for (let column = 0; column < 38; column++)
      fill('#b88159', 280 + column * 12 + (row % 2) * 5, 83 + row * 15, 9, 3);
  for (let x = 295; x < 735; x += 35) {
    fill('#e3cfa6', x, 110, 20, 38);
    fill('#254654', x + 4, 114, 12, 29);
    fill('#7da7a6', x + 5, 115, 4, 12);
  }
  fill('#ddc69b', 472, 46, 80, 118);
  fill('#344c4d', 493, 112, 38, 52);
  ctx.fillStyle = '#1b343a';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WOLVES FIELD', 512, 76);
  for (let row = 0; row < 5; row++) {
    fill('#304a51', 0, 168 + row * 13, 1024, 12);
    for (let seat = 0; seat < 145; seat++) {
      const x = seat * 7 + (row % 2) * 3;
      const colors = ['#e4ba62', '#c45543', '#608a9c', '#e9ddba'];
      fill('#d39b72', x + 1, 170 + row * 13, 3, 3);
      fill(colors[(seat * 3 + row) % colors.length], x, 173 + row * 13, 5, 6);
    }
  }
  fill('#173b3e', 0, 233, 1024, 23);
  ctx.fillStyle = '#e4c277';
  ctx.font = 'bold 11px monospace';
  for (let x = 80; x < 1024; x += 190) ctx.fillText('AURORA • 1985', x, 248);
  for (const x of [100, 905]) {
    fill('#748e90', x + 9, 20, 4, 142);
    fill('#263f49', x, 15, 24, 17);
    for (let light = 0; light < 3; light++) fill('#f5e6ac', x + 3 + light * 7, 18, 5, 9);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.LinearFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 24),
    new THREE.MeshBasicMaterial({ map }),
  );
  backdrop.position.set(0, 12, -31);
  scene.add(backdrop);
}
