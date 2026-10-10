export type DefensivePlan = 'man' | 'zone' | 'blitz';
export const DEFENSIVE_PLANS: Record<DefensivePlan, { name: string; description: string }> = {
  man: {
    name: 'Marcação individual',
    description: 'Marcadores acompanham recebedores; safeties protegem a profundidade.',
  },
  zone: {
    name: 'Cobertura de zona',
    description: 'Defensores protegem setores; procure espaços entre as zonas.',
  },
  blitz: {
    name: 'Blitz',
    description: 'Dois defensores extras pressionam o QB; menos proteção no passe curto.',
  },
};
