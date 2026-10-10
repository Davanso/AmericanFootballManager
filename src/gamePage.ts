import { setPausedControls } from './ui/pauseControls';
import { ERAS } from './data/eras';
import {
  loadCampaign,
  saveCampaign,
  startCampaignMatch,
  captureMatch,
} from './management/campaign';
import { applyTraining } from './management/training';
import { applyLineup, lineupAppearance, selectedPlayer } from './management/roster';
import { playerAppearance } from './data/playerAppearance';
import './style.css';
import { loadClub, startingQB } from './management/club';
import { navigation } from './ui/navigation';
import { createField } from './rendering/field';
import { createPlay, RECEIVERS, startPlay, throwPass } from './simulation/play';
import { updatePlay } from './simulation/update';
import { createControls } from './ui/controls';
import { createPlayStatus } from './ui/play-status';
import { PASS_TARGETS } from './data/passTargets';
import { playDiagram } from './ui/playDiagram';
import { confirmKick } from './simulation/kicking';
import type { PlayKind } from './simulation/play';
import { chooseConversion, needsConversion } from './simulation/conversion';
import { DEFENSIVE_PLANS } from './data/defensivePlans';
import type { DefensivePlan } from './data/defensivePlans';
import { switchDefender, attemptTackle } from './simulation/defenderControl';
import { createMatch, tickMatch, nextMatchPlay, matchConversion } from './simulation/match';
import type { MatchSession } from './simulation/match';
import { createMatchStatus } from './ui/matchStatus';
import { broadcastMarkup, updateBroadcastScoreboard } from './ui/broadcastScoreboard';
import { applyRoster, QB_PROFILES } from './data/playerAttributes';
import type { QBProfile } from './data/playerAttributes';
import { resolvePenalty } from './simulation/penalties';
import { createReplay } from './simulation/replay';
import { createDrive } from './simulation/drive';

const displayClub = loadCampaign().active?.club ?? loadClub();
document.documentElement.dataset.era = displayClub.era;
const clubTargets = PASS_TARGETS.map((target) => ({
  ...target,
  name: selectedPlayer(displayClub.lineup, target.id).name,
}));
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento raiz não encontrado.');
app.innerHTML = `
  <main class="clubhouse">
    <header><a class="brand" href="/" aria-label="American Football Manager">AFM<span>AMERICAN FOOTBALL MANAGER</span></a><span class="era">EST. ${ERAS[displayClub.era].year} · ${ERAS[displayClub.era].name.toUpperCase()}</span></header>
    ${navigation('game')}<section class="campaign-controls" aria-label="Partida salva"><button id="pause-match" disabled>Pausar partida</button><span id="campaign-status" role="status">Partidas são salvas automaticamente. Treino livre não é salvo.</span></section><p class="starter-caption">QB TITULAR · ${startingQB(displayClub).name} · #${startingQB(displayClub).number} · <a href="/elenco">Alterar escalação</a></p><label class="session-mode">MODO <select id="session-mode" aria-label="Modo de jogo"><option value="training">Treino livre</option><option value="match">Partida curta · 4 × ${displayClub.periodSeconds}s</option></select><select id="qb-profile" aria-label="Perfil do quarterback"><option value="base">Base de treino</option>${Object.entries(
      QB_PROFILES,
    )
      .map(([id, profile]) => `<option value="${id}">${profile.name}</option>`)
      .join(
        '',
      )}</select></label><section class="intro"><div><p class="eyebrow">DEMO / PASSE CURTO</p><h1>Leia o campo.<br>Chame a jogada.</h1></div><p class="description">Espaço: snap · WASD ou setas: mover QB / RB / defensor<br>E: trocar defensor · Espaço: tackle na defesa<br>J, K, L: passar para a tecla sobre o atleta<br>Em passes: após 5 segundos, passe assistido para Carter.</p></section>
    <section class="stadium" aria-label="Campo de treinamento">
      <div class="scoreboard"><span>WOLVES <b id="home-score">00</b></span><span class="score-center"><span id="session-caption">DRIVE DE TREINO</span><small id="play-info">ANTES DO SNAP</small></span><span><b id="away-score">00</b> HAWKS</span></div>
      <div class="field-stage"><div id="field" role="img" aria-label="Campo com atletas e rotas da jogada"></div><div id="touchdown" class="touchdown-banner" role="status" hidden><small>AURORA WOLVES</small><strong>TOUCHDOWN</strong><span>+6 PONTOS</span></div></div>
      <div class="drive-board" aria-label="Descida e distância"><div><small id="down-caption">DESCIDA ATUAL</small><strong id="down-distance">1st to 10</strong></div><span id="ball-spot">BOLA · WOLVES 31</span><button id="next-play" type="button" disabled>Próxima jogada →</button></div>
      <section id="conversion-choice" hidden aria-label="Tentativa após touchdown"><strong>TOUCHDOWN · Escolha a conversão</strong><button id="extra-point" type="button">Extra point · +1</button><button id="two-point" type="button">Conversão de dois pontos · +2</button></section>
      <label class="practice-start">INÍCIO DO TREINO <select id="start-spot"><option value="-19">Wolves · jarda 31</option><option value="0">Meio do campo</option><option value="30">Hawks · jarda 20</option><option value="45">Hawks · jarda 5 · goal</option></select><select id="scenario" aria-label="Situação do treino"><option value="normal">Treino normal</option><option value="late">Fim de jogo · 20s</option></select><select id="defense-plan" aria-label="Plano defensivo">${Object.entries(
        DEFENSIVE_PLANS,
      )
        .map(([id, plan]) => `<option value="${id}">${plan.name}</option>`)
        .join(
          '',
        )}</select><select id="control-side" aria-label="Lado controlado"><option value="offense">Controlar ataque</option><option value="defense">Controlar defesa</option></select></label>
      <section id="penalty-choice" hidden aria-label="Decisão de penalidade"><strong id="penalty-text">FLAG</strong><button id="accept-penalty" type="button">Aceitar falta</button><button id="decline-penalty" type="button">Recusar falta</button></section><p id="render-status" role="status">Preparando o campo…</p>
    </section>
    <section id="kick-controls" hidden aria-label="Controle do chute"><div class="kick-direction"><span id="kick-arrow">↑</span></div><label>FORÇA <meter id="kick-meter" min="0" max="1" value="0.8"></meter></label><button id="kick-confirm" type="button">Fixar direção</button><p id="kick-hint">Espaço: fixar direção, depois força.</p></section><section class="replay-controls" aria-label="Replay da última jogada"><button id="start-replay" type="button" disabled>Replay da última jogada</button><select id="replay-speed" aria-label="Velocidade do replay"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select><button id="stop-replay" type="button" hidden>Parar replay</button></section><footer class="play-controls"><div><span class="tag" id="play-title">JOGADA · PASSE CURTO</span><p id="result">Dê o snap e encontre um recebedor.</p></div><div class="actions"><button id="snap" type="button">Dar snap</button>${clubTargets.map((target, index) => `<button data-pass="${index}" type="button" aria-label="Passar para ${target.name}, tecla ${target.label}"><kbd style="--target-color:${target.color}">${target.label}</kbd> ${target.name}</button>`).join('')}<button id="restart" type="button">Reiniciar</button></div></footer>
    <section class="playbook" aria-label="Desenho da jogada de treino"><div class="playChoices"><button type="button" data-kind="run" aria-label="Selecionar corrida pelo meio" class="play-choice">${playDiagram('run')}</button><button type="button" data-kind="short" aria-label="Selecionar passe curto" class="play-choice">${playDiagram()}</button><button type="button" data-kind="deep" aria-label="Selecionar passe longo" class="play-choice">${playDiagram('deep')}</button><button id="choose-kick" type="button" aria-label="Field goal · 3 pontos"><span>Field goal · 3 pontos</span><svg viewBox="0 0 160 64" width="160" height="64" role="img" aria-label="Formação de chute: snap para holder e chute entre os postes"><path d="M125 8V40H150V8 M137 40V57" fill="none" stroke="#f1d575" stroke-width="3"/><path d="M42 34Q80 10 132 25" fill="none" stroke="#f1d575" stroke-width="2" stroke-dasharray="4 3"/><path d="M61 8V58" stroke="#517b67"/><g fill="#eee5cc"><circle cx="61" cy="15" r="3"/><circle cx="61" cy="24" r="3"/><circle cx="61" cy="33" r="3"/><circle cx="61" cy="42" r="3"/><circle cx="61" cy="51" r="3"/><circle cx="42" cy="34" r="3"/><circle cx="32" cy="44" r="3"/></g></svg></button><button id="choose-punt" type="button">Punt · trocar posse</button></div><div><p class="eyebrow">DO PLAYBOOK AO CAMPO</p><p>As cores e teclas do desenho acompanham seus recebedores.<br>Depois do snap, as rotas somem. Os alvos continuam identificados.</p></div></section>
  ${broadcastMarkup.replace('1985', String(ERAS[displayClub.era].year))}</main>`;

function mountDemo() {
  const host = document.querySelector<HTMLDivElement>('#field')!;
  const updateStatus = createPlayStatus(clubTargets, selectedPlayer(displayClub.lineup, 'rb'));
  const snap = document.querySelector<HTMLButtonElement>('#snap')!;
  const restart = document.querySelector<HTMLButtonElement>('#restart')!;
  const next = document.querySelector<HTMLButtonElement>('#next-play')!;
  const startSpot = document.querySelector<HTMLSelectElement>('#start-spot')!;
  const passes = [...document.querySelectorAll<HTMLButtonElement>('[data-pass]')];
  let kind: PlayKind = 'short';
  const scenario = document.querySelector<HTMLSelectElement>('#scenario')!;
  const kickConfirm = document.querySelector<HTMLButtonElement>('#kick-confirm')!;
  const chooseKick = document.querySelector<HTMLButtonElement>('#choose-kick')!;
  const playChoices = [...document.querySelectorAll<HTMLButtonElement>('[data-kind]')];
  const defensePlan = document.querySelector<HTMLSelectElement>('#defense-plan')!;
  const controlSide = document.querySelector<HTMLSelectElement>('#control-side')!;
  const sessionMode = document.querySelector<HTMLSelectElement>('#session-mode')!;
  const updateMatchStatus = createMatchStatus();
  let match: MatchSession | undefined;
  const qbProfile = document.querySelector<HTMLSelectElement>('#qb-profile')!;
  let campaign = loadCampaign();
  const club = campaign.active?.club ?? loadClub();
  let paused = Boolean(campaign.active);
  qbProfile.value = startingQB(club).profile;
  const clubMatch = () => createMatch(club.periodSeconds, startingQB(club).profile);
  match = campaign.active?.session;
  if (match) sessionMode.value = 'match';
  let state = match?.play ?? createPlay();
  if (!match) applyRoster(state, startingQB(club).profile);
  const starter = startingQB(club);
  const field = createField(
    host,
    state,
    {
      ...lineupAppearance(club.lineup, club.era),
      qb: { ...playerAppearance(starter.id, 'home', club.era), number: starter.number },
    },
    club.era,
  );
  const replay = createReplay();
  const pauseButton = document.querySelector<HTMLButtonElement>('#pause-match')!;
  const saveStatus = document.querySelector<HTMLElement>('#campaign-status')!;
  let saveElapsed = 0;
  const persist = () => {
    if (!match) return;
    match.play = state;
    campaign = captureMatch(campaign, match);
    saveStatus.textContent = saveCampaign(campaign)
      ? paused
        ? 'Partida pausada e salva. Clique em Continuar partida.'
        : 'Partida salva automaticamente.'
      : 'Não foi possível salvar a partida. Verifique o armazenamento do navegador.';
  };
  const onPause = () => {
    if (!match || match.finished) return;
    paused = !paused;
    persist();
  };
  pauseButton.addEventListener('click', onPause);
  window.addEventListener('pagehide', persist);
  const onVisibility = () => {
    if (document.hidden && match) {
      paused = true;
      persist();
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onSnap = () => {
    if (paused) return;
    if (state.phase === 'ready' && !replay.playing) {
      applyLineup(state, club.lineup);
      applyTraining(state, club);
    }
    if (replay.playing || paused) return;
    if (state.controlSide === 'defense' && state.phase === 'live') return attemptTackle(state);
    if (state.phase.startsWith('kick')) return confirmKick(state);
    startPlay(state);
  };
  const onPass = (index: number) => {
    if (!paused && state.controlSide === 'offense') throwPass(state, RECEIVERS[index]);
  };
  const controls = createControls(onSnap, onPass, () => switchDefender(state));
  snap.addEventListener('click', onSnap);
  const onRestart = () => {
    replay.stop();
    if (match) {
      match = clubMatch();
      paused = false;
      campaign = startCampaignMatch(campaign, match, club);
      state = match.play;
      kind = state.kind;
      return;
    }
    state = createPlay();
    kind = 'short';
    scenario.value = 'normal';
    startSpot.value = '-19';
    defensePlan.value = 'man';
    controlSide.value = 'offense';
  };
  restart.addEventListener('click', onRestart);
  const onNext = () => {
    replay.stop();
    if (match) {
      nextMatchPlay(match);
      state = match.play;
      kind = state.kind;
      return;
    }
    if (state.pendingPenalty || state.phase !== 'finished' || needsConversion(state)) return;
    const ended = state.drive.status !== 'active';
    if (ended) kind = 'short';
    state = createPlay(
      state.drive,
      kind,
      state.lateGame,
      ended ? (state.lateGame ? 20 : 120) : state.gameSeconds,
      state.defenseReads,
      state.defensePlan,
      state.controlSide,
    );
    if (ended) startSpot.value = '-19';
  };
  next.addEventListener('click', onNext);
  const onStartSpot = () => {
    if (replay.playing || paused) return;
    if (match) return;
    if (needsConversion(state) || state.drive.attempt) return;
    if (state.phase !== 'ready' && state.phase !== 'finished') return;
    state = createPlay(
      createDrive(state.drive.score, Number(startSpot.value)),
      kind,
      scenario.value === 'late',
      undefined,
      {},
      defensePlan.value as DefensivePlan,
      controlSide.value as 'offense' | 'defense',
    );
  };
  startSpot.addEventListener('change', onStartSpot);
  scenario.addEventListener('change', onStartSpot);
  const selectKind = (value: PlayKind) => {
    if (replay.playing || paused) return;
    if (state.pendingPenalty) return;
    if (match && state.controlSide === 'defense') return;
    if (
      needsConversion(state) ||
      (state.drive.attempt &&
        (state.phase !== 'ready' || state.drive.attempt === 'extraPoint' || value === 'kick'))
    )
      return;
    if (state.phase !== 'ready' && state.phase !== 'finished') return;
    kind = value;
    state = createPlay(
      state.drive,
      kind,
      state.lateGame,
      state.gameSeconds,
      state.defenseReads,
      state.defensePlan,
      state.controlSide,
    );
  };
  const kindHandlers = playChoices.map((button) => {
    const handler = () => selectKind(button.dataset.kind as PlayKind);
    button.addEventListener('click', handler);
    return handler;
  });
  const onChooseKick = () => selectKind('kick');
  const onKickConfirm = () => {
    if (!paused) confirmKick(state);
  };
  chooseKick.addEventListener('click', onChooseKick);
  kickConfirm.addEventListener('click', onKickConfirm);
  const passHandlers = passes.map((button, index) => {
    const handler = () => onPass(index);
    button.addEventListener('click', handler);
    return handler;
  });
  const conversionButtons = [
    document.querySelector<HTMLButtonElement>('#extra-point')!,
    document.querySelector<HTMLButtonElement>('#two-point')!,
  ];
  const conversionHandlers = conversionButtons.map((button, index) => {
    const handler = () => {
      if (replay.playing || paused) return;
      if (match) {
        matchConversion(match, index === 0 ? 'extraPoint' : 'twoPoint');
        state = match.play;
      }
      if (!match) state = chooseConversion(state, index === 0 ? 'extraPoint' : 'twoPoint');
      kind = state.kind;
    };
    button.addEventListener('click', handler);
    return handler;
  });
  const onDefensePlan = () => {
    if (state.phase !== 'ready' || needsConversion(state)) return;
    state.defensePlan = defensePlan.value as DefensivePlan;
  };
  defensePlan.addEventListener('change', onDefensePlan);
  const onControlSide = () => {
    if (state.phase === 'ready') state.controlSide = controlSide.value as 'offense' | 'defense';
  };
  controlSide.addEventListener('change', onControlSide);
  const onSessionMode = () => {
    replay.stop();
    persist();
    match = sessionMode.value === 'match' ? (campaign.active?.session ?? clubMatch()) : undefined;
    paused = false;
    if (match && !campaign.active) campaign = startCampaignMatch(campaign, match, club);
    state = match?.play ?? createPlay();
    kind = state.kind;
  };
  sessionMode.addEventListener('change', onSessionMode);
  const puntButton = document.querySelector<HTMLButtonElement>('#choose-punt')!;
  const onPunt = () => selectKind('punt');
  puntButton.addEventListener('click', onPunt);
  const onQBProfile = () => {
    if (match) return;
    if (state.phase !== 'ready') return;
    if (qbProfile.value === 'base') {
      state.qbProfile = undefined;
      state.athletes.forEach((p) => {
        p.attributes = undefined;
        p.speed = 7;
      });
      return;
    }
    applyRoster(state, qbProfile.value as QBProfile);
  };
  qbProfile.addEventListener('change', onQBProfile);
  const penaltyButtons = [
    document.querySelector<HTMLButtonElement>('#accept-penalty')!,
    document.querySelector<HTMLButtonElement>('#decline-penalty')!,
  ];
  const penaltyHandlers = penaltyButtons.map((button, index) => {
    const handler = () => {
      if (paused) return;
      state = resolvePenalty(state, index === 0);
      if (match) match.play = state;
    };
    button.addEventListener('click', handler);
    return handler;
  });
  const replayButton = document.querySelector<HTMLButtonElement>('#start-replay')!;
  const stopReplay = document.querySelector<HTMLButtonElement>('#stop-replay')!;
  const replaySpeed = document.querySelector<HTMLSelectElement>('#replay-speed')!;
  replaySpeed.value = String(club.replaySpeed);
  const onReplay = () => replay.start();
  const onStopReplay = () => replay.stop();
  replayButton.addEventListener('click', onReplay);
  stopReplay.addEventListener('click', onStopReplay);
  let last = performance.now();
  let accumulator = 0;
  let frame = 0;
  function tick(now: number) {
    const frameDelta = Math.min((now - last) / 1000, 0.1);
    accumulator += frameDelta;
    last = now;
    while (accumulator >= 1 / 60) {
      if (replay.playing || paused) {
        accumulator -= 1 / 60;
        continue;
      }
      if (match) {
        match.play = state;
        tickMatch(match, controls.read(), 1 / 60);
        state = match.play;
      }
      if (!match) updatePlay(state, controls.read(), 1 / 60);
      replay.record(state, 1 / 60);
      accumulator -= 1 / 60;
    }
    saveElapsed += frameDelta;
    if (match && (saveElapsed >= 1 || (match.finished && campaign.active))) {
      persist();
      saveElapsed = 0;
    }
    qbProfile.disabled = Boolean(match);
    pauseButton.disabled = !match || match.finished;
    pauseButton.textContent = paused ? 'Continuar partida' : 'Pausar partida';
    const replayFrame = replay.sample(frameDelta, Number(replaySpeed.value));
    field.render(replayFrame ?? state);
    if (
      state.phase === 'ready' &&
      !match &&
      qbProfile.value !== 'base' &&
      state.qbProfile !== qbProfile.value
    )
      applyRoster(state, qbProfile.value as QBProfile);
    updateStatus(state);
    updateMatchStatus(match, state);
    setPausedControls(paused, [...conversionButtons, ...penaltyButtons, kickConfirm]);
    updateBroadcastScoreboard(match, state);
    replayButton.disabled = !replay.canPlay() || replay.playing;
    stopReplay.hidden = !replay.playing;
    if (paused) {
      document
        .querySelectorAll<HTMLButtonElement | HTMLSelectElement>(
          '#kick-confirm,#choose-kick,#choose-punt,[data-kind],#extra-point,#two-point,#accept-penalty,#decline-penalty,#defense-plan',
        )
        .forEach((control) => (control.disabled = true));
      snap.disabled = true;
      next.disabled = true;
      passes.forEach((button) => (button.disabled = true));
      document.querySelector('#broadcast-phase')!.textContent = 'PAUSADO';
    }
    if (replay.playing) {
      next.disabled = true;
      snap.disabled = true;
      document.querySelector<HTMLElement>('#broadcast-phase')!.textContent =
        'REPLAY · ' + replaySpeed.value + '×';
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    persist();
    window.removeEventListener('pagehide', persist);
    document.removeEventListener('visibilitychange', onVisibility);
    pauseButton.removeEventListener('click', onPause);
    cancelAnimationFrame(frame);
    conversionButtons.forEach((button, index) =>
      button.removeEventListener('click', conversionHandlers[index]),
    );
    controlSide.removeEventListener('change', onControlSide);
    defensePlan.removeEventListener('change', onDefensePlan);
    replayButton.removeEventListener('click', onReplay);
    stopReplay.removeEventListener('click', onStopReplay);
    penaltyButtons.forEach((button, index) =>
      button.removeEventListener('click', penaltyHandlers[index]),
    );
    qbProfile.removeEventListener('change', onQBProfile);
    sessionMode.removeEventListener('change', onSessionMode);
    puntButton.removeEventListener('click', onPunt);
    controls.dispose();
    field.dispose();
    snap.removeEventListener('click', onSnap);
    restart.removeEventListener('click', onRestart);
    next.removeEventListener('click', onNext);
    startSpot.removeEventListener('change', onStartSpot);
    scenario.removeEventListener('change', onStartSpot);
    chooseKick.removeEventListener('click', onChooseKick);
    kickConfirm.removeEventListener('click', onKickConfirm);
    playChoices.forEach((button, index) =>
      button.removeEventListener('click', kindHandlers[index]),
    );
    passes.forEach((button, index) => button.removeEventListener('click', passHandlers[index]));
  };
}
try {
  const dispose = mountDemo();
  if (import.meta.hot) import.meta.hot.dispose(dispose);
} catch (error) {
  document.querySelector('#render-status')!.textContent =
    'Não foi possível abrir o campo. Ative a aceleração gráfica e recarregue.';
  document.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.disabled = true;
  });
  console.error(error);
}
