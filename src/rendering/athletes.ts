import * as THREE from 'three';
import type { PlayState } from '../simulation/play';
import { PASS_TARGETS } from '../data/passTargets';
import { createPlayerTexture, createKeyTexture } from './playerSprite';
import { createRoute } from './routeDrawing';
import { ballPresentation, fallPresentation } from './finishAnimation';

export function createAthletes(scene: THREE.Scene, initial: PlayState) {
  const textures = new Map(
    initial.athletes.map((athlete) => [
      athlete.id,
      Array.from({ length: 8 }, (_, frame) => createPlayerTexture(athlete.team, frame, athlete.id)),
    ]),
  );
  const group = new THREE.Group();
  const routes = new THREE.Group();
  const sprites = new Map<string, THREE.Sprite>();
  const shadows = new Map<string, THREE.Mesh>();
  const badges = new Map<string, THREE.Sprite>();
  for (const athlete of initial.athletes) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: textures.get(athlete.id)![0] }),
    );
    sprite.scale.set(4.4, 5.5, 1);
    group.add(sprite);
    sprites.set(athlete.id, sprite);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 16),
      new THREE.MeshBasicMaterial({
        color: '#133c32',
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.y = 0.65;
    group.add(shadow);
    shadows.set(athlete.id, shadow);
    const target = PASS_TARGETS.find((receiver) => receiver.id === athlete.id);
    if (!target) continue;
    const badge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createKeyTexture(target.label, target.color),
        depthTest: false,
      }),
    );
    badge.scale.set(2.8, 2.8, 1);
    badge.renderOrder = 5;
    group.add(badge);
    badges.set(athlete.id, badge);
  }
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 8, 6),
    new THREE.MeshBasicMaterial({ color: '#a56432' }),
  );
  ball.scale.set(1.5, 0.7, 0.7);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 2.1, 24),
    new THREE.MeshBasicMaterial({ color: '#ffe28b', side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  group.add(ball, ring, routes);
  scene.add(group);
  let finishSeconds = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let routeState: PlayState | undefined;
  function render(state: PlayState, dt = 0) {
    if (routeState !== state) {
      routes.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      routes.clear();
      const routeTargets = state.kind === 'run' ? [{ id: 'rb', color: '#b7ef8c' }] : PASS_TARGETS;
      for (const target of routeTargets) {
        const receiver = state.athletes.find((athlete) => athlete.id === target.id)!;
        const route = createRoute([receiver, ...receiver.route], target.color);
        route.name = `route:${target.id}`;
        routes.add(route);
      }
      routeState = state;
      finishSeconds = 0;
    }
    finishSeconds = state.phase === 'finished' ? finishSeconds + dt : 0;
    routes.visible = state.phase === 'ready' && state.kind !== 'kick';
    for (const athlete of state.athletes) {
      const sprite = sprites.get(athlete.id)!;
      const moving =
        Math.hypot(sprite.position.x - athlete.x, sprite.position.z - athlete.z) > 0.001;
      const active = moving && !['ready', 'finished'].includes(state.phase);
      let animation = active ? Math.floor(state.elapsed * 10 + athlete.id.charCodeAt(0)) % 4 : 0;
      if (athlete.id === 'ol2' && state.phase === 'snap') animation = 4;
      if (
        athlete.id === 'qb' &&
        (state.carrier === 'qb' || (state.phase === 'snap' && state.elapsed > 0.2))
      )
        animation = 5;
      if (athlete.id === state.carrier && athlete.id !== 'qb') animation = 5;
      if (athlete.id === 'qb' && state.phase === 'handoff') animation = 5;
      if (athlete.id === 'qb' && state.phase === 'pass' && state.flight < 0.3) animation = 6;
      if (
        athlete.id === 'rb' &&
        state.kind === 'kick' &&
        state.phase === 'kickFlight' &&
        state.flight > 0.12
      )
        animation = 7;
      sprite.material.map = textures.get(athlete.id)![animation];
      sprite.material.rotation = 0;
      sprite.material.depthTest = state.fallen !== athlete.id;
      sprite.renderOrder = state.fallen === athlete.id ? 6 : 0;
      sprite.scale.set(4.4, 5.5, 1);
      const bounce = active ? Math.abs(Math.sin(state.elapsed * 20)) * 0.3 : 0;
      sprite.position.set(athlete.x, 3.1 + bounce, athlete.z);
      if (state.outcome === 'touchdown' && athlete.id === state.carrier && !reducedMotion) {
        sprite.position.y += Math.abs(Math.sin(Math.min(finishSeconds, 3) * Math.PI * 2)) * 1.8;
      }
      if (state.fallen === athlete.id) {
        const fall = fallPresentation(finishSeconds);
        sprite.material.rotation = fall.rotation;
        sprite.scale.y = fall.scaleY;
        sprite.position.y = fall.height;
      }
      shadows.get(athlete.id)!.position.set(athlete.x, 0.09, athlete.z);
      const badge = badges.get(athlete.id);
      if (!badge) continue;
      badge.position.set(athlete.x, 7.7, athlete.z);
      badge.visible =
        state.kind !== 'run' &&
        (state.phase === 'ready' ||
          state.phase === 'snap' ||
          (state.phase === 'live' && state.carrier === 'qb'));
    }
    const displayedBall = ballPresentation(state, finishSeconds);
    ball.position.set(
      displayedBall.x,
      displayedBall.height + (state.carrier ? 1 : 0),
      displayedBall.z,
    );
    ball.rotation.z =
      state.outcome === 'incomplete' ? Math.min(finishSeconds, 2) * 5 : state.flight * 6;
    const carrier = state.athletes.find((athlete) => athlete.id === (state.carrier || 'qb'))!;
    ring.position.set(carrier.x, 0.2, carrier.z);
  }
  render(initial);
  return {
    render,
    dispose() {
      textures.forEach((frames) => frames.forEach((map) => map.dispose()));
    },
  };
}
