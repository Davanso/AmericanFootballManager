export interface Drive {
  spot: number;
  target: number;
  down: number;
  score: number;
  status: 'active' | 'touchdown' | 'turnover';
}

export function createDrive(score = 0, spot = -19): Drive {
  return { spot, target: Math.min(50, spot + 10), down: 1, score, status: 'active' };
}

export function advanceDrive(drive: Drive, ballSpot: number, incomplete: boolean): Drive {
  if (drive.status !== 'active') return drive;
  const spot = incomplete ? drive.spot : Math.max(-49, Math.min(50, ballSpot));
  if (spot >= 50) return { ...drive, spot: 50, score: drive.score + 6, status: 'touchdown' };
  if (spot >= drive.target) return createDrive(drive.score, spot);
  if (drive.down === 4) return { ...drive, spot, status: 'turnover' };
  return { ...drive, spot, down: drive.down + 1 };
}

export function downLabel(drive: Drive) {
  const ordinal = ['1st', '2nd', '3rd', '4th'][drive.down - 1];
  const distance = drive.target === 50 ? 'GOAL' : Math.ceil(drive.target - drive.spot);
  return `${ordinal} to ${distance}`;
}
