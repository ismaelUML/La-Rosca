import type {
  MandateStatus,
  MonthlyHistorySnapshot,
  SimulationState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { getGovernmentRuntime, MANDATE_MONTHS } from '../politics/governmentEventsEngine.js';

// Historial mensual real para los 24 gráficos de Indicadores + clasificación de legado presidencial
// y transición limpia a un 2° mandato (Reelección 2031).

const SHORT_MONTHS = ['dic', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov'];

function formatSnapshotLabel(turnMonth: number): string {
  const idx = (turnMonth - 1) % 12;
  const year = 27 + Math.floor(turnMonth / 12);
  return `${SHORT_MONTHS[idx] ?? 'mes'} ${year}`;
}

export function captureMonthlyHistorySnapshot(state: SimulationState): MonthlyHistorySnapshot {
  return {
    turnMonth: state.turnMonth,
    label: formatSnapshotLabel(state.turnMonth),
    monthlyIpcPct: round2(state.inflation.realMonthlyIpcPct),
    interannualIpcPct: round2(state.inflation.interannualIpcPct),
    foodInflationPct: round2(state.inflation.foodInflationMonthlyPct),
    unemploymentPct: round2(state.labor.unemploymentPct),
    informalityPct: round2(state.labor.informalityPct),
    realWageIndex: round2(state.labor.realWageIndex),
    gdpGrowthPct: round2(state.gdpGrowthAnnualPct),
    gdpNominalUsdB: round2(state.gdpNominalBillionUsd),
    povertyPct: round2(state.inflation.povertyCbtPct),
    indigencePct: round2(state.inflation.indigenceCbaPct),
    giniCoefficient: round2(state.inflation.giniCoefficient),
    officialDollarArs: round2(state.centralBank.officialDollarArs),
    cclDollarArs: round2(state.centralBank.cclDollarArs),
    brechaPct: round2(state.centralBank.exchangeBrechaPct),
    grossReservesUsdB: round2(state.centralBank.grossReservesBillionUsd),
    netReservesUsdB: round2(state.centralBank.netLiquidReservesBillionUsd),
    policyRatePct: round2(state.centralBank.policyRateAnnualPct),
    countryRiskPb: Math.round(state.countryRiskEmbiPb),
    primaryResultPctGdp: round2(state.treasury.primaryResultPctGdp),
    revenuePctGdp: round2(state.treasury.revenuePctGdp),
    primarySpendingPctGdp: round2(state.treasury.primarySpendingPctGdp),
    tariffCoveragePct: round2(state.energy.userTariffCoveragePct),
    approvalPct: round2(state.publicOpinion.managementApprovalPct),
    personalImagePct: round2(state.publicOpinion.presidentialPersonalImagePct),
    expectation12mPct: round2(state.publicOpinion.expectation12MonthsPct)
  };
}

export function appendMonthlyHistorySnapshot(
  prevState: SimulationState,
  nextState: SimulationState
): MonthlyHistorySnapshot[] {
  const existing = prevState.historySnapshots ?? [captureMonthlyHistorySnapshot(prevState)];
  const nextSnap = captureMonthlyHistorySnapshot(nextState);
  return [...existing, nextSnap].slice(-49);
}

export interface PresidentialLegacyVerdict {
  archetypeTitle: string;
  tagline: string;
  canRunReelection: boolean;
}

const FAILURE_LEGACIES: Record<Exclude<MandateStatus, 'EN_CURSO' | 'MANDATO_COMPLETADO'>, PresidentialLegacyVerdict> = {
  HIPERINFLACION: {
    archetypeTitle: 'La Espiral Sin Freno',
    tagline: 'El peso se pulverizó y las góndolas remarcaron cada semana.',
    canRunReelection: false
  },
  DEFAULT_SOBERANO: {
    archetypeTitle: 'Default y Persiana Baja',
    tagline: 'Sin crédito externo ni reservas, el país volvió a quedar aislado.',
    canRunReelection: false
  },
  JUICIO_POLITICO: {
    archetypeTitle: 'Soledad en el Recinto',
    tagline: 'Perdiste la calle, los gobernadores y los dos tercios en el Congreso.',
    canRunReelection: false
  },
  RENUNCIA: {
    archetypeTitle: 'Helicóptero en Plaza de Mayo',
    tagline: 'La ingobernabilidad agotó el margen político antes de terminar el mandato.',
    canRunReelection: false
  }
};

function isStabilizerProfile(state: SimulationState): boolean {
  return state.inflation.interannualIpcPct <= 25 && state.treasury.primaryResultPctGdp >= 0.3;
}

function isPopularProfile(state: SimulationState): boolean {
  return state.publicOpinion.managementApprovalPct >= 52 && state.inflation.povertyCbtPct <= 33;
}

function classifyCompletedMandate(state: SimulationState): PresidentialLegacyVerdict {
  if (isStabilizerProfile(state)) {
    return {
      archetypeTitle: 'Estabilizador de Hierro',
      tagline: 'Domaste la inflación con ancla fiscal y cerraste el mandato con músculo financiero.',
      canRunReelection: true
    };
  }
  if (isPopularProfile(state)) {
    return {
      archetypeTitle: 'Conducción con Respaldo Popular',
      tagline: 'Sostuviste la calle y bajaste la pobreza para llegar entero a la reelección.',
      canRunReelection: true
    };
  }
  if (state.publicOpinion.managementApprovalPct >= 38) {
    return {
      archetypeTitle: 'Mago de la Rosca Eterna',
      tagline: 'Navegaste un Congreso partido, apagaste incendios y entregás el bastón en pie.',
      canRunReelection: true
    };
  }
  return {
    archetypeTitle: 'Sobreviviente del Desgaste',
    tagline: 'Completaste los 48 meses a fuerza de parches, pero llegás raspando al cierre.',
    canRunReelection: true
  };
}

export function resolvePresidentialLegacy(
  state: SimulationState,
  status: Exclude<MandateStatus, 'EN_CURSO'>
): PresidentialLegacyVerdict {
  if (status === 'MANDATO_COMPLETADO') return classifyCompletedMandate(state);
  return FAILURE_LEGACIES[status];
}

export function applyStartReelectionTerm(state: SimulationState): SimulationState {
  const gov = getGovernmentRuntime(state);
  const nextTarget = (gov.mandateTargetMonths ?? MANDATE_MONTHS) + MANDATE_MONTHS;
  return {
    ...state,
    government: {
      ...gov,
      mandateStatus: 'EN_CURSO',
      mandateTargetMonths: nextTarget,
      lowGovernabilityMonths: 0,
      lowApprovalMonths: 0,
      defaultRiskMonths: 0,
      hyperinflationMonths: 0,
      endReason: undefined,
      finalScore: undefined
    },
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct + 4, 25, 85))
    },
    eventLog: [
      `Reelección confirmada: comenzás un nuevo período presidencial (objetivo ${nextTarget} meses).`,
      ...state.eventLog.slice(0, 14)
    ]
  };
}
