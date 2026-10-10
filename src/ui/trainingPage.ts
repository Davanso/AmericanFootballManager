import { loadClub, saveClub, QUARTERBACKS } from '../management/club';
import { ROSTER } from '../management/roster';
import { QB_PROFILES } from '../data/playerAttributes';
import { FOCUSES, trainPlayer, nextTrainingWeek, trainedAttributes } from '../management/training';
import type { TrainingFocus } from '../management/training';
import { navigation } from './navigation';
export function trainingMarkup() {
  const club = loadClub();
  const players = [
    ...QUARTERBACKS.map((q) => ({
      id: q.id,
      name: q.name,
      position: 'QB',
      attributes: { ...QB_PROFILES[q.profile], catching: 0.95 },
    })),
    ...ROSTER,
  ];
  return `<main class="clubhouse management"><header><a class="brand" href="/">AFM<span>AURORA WOLVES · 1985</span></a><span class="era">CENTRO DE TREINAMENTO</span></header>${navigation('training')}<p class="eyebrow">SEMANA ${club.training.week} · ${club.training.remaining} SESSÕES DISPONÍVEIS</p><h1>Prepare o time.<br>Ganhe jardas.</h1><p>Cada sessão desenvolve um atleta. Velocidade: +0.1; recepção e precisão: +0.5 ponto percentual. Máximo de dez sessões por habilidade e atleta.</p><form id="training" class="settings-panel"><label>Atleta<select name="player" aria-label="Atleta para treinar">${players.map((p) => `<option value="${p.id}">${p.position} · ${p.name}</option>`).join('')}</select></label><label>Habilidade<select name="focus" aria-label="Habilidade de treino">${Object.entries(
    FOCUSES,
  )
    .map(([id, label]) => `<option value="${id}">${label}</option>`)
    .join(
      '',
    )}</select></label><button ${club.training.remaining <= 0 ? 'disabled' : ''}>Treinar atleta</button></form><button id="next-week">Avançar semana</button><p>Avançar semana recupera três sessões. Nesta demo, o calendário de treino é independente das partidas.</p><p id="training-status" role="status">Passe curto e longo são treinos exclusivos dos QBs. A evolução é aplicada no próximo snap.</p><section aria-label="Desenvolvimento dos atletas"><h2>Relatório de evolução</h2>${
    players
      .filter((p) => club.training.progress[p.id])
      .map((p) => {
        const attr = trainedAttributes(p.attributes, club.training, p.id);
        return `<article class="training-report"><strong>${p.name}</strong><span>VEL ${attr.speed.toFixed(1)} · REC ${(attr.catching * 100).toFixed(1)} · CURTO ${(attr.shortPass * 100).toFixed(1)} · LONGO ${(attr.longPass * 100).toFixed(1)}</span></article>`;
      })
      .join('') || '<p>Nenhum atleta treinado ainda. Escolha seu primeiro foco.</p>'
  }</section></main>`;
}
export function mountTraining() {
  document.querySelector('#app')!.innerHTML = trainingMarkup();
  const club = loadClub();
  const finish = (success: string) => {
    if (!saveClub(club)) {
      document.querySelector('#training-status')!.textContent = 'Não foi possível salvar o treino.';
      return;
    }
    mountTraining();
    document.querySelector('#training-status')!.textContent = success;
  };
  document.querySelector<HTMLFormElement>('#training')!.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const next = trainPlayer(
      club.training,
      String(data.get('player')),
      String(data.get('focus')) as TrainingFocus,
    );
    if (next === club.training) {
      document.querySelector('#training-status')!.textContent =
        'Treino indisponível: verifique a posição, sessões restantes e limite da habilidade.';
      return;
    }
    club.training = next;
    finish('Treino concluído e evolução salva.');
  });
  document.querySelector('#next-week')!.addEventListener('click', () => {
    club.training = nextTrainingWeek(club.training);
    finish('Nova semana iniciada: três sessões disponíveis.');
  });
}
