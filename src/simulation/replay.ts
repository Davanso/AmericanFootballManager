import type { PlayState } from './play';
export function createReplay() {
  let source: PlayState | undefined;
  let frames: PlayState[] = [];
  let accumulated = 0;
  let elapsed = 0;
  let playing = false;
  let output: PlayState | undefined;
  const canPlay = () => frames.length > 1 && frames.at(-1)!.phase === 'finished';
  return {
    get playing() {
      return playing;
    },
    canPlay,
    record(state: PlayState, dt: number) {
      if (state !== source) {
        source = state;
        frames = [];
        accumulated = 0;
        playing = false;
        output = undefined;
      }
      if (state.phase === 'ready' || frames.at(-1)?.phase === 'finished') return;
      accumulated += dt;
      if (accumulated < 1 / 30 && state.phase !== 'finished') return;
      accumulated = 0;
      frames.push(structuredClone(state));
      if (frames.length > 460) frames.shift();
    },
    start() {
      if (!canPlay()) return;
      playing = true;
      elapsed = 0;
      output = structuredClone(frames[0]);
    },
    sample(dt: number, speed = 1) {
      if (!playing) return;
      elapsed += dt * Math.max(0.25, Math.min(2, speed));
      const index = Math.min(frames.length - 1, Math.floor(elapsed * 30));
      Object.assign(output!, frames[index]);
      if (index === frames.length - 1) playing = false;
      return output;
    },
    stop() {
      playing = false;
    },
  };
}
