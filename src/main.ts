import './style.css';
import { createField } from './rendering/field';
import { createPlay, RECEIVERS, startPlay, throwPass } from './simulation/play';
import { updatePlay } from './simulation/update';
import { createControls } from './ui/controls';
import { createPlayStatus } from './ui/play-status';
import { PASS_TARGETS } from './data/passTargets';
import { playDiagram } from './ui/playDiagram';
import { createDrive } from './simulation/drive';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento raiz não encontrado.');
app.innerHTML = `
  <main class="clubhouse">
    <header><a class="brand" href="/" aria-label="American Football Manager">AFM<span>AMERICAN FOOTBALL MANAGER</span></a><span class="era">EST. 1985 · CAMPO DE TREINO</span></header>
    <section class="intro"><div><p class="eyebrow">DEMO / PASSE CURTO</p><h1>Leia o campo.<br>Chame a jogada.</h1></div><p class="description">Espaço: snap · WASD ou setas: mover QB<br>J, K, L: passar para a tecla sobre o atleta<br>Após 5 segundos, passe assistido para Carter.</p></section>
    <section class="stadium" aria-label="Campo de treinamento">
      <div class="scoreboard"><span>WOLVES <b id="home-score">00</b></span><span class="score-center">DRIVE DE TREINO<small id="play-info">ANTES DO SNAP</small></span><span><b>00</b> HAWKS</span></div>
      <div class="field-stage"><div id="field" role="img" aria-label="Campo com atletas e rotas da jogada"></div><div id="touchdown" class="touchdown-banner" role="status" hidden><small>AURORA WOLVES</small><strong>TOUCHDOWN</strong><span>+6 PONTOS</span></div></div>
      <div class="drive-board" aria-label="Descida e distância"><div><small id="down-caption">DESCIDA ATUAL</small><strong id="down-distance">1st to 10</strong></div><span id="ball-spot">BOLA · WOLVES 31</span><button id="next-play" type="button" disabled>Próxima jogada →</button></div>
      <label class="practice-start">INÍCIO DO TREINO <select id="start-spot"><option value="-19">Wolves · jarda 31</option><option value="0">Meio do campo</option><option value="30">Hawks · jarda 20</option><option value="45">Hawks · jarda 5 · goal</option></select></label>
      <p id="render-status" role="status">Preparando o campo…</p>
    </section>
    <footer class="play-controls"><div><span class="tag">JOGADA · PASSE CURTO</span><p id="result">Dê o snap e encontre um recebedor.</p></div><div class="actions"><button id="snap" type="button">Dar snap</button>${PASS_TARGETS.map((target, index) => `<button data-pass="${index}" type="button" aria-label="Passar para ${target.name}, tecla ${target.label}"><kbd style="--target-color:${target.color}">${target.label}</kbd> ${target.name}</button>`).join('')}<button id="restart" type="button">Reiniciar</button></div></footer>
    <section class="playbook" aria-label="Desenho da jogada de treino">${playDiagram()}<div><p class="eyebrow">DO PLAYBOOK AO CAMPO</p><p>As cores e teclas do desenho acompanham seus recebedores.<br>Depois do snap, as rotas somem. Os alvos continuam identificados.</p></div></section>
  </main>`;

function mountDemo() {
  const host = document.querySelector<HTMLDivElement>('#field')!;
  const updateStatus = createPlayStatus();
  const snap = document.querySelector<HTMLButtonElement>('#snap')!;
  const restart = document.querySelector<HTMLButtonElement>('#restart')!;
  const next = document.querySelector<HTMLButtonElement>('#next-play')!;
  const startSpot = document.querySelector<HTMLSelectElement>('#start-spot')!;
  const passes = [...document.querySelectorAll<HTMLButtonElement>('[data-pass]')];
  let state = createPlay();
  const field = createField(host, state);
  const onSnap = () => startPlay(state);
  const onPass = (index: number) => throwPass(state, RECEIVERS[index]);
  const controls = createControls(onSnap, onPass);
  snap.addEventListener('click', onSnap);
  const onRestart = () => {
    state = createPlay();
    startSpot.value = '-19';
  };
  restart.addEventListener('click', onRestart);
  const onNext = () => {
    if (state.phase !== 'finished') return;
    const ended = state.drive.status !== 'active';
    state = createPlay(state.drive);
    if (ended) startSpot.value = '-19';
  };
  next.addEventListener('click', onNext);
  const onStartSpot = () => {
    if (state.phase !== 'ready' && state.phase !== 'finished') return;
    state = createPlay(createDrive(state.drive.score, Number(startSpot.value)));
  };
  startSpot.addEventListener('change', onStartSpot);
  const passHandlers = passes.map((button, index) => {
    const handler = () => onPass(index);
    button.addEventListener('click', handler);
    return handler;
  });
  let last = performance.now();
  let accumulator = 0;
  let frame = 0;
  function tick(now: number) {
    accumulator += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (accumulator >= 1 / 60) {
      updatePlay(state, controls.read(), 1 / 60);
      accumulator -= 1 / 60;
    }
    field.render(state);
    updateStatus(state);
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    controls.dispose();
    field.dispose();
    snap.removeEventListener('click', onSnap);
    restart.removeEventListener('click', onRestart);
    next.removeEventListener('click', onNext);
    startSpot.removeEventListener('change', onStartSpot);
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
