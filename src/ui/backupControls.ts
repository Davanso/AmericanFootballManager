import { loadClub, startingQB } from '../management/club';
import { loadCampaign } from '../management/campaign';
import { exportBackup, parseBackup, restoreBackup } from '../management/backup';
import type { Backup } from '../management/backup';
export const backupMarkup = `<section class="settings-panel" aria-label="Backup do progresso"><h2>Seu clube, guardado.</h2><p>Exporte escalação, treino, preferências, partida salva e resultados em um arquivo JSON.</p><button id="export-backup" type="button">Exportar backup</button><label>Importar arquivo de backup<input id="import-backup" type="file" accept=".json,application/json" aria-label="Arquivo de backup"></label><p id="backup-preview" role="status">Escolha um arquivo para revisar antes de restaurar.</p><button id="restore-backup" type="button" disabled>Restaurar backup</button><p>Restaurar substitui o progresso deste navegador pelo conteúdo do arquivo.</p></section>`;
export function mountBackupControls() {
  let pending: Backup | undefined;
  let selection = 0;
  const status = document.querySelector<HTMLElement>('#backup-preview')!;
  const restore = document.querySelector<HTMLButtonElement>('#restore-backup')!;
  document.querySelector('#export-backup')!.addEventListener('click', () => {
    const blob = new Blob([exportBackup(loadClub(), loadCampaign())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aurora-wolves-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = 'Backup preparado para download.';
  });
  document
    .querySelector<HTMLInputElement>('#import-backup')!
    .addEventListener('change', async (event) => {
      const request = ++selection;
      pending = undefined;
      restore.disabled = true;
      const file = (event.currentTarget as HTMLInputElement).files?.[0];
      if (!file) {
        status.textContent = 'Escolha um arquivo de backup.';
        return;
      }
      if (file.size > 1000000) {
        status.textContent = 'Arquivo grande demais. Limite: 1 MB.';
        return;
      }
      try {
        const raw = await file.text();
        if (request !== selection) return;
        const backup = parseBackup(raw);
        if (!backup) {
          status.textContent = 'Backup inválido ou incompatível. Nenhum dado foi alterado.';
          return;
        }
        pending = backup;
        restore.disabled = false;
        status.textContent = `Prévia: QB ${startingQB(backup.club).name}, semana ${backup.club.training.week}, ${backup.campaign.results.length} resultados, ${backup.campaign.active ? 'uma partida salva' : 'sem partida em andamento'}. Clique em Restaurar backup para aplicar.`;
      } catch {
        status.textContent = 'Não foi possível ler o arquivo. Nenhum dado foi alterado.';
      }
    });
  restore.addEventListener('click', () => {
    if (!pending) return;
    try {
      const result = restoreBackup(pending, localStorage);
      if (result === 'saved') {
        location.reload();
        return;
      }
      status.textContent =
        result === 'failed'
          ? 'Não foi possível restaurar. O progresso anterior foi preservado.'
          : 'Falha de armazenamento durante a restauração. Guarde o arquivo e tente novamente quando o navegador permitir salvar.';
    } catch {
      status.textContent = 'O armazenamento do navegador está indisponível.';
    }
  });
}
