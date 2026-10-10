import { describe, it, expect, vi, afterEach } from 'vitest';
import { decodeClub, defaultClub, startingQB, saveClub, loadClub } from '../../management/club';
import { createMatch } from '../../simulation/match';
describe('club persistence', () => {
  it('restores valid choices across reloads', () => {
    const save = { ...defaultClub(), starter: 'reyes', periodSeconds: 120, replaySpeed: 0.5 };
    expect(decodeClub(JSON.stringify(save))).toEqual(save);
    expect(startingQB(save).profile).toBe('mobile');
  });
  it('recovers corrupt and unsupported saves', () => {
    for (const raw of [null, '{', 'null', '{"version":2}'])
      expect(decodeClub(raw)).toEqual(defaultClub());
    expect(
      decodeClub('{"version":1,"starter":"invalid","periodSeconds":-1,"replaySpeed":9}'),
    ).toEqual(defaultClub());
  });
  it('uses the selected starter and period in a new match', () => {
    const session = createMatch(120, 'mobile');
    expect(session.play.athletes.find((p) => p.id === 'qb')!.speed).toBe(9);
    expect(session.remaining).toBe(120);
    expect(session.wolvesProfile).toBe('mobile');
  });
});

afterEach(() => vi.unstubAllGlobals());
it('reports blocked storage without crashing', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  });
  expect(loadClub()).toEqual(defaultClub());
  expect(saveClub(defaultClub())).toBe(false);
});
it('persists the save and restores it through storage', () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  const save = { ...defaultClub(), starter: 'walker' };
  expect(saveClub(save)).toBe(true);
  expect(loadClub()).toEqual(save);
});
