import { expect, it } from 'vitest';
import {
  createMatch,
  tickMatch,
  nextMatchPlay,
  matchConversion,
  matchResult,
} from '../../simulation/match';
import { startPlay, finishPlay } from '../../simulation/play';
it('runs the clock only during execution and keeps conversion attempts untimed', () => {
  const match = createMatch(10);
  tickMatch(match, { x: 0, z: 0 }, 1);
  expect(match.remaining).toBe(10);
  startPlay(match.play);
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.remaining).toBeCloseTo(9.9);
  match.play.ball.x = 50;
  finishPlay(match.play, 'TD', 'touchdown');
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  nextMatchPlay(match);
  expect(match.play.drive.status).toBe('touchdown');
  matchConversion(match, 'extraPoint');
  startPlay(match.play);
  const clock = match.remaining;
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.remaining).toBe(clock);
});
it('switches possession on failed fourth down and gives the player defense against the Hawks', () => {
  const match = createMatch();
  match.play.drive.down = 4;
  match.play.ball.x = -15;
  finishPlay(match.play, 'tackle', 'tackle');
  nextMatchPlay(match);
  expect(match.possession).toBe('hawks');
  expect(match.play.controlSide).toBe('defense');
  expect(match.play.drive.spot).toBe(15);
});
it('keeps scores separate and switches only after the conversion attempt', () => {
  const match = createMatch();
  match.play.ball.x = 50;
  finishPlay(match.play, 'TD', 'touchdown');
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.scores.wolves).toBe(6);
  expect(match.scores.hawks).toBe(0);
  matchConversion(match, 'twoPoint');
  match.play.ball.x = 50;
  finishPlay(match.play, 'TD', 'touchdown');
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.scores.wolves).toBe(8);
  nextMatchPlay(match);
  expect(match.possession).toBe('hawks');
  expect(match.play.drive.score).toBe(0);
});
it('advances periods and ends the fourth after the last play with a stable result', () => {
  const match = createMatch(1);
  for (let quarter = 1; quarter <= 4; quarter++) {
    expect(match.quarter).toBe(quarter);
    match.play.gameSeconds = 0;
    match.remaining = 0;
    finishPlay(match.play, 'end');
    tickMatch(match, { x: 0, z: 0 }, 0.1);
    nextMatchPlay(match);
  }
  expect(match.finished).toBe(true);
  expect(matchResult(match)).toBe('Empate');
  const snapshot = JSON.stringify(match);
  tickMatch(match, { x: 1, z: 1 }, 1);
  expect(JSON.stringify(match)).toBe(snapshot);
});
it('requires an untimed conversion after a touchdown on the final play', () => {
  const match = createMatch();
  match.quarter = 4;
  match.remaining = 0;
  match.play.gameSeconds = 0;
  match.play.ball.x = 50;
  finishPlay(match.play, 'TD', 'touchdown');
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.finished).toBe(false);
  matchConversion(match, 'twoPoint');
  match.play.ball.x = 49;
  finishPlay(match.play, 'failed', 'tackle');
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.finished).toBe(true);
  expect(match.scores.wolves).toBe(6);
});

it('waits for a final-play flag decision instead of ending the match early', () => {
  const match = createMatch();
  match.quarter = 4;
  match.remaining = 0;
  match.play.gameSeconds = 0;
  match.play.phase = 'finished';
  match.play.pendingPenalty = { kind: 'facemask', original: { ...match.play.drive }, spot: 0 };
  tickMatch(match, { x: 0, z: 0 }, 0.1);
  expect(match.finished).toBe(false);
  nextMatchPlay(match);
  expect(match.quarter).toBe(4);
});

it('keeps the player QB profile and defensive reads independent from the opponent', () => {
  const match = createMatch();
  match.play.qbProfile = 'mobile';
  match.play.defenseReads = { wr1: 4 };
  tickMatch(match, { x: 0, z: 0 }, 1 / 60);
  match.play.drive.status = 'turnover';
  match.play.phase = 'finished';
  nextMatchPlay(match);
  expect(match.play.qbProfile).toBe('deep');
  expect(match.play.defenseReads.wr1).toBeUndefined();
  match.play.drive.status = 'turnover';
  match.play.phase = 'finished';
  nextMatchPlay(match);
  expect(match.play.qbProfile).toBe('mobile');
  expect(match.play.defenseReads.wr1).toBe(4);
});
