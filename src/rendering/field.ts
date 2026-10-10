import * as THREE from 'three';

/** Static first-run scene. Game rules will live independently of rendering. */
export function createField(host: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#102e3b');
  const camera = new THREE.OrthographicCamera(-80, 80, 55, -55, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.append(renderer.domElement);

  function rectangle(width: number, depth: number, color: string, x = 0, z = 0, y = 0) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({ color }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  rectangle(134, 72, '#b8b694');
  rectangle(120, 53.33, '#35714b', 0, 0, 0.01);
  for (let yard = -50; yard < 50; yard += 5) {
    rectangle(5, 53.33, yard % 10 === 0 ? '#438255' : '#3b784e', yard + 2.5, 0, 0.02);
  }
  rectangle(10, 53.33, '#183f52', -55, 0, 0.03);
  rectangle(10, 53.33, '#9d4c38', 55, 0, 0.03);
  for (let yard = -50; yard <= 50; yard += 5) {
    rectangle(0.18, 53.33, '#e5e5bf', yard, 0, 0.04);
  }
  for (let yard = -49; yard < 50; yard++) {
    for (const z of [-23.5, -3, 3, 23.5]) rectangle(0.12, 0.65, '#e5e5bf', yard, z, 0.05);
  }
  for (const z of [-26.65, 26.65]) rectangle(120, 0.35, '#e5e5bf', 0, z, 0.05);

  // Small pixel-style crowd blocks keep all assets local to the application.
  for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      rectangle(125, 2.5, '#254957', 0, side * (39 + row * 3), 1 + row);
      for (let seat = 0; seat < 62; seat++) {
        const colors = ['#d6bb78', '#bb654b', '#678b91', '#ece0b7'];
        rectangle(0.9, 0.9, colors[(seat + row) % colors.length], -60 + seat * 2, side * (39 + row * 3), 1.1 + row);
      }
    }
  }

  function resize() {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    const aspect = width / height;
    const halfHeight = Math.max(48, 76 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }
  function resetCamera() {
    camera.position.set(15, 100, 100);
    camera.lookAt(0, 0, 0);
    resize();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resetCamera();

  return {
    resetCamera,
    dispose() {
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
