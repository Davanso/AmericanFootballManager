import type { PlayState } from './play';
export function nextRandom(state: PlayState) {
  let seed = state.randomState >>> 0;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state.randomState = seed >>> 0;
  return state.randomState / 4294967296;
}
