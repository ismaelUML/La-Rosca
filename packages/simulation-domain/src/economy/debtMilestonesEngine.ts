import type {
  DebtMilestoneOption,
  PendingDebtMilestone,
  SimulationState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// Calendario de megavencimientos de deuda soberana y revisiones FMI:
// cuatro hitos anunciados en el mandato para que la deuda deje de rodar invisible en segundo plano.

export const DEBT_MILESTONES_SCHEDULE: PendingDebtMilestone[] = [
  {
    id: 'FMI_REV_2028',
    turnMonth: 8,
    title: 'Revisión FMI + Vencimiento Bonares',
    amountBillionUsd: 4.5,
    summary: 'Vencen US$ 4,5 MM entre cupones Bonares y metas del Fondo. El mercado exige señal clara de pago o canje.'
  },
  {
    id: 'BONARES_2029',
    turnMonth: 18,
    title: 'Megavencimiento Bonares y Globales',
    amountBillionUsd: 6.2,
    summary: 'Pared de US$ 6,2 MM en dólares antes de las Legislativas. Wall Street mira las reservas netas con lupa.'
  },
  {
    id: 'FMI_AMORT_2030',
    turnMonth: 30,
    title: 'Amortización Fuerte de Capital FMI',
    amountBillionUsd: 5.4,
    summary: 'Compromiso de capital por US$ 5,4 MM con organismos multilaterales en la segunda mitad del mandato.'
  },
  {
    id: 'CIERRE_CURVA_2031',
    turnMonth: 42,
    title: 'Cierre de Curva Soberana 2031',
    amountBillionUsd: 5.8,
    summary: 'Último vencimiento pesado (US$ 5,8 MM) antes de las elecciones presidenciales.'
  }
];

export interface UpcomingDebtNotice {
  milestone: PendingDebtMilestone;
  monthsLeft: number;
}

export function getUpcomingDebtMilestone(state: SimulationState): UpcomingDebtNotice | null {
  const done = new Set(state.resolvedDebtMilestones ?? []);
  const next = DEBT_MILESTONES_SCHEDULE.find(
    (m) => !done.has(m.id) && m.turnMonth > state.turnMonth && m.turnMonth - state.turnMonth <= 3
  );
  if (!next) return null;
  return { milestone: next, monthsLeft: next.turnMonth - state.turnMonth };
}

export function detectDueDebtMilestone(state: SimulationState): PendingDebtMilestone | null {
  if (state.pendingDebtMilestone) return state.pendingDebtMilestone;
  const done = new Set(state.resolvedDebtMilestones ?? []);
  return (
    DEBT_MILESTONES_SCHEDULE.find((m) => !done.has(m.id) && m.turnMonth === state.turnMonth) ?? null
  );
}

function applyPayWithReserves(state: SimulationState, m: PendingDebtMilestone): SimulationState {
  const netDrain = round2(m.amountBillionUsd * 0.45);
  if (state.centralBank.netLiquidReservesBillionUsd < 6) {
    return applyMarketSwap(state, m);
  }
  return {
    ...state,
    pendingDebtMilestone: null,
    resolvedDebtMilestones: [...(state.resolvedDebtMilestones ?? []), m.id],
    countryRiskEmbiPb: Math.min(state.countryRiskEmbiPb, Math.max(120, state.countryRiskEmbiPb - 75)),
    centralBank: {
      ...state.centralBank,
      grossReservesBillionUsd: round2(Math.max(10, state.centralBank.grossReservesBillionUsd - netDrain)),
      netLiquidReservesBillionUsd: round2(state.centralBank.netLiquidReservesBillionUsd - netDrain)
    },
    structural: {
      ...state.structural,
      anchorCredibilityIndex: round2(clamp(state.structural.anchorCredibilityIndex + 4.5, 8, 98))
    },
    eventLog: [
      `Deuda honrada cash (${m.title}): -US$ ${netDrain.toFixed(1).replace('.', ',')} MM reservas, -75 pb riesgo país.`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}

function applyMarketSwap(state: SimulationState, m: PendingDebtMilestone): SimulationState {
  return {
    ...state,
    pendingDebtMilestone: null,
    resolvedDebtMilestones: [...(state.resolvedDebtMilestones ?? []), m.id],
    countryRiskEmbiPb: state.countryRiskEmbiPb + 40,
    treasury: {
      ...state.treasury,
      debtInterestPctGdp: round2(state.treasury.debtInterestPctGdp + 0.22)
    },
    eventLog: [
      `Canje de mercado (${m.title}): preservaste reservas a cambio de +0,22 % PBI en intereses y +40 pb riesgo.`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}

function applyRestructureDebt(state: SimulationState, m: PendingDebtMilestone): SimulationState {
  return {
    ...state,
    pendingDebtMilestone: null,
    resolvedDebtMilestones: [...(state.resolvedDebtMilestones ?? []), m.id],
    countryRiskEmbiPb: state.countryRiskEmbiPb + 260,
    treasury: {
      ...state.treasury,
      debtInterestPctGdp: round2(Math.max(0.2, state.treasury.debtInterestPctGdp - 0.18))
    },
    structural: {
      ...state.structural,
      anchorCredibilityIndex: round2(clamp(state.structural.anchorCredibilityIndex - 14, 8, 98))
    },
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct - 2.4, 5, 95))
    },
    eventLog: [
      `Reperfilamiento compulsivo (${m.title}): ahorro de caja, pero +260 pb riesgo país y -14 credibilidad.`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}

export function resolveDebtMilestoneAction(
  state: SimulationState,
  option: DebtMilestoneOption
): SimulationState {
  const milestone = state.pendingDebtMilestone;
  if (!milestone) return state;
  if (option === 'PAGAR_RESERVAS') return applyPayWithReserves(state, milestone);
  if (option === 'CANJE_MERCADO') return applyMarketSwap(state, milestone);
  return applyRestructureDebt(state, milestone);
}
