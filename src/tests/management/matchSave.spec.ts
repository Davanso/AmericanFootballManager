import { it, expect } from 'vitest';
import { decodeMatch } from '../../management/matchSave';
import { createMatch, tickMatch, matchConversion } from '../../simulation/match';
import { throwPass } from '../../simulation/play';
it('restores ready, live and pass snapshots with the full RNG and routes', () => {
  const session = createMatch();
  expect(decodeMatch(session)).toEqual(session);
  session.play.flagsEnabled = false;
  session.play.phase = 'live';
  session.play.carrier = 'qb';
  tickMatch(session, { x: 0, z: 0 }, 0.1);
  expect(decodeMatch(session)).toEqual(session);
  throwPass(session.play, 'wr1');
  expect(decodeMatch(session)).toEqual(session);
});
it('returns an independent copy', () => {
  const session = createMatch();
  const restored = decodeMatch(session)!;
  restored.play.athletes[0].x = 1;
  expect(session.play.athletes[0].x).not.toBe(1);
});
it('preserves pending conversion including untimed clock and flags', () => {
  const session = createMatch();
  session.play.phase = 'finished';
  session.play.drive.status = 'touchdown';
  session.play.drive.score = 6;
  matchConversion(session, 'extraPoint');
  expect(decodeMatch(session)).toEqual(session);
});
it('rejects broken routes, missing athletes, invalid references and invalid numeric state', () => {
  for (const breakState of [
    (s: ReturnType<typeof createMatch>) => s.play.athletes.pop(),
    (s: ReturnType<typeof createMatch>) => {
      s.play.phase = 'pass';
      s.play.target = '';
    },
    (s: ReturnType<typeof createMatch>) => {
      s.play.randomState = -1;
    },
    (s: ReturnType<typeof createMatch>) => {
      s.play.athletes[0].x = NaN;
    },
    (s: ReturnType<typeof createMatch>) => {
      s.quarter = 6;
    },
    (s: ReturnType<typeof createMatch>) => {
      s.play.athletes[0].route = null as never;
    },
  ]) {
    const session = createMatch();
    breakState(session);
    expect(decodeMatch(session)).toBeUndefined();
  }
});
it('preserves flags awaiting acceptance', () => {
  const session = createMatch();
  session.play.pendingPenalty = {
    kind: 'falseStart',
    original: { ...session.play.drive },
    spot: session.play.drive.spot,
  };
  expect(decodeMatch(session)).toEqual(session);
});
