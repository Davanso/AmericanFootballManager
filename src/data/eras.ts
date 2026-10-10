export const ERAS = {
  '1980s': {
    name: 'Anos 80',
    year: 1985,
    stadiumTint: '#ffffff',
    banner: 'AURORA FIELD 1985',
    bannerBackground: '#183d32',
    bannerText: '#f1d575',
  },
  '1990s': {
    name: 'Anos 90',
    year: 1995,
    stadiumTint: '#edf6ff',
    banner: 'WOLVES FOOTBALL 1995',
    bannerBackground: '#254a68',
    bannerText: '#e2eef7',
  },
  '2000s': {
    name: 'Anos 2000',
    year: 2005,
    stadiumTint: '#e5edff',
    banner: 'AURORA LIVE 2005',
    bannerBackground: '#111f31',
    bannerText: '#5ae1ee',
  },
};
export type EraId = keyof typeof ERAS;
export function decodeEra(value: unknown): EraId {
  return typeof value === 'string' && Object.hasOwn(ERAS, value) ? (value as EraId) : '1980s';
}
