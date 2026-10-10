import type { PlayState } from '../simulation/play';
import { PASS_TARGETS } from '../data/passTargets';

export function createPlayStatus() {
  const status = document.querySelector<HTMLElement>('#render-status')!;
  const info = document.querySelector<HTMLElement>('#play-info')!;
  const result = document.querySelector<HTMLElement>('#result')!;
  const snap = document.querySelector<HTMLButtonElement>('#snap')!;
  const passes = [...document.querySelectorAll<HTMLButtonElement>('[data-pass]')];
  return (state: PlayState) => {
    snap.disabled = state.phase !== 'ready';
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    const canPass = state.phase === 'live' && state.carrier === 'qb' && qb.x < -19;
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
      status.textContent = 'Jogada encerrada · reinicie para tentar novamente';
      return;
    }
    info.textContent = `${state.decision.toFixed(1)}s · EM JOGO`;
    status.textContent = 'Rotas ocultas · simulação em andamento';
  };
}
