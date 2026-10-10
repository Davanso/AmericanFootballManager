import type { QBProfile } from '../data/playerAttributes';
import { applyRoster } from '../data/playerAttributes';
import { createDrive } from './drive';
import { createPlay } from './play';
import type { PlayState, PlayKind } from './play';
import { updatePlay } from './update';
import type { Input } from './update';
import { chooseConversion, needsConversion } from './conversion';
export interface MatchSession {
  wolvesProfile: QBProfile;
  reads: { wolves: Record<string, number>; hawks: Record<string, number> };
  quarter: number;
  remaining: number;
  periodSeconds: number;
  possession: 'wolves' | 'hawks';
  scores: { wolves: number; hawks: number };
  finished: boolean;
  play: PlayState;
  series: number;
}
export function createMatch(periodSeconds = 60, profile: QBProfile = 'balanced'): MatchSession {
  const session: MatchSession = {
    wolvesProfile: profile,
    reads: { wolves: {}, hawks: {} },
    quarter: 1,
    remaining: periodSeconds,
    periodSeconds,
    possession: 'wolves',
    scores: { wolves: 0, hawks: 0 },
    finished: false,
    play: createPlay(),
    series: 0,
  };
  session.play = matchPlay(session, createDrive(), 'short');
  return session;
}
function matchPlay(session: MatchSession, drive: PlayState['drive'], kind: PlayKind) {
  const previous = session.play;
  const state = createPlay(
    drive,
    kind,
    false,
    session.remaining,
    session.reads[session.possession],
    previous.defensePlan,
    session.possession === 'wolves' ? 'offense' : 'defense',
  );
  state.matchPlay = true;
  state.flagsEnabled = true;
  state.randomState = previous.randomState;
  applyRoster(state, session.possession === 'wolves' ? session.wolvesProfile : 'deep');
  return state;
}
export function tickMatch(session: MatchSession, input: Input, dt: number) {
  if (session.finished) return;
  const state = session.play;
  state.matchPlay = true;
  state.flagsEnabled = true;
  if (!state.qbProfile) applyRoster(state, session.possession === 'wolves' ? 'balanced' : 'deep');
  state.lateGame = session.quarter === 4 && session.remaining <= 30 && !state.drive.attempt;
  if (session.possession === 'wolves' && state.qbProfile) session.wolvesProfile = state.qbProfile;
  updatePlay(state, input, dt);
  session.reads[session.possession] = { ...state.defenseReads };
  if (!state.drive.attempt) session.remaining = state.gameSeconds;
  session.scores[session.possession] = state.drive.score;
  if (needsConversion(state) && state.controlSide === 'defense') {
    session.play = chooseConversion(state, 'extraPoint');
    session.play.matchPlay = true;
  }
  if (
    state.phase === 'finished' &&
    !state.pendingPenalty &&
    session.remaining === 0 &&
    session.quarter === 4 &&
    !needsConversion(state)
  )
    session.finished = true;
}
export function matchConversion(session: MatchSession, attempt: 'extraPoint' | 'twoPoint') {
  if (session.finished) return;
  session.play = chooseConversion(session.play, attempt);
  session.play.matchPlay = true;
}
export function nextMatchPlay(session: MatchSession) {
  if (
    session.finished ||
    session.play.phase !== 'finished' ||
    session.play.pendingPenalty ||
    needsConversion(session.play)
  )
    return;
  const previous = session.play;
  session.scores[session.possession] = previous.drive.score;
  if (session.remaining === 0) {
    if (session.quarter === 4) {
      session.finished = true;
      return;
    }
    session.quarter++;
    session.remaining = session.periodSeconds;
  }
  if (previous.drive.status === 'active') {
    session.play = matchPlay(
      session,
      previous.drive,
      session.possession === 'wolves' ? previous.kind : botPlayKind(session, previous.drive),
    );
    return;
  }
  session.possession = session.possession === 'wolves' ? 'hawks' : 'wolves';
  session.series++;
  const spot =
    previous.drive.attempt || previous.outcome === 'fieldGoal'
      ? -25
      : Math.max(-49, Math.min(49, -previous.drive.spot));
  const drive = createDrive(session.scores[session.possession], spot);
  session.play = matchPlay(
    session,
    drive,
    session.possession === 'wolves' ? 'short' : botPlayKind(session, drive),
  );
}
function botPlayKind(session: MatchSession, drive: PlayState['drive']): PlayKind {
  if (drive.down === 4 && drive.spot >= 17) return 'kick';
  return (['short', 'run', 'deep'] as const)[session.series % 3];
}
export function matchResult(session: MatchSession) {
  if (session.scores.wolves === session.scores.hawks) return 'Empate';
  return session.scores.wolves > session.scores.hawks
    ? 'Aurora Wolves venceu'
    : 'Crimson Hawks venceu';
}
