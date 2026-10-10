import { ERAS } from '../data/eras';
import { loadClub, startingQB } from '../management/club';
import { createMatch } from '../simulation/match';
import { loadCampaign, saveCampaign, startCampaignMatch } from '../management/campaign';
import { navigation } from './navigation';
export function campaignMarkup() {
  const campaign = loadCampaign();
  const wins = campaign.results.filter((r) => r.wolves > r.hawks).length;
  const losses = campaign.results.filter((r) => r.wolves < r.hawks).length;
  const draws = campaign.results.length - wins - losses;
  return `<main class="clubhouse management"><header><a class="brand" href="/">AFM<span>AURORA WOLVES · ${ERAS[loadClub().era].year}</span></a><span class="era">ARQUIVO DO CLUBE</span></header>${navigation('campaign')}<p class="eyebrow">CAMPANHA OFFLINE</p><h1>Cada jogo<br>conta uma história.</h1><p>${wins} vitórias · ${losses} derrotas · ${draws} empates nos últimos 20 jogos.</p><section class="settings-panel"><h2>${campaign.active ? 'Partida salva' : 'Pronto para o próximo jogo'}</h2>${campaign.active ? `<p>Q${campaign.active.session.quarter} · ${Math.ceil(campaign.active.session.remaining)}s · Wolves ${campaign.active.session.scores.wolves} × ${campaign.active.session.scores.hawks} Hawks</p><a class="return-field" href="/">Retomar no campo →</a>` : '<p>Escolha Partida curta no campo para começar. Treinos livres não entram no histórico.</p><a class="return-field" href="/">Ir para o campo →</a>'}</section><button id="new-match">Nova partida com escalação atual</button><p id="campaign-message" role="status">Começar uma nova partida substitui a partida em andamento e preserva o histórico.</p><h2>Resultados recentes</h2>${
    campaign.results
      .slice()
      .reverse()
      .map(
        (r) =>
          `<article class="training-report"><strong>Jogo ${r.id} · ${r.wolves > r.hawks ? 'Vitória' : r.wolves < r.hawks ? 'Derrota' : 'Empate'}</strong><span>WOLVES ${r.wolves} × ${r.hawks} HAWKS</span></article>`,
      )
      .join('') || '<p>Nenhuma partida concluída ainda.</p>'
  }<p>Salvamento automático a cada segundo e ao sair do campo. O replay não é armazenado.</p></main>`;
}
export function mountCampaign() {
  document.documentElement.dataset.era = loadClub().era;
  document.querySelector('#app')!.innerHTML = campaignMarkup();
  document.querySelector('#new-match')!.addEventListener('click', () => {
    const club = loadClub();
    const next = startCampaignMatch(
      loadCampaign(),
      createMatch(club.periodSeconds, startingQB(club).profile),
      club,
    );
    if (!saveCampaign(next)) {
      document.querySelector('#campaign-message')!.textContent =
        'Não foi possível salvar a nova partida.';
      return;
    }
    location.href = '/';
  });
}
