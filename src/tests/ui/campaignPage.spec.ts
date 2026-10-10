import { it, expect } from 'vitest';
import { campaignMarkup } from '../../ui/campaignPage';
it('shows honest empty history and new game controls', () => {
  const html = campaignMarkup();
  expect(html).toContain('Nenhuma partida concluída');
  expect(html).toContain('Nova partida com escalação atual');
  expect(html).toContain('/campanha');
});
