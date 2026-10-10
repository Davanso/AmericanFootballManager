import type { PlayState } from '../simulation/play';
import { PASS_TARGETS } from '../data/passTargets';
import { downLabel } from '../simulation/drive';

export function createPlayStatus() {
  const status = document.querySelector<HTMLElement>('#render-status')!;
  const info = document.querySelector<HTMLElement>('#play-info')!;
  const result = document.querySelector<HTMLElement>('#result')!;
  const snap = document.querySelector<HTMLButtonElement>('#snap')!;
  const passes = [...document.querySelectorAll<HTMLButtonElement>('[data-pass]')];
  const distance = document.querySelector<HTMLElement>('#down-distance')!;
  const caption = document.querySelector<HTMLElement>('#down-caption')!;
  const spot = document.querySelector<HTMLElement>('#ball-spot')!;
  const score = document.querySelector<HTMLElement>('#home-score')!;
  const next = document.querySelector<HTMLButtonElement>('#next-play')!;
  const touchdown = document.querySelector<HTMLElement>('#touchdown')!;
  const startSpot = document.querySelector<HTMLSelectElement>('#start-spot')!;
  return (state: PlayState) => {
    distance.textContent =
      state.drive.status === 'touchdown'
        ? 'TOUCHDOWN · +6'
        : state.drive.status === 'turnover'
          ? 'FIM DO DRIVE'
          : downLabel(state.drive);
    caption.textContent = state.phase === 'finished' ? 'PRÓXIMA DESCIDA' : 'DESCIDA ATUAL';
    const yard = Math.round(state.drive.spot < 0 ? state.drive.spot + 50 : 50 - state.drive.spot);
    spot.textContent = `BOLA · ${state.drive.spot < 0 ? 'WOLVES' : 'HAWKS'} ${yard}`;
    score.textContent = String(state.drive.score).padStart(2, '0');
    next.disabled = state.phase !== 'finished';
    next.textContent = state.drive.status === 'active' ? 'Próxima jogada →' : 'Novo drive →';
    touchdown.hidden = state.outcome !== 'touchdown';
    startSpot.disabled = state.phase !== 'ready' && state.phase !== 'finished';
    snap.disabled = state.phase !== 'ready';
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    const canPass =
      state.phase === 'live' && state.carrier === 'qb' && qb.x < state.lineOfScrimmage;
    passes.forEach((button) => {
      button.disabled = !canPass;
    });
    result.textContent =
      state.result || PASS_TARGETS.map((target) => `${target.label} · ${target.name}`).join(' / ');
    if (state.phase === 'ready') {
      info.textContent = 'ANTES DO SNAP';
      status.textContent = 'Rotas visíveis · escolha o momento do snap';
      return;
    }
    if (state.phase === 'finished') {
      info.textContent = 'FIM DA JOGADA';
      status.textContent =
        state.drive.status === 'turnover'
          ? 'Quarta descida sem conversão · drive encerrado; inicie um novo drive de treino'
          : 'Jogada encerrada · avance para a próxima jogada';
      return;
    }
    info.textContent = `${state.decision.toFixed(1)}s · EM JOGO`;
    status.textContent = 'Rotas ocultas · simulação em andamento';
  };
}
