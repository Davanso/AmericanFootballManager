import { gameClock } from './gameClock';
import type { MatchSession } from '../simulation/match';
import { matchResult } from '../simulation/match';
import type { PlayState } from '../simulation/play';
import { needsConversion } from '../simulation/conversion';
export function createMatchStatus() {
  const text = (id: string, value: string) => {
    document.querySelector<HTMLElement>(id)!.textContent = value;
  };
  const disable = (id: string, value: boolean) => {
    document.querySelector<HTMLButtonElement>(id)!.disabled = value;
  };
  return (match: MatchSession | undefined, state: PlayState) => {
    disable(
      '#choose-punt',
      state.phase !== 'ready' ||
        Boolean(state.pendingPenalty) ||
        Boolean(state.drive.attempt) ||
        Boolean(match && state.controlSide === 'defense'),
    );
    text('#session-caption', match ? 'PARTIDA CURTA' : 'DRIVE DE TREINO');
    if (!match) {
      text('#away-score', '00');
      return;
    }
    text('#home-score', String(match.scores.wolves).padStart(2, '0'));
    text('#away-score', String(match.scores.hawks).padStart(2, '0'));
    text(
      '#play-info',
      match.finished
        ? matchResult(match)
        : `Q${match.quarter} · ${gameClock(match.remaining)} · ${match.possession.toUpperCase()}`,
    );
    disable('#start-spot', true);
    disable('#scenario', true);
    disable('#control-side', true);
    const botAttack = state.controlSide === 'defense';
    document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((button) => {
      if (botAttack || match.finished) button.disabled = true;
    });
    if (botAttack) disable('#choose-kick', true);
    text('#next-play', 'Próxima jogada →');
    if (needsConversion(state))
      text('#render-status', 'Touchdown · escolha a conversão para continuar');
    if (state.pendingPenalty) {
      disable('#next-play', true);
      disable('#snap', true);
    }
    if (match.finished) {
      text('#render-status', 'FIM DA PARTIDA · ' + matchResult(match));
      disable('#snap', true);
      disable('#next-play', true);
      disable('#choose-punt', true);
      disable('#choose-kick', true);
    }
  };
}
