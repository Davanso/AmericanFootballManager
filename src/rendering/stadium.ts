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
  const markers = ['#63cde1', '#f4d575'].map((color) => {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 53.33),
      new THREE.MeshBasicMaterial({ color }),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.085;
    scene.add(line);
    return line;
  });
  return (lineOfScrimmage: number, target: number) => {
    markers[0].position.x = lineOfScrimmage;
    markers[1].position.x = target;
  };
}

export function createStadium(scene: THREE.Scene) {
  const map = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/stadium1985.png`);
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.LinearFilter;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(190, 27),
    new THREE.MeshBasicMaterial({ map }),
  );
  backdrop.position.set(0, 13.5, -28.2);
  scene.add(backdrop);
}
