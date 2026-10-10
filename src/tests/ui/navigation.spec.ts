import { it, expect } from 'vitest';
import { navigation } from '../../ui/navigation';
it('links separate pages and marks only the current page', () => {
  const html = navigation('roster');
  expect(html).toContain('href="/elenco" aria-current="page"');
  expect(html).toContain('href="/config"');
  expect(html.match(/aria-current/g)).toHaveLength(1);
});
