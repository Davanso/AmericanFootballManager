import * as THREE from 'three';
import { createAthletes } from './athletes';
import type { PlayState } from '../simulation/play';
import { createAdaptiveCamera } from './adaptiveCamera';
import { createStadium, decorateField } from './stadium';
import { createTurfTexture } from './turfTexture';

// Render the field independently of simulation rules.
export function createField(host: HTMLElement, initial: PlayState) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#8eb8bd');
  const camera = new THREE.OrthographicCamera(-80, 80, 55, -55, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
  host.append(renderer.domElement);

  function rectangle(width: number, depth: number, color: string, x = 0, z = 0, y = 0) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  rectangle(180, 110, '#35583c', 0, 0, -0.03);
  rectangle(128, 60, '#d1cfb9');
  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 53.33),
    new THREE.MeshBasicMaterial({ map: createTurfTexture() }),
  );
  turf.rotation.x = -Math.PI / 2;
  turf.position.y = 0.01;
  scene.add(turf);
  rectangle(10, 53.33, '#183f52', -55, 0, 0.03);
  rectangle(10, 53.33, '#9d4c38', 55, 0, 0.03);
  for (let yard = -50; yard <= 50; yard += 5) {
    rectangle(yard % 10 === 0 ? 0.28 : 0.12, 53.33, '#e5e5bf', yard, 0, 0.04);
  }
  for (let yard = -49; yard < 50; yard++) {
    for (const z of [-23.5, -3, 3, 23.5]) rectangle(0.12, 0.65, '#e5e5bf', yard, z, 0.05);
  }
  for (const z of [-26.65, 26.65]) rectangle(120, 0.35, '#e5e5bf', 0, z, 0.05);

  decorateField(scene);
  createStadium(scene);
  const athletes = createAthletes(scene, initial);
  const framing = createAdaptiveCamera(camera);
  let aspect = 1;
  let lastFrame = performance.now();
  function resize() {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    aspect = width / height;
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }
  function resetCamera() {
    framing.update(initial, aspect, 1);
    resize();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resetCamera();

  return {
    resetCamera,
    render(state: PlayState) {
      const now = performance.now();
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      framing.update(state, aspect, dt);
      lastFrame = now;
      athletes.render(state, dt);
      renderer.render(scene, camera);
    },
    dispose() {
      observer.disconnect();
      athletes.dispose();
      scene.traverse((object) => {
        if (
          !(
            object instanceof THREE.Mesh ||
            object instanceof THREE.Line ||
            object instanceof THREE.Sprite
          )
        )
          return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
