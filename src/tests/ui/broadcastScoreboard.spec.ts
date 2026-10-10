import { expect, it } from 'vitest';
import { scoreboardView } from '../../ui/broadcastScoreboard';
import { createMatch } from '../../simulation/match';
import { createPlay } from '../../simulation/play';
it('shows independent scores possession quarter time down and field position', () => {
  const match = createMatch();
  match.possession = 'hawks';
  match.scores = { wolves: 7, hawks: 3 };
  match.quarter = 4;
  match.remaining = 9.4;
  const view = scoreboardView(match, match.play);
  expect(view.wolves).toBe('07');
  expect(view.hawks).toBe('03');
  expect(view.clock).toBe('0:10');
  expect(view.period).toBe('Q4');
  expect(view.possession).toBe('hawks');
  expect(view.spot).toContain('HAWKS');
});
it('keeps training clocks and conversion labels readable and reports the final winner', () => {
  const state = createPlay();
  state.drive.attempt = 'twoPoint';
  expect(scoreboardView(undefined, state).down).toBe('2 POINT TRY');
  const match = createMatch();
  match.finished = true;
  match.scores.wolves = 8;
  expect(scoreboardView(match, match.play).phase).toContain('Wolves venceu');
});
