import './style.css';
import { createField } from './rendering/field';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento raiz não encontrado.');

app.innerHTML = `
  <main class="clubhouse">
    <header><a class="brand" href="/" aria-label="American Football Manager">AFM<span>AMERICAN FOOTBALL MANAGER</span></a><span class="era">EST. 1985 · TRAINING CAMP</span></header>
    <section class="intro"><div><p class="eyebrow">PRÉ-TEMPORADA / ANOS 80</p><h1>Tudo começa<br>no campo.</h1></div><p class="description">Um time para construir.<br>Uma história para jogar.<br>Bem-vindo ao primeiro treino.</p></section>
    <section class="stadium" aria-label="Prévia do campo de treinamento">
      <div class="scoreboard"><span>HOME <b>00</b></span><span class="score-center">TRAINING CAMP<small>PRÉVIA DO ESTÁDIO</small></span><span><b>00</b> AWAY</span></div>
      <div id="field" role="img" aria-label="Campo de futebol americano em perspectiva inclinada"></div>
      <p id="render-status" role="status">Preparando o campo…</p>
    </section>
    <footer><div><span class="tag">PRIMEIRO RUN</span><p>Campo aberto. O playbook vem a seguir.</p></div><button id="reset-camera" type="button">Restaurar câmera <span aria-hidden="true">↗</span></button></footer>
  </main>`;

const host = document.querySelector<HTMLDivElement>('#field')!;
const status = document.querySelector<HTMLParagraphElement>('#render-status')!;
try {
  const field = createField(host);
  status.textContent = 'Prévia estática · jogadas e atletas em desenvolvimento';
  document.querySelector('#reset-camera')!.addEventListener('click', field.resetCamera);
  if (import.meta.hot) import.meta.hot.dispose(field.dispose);
} catch (error) {
  status.textContent = 'Não foi possível abrir o campo. Ative a aceleração gráfica do navegador e recarregue.';
  document.querySelector<HTMLButtonElement>('#reset-camera')!.disabled = true;
  console.error(error);
}
