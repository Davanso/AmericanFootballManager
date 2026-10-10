import { it, expect } from 'vitest';
import { trainingMarkup } from '../../ui/trainingPage';
it('shows available sessions, skill limits and navigation', () => {
  const html = trainingMarkup();
  expect(html).toContain('3 SESSÕES DISPONÍVEIS');
  expect(html).toContain('Atleta para treinar');
  expect(html).toContain('dez sessões');
});
