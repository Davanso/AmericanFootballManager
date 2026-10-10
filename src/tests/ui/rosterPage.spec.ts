import { it, expect } from 'vitest';
import { depthChart } from '../../ui/rosterPage';
import { defaultClub } from '../../management/club';
it('shows all positions with named selections and attribute summaries', () => {
  const markup = depthChart(defaultClub());
  expect(markup.match(/data-slot=/g)).toHaveLength(21);
  expect(markup).toContain('aria-label="Running back"');
  expect(markup).toContain('aria-label="Cornerback 3"');
  expect(markup).toContain('VEL 7.3');
});
