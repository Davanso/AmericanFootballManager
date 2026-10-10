const SKINS = ['#f0c5a0', '#ce966e', '#a76a46', '#68412f'];
const CLEATS = ['#202b29', '#efe4c5', '#583e2e'];

export function playerAppearance(id: string, team: 'home' | 'away') {
  const hash =
    [...id].reduce((value, char) => value * 31 + char.charCodeAt(0), team === 'home' ? 0 : 7) >>> 0;
  const suffix = Number(id.match(/\d+$/)?.[0] ?? 0);
  const numbers: Record<string, number> = { qb: 12, rb: 34, fb: 44, wr1: 81, wr2: 86, wr3: 89 };
  const base = id.startsWith('ol')
    ? 60
    : id.startsWith('rush')
      ? 90
      : id.startsWith('cover')
        ? 21
        : 30;
  return {
    number: numbers[id] ?? base + suffix,
    skin: SKINS[hash % SKINS.length],
    cleats: CLEATS[hash % CLEATS.length],
    hair: hash % 2 ? '#412c22' : '#b58b47',
    moustache: hash % 3 === 0,
    mullet: hash % 2 === 0,
  };
}
