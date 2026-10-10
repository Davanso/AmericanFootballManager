import type { PlayState } from '../simulation/play';
import { DEFENSIVE_PLANS } from '../data/defensivePlans';
import { PASS_TARGETS } from '../data/passTargets';
import { needsConversion } from '../simulation/conversion';
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
  const kickControls = document.querySelector<HTMLElement>('#kick-controls')!;
  const kickButton = document.querySelector<HTMLButtonElement>('#kick-confirm')!;
  const arrow = document.querySelector<HTMLElement>('#kick-arrow')!;
  const meter = document.querySelector<HTMLMeterElement>('#kick-meter')!;
  const chooseKick = document.querySelector<HTMLButtonElement>('#choose-kick')!;
  const scenario = document.querySelector<HTMLSelectElement>('#scenario')!;
  const choices = [...document.querySelectorAll<HTMLButtonElement>('[data-kind]')];
  return (state: PlayState) => {
    document.querySelector<HTMLElement>('#play-title')!.textContent =
      state.kind === 'kick'
        ? state.drive.attempt === 'extraPoint'
          ? 'JOGADA · EXTRA POINT'
          : 'JOGADA · FIELD GOAL'
        : state.kind === 'run'
          ? 'JOGADA · CORRIDA PELO MEIO'
          : state.kind === 'deep'
            ? 'JOGADA · PASSE LONGO'
            : 'JOGADA · PASSE CURTO';
    const pendingConversion = needsConversion(state);
    document.querySelector<HTMLElement>('#conversion-choice')!.hidden = !pendingConversion;
    const defenseSelect = document.querySelector<HTMLSelectElement>('#defense-plan')!;
    defenseSelect.disabled = state.phase !== 'ready';
    defenseSelect.value = state.defensePlan;
    const sideSelect = document.querySelector<HTMLSelectElement>('#control-side')!;
    sideSelect.disabled = state.phase !== 'ready';
    sideSelect.value = state.controlSide;
    const between = state.phase === 'ready' || state.phase === 'finished';
    scenario.disabled = !between || pendingConversion || Boolean(state.drive.attempt);
    choices.forEach((button) => {
      button.disabled =
        !between ||
        pendingConversion ||
        (Boolean(state.drive.attempt) &&
          (state.phase !== 'ready' || state.drive.attempt === 'extraPoint'));
      button.classList.toggle('selected', button.dataset.kind === state.kind);
    });
    chooseKick.disabled =
      state.phase !== 'ready' || state.lineOfScrimmage < 17 || Boolean(state.drive.attempt);
    kickControls.hidden = !['kickAim', 'kickPower'].includes(state.phase);
    arrow.style.transform = `rotate(${(state.kick.angle * 180) / Math.PI}deg)`;
    meter.value = state.kick.power;
    kickButton.textContent = state.phase === 'kickAim' ? 'Fixar direção' : 'Chutar · fixar força';
    distance.textContent =
      state.drive.attempt && state.phase !== 'finished'
        ? state.drive.attempt === 'extraPoint'
          ? 'EXTRA POINT · +1'
          : '2 POINT TRY · GOAL'
        : state.drive.status === 'touchdown'
          ? 'TOUCHDOWN · +6'
          : state.drive.status === 'turnover'
            ? 'FIM DO DRIVE'
            : downLabel(state.drive);
    caption.textContent =
      state.phase === 'finished'
        ? state.drive.status === 'active'
          ? 'PRÓXIMA DESCIDA'
          : 'DRIVE ENCERRADO'
        : 'DESCIDA ATUAL';
    const yard = Math.round(state.drive.spot < 0 ? state.drive.spot + 50 : 50 - state.drive.spot);
    spot.textContent = `BOLA · ${state.drive.spot < 0 ? 'WOLVES' : 'HAWKS'} ${yard}`;
    score.textContent = String(state.drive.score).padStart(2, '0');
    next.disabled = state.phase !== 'finished' || pendingConversion;
    next.textContent = state.drive.status === 'active' ? 'Próxima jogada →' : 'Novo drive →';
    touchdown.hidden = state.outcome !== 'touchdown' || Boolean(state.drive.attempt);
    startSpot.disabled = !between || pendingConversion || Boolean(state.drive.attempt);
    snap.disabled =
      state.phase !== 'ready' && !(state.controlSide === 'defense' && state.phase === 'live');
    snap.textContent =
      state.controlSide === 'defense' && state.phase === 'live' ? 'Tentar tackle' : 'Dar snap';
    const qb = state.athletes.find((athlete) => athlete.id === 'qb')!;
    const canPass =
      state.controlSide === 'offense' &&
      state.kind !== 'run' &&
      state.phase === 'live' &&
      state.carrier === 'qb' &&
      qb.x < state.lineOfScrimmage;
    passes.forEach((button) => {
      button.disabled = !canPass;
    });
    result.textContent =
      state.result ||
      (state.kind === 'run'
        ? 'Entrega ao RB #34 · depois, WASD ou setas para correr'
        : PASS_TARGETS.map((target) => `${target.label} · ${target.name}`).join(' / '));
    if (state.phase === 'ready') {
      info.textContent = state.lateGame
        ? 'FIM DE JOGO · ' + state.gameSeconds.toFixed(1) + 's'
        : 'ANTES DO SNAP';
      status.textContent =
        DEFENSIVE_PLANS[state.defensePlan].name +
        ' · ' +
        (state.lateGame && state.lineOfScrimmage >= 0
          ? 'Linha branca: alcance de field goal de 50 jardas · cenário de fim de jogo'
          : 'Linha dourada: primeira descida ou goal · escolha a jogada e dê o snap');
      return;
    }
    if (state.phase === 'finished') {
      info.textContent = 'FIM DA JOGADA';
      status.textContent = pendingConversion
        ? 'Touchdown! Escolha extra point (+1) ou uma jogada para dois pontos.'
        : state.drive.attempt
          ? 'Tentativa encerrada · inicie um novo drive'
          : state.outcome === 'fieldGoal'
            ? 'Chute encerrado · inicie um novo drive'
            : state.drive.status === 'turnover'
              ? 'Quarta descida sem conversão · drive encerrado; inicie um novo drive de treino'
              : 'Jogada encerrada · avance para a próxima jogada';
      return;
    }
    if (state.controlSide === 'defense' && state.kind !== 'kick') {
      info.textContent = 'DEFESA · ' + state.selectedDefender.toUpperCase();
      status.textContent =
        'WASD/setas: mover defensor · E: trocar · Espaço: tackle · QB controlado pelo bot';
      return;
    }
    if (state.kind === 'run') {
      info.textContent = state.phase === 'live' ? 'RB #34 · EM JOGO' : 'SNAP / ENTREGA AO RB';
      status.textContent =
        state.phase === 'live'
          ? 'Você controla o RB #34 · WASD ou setas · ataque avança para a direita'
          : 'Aguarde a entrega do QB ao RB';
      return;
    }
    info.textContent = `${state.decision.toFixed(1)}s · EM JOGO`;
    if (state.kind === 'kick') {
      if (!state.lateGame)
        info.textContent =
          (state.drive.attempt === 'extraPoint' ? 'EXTRA POINT · ' : 'FIELD GOAL · ') +
          Math.round(67 - state.lineOfScrimmage) +
          ' jardas';
      status.textContent = 'Chute · fixe direção e força com Espaço ou os botões';
      return;
    }
    status.textContent = 'Rotas ocultas · simulação em andamento';
  };
}
