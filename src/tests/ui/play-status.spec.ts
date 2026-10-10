import { afterEach, expect, it, vi } from 'vitest';
import { createPlayStatus } from '../../ui/play-status';
import { createPlay, finishPlay } from '../../simulation/play';
import { chooseConversion } from '../../simulation/conversion';
afterEach(() => vi.unstubAllGlobals());
it('requires a conversion choice and locks training controls until the attempt ends', () => {
  const nodes = new Map<
    string,
    { hidden: boolean; disabled: boolean; textContent: string; style: object; value: number }
  >();
  const node = (selector: string) => {
    if (!nodes.has(selector))
      nodes.set(selector, { hidden: false, disabled: false, textContent: '', style: {}, value: 0 });
    return nodes.get(selector)!;
  };
  vi.stubGlobal('document', { querySelector: node, querySelectorAll: () => [] });
  const update = createPlayStatus();
  const td = createPlay();
  td.ball.x = 50;
  finishPlay(td, 'Touchdown', 'touchdown');
  update(td);
  expect(node('#conversion-choice').hidden).toBe(false);
  expect(node('#next-play').disabled).toBe(true);
  const state = chooseConversion(td, 'twoPoint');
  update(state);
  expect(node('#conversion-choice').hidden).toBe(true);
  expect(node('#start-spot').disabled).toBe(true);
  expect(node('#choose-kick').disabled).toBe(true);
  expect(node('#down-distance').textContent).toContain('2 POINT');
  state.ball.x = 50;
  finishPlay(state, 'conversion', 'touchdown');
  update(state);
  expect(node('#home-score').textContent).toBe('08');
  expect(node('#touchdown').hidden).toBe(true);
  expect(node('#next-play').disabled).toBe(false);
});

it('shows RB controls without a passing countdown during a run', () => {
  const nodes = new Map<
    string,
    { textContent: string; disabled: boolean; hidden: boolean; style: object; value: number }
  >();
  const node = (selector: string) => {
    if (!nodes.has(selector))
      nodes.set(selector, { textContent: '', disabled: false, hidden: false, style: {}, value: 0 });
    return nodes.get(selector)!;
  };
  vi.stubGlobal('document', { querySelector: node, querySelectorAll: () => [] });
  const state = createPlay(undefined, 'run');
  state.phase = 'live';
  state.carrier = 'rb';
  createPlayStatus()(state);
  expect(node('#play-title').textContent).toContain('CORRIDA PELO MEIO');
  expect(node('#play-info').textContent).toContain('RB #34');
  expect(node('#render-status').textContent).toContain('WASD');
});
