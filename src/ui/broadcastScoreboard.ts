import { gameClock } from './gameClock';
import type { MatchSession } from '../simulation/match';
import { matchResult } from '../simulation/match';
import type { PlayState } from '../simulation/play';
import { downLabel } from '../simulation/drive';
export const broadcastMarkup = `<aside class="broadcast-scoreboard" aria-label="Placar de transmissão"><div class="broadcast-brand">AFM<small>1985</small></div><div class="broadcast-team wolves"><span>WOLVES</span><b id="broadcast-wolves">00</b><small id="possession-wolves"></small></div><div class="broadcast-team hawks"><span>HAWKS</span><b id="broadcast-hawks">00</b><small id="possession-hawks"></small></div><div class="broadcast-clock"><span id="broadcast-period">TREINO</span><b id="broadcast-clock">2:00</b></div><div class="broadcast-down"><b id="broadcast-down">1st to 10</b><span id="broadcast-spot">WOLVES 31</span></div><div class="broadcast-phase" id="broadcast-phase">ANTES DO SNAP</div></aside>`;
export function scoreboardView(match: MatchSession | undefined, state: PlayState) {
  const seconds = Math.max(0, Math.ceil(match?.remaining ?? state.gameSeconds));
  const yard = Math.round(state.drive.spot < 0 ? state.drive.spot + 50 : 50 - state.drive.spot);
  const possession = match?.possession ?? 'wolves';
  return {
    wolves: String(match?.scores.wolves ?? state.drive.score).padStart(2, '0'),
    hawks: String(match?.scores.hawks ?? 0).padStart(2, '0'),
    possession,
    clock: gameClock(seconds),
    period: match ? `Q${match.quarter}` : 'TREINO',
    down: state.drive.attempt
      ? state.drive.attempt === 'extraPoint'
        ? 'EXTRA POINT'
        : '2 POINT TRY'
      : state.drive.status === 'touchdown'
        ? 'TOUCHDOWN'
        : downLabel(state.drive),
    spot: `${state.drive.spot < 0 ? possession.toUpperCase() : possession === 'wolves' ? 'HAWKS' : 'WOLVES'} ${yard}`,
    phase: state.pendingPenalty
      ? 'FLAG · JOGADA PARADA'
      : match?.finished
        ? matchResult(match)
        : state.phase === 'ready'
          ? 'ANTES DO SNAP'
          : state.phase === 'finished'
            ? 'FIM DA JOGADA'
            : state.controlSide === 'defense'
              ? 'VOCÊ NA DEFESA'
              : state.carrier === 'rb'
                ? 'RB #34 · CORRA'
                : 'EM JOGO',
  };
}
export function updateBroadcastScoreboard(match: MatchSession | undefined, state: PlayState) {
  const view = scoreboardView(match, state);
  for (const key of ['wolves', 'hawks', 'clock', 'period', 'down', 'spot', 'phase'] as const)
    document.querySelector<HTMLElement>(`#broadcast-${key}`)!.textContent = view[key];
  for (const team of ['wolves', 'hawks'] as const)
    document.querySelector<HTMLElement>(`#possession-${team}`)!.textContent =
      view.possession === team ? '▶ BOLA' : '';
}
