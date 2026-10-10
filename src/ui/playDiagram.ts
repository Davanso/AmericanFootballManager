import { PASS_TARGETS } from '../data/passTargets';
import type { PlayKind } from '../simulation/play';
import { createPlay } from '../simulation/play';

export function playDiagram(kind: PlayKind = 'short') {
  const state = createPlay(undefined, kind);
  const x = (value: number) => (value + 32) * 3.5;
  const z = (value: number) => (value + 27) * 2;
  const routes = state.athletes
    .filter((athlete) => athlete.route.length)
    .map((athlete) => {
      const target = PASS_TARGETS.find((receiver) => receiver.id === athlete.id) ?? {
        color: '#b7ef8c',
        label: 'RB',
      };
      const points = [athlete, ...athlete.route]
        .map((point) => `${x(point.x)},${z(point.z)}`)
        .join(' ');
      return `<polyline points="${points}" fill="none" stroke="${target.color}" stroke-width="3"/><text x="${x(athlete.x) - 11}" y="${z(athlete.z) + 4}" fill="${target.color}" font-size="10">${target.label}</text>`;
    })
    .join('');
  const players = state.athletes
    .filter((athlete) => athlete.team === 'home')
    .map((athlete) => `<circle cx="${x(athlete.x)}" cy="${z(athlete.z)}" r="3" fill="#f3e4be"/>`)
    .join('');
  const name =
    kind === 'run' ? 'Corrida pelo meio' : kind === 'deep' ? 'Passe longo' : 'Passe curto';
  return `<figure class="play-card"><figcaption><span>JOGADA DE TREINO</span><strong>${name}</strong></figcaption><svg viewBox="0 0 185 108" role="img" aria-label="Desenho da formação e rotas: ${name}"><path d="M60 0V108 M100 0V108 M140 0V108 M0 27H185 M0 81H185" stroke="#517b67" stroke-width="1"/>${routes}${players}</svg><p>${kind === 'run' ? 'Entrega ao RB. Encontre a abertura.' : 'Três rotas. Leia a cobertura.'}</p></figure>`;
}
