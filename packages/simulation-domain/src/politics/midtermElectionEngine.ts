import type {
  CongressBlocAllocation,
  MidtermElection2029Result,
  SimulationState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// Legislativas de medio término (Octubre 2029, Mes 23): renueva 127 bancas de Diputados
// y 24 del Senado según gestión real. Nunca rompe el total constitucional de 257 / 72.

export const MIDTERM_2029_TURN_MONTH = 23;

const DEFAULT_FALLBACK_BLOCS: CongressBlocAllocation[] = [
  { id: 'LLA', deputiesSeats: 38, senateSeats: 7, relation: 100 },
  { id: 'PRO', deputiesSeats: 37, senateSeats: 6, relation: 78 },
  { id: 'UCR', deputiesSeats: 34, senateSeats: 13, relation: 42 },
  { id: 'PF', deputiesSeats: 16, senateSeats: 6, relation: 55 },
  { id: 'PROVINCIALES', deputiesSeats: 28, senateSeats: 7, relation: 50 },
  { id: 'UXP', deputiesSeats: 99, senateSeats: 33, relation: 0 },
  { id: 'FIT', deputiesSeats: 5, senateSeats: 0, relation: 5 }
];

function computeMidtermVotePct(state: SimulationState): number {
  const promises = state.campaignPromises ?? [];
  const brokenCount = promises.filter((p) => p.status === 'ROTA').length;
  const fulfilledCount = promises.filter((p) => p.status === 'CUMPLIDA').length;
  const inflBonus = (2.5 - state.inflation.realMonthlyIpcPct) * 2.2;
  const povertyBonus = (35 - state.inflation.povertyCbtPct) * 0.4;
  const raw =
    state.publicOpinion.managementApprovalPct * 0.72 +
    inflBonus +
    povertyBonus +
    fulfilledCount * 1.5 -
    brokenCount * 2.5;
  return round2(clamp(raw, 18, 58));
}

function findPlayerAndOppBlocIds(blocs: CongressBlocAllocation[]): { playerId: string; oppId: string } {
  const player = blocs.find((b) => b.relation >= 99) ?? blocs[0];
  const playerId = player?.id ?? 'LLA';
  const candidates = blocs.filter((b) => b.id !== playerId);
  const opp = candidates.reduce<CongressBlocAllocation | null>(
    (best, cur) => (!best || cur.deputiesSeats > best.deputiesSeats ? cur : best),
    null
  );
  return { playerId, oppId: opp?.id ?? (playerId === 'UXP' ? 'PRO' : 'UXP') };
}

function applySafeSeatTransfer(
  blocs: CongressBlocAllocation[],
  playerId: string,
  oppId: string,
  field: 'deputiesSeats' | 'senateSeats',
  desiredDelta: number,
  minFloor: number
): { nextBlocs: CongressBlocAllocation[]; actualDelta: number } {
  const playerBloc = blocs.find((b) => b.id === playerId);
  const oppBloc = blocs.find((b) => b.id === oppId);
  if (!playerBloc || !oppBloc || desiredDelta === 0) return { nextBlocs: blocs, actualDelta: 0 };

  const actualDelta =
    desiredDelta > 0
      ? Math.min(desiredDelta, Math.max(0, oppBloc[field] - minFloor))
      : -Math.min(-desiredDelta, Math.max(0, playerBloc[field] - minFloor));

  const nextBlocs = blocs.map((b) => {
    if (b.id === playerId) return { ...b, [field]: b[field] + actualDelta };
    if (b.id === oppId) return { ...b, [field]: b[field] - actualDelta };
    return b;
  });
  return { nextBlocs, actualDelta };
}

function buildMidtermVerdict(votePct: number): { verdictLabel: string; headline: string } {
  if (votePct >= 42) {
    return {
      verdictLabel: 'TRIUNFO CONTUNDENTE EN MEDIO TÉRMINO',
      headline: 'El oficialismo plebiscitó la gestión y amplió músculo en ambas Cámaras.'
    };
  }
  if (votePct >= 34) {
    return {
      verdictLabel: 'EMPATE TÉCNICO Y CONGRESO DIVIDIDO',
      headline: 'Las urnas mantuvieron el tablero partido: cada ley seguirá dependiendo de la rosca.'
    };
  }
  return {
    verdictLabel: 'DERROTA EN LAS LEGISLATIVAS 2029',
    headline: 'La oposición capitalizó el desgaste económico y recortó bancas oficialistas.'
  };
}

function formatSeatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

function resolveBaseBlocs(state: SimulationState): CongressBlocAllocation[] {
  const current = state.congressBlocs;
  return current && current.length > 0 ? current : DEFAULT_FALLBACK_BLOCS;
}

export function stepMidterm2029IfDue(state: SimulationState): Partial<SimulationState> {
  if (state.turnMonth !== MIDTERM_2029_TURN_MONTH || state.midterm2029Done) {
    return {};
  }
  const baseBlocs = resolveBaseBlocs(state);
  const playerVotePct = computeMidtermVotePct(state);
  const oppositionVotePct = round2(clamp(82 - playerVotePct, 22, 62));
  const perf = playerVotePct - 36;
  const desiredDep = Math.round(clamp(perf * 1.35, -24, 28));
  const desiredSen = Math.round(clamp(perf * 0.28, -6, 8));

  const { playerId, oppId } = findPlayerAndOppBlocIds(baseBlocs);
  const depStep = applySafeSeatTransfer(baseBlocs, playerId, oppId, 'deputiesSeats', desiredDep, 8);
  const senStep = applySafeSeatTransfer(depStep.nextBlocs, playerId, oppId, 'senateSeats', desiredSen, 2);
  const { verdictLabel, headline } = buildMidtermVerdict(playerVotePct);

  const result: MidtermElection2029Result = {
    turnMonth: state.turnMonth,
    playerVotePct,
    oppositionVotePct,
    deputiesDelta: depStep.actualDelta,
    senateDelta: senStep.actualDelta,
    verdictLabel,
    headline,
    dismissed: false
  };

  const logLine = `Legislativas 2029: ${playerVotePct.toFixed(1).replace('.', ',')} % · ${formatSeatDelta(depStep.actualDelta)} Diputados, ${formatSeatDelta(senStep.actualDelta)} Senadores.`;

  return {
    congressBlocs: senStep.nextBlocs,
    midterm2029Done: true,
    midterm2029Result: result,
    eventLog: [logLine, ...state.eventLog.slice(0, 14)]
  };
}
