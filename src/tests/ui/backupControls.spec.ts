import { it, expect } from 'vitest';
import { backupMarkup } from '../../ui/backupControls';
it('requires review before enabling restoration and explains replacement', () => {
  expect(backupMarkup).toContain('id="restore-backup" type="button" disabled');
  expect(backupMarkup).toContain('revisar antes de restaurar');
  expect(backupMarkup).toContain('substitui o progresso');
});
