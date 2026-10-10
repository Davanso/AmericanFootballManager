import { createMatch } from '../simulation/match';
import type { MatchSession } from '../simulation/match';
import type { Drive } from '../simulation/drive';
function shape(value: unknown, template: unknown): boolean {
  if (typeof template === 'number')
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Math.abs(value) <= Number.MAX_SAFE_INTEGER
    );
  if (typeof template === 'string') return typeof value === 'string' && value.length < 500;
  if (typeof template === 'boolean') return typeof value === 'boolean';
  if (!template || typeof template !== 'object') return value === template;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(template).every(([key, item]) =>
    shape((value as Record<string, unknown>)[key], item),
  );
}
function validDrive(value: Drive) {
  return (
    shape(value, { spot: 0, target: 0, down: 1, score: 0, status: 'active' }) &&
    value.spot >= -49 &&
    value.spot <= 50 &&
    value.target <= 50 &&
    value.target >= -49 &&
    Number.isInteger(value.down) &&
    value.down >= 1 &&
    value.down <= 4 &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    ['active', 'touchdown', 'turnover'].includes(value.status) &&
    (value.attempt === undefined || ['extraPoint', 'twoPoint'].includes(value.attempt))
  );
}
function validReads(value: unknown) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, n]) =>
        ['wr1', 'wr2', 'wr3'].includes(key) &&
        typeof n === 'number' &&
        Number.isInteger(n) &&
        n >= 0 &&
        n < 1000000,
    ),
  );
}
export function decodeMatch(value: unknown): MatchSession | undefined {
  try {
    const match = value as MatchSession;
    const base = createMatch();
    const { play: _, reads: __, ...header } = base;
    if (
      !shape(match, header) ||
      !Number.isInteger(match.quarter) ||
      match.quarter < 1 ||
      match.quarter > 4 ||
      ![60, 120, 180].includes(match.periodSeconds) ||
      match.remaining < 0 ||
      match.remaining > match.periodSeconds ||
      !['wolves', 'hawks'].includes(match.possession) ||
      !['balanced', 'mobile', 'deep'].includes(match.wolvesProfile)
    )
      return;
    if (!validReads(match.reads?.wolves) || !validReads(match.reads?.hawks)) return;
    const state = match.play;
    if (
      !Number.isInteger(state?.randomState) ||
      state.randomState < 0 ||
      state.randomState > 0xffffffff
    )
      return;
    if (state.flagsEnabled !== undefined && typeof state.flagsEnabled !== 'boolean') return;
    if (state.flagChecked !== undefined && typeof state.flagChecked !== 'boolean') return;
    if (match.finished && state.phase !== 'finished') return;
    const {
      athletes: ___,
      drive: ____,
      defenseReads: _____,
      flagsEnabled: _flags,
      ...playTemplate
    } = base.play;
    if (!shape(state, playTemplate) || !validDrive(state.drive) || !validReads(state.defenseReads))
      return;
    if (
      ![
        'ready',
        'snap',
        'handoff',
        'live',
        'pass',
        'finished',
        'kickAim',
        'kickPower',
        'kickFlight',
        'puntFlight',
      ].includes(state.phase) ||
      !['short', 'deep', 'run', 'kick', 'punt'].includes(state.kind) ||
      !['man', 'zone', 'blitz'].includes(state.defensePlan) ||
      !['offense', 'defense'].includes(state.controlSide) ||
      !['balanced', 'mobile', 'deep'].includes(state.qbProfile!)
    )
      return;
    if (
      state.controlSide !== (match.possession === 'wolves' ? 'offense' : 'defense') ||
      !state.matchPlay ||
      state.elapsed < 0 ||
      state.gameSeconds < 0 ||
      (state.gameSeconds > match.periodSeconds && !state.drive.attempt) ||
      state.decision < 0
    )
      return;
    if (
      !Array.isArray(state.athletes) ||
      state.athletes.length !== 22 ||
      new Set(state.athletes.map((a) => a.id)).size !== 22
    )
      return;
    for (const expected of base.play.athletes) {
      const athlete = state.athletes.find((a) => a.id === expected.id);
      const { route: ______, ...athleteTemplate } = expected;
      if (
        !athlete ||
        !shape(athlete, athleteTemplate) ||
        athlete.team !== expected.team ||
        athlete.role !== expected.role ||
        !Array.isArray(athlete.route) ||
        athlete.route.length > 10 ||
        !athlete.route.every((p) => shape(p, { x: 0, z: 0 })) ||
        !Number.isInteger(athlete.waypoint) ||
        athlete.waypoint < 0 ||
        athlete.waypoint > athlete.route.length ||
        athlete.speed < 0 ||
        athlete.speed > 20 ||
        Math.abs(athlete.x) > 60 ||
        Math.abs(athlete.z) > 27
      )
        return;
      if (
        athlete.attributes &&
        (!shape(athlete.attributes, { speed: 0, catching: 0, shortPass: 0, longPass: 0 }) ||
          Object.entries(athlete.attributes).some(
            ([key, n]) => n < 0 || n > (key === 'speed' ? 20 : 1),
          ))
      )
        return;
    }
    const ids = state.athletes.map((a) => a.id);
    if (
      !['', ...ids].includes(state.carrier) ||
      !['', 'wr1', 'wr2', 'wr3'].includes(state.target) ||
      (state.phase === 'pass' && !state.target) ||
      !['', ...ids].includes(state.fallen) ||
      !ids.includes(state.selectedDefender)
    )
      return;
    if (
      state.pendingPenalty &&
      (!['falseStart', 'facemask'].includes(state.pendingPenalty.kind) ||
        !validDrive(state.pendingPenalty.original) ||
        !Number.isFinite(state.pendingPenalty.spot))
    )
      return;
    if (
      !['none', 'tackle', 'incomplete', 'touchdown', 'fieldGoal', 'interception', 'other'].includes(
        state.outcome,
      )
    )
      return;
    if (Object.values(match.scores).some((n) => !Number.isInteger(n) || n < 0)) return;
    return structuredClone(match);
  } catch {
    return;
  }
}
