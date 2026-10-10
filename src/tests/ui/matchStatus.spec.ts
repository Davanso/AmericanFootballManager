import { afterEach, it, expect, vi } from 'vitest';
import { createMatchStatus } from '../../ui/matchStatus';
import { createMatch } from '../../simulation/match';
import { scoreboardView } from '../../ui/broadcastScoreboard';
afterEach(() => vi.unstubAllGlobals());
it('matches broadcast clock rounding without allowing a snap in a finished match', () => {
  const nodes = new Map<string, { textContent: string; disabled: boolean }>();
  const node = (id: string) => {
    if (!nodes.has(id)) nodes.set(id, { textContent: '', disabled: false });
    return nodes.get(id)!;
  };
  vi.stubGlobal('document', { querySelector: node, querySelectorAll: () => [] });
  const match = createMatch();
  match.remaining = 59.9;
  const update = createMatchStatus();
  update(match, match.play);
  expect(node('#play-info').textContent).toContain(scoreboardView(match, match.play).clock);
  match.finished = true;
  update(match, match.play);
  expect(node('#snap').disabled).toBe(true);
});
