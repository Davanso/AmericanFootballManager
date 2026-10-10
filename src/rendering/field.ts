import type { playerAppearance } from '../data/playerAppearance';
import * as THREE from 'three';
import { createAthletes } from './athletes';
import type { PlayState } from '../simulation/play';
import { createAdaptiveCamera } from './adaptiveCamera';
import { decorateField } from './stadium';
import { createTurfTexture } from './turfTexture';
import { showKickTarget } from '../simulation/kicking';
import { createStadiumBackdrop } from './stadiumBackdrop';
import { createTouchdownEffect } from './touchdownEffect';

// Render the field independently of simulation rules.
export function createField(
  host: HTMLElement,
  initial: PlayState,
  appearances?: Record<string, ReturnType<typeof playerAppearance>>,
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#35583c');
  const updateBackdrop = createStadiumBackdrop(
    scene,
    new THREE.TextureLoader().load('/assets/stadium1985.png'),
  );
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
    return mesh;
  }

  rectangle(121, 54.1, '#ede7c5');
  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 53.33),
    new THREE.MeshBasicMaterial({ map: createTurfTexture() }),
  );
  turf.rotation.x = -Math.PI / 2;
  turf.position.y = 0.01;
  scene.add(turf);
  const leftEndzone = rectangle(10, 53.33, '#183f52', -55, 0, 0.03);
  const rightEndzone = rectangle(10, 53.33, '#9d4c38', 55, 0, 0.03);
  for (const z of [-26.65, 26.65]) rectangle(120, 0.35, '#e5e5bf', 0, z, 0.05);

  const updateMarkers = decorateField(scene);
  updateMarkers(initial.lineOfScrimmage, initial.firstDownLine);

  const athletes = createAthletes(scene, initial, appearances);
  const framing = createAdaptiveCamera(camera);
  const touchdown = createTouchdownEffect(scene);
  let aspect = 1;
  let lastFrame = performance.now();
  function resize() {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    aspect = width / height;
    renderer.setSize(width, height);
    updateBackdrop(camera);
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
      const swapped = Boolean(state.matchPlay && state.controlSide === 'defense');
      leftEndzone.material.color.set(swapped ? '#9d4c38' : '#183f52');
      rightEndzone.material.color.set(swapped ? '#183f52' : '#9d4c38');
      updateMarkers(state.lineOfScrimmage, state.firstDownLine, showKickTarget(state), swapped);
      touchdown(state, dt);
      updateBackdrop(camera);
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
