import './style.css';
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
import { createDrive } from './simulation/drive';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento raiz não encontrado.');
app.innerHTML = `
  <main class="clubhouse">
    <header><a class="brand" href="/" aria-label="American Football Manager">AFM<span>AMERICAN FOOTBALL MANAGER</span></a><span class="era">EST. 1985 · CAMPO DE TREINO</span></header>
    <label class="session-mode">MODO <select id="session-mode" aria-label="Modo de jogo"><option value="training">Treino livre</option><option value="match">Partida curta · 4 × 60s</option></select></label><section class="intro"><div><p class="eyebrow">DEMO / PASSE CURTO</p><h1>Leia o campo.<br>Chame a jogada.</h1></div><p class="description">Espaço: snap · WASD ou setas: mover QB / RB / defensor<br>E: trocar defensor · Espaço: tackle na defesa<br>J, K, L: passar para a tecla sobre o atleta<br>Em passes: após 5 segundos, passe assistido para Carter.</p></section>
    <section class="stadium" aria-label="Campo de treinamento">
      <div class="scoreboard"><span>WOLVES <b id="home-score">00</b></span><span class="score-center">DRIVE DE TREINO<small id="play-info">ANTES DO SNAP</small></span><span><b id="away-score">00</b> HAWKS</span></div>
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
      <p id="render-status" role="status">Preparando o campo…</p>
    </section>
    <section id="kick-controls" hidden aria-label="Controle do chute"><div class="kick-direction"><span id="kick-arrow">↑</span></div><label>FORÇA <meter id="kick-meter" min="0" max="1" value="0.8"></meter></label><button id="kick-confirm" type="button">Fixar direção</button><p id="kick-hint">Espaço: fixar direção, depois força.</p></section><footer class="play-controls"><div><span class="tag" id="play-title">JOGADA · PASSE CURTO</span><p id="result">Dê o snap e encontre um recebedor.</p></div><div class="actions"><button id="snap" type="button">Dar snap</button>${PASS_TARGETS.map((target, index) => `<button data-pass="${index}" type="button" aria-label="Passar para ${target.name}, tecla ${target.label}"><kbd style="--target-color:${target.color}">${target.label}</kbd> ${target.name}</button>`).join('')}<button id="restart" type="button">Reiniciar</button></div></footer>
    <section class="playbook" aria-label="Desenho da jogada de treino"><div class="playChoices"><button type="button" data-kind="run" aria-label="Selecionar corrida pelo meio" class="play-choice">${playDiagram('run')}</button><button type="button" data-kind="short" aria-label="Selecionar passe curto" class="play-choice">${playDiagram()}</button><button type="button" data-kind="deep" aria-label="Selecionar passe longo" class="play-choice">${playDiagram('deep')}</button><button id="choose-kick" type="button" aria-label="Field goal · 3 pontos"><span>Field goal · 3 pontos</span><svg viewBox="0 0 160 64" width="160" height="64" role="img" aria-label="Formação de chute: snap para holder e chute entre os postes"><path d="M125 8V40H150V8 M137 40V57" fill="none" stroke="#f1d575" stroke-width="3"/><path d="M42 34Q80 10 132 25" fill="none" stroke="#f1d575" stroke-width="2" stroke-dasharray="4 3"/><path d="M61 8V58" stroke="#517b67"/><g fill="#eee5cc"><circle cx="61" cy="15" r="3"/><circle cx="61" cy="24" r="3"/><circle cx="61" cy="33" r="3"/><circle cx="61" cy="42" r="3"/><circle cx="61" cy="51" r="3"/><circle cx="42" cy="34" r="3"/><circle cx="32" cy="44" r="3"/></g></svg></button><button id="choose-punt" type="button">Punt · trocar posse</button></div><div><p class="eyebrow">DO PLAYBOOK AO CAMPO</p><p>As cores e teclas do desenho acompanham seus recebedores.<br>Depois do snap, as rotas somem. Os alvos continuam identificados.</p></div></section>
  </main>`;

function mountDemo() {
  const host = document.querySelector<HTMLDivElement>('#field')!;
  const updateStatus = createPlayStatus();
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
  let state = createPlay();
  const field = createField(host, state);
  const onSnap = () => {
    if (state.controlSide === 'defense' && state.phase === 'live') return attemptTackle(state);
    if (state.phase.startsWith('kick')) return confirmKick(state);
    startPlay(state);
  };
  const onPass = (index: number) => {
    if (state.controlSide === 'offense') throwPass(state, RECEIVERS[index]);
  };
  const controls = createControls(onSnap, onPass, () => switchDefender(state));
  snap.addEventListener('click', onSnap);
  const onRestart = () => {
    if (match) {
      match = createMatch();
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
    if (match) {
      nextMatchPlay(match);
      state = match.play;
      kind = state.kind;
      return;
    }
    if (state.phase !== 'finished' || needsConversion(state)) return;
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
  const onKickConfirm = () => confirmKick(state);
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
    match = sessionMode.value === 'match' ? createMatch() : undefined;
    state = match?.play ?? createPlay();
    kind = state.kind;
  };
  sessionMode.addEventListener('change', onSessionMode);
  const puntButton = document.querySelector<HTMLButtonElement>('#choose-punt')!;
  const onPunt = () => selectKind('punt');
  puntButton.addEventListener('click', onPunt);
  let last = performance.now();
  let accumulator = 0;
  let frame = 0;
  function tick(now: number) {
    accumulator += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (accumulator >= 1 / 60) {
      if (match) {
        match.play = state;
        tickMatch(match, controls.read(), 1 / 60);
        state = match.play;
      }
      if (!match) updatePlay(state, controls.read(), 1 / 60);
      accumulator -= 1 / 60;
    }
    field.render(state);
    updateStatus(state);
    updateMatchStatus(match, state);
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    conversionButtons.forEach((button, index) =>
      button.removeEventListener('click', conversionHandlers[index]),
    );
    controlSide.removeEventListener('change', onControlSide);
    defensePlan.removeEventListener('change', onDefensePlan);
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
