import { trainedAttributes } from '../management/training';
import { SLOTS, ROSTER, selectedPlayer } from '../management/roster';
import type { ClubSave } from '../management/club';
export function depthChart(club: ClubSave) {
  return `<section class="depth-chart" aria-label="Escalação de ataque e defesa"><h2>As duas unidades</h2><p>21 posições além do QB. Trocar um jogador já titular troca os dois lugares, sem duplicar atletas.</p>${SLOTS.map(
    (slot) => {
      const player = selectedPlayer(club.lineup, slot.id);
      const attributes = trainedAttributes(player.attributes, club.training, player.id);
      return `<label class="depth-row"><span>${slot.position} · ${slot.label}</span><select data-slot="${slot.id}" aria-label="${slot.label}">${ROSTER.filter(
        (p) => p.position === slot.position,
      )
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === player.id ? 'selected' : ''}>#${p.number} ${p.name}</option>`,
        )
        .join(
          '',
        )}</select><small>VEL ${attributes.speed.toFixed(1)} · REC ${Math.round(attributes.catching * 100)}</small></label>`;
    },
  ).join('')}</section>`;
}
