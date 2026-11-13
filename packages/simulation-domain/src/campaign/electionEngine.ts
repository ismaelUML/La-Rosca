import type { CampaignSimulationState } from '../models/CampaignTypes.js';

export type ElectionStageType = 'PASO' | 'GENERALES' | 'BALOTAJE';

export interface CandidateVoteResult {
  fuerza: string;
  candidato: string;
  votos: number;
  pct: number;
  color: string;
  isPlayer: boolean;
}

export interface EscrutinioData {
  padronTotal: number;
  participacionPct: number;
  votosPositivos: number;
  votosBlancos: number;
  votosNulos: number;
  abstencion: number;
  results: CandidateVoteResult[];
  verdictTitle: string;
  verdictSubtitle: string;
  isVictory: boolean;
  isRunoff: boolean;
}

interface NationalPresetTicket {
  partySigla: string;
  fuerza: string;
  candidato: string;
  color: string;
  baseWeight: number;
}

const PADRON_NACIONAL = 36262373;

const NATIONAL_TICKETS_POOL: NationalPresetTicket[] = [
  {
    partySigla: 'UxP',
    fuerza: 'UxP + FIT',
    candidato: 'Axel Kicillof (fórmula presidencial con vicepresidencia)',
    color: '#0284c7',
    baseWeight: 44
  },
  {
    partySigla: 'LLA',
    fuerza: 'La Libertad Avanza',
    candidato: 'Javier Milei (fórmula presidencial con vicepresidencia)',
    color: '#8b5cf6',
    baseWeight: 44
  },
  {
    partySigla: 'PRO',
    fuerza: 'Propuesta Republicana (PRO)',
    candidato: 'Mauricio Macri (fórmula presidencial con vicepresidencia)',
    color: '#eab308',
    baseWeight: 20
  },
  {
    partySigla: 'PF',
    fuerza: 'Provincias Unidas / Peronismo Federal',
    candidato: 'Juan Schiaretti (fórmula presidencial con vicepresidencia)',
    color: '#2563eb',
    baseWeight: 16
  },
  {
    partySigla: 'UCR',
    fuerza: 'Unión Cívica Radical',
    candidato: 'Maximiliano Pullaro (fórmula presidencial con vicepresidencia)',
    color: '#dc2626',
    baseWeight: 14
  },
  {
    partySigla: 'FIT',
    fuerza: 'Frente de Izquierda',
    candidato: 'Myriam Bregman (fórmula presidencial con vicepresidencia)',
    color: '#ef4444',
    baseWeight: 6
  }
];

function resolveCoalitionLabel(partySigla: string, coalitionParties?: string[]): string {
  if (coalitionParties && coalitionParties.length > 0) {
    return `${partySigla} + ${coalitionParties.join(' + ')}`;
  }
  return partySigla;
}

function resolveEscrutinioTitle(isDirectVictory: boolean, isPlayerWinner: boolean, isPaso: boolean): string {
  if (isDirectVictory) {
    return isPlayerWinner ? 'Ganaste en primera vuelta' : 'Ganó la oposición en primera vuelta';
  }
  if (isPaso) {
    return isPlayerWinner ? 'Ganaste las PASO' : 'Quedaste posicionado para las Generales';
  }
  return 'Vas a segunda vuelta';
}

function resolveRivalTickets(playerPartySigla: string, coalitionParties: string[] = []): NationalPresetTicket[] {
  const allied = new Set([playerPartySigla, ...coalitionParties]);
  return NATIONAL_TICKETS_POOL.filter((t) => !allied.has(t.partySigla));
}

function distributeRivalShares(
  rivals: NationalPresetTicket[],
  remainingPct: number,
  votosValidos: number
): CandidateVoteResult[] {
  const sumWeights = rivals.reduce((acc, r) => acc + r.baseWeight, 0) || 1;
  let allocatedPct = 0;
  const results: CandidateVoteResult[] = [];

  for (let i = 0; i < rivals.length; i++) {
    const r = rivals[i]!;
    const isLast = i === rivals.length - 1;
    const share = isLast
      ? Math.max(0.5, Math.round((remainingPct - allocatedPct) * 10) / 10)
      : Math.round((r.baseWeight / sumWeights) * remainingPct * 10) / 10;
    allocatedPct += share;
    results.push({
      fuerza: r.fuerza,
      candidato: r.candidato,
      votos: Math.round((votosValidos * share) / 100),
      pct: share,
      color: r.color,
      isPlayer: false
    });
  }
  return results;
}

function checkConstitutionalFirstRoundWin(firstPct: number, diffPct: number): boolean {
  if (firstPct >= 45) return true;
  return firstPct >= 40 && diffPct >= 10;
}

function buildPlayerResult(
  state: CampaignSimulationState,
  coalitionLabel: string,
  playerPct: number,
  playerVotes: number
): CandidateVoteResult {
  return {
    fuerza: coalitionLabel,
    candidato: `${state.candidateName} (fórmula presidencial con vicepresidencia)`,
    votos: playerVotes,
    pct: playerPct,
    color: state.partyColor || '#8b5cf6',
    isPlayer: true
  };
}

function computeBalotajeEscrutinio(
  state: CampaignSimulationState,
  votosValidos: number,
  participacionPct: number,
  votosBlancos: number,
  votosNulos: number,
  abstencion: number,
  coalitionLabel: string
): EscrutinioData {
  const playerShare = Math.min(80, Math.max(20, state.votingIntention.intencionVotoGeneral));
  const playerPct = Math.min(78, Math.max(48, Math.round(playerShare * 1.35 * 10) / 10));
  const rivalPct = Math.round((100 - playerPct) * 10) / 10;
  const playerVotes = Math.round((votosValidos * playerPct) / 100);
  const isPlayerWinner = playerPct > rivalPct;

  const rivals = resolveRivalTickets(state.partySigla, state.coalitionParties);
  const topRival = rivals[0] ?? NATIONAL_TICKETS_POOL[0]!;
  const results: CandidateVoteResult[] = [
    buildPlayerResult(state, coalitionLabel, playerPct, playerVotes),
    {
      fuerza: topRival.fuerza,
      candidato: topRival.candidato,
      votos: votosValidos - playerVotes,
      pct: rivalPct,
      color: topRival.color,
      isPlayer: false
    }
  ];

  return {
    padronTotal: PADRON_NACIONAL,
    participacionPct,
    votosPositivos: votosValidos,
    votosBlancos,
    votosNulos,
    abstencion,
    results,
    verdictTitle: isPlayerWinner ? 'Ganaste la Presidencia' : 'Fuiste derrotado en el balotaje',
    verdictSubtitle: `Sacaste ${playerPct.toFixed(1).replace('.', ',')} % (${playerVotes.toLocaleString('es-AR')} votos).`,
    isVictory: isPlayerWinner,
    isRunoff: false
  };
}

function computeGeneralesEscrutinio(
  state: CampaignSimulationState,
  votosValidos: number,
  participacionPct: number,
  votosBlancos: number,
  votosNulos: number,
  abstencion: number,
  coalitionLabel: string,
  stage: ElectionStageType
): EscrutinioData {
  const playerShare = Math.min(80, Math.max(15, state.votingIntention.intencionVotoGeneral));
  const playerPct = Math.round(playerShare * 10) / 10;
  const remainingPct = Math.round((100 - playerPct) * 10) / 10;
  const playerVotes = Math.round((votosValidos * playerPct) / 100);

  const rivals = resolveRivalTickets(state.partySigla, state.coalitionParties);
  const rivalResults = distributeRivalShares(rivals, remainingPct, votosValidos);
  const rawResults = [buildPlayerResult(state, coalitionLabel, playerPct, playerVotes), ...rivalResults].sort(
    (a, b) => b.pct - a.pct
  );

  const first = rawResults[0]!;
  const second = rawResults[1] ?? first;
  const directVictory = checkConstitutionalFirstRoundWin(first.pct, first.pct - second.pct);
  const isRunoff = stage === 'GENERALES' ? !directVictory : false;

  return {
    padronTotal: PADRON_NACIONAL,
    participacionPct,
    votosPositivos: votosValidos,
    votosBlancos,
    votosNulos,
    abstencion,
    results: rawResults,
    verdictTitle: resolveEscrutinioTitle(directVictory, first.isPlayer, stage === 'PASO'),
    verdictSubtitle: `Sacaste ${playerPct.toFixed(1).replace('.', ',')} % (${playerVotes.toLocaleString('es-AR')} votos).`,
    isVictory: directVictory && first.isPlayer,
    isRunoff
  };
}

export function computeEscrutinio(stage: ElectionStageType, state: CampaignSimulationState): EscrutinioData {
  const isBalotaje = stage === 'BALOTAJE';
  const participacionPct = isBalotaje ? 76.2 : 75.1;
  const electoresVotantes = Math.round((PADRON_NACIONAL * participacionPct) / 100);
  const abstencion = PADRON_NACIONAL - electoresVotantes;
  const votosBlancos = isBalotaje ? 667473 : 530558;
  const votosNulos = isBalotaje ? 370700 : 314092;
  const votosValidos = electoresVotantes - votosBlancos - votosNulos;
  const coalitionLabel = resolveCoalitionLabel(state.partySigla, state.coalitionParties);

  if (isBalotaje) {
    return computeBalotajeEscrutinio(
      state,
      votosValidos,
      participacionPct,
      votosBlancos,
      votosNulos,
      abstencion,
      coalitionLabel
    );
  }
  return computeGeneralesEscrutinio(
    state,
    votosValidos,
    participacionPct,
    votosBlancos,
    votosNulos,
    abstencion,
    coalitionLabel,
    stage
  );
}
