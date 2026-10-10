import { loadClub, saveClub, QUARTERBACKS } from '../management/club';
import { QB_PROFILES } from '../data/playerAttributes';
import { navigation } from './navigation';
export function mountManagement(path: string) {
  const club = loadClub();
  const roster = path === '/elenco';
  const app = document.querySelector('#app')!;
  app.innerHTML = `<main class="clubhouse management"><header><a class="brand" href="/">AFM<span>AURORA WOLVES · 1985</span></a><span class="era">SALA DO TÉCNICO</span></header>${navigation(roster ? 'roster' : 'config')}<p class="eyebrow">${roster ? 'ESCALAÇÃO / QUARTERBACKS' : 'PREFERÊNCIAS / OFFLINE'}</p><h1>${roster ? 'Quem lidera<br>seu ataque?' : 'Seu ritmo.<br>Seu jogo.'}</h1><p>${roster ? 'Escolha o titular para a próxima partida. Cada quarterback tem sua especialidade.' : 'As preferências valem para novas partidas e ficam salvas neste navegador.'}</p>${
    roster
      ? `<section class="roster-grid" aria-label="Quarterbacks">${QUARTERBACKS.map((player) => {
          const attributes = QB_PROFILES[player.profile];
          return `<article class="roster-card"><span class="jersey-number">${player.number}</span><p class="eyebrow">QB · ${attributes.name}</p><h2>${player.name}</h2><dl><dt>Velocidade</dt><dd>${attributes.speed}</dd><dt>Passe curto</dt><dd>${Math.round(attributes.shortPass * 100)}</dd><dt>Passe longo</dt><dd>${Math.round(attributes.longPass * 100)}</dd></dl><button data-starter="${player.id}" aria-pressed="${club.starter === player.id}">${club.starter === player.id ? 'Titular' : 'Escalar ' + player.name}</button></article>`;
        }).join(
          '',
        )}</section><p>Primeira etapa da gestão: quarterbacks. Demais posições, treino e evolução entram nas próximas entregas.</p>`
      : `<form id="settings" class="settings-panel"><label>Duração de cada quarto<select name="period" aria-label="Duração de cada quarto">${[60, 120, 180].map((n) => `<option value="${n}" ${club.periodSeconds === n ? 'selected' : ''}>${n / 60} minuto${n > 60 ? 's' : ''}</option>`).join('')}</select></label><label>Velocidade padrão do replay<select name="speed" aria-label="Velocidade padrão do replay">${[0.5, 1, 2].map((n) => `<option value="${n}" ${club.replaySpeed === n ? 'selected' : ''}>${n}×</option>`).join('')}</select></label><button>Salvar configurações</button></form>`
  }<p id="save-status" role="status">Escalação e configurações são salvas neste navegador. A partida em andamento não é salva.</p><a class="return-field" href="/">Ir para o campo →</a></main>`;
  document.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((button) =>
    button.addEventListener('click', () => {
      club.starter = button.dataset.starter!;
      if (!saveClub(club)) {
        document.querySelector('#save-status')!.textContent =
          'Não foi possível salvar. Verifique o armazenamento do navegador.';
        return;
      }
      mountManagement(path);
      document.querySelector('#save-status')!.textContent = 'Titular salvo para a próxima partida.';
    }),
  );
  document.querySelector<HTMLFormElement>('#settings')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    club.periodSeconds = Number(data.get('period'));
    club.replaySpeed = Number(data.get('speed'));
    document.querySelector('#save-status')!.textContent = saveClub(club)
      ? 'Configurações salvas.'
      : 'Não foi possível salvar. Verifique o armazenamento do navegador.';
  });
}
