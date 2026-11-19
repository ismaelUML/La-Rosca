import type {
  CongressBlocAllocation,
  OppositionBillResolution,
  PendingOppositionBill,
  SimulationState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// Oposición activa en el Congreso: cada 5-6 meses las bancadas opositoras impulsan
// leyes incómodas que obligan al Ejecutivo a promulgar, negociar o vetar y blindar los 86 diputados.

export const VETO_BLOCKING_THIRD_DEPUTIES = 86;

export const OPPOSITION_BILLS_SCHEDULE: PendingOppositionBill[] = [
  {
    id: 'OPP_MOVILIDAD_JUB',
    turnMonth: 6,
    title: 'Ley de Movilidad Jubilatoria Reforzada',
    sponsorBloc: 'UXP + UCR',
    summary: 'La oposición aprobó un empalme jubilatorio con impacto directo sobre ANSES y el superávit primario.',
    fiscalCostPctGdp: 0.45
  },
  {
    id: 'OPP_FINANC_UNIV',
    turnMonth: 12,
    title: 'Ley de Financiamiento Universitario',
    sponsorBloc: 'UCR + PF + UXP',
    summary: 'Actualización automática por IPC de partidas universitarias y salarios docentes en todo el país.',
    fiscalCostPctGdp: 0.28
  },
  {
    id: 'OPP_FONID_TRANSPORTE',
    turnMonth: 17,
    title: 'Restitución del FONID y Fondo Transporte',
    sponsorBloc: 'PROVINCIALES + UXP',
    summary: 'Los bloques del interior exigen reponer transferencias educativas y subsidios al transporte provincial.',
    fiscalCostPctGdp: 0.24
  },
  {
    id: 'OPP_LIMITE_DNU',
    turnMonth: 26,
    title: 'Reforma Restrictiva de la Ley de DNU',
    sponsorBloc: 'UXP + UCR + FIT',
    summary: 'Basta el rechazo de una sola Cámara para voltear decretos presidenciales: recorta tu margen de acción.',
    fiscalCostPctGdp: 0,
    limitsPoliticalCapital: true
  },
  {
    id: 'OPP_FRENO_TARIFAS',
    turnMonth: 34,
    title: 'Emergencia Tarifaria Nacional',
    sponsorBloc: 'UXP + FIT',
    summary: 'Congela cuadros tarifarios de luz y gas, bajando cobertura y cargando déficit sobre CAMMESA.',
    fiscalCostPctGdp: 0.32,
    tariffHitPp: 12
  }
];

const FALLBACK_BLOCS: CongressBlocAllocation[] = [
  { id: 'LLA', deputiesSeats: 38, senateSeats: 7, relation: 100 },
  { id: 'PRO', deputiesSeats: 37, senateSeats: 6, relation: 78 },
  { id: 'UCR', deputiesSeats: 34, senateSeats: 13, relation: 42 },
  { id: 'PF', deputiesSeats: 16, senateSeats: 6, relation: 55 },
  { id: 'PROVINCIALES', deputiesSeats: 28, senateSeats: 7, relation: 50 },
  { id: 'UXP', deputiesSeats: 99, senateSeats: 33, relation: 0 },
  { id: 'FIT', deputiesSeats: 5, senateSeats: 0, relation: 5 }
];

export function countAlliedDeputiesForVeto(state: SimulationState): number {
  const blocs = state.congressBlocs && state.congressBlocs.length > 0 ? state.congressBlocs : FALLBACK_BLOCS;
  return blocs
    .filter((b) => b.relation >= 55)
    .reduce((acc, b) => acc + b.deputiesSeats, 0);
}

export function detectDueOppositionBill(state: SimulationState): PendingOppositionBill | null {
  if (state.pendingOppositionBill) return state.pendingOppositionBill;
  if (state.pendingDebtMilestone) return null;
  const done = new Set(state.resolvedOppositionBills ?? []);
  return (
    OPPOSITION_BILLS_SCHEDULE.find((b) => !done.has(b.id) && b.turnMonth === state.turnMonth) ?? null
  );
}

function applyLawCostToState(state: SimulationState, bill: PendingOppositionBill, scale = 1): SimulationState {
  const extraSpend = round2(bill.fiscalCostPctGdp * scale);
  const tariffDrop = bill.tariffHitPp ? Math.round(bill.tariffHitPp * scale) : 0;
  const nextCap = bill.limitsPoliticalCapital
    ? { remaining: 2, maxPerMonth: 2 }
    : state.politicalCapital;
  return {
    ...state,
    politicalCapital: nextCap,
    treasury: {
      ...state.treasury,
      socialProgramsPctGdp: round2(state.treasury.socialProgramsPctGdp + extraSpend)
    },
    energy: {
      ...state.energy,
      userTariffCoveragePct: clamp(state.energy.userTariffCoveragePct - tariffDrop, 20, 100)
    }
  };
}

function shiftNonPlayerBlocs(
  blocs: CongressBlocAllocation[] | undefined,
  delta: number
): CongressBlocAllocation[] | undefined {
  if (!blocs) return blocs;
  return blocs.map((b) =>
    b.relation >= 99 ? b : { ...b, relation: clamp(b.relation + delta, 0, 100) }
  );
}

function applyPromulgateBill(state: SimulationState, bill: PendingOppositionBill): SimulationState {
  const withCost = applyLawCostToState(state, bill, 1);
  return {
    ...withCost,
    pendingOppositionBill: null,
    resolvedOppositionBills: [...(state.resolvedOppositionBills ?? []), bill.id],
    congressBlocs: shiftNonPlayerBlocs(state.congressBlocs, 5),
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct + 1.8, 5, 95))
    },
    eventLog: [
      `Promulgaste ley opositora "${bill.title}" (+1,8 % imagen · costo fiscal +${bill.fiscalCostPctGdp.toFixed(2).replace('.', ',')} % PBI).`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}

function resolveVetoOutcomeSpec(
  shielded: boolean,
  allied: number,
  billTitle: string
): { approvalDelta: number; credDelta: number; logLine: string } {
  if (shielded) {
    return {
      approvalDelta: -1.4,
      credDelta: 3.0,
      logLine: `Veto presidencial blindado (${allied} dip. aliados) contra "${billTitle}" (+3 credibilidad, -1,4 % imagen).`
    };
  }
  return {
    approvalDelta: -2.6,
    credDelta: -3.5,
    logLine: `Derrota en el recinto: solo juntaste ${allied}/86 diputados y la oposición rechazó tu veto a "${billTitle}".`
  };
}

function applyVetoBill(state: SimulationState, bill: PendingOppositionBill): SimulationState {
  const allied = countAlliedDeputiesForVeto(state);
  const shielded = allied >= VETO_BLOCKING_THIRD_DEPUTIES;
  const base = shielded ? state : applyLawCostToState(state, bill, 1);
  const spec = resolveVetoOutcomeSpec(shielded, allied, bill.title);

  return {
    ...base,
    pendingOppositionBill: null,
    resolvedOppositionBills: [...(state.resolvedOppositionBills ?? []), bill.id],
    congressBlocs: shiftNonPlayerBlocs(state.congressBlocs, -4),
    structural: {
      ...base.structural,
      anchorCredibilityIndex: round2(clamp(base.structural.anchorCredibilityIndex + spec.credDelta, 8, 98))
    },
    publicOpinion: {
      ...base.publicOpinion,
      managementApprovalPct: round2(clamp(base.publicOpinion.managementApprovalPct + spec.approvalDelta, 5, 95))
    },
    eventLog: [spec.logLine, ...state.eventLog.slice(0, 14)]
  };
}

function applyNegotiateBill(state: SimulationState, bill: PendingOppositionBill): SimulationState {
  const withHalfCost = applyLawCostToState(state, bill, 0.5);
  return {
    ...withHalfCost,
    pendingOppositionBill: null,
    resolvedOppositionBills: [...(state.resolvedOppositionBills ?? []), bill.id],
    treasury: {
      ...withHalfCost.treasury,
      discretionaryAtnPctGdp: round2(withHalfCost.treasury.discretionaryAtnPctGdp + 0.06)
    },
    congressBlocs: shiftNonPlayerBlocs(state.congressBlocs, 4),
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct + 0.4, 5, 95))
    },
    eventLog: [
      `Versión consensuada de "${bill.title}": redujiste el costo a la mitad con rosca parlamentaria (+4 relación bloques).`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}

export function resolveOppositionBillAction(
  state: SimulationState,
  resolution: OppositionBillResolution
): SimulationState {
  const bill = state.pendingOppositionBill;
  if (!bill) return state;
  if (resolution === 'PROMULGAR') return applyPromulgateBill(state, bill);
  if (resolution === 'VETAR') return applyVetoBill(state, bill);
  return applyNegotiateBill(state, bill);
}
