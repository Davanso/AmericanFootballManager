import type { PlayState } from '../simulation/play';
export type QBProfile = 'balanced' | 'mobile' | 'deep';
export interface PlayerAttributes {
  speed: number;
  shortPass: number;
  longPass: number;
  catching: number;
}
export const QB_PROFILES: Record<
  QBProfile,
  { name: string; speed: number; shortPass: number; longPass: number }
> = {
  balanced: { name: 'QB equilibrado', speed: 7, shortPass: 0.94, longPass: 0.78 },
  mobile: { name: 'QB móvel', speed: 9, shortPass: 0.83, longPass: 0.61 },
  deep: { name: 'QB de profundidade', speed: 6, shortPass: 0.88, longPass: 0.95 },
};
export function applyRoster(state: PlayState, profile: QBProfile) {
  state.qbProfile = profile;
  for (const athlete of state.athletes) {
    const hash = [...athlete.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const qb = QB_PROFILES[profile];
    const speed =
      athlete.id === 'qb'
        ? qb.speed
        : athlete.id === 'rb'
          ? 8.2
          : athlete.role === 'blocker'
            ? 5.5 + (hash % 4) * 0.2
            : 6.8 + (hash % 6) * 0.25;
    athlete.attributes = {
      speed,
      shortPass: qb.shortPass,
      longPass: qb.longPass,
      catching: 0.89 + (hash % 5) * 0.02,
    };
    athlete.speed = speed;
  }
}
