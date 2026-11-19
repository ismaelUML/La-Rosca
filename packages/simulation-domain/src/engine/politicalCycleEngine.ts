import type { SectorMeasureCard } from '../models/PartyAndSetupTypes.js';
import type { PoliticalCapitalState, SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { stepMidterm2029IfDue } from '../politics/midtermElectionEngine.js';
import { stepCampaignPromises, stepCrisisArcs } from '../politics/promisesAndCrisisEngine.js';
import { stepCabinetDynamics } from '../politics/cabinetDynamicsEngine.js';
import { detectDueDebtMilestone, getUpcomingDebtMilestone } from '../economy/debtMilestonesEngine.js';
import { appendMonthlyHistorySnapshot } from '../politics/mandateLegacyEngine.js';
import { detectDueOppositionBill } from '../politics/oppositionBillEngine.js';

// Ritmo político mensual del Ejecutivo: límite de decisiones reales, vencimiento con rebote
// de medidas temporales, diagnóstico del incendio principal y balance causal del mes.

export const DEFAULT_POLITICAL_CAPITAL: PoliticalCapitalState = {
  remaining: 3,
  maxPerMonth: 3
};

export const TEMPORAL_MEASURE_DEFAULT_MONTHS = 6;
export const TEMPORAL_MEASURE_DEFAULT_COOLDOWN = 3;

export function getPoliticalCapital(state: SimulationState): PoliticalCapitalState {
  return state.politicalCapital ?? DEFAULT_POLITICAL_CAPITAL;
}

export function replenishPoliticalCapital(state: SimulationState): PoliticalCapitalState {
  const highLeverage =
    state.structural.anchorCredibilityIndex >= 70 &&
    state.publicOpinion.managementApprovalPct >= 55;
  const maxPerMonth = highLeverage ? 4 : 3;
  return { remaining: maxPerMonth, maxPerMonth };
}

export interface TemporalLifecycleResult {
  nextMeasures: SectorMeasureCard[];
  reboundInflationPp: number;
  reboundApprovalPp: number;
  expiredTitles: string[];
}

interface SingleMeasureTick {
  next: SectorMeasureCard;
  reboundInflationPp: number;
  reboundApprovalPp: number;
  expiredTitle: string | null;
}

function expireTemporalMeasure(measure: SectorMeasureCard): SingleMeasureTick {
  const reboundInflationPp =
    measure.inflationEffectPp < 0 ? Math.min(0.65, Math.abs(measure.inflationEffectPp) * 0.45) : 0;
  const reboundApprovalPp =
    measure.approvalEffectPp > 0 ? -Math.min(1.2, measure.approvalEffectPp * 0.3) : 0;
  const cooldownRemainingMonths = measure.cooldownMonths ?? TEMPORAL_MEASURE_DEFAULT_COOLDOWN;
  return {
    next: { ...measure, active: false, remainingMonths: 0, cooldownRemainingMonths },
    reboundInflationPp,
    reboundApprovalPp,
    expiredTitle: measure.title
  };
}

function tickActiveTemporalMeasure(measure: SectorMeasureCard): SingleMeasureTick {
  const remaining = (measure.remainingMonths ?? TEMPORAL_MEASURE_DEFAULT_MONTHS) - 1;
  if (remaining <= 0) return expireTemporalMeasure(measure);
  return { next: { ...measure, remainingMonths: remaining }, reboundInflationPp: 0, reboundApprovalPp: 0, expiredTitle: null };
}

function tickInactiveCooldown(measure: SectorMeasureCard): SingleMeasureTick {
  const cd = measure.cooldownRemainingMonths ?? 0;
  const next = cd > 0 ? { ...measure, cooldownRemainingMonths: cd - 1 } : measure;
  return { next, reboundInflationPp: 0, reboundApprovalPp: 0, expiredTitle: null };
}

function tickSingleMeasure(measure: SectorMeasureCard): SingleMeasureTick {
  if (measure.active && measure.durationType === 'TEMPORAL') return tickActiveTemporalMeasure(measure);
  if (!measure.active) return tickInactiveCooldown(measure);
  return { next: measure, reboundInflationPp: 0, reboundApprovalPp: 0, expiredTitle: null };
}

export function stepTemporalMeasuresLifecycle(measures?: SectorMeasureCard[]): TemporalLifecycleResult {
  const list = measures ?? [];
  let reboundInflationPp = 0;
  let reboundApprovalPp = 0;
  const expiredTitles: string[] = [];
  const nextMeasures = list.map((m) => {
    const res = tickSingleMeasure(m);
    reboundInflationPp += res.reboundInflationPp;
    reboundApprovalPp += res.reboundApprovalPp;
    if (res.expiredTitle) expiredTitles.push(res.expiredTitle);
    return res.next;
  });
  return {
    nextMeasures,
    reboundInflationPp: round2(reboundInflationPp),
    reboundApprovalPp: round2(reboundApprovalPp),
    expiredTitles
  };
}

function fmtEs(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace('.', ',');
}

function resolveMacroFire(state: SimulationState): string | null {
  if (state.centralBank.netLiquidReservesBillionUsd <= 14) {
    return `Reservas netas en US$ ${fmtEs(state.centralBank.netLiquidReservesBillionUsd)} MM · frenar drenaje`;
  }
  if (state.centralBank.exchangeBrechaPct >= 22) {
    return `Brecha cambiaria en ${fmtEs(state.centralBank.exchangeBrechaPct)} % · riesgo de corrida`;
  }
  if (state.inflation.realMonthlyIpcPct >= 4.0) {
    return `IPC mensual recalentado (${fmtEs(state.inflation.realMonthlyIpcPct)} %) · anclar precios`;
  }
  if (state.countryRiskEmbiPb >= 1300) {
    return `Riesgo país en ${Math.round(state.countryRiskEmbiPb)} pb · asegurar rollover`;
  }
  return null;
}

function resolveDebtFire(state: SimulationState): string | null {
  if (state.pendingDebtMilestone) {
    return `Vencimiento ${state.pendingDebtMilestone.title} · definir pago`;
  }
  if (state.pendingOppositionBill) {
    return `Ofensiva opositora: ${state.pendingOppositionBill.title} · definir veto`;
  }
  const upcomingDebt = getUpcomingDebtMilestone(state);
  if (upcomingDebt) {
    return `Vencimiento deuda US$ ${fmtEs(upcomingDebt.milestone.amountBillionUsd)} MM en ${upcomingDebt.monthsLeft} m.`;
  }
  return null;
}

function resolveMidtermCountdownFire(state: SimulationState): string | null {
  if (state.turnMonth < 18 || state.midterm2029Done) return null;
  const left = Math.max(1, 23 - state.turnMonth);
  const unit = left === 1 ? 'mes' : 'meses';
  return `Legislativas 2029 en ${left} ${unit} · cuidar imagen y gestión`;
}

function resolvePoliticalFire(state: SimulationState): string | null {
  const debtFire = resolveDebtFire(state);
  if (debtFire) return debtFire;
  if (state.labor.activeNationalStrike) {
    return 'Paro nacional activo · destrabar conflicto sindical';
  }
  return resolveMidtermCountdownFire(state);
}

export function resolveFireOfTheMonth(state: SimulationState): string {
  if (state.activeCrisisArc) {
    return `${state.activeCrisisArc.headline} · definí salida en Despacho`;
  }
  const macroFire = resolveMacroFire(state);
  if (macroFire) return macroFire;
  const polFire = resolvePoliticalFire(state);
  if (polFire) return polFire;
  return 'Frente estable · consolidar reservas y reformas en Congreso';
}

function pickIpcDriverLabel(next: SimulationState, expiredCount: number): string {
  if (expiredCount > 0) return 'rebote por vencimiento de medidas temporales';
  if (next.inflation.tarifazoComponentPp >= 0.45) return 'ajuste de tarifas energéticas';
  if (next.inflation.passThroughComponentPp >= 0.8) return 'traslado cambiario a precios';
  return 'inercia salarial y expectativas';
}

function signedDelta(delta: number, suffix: string): string {
  const prefix = delta >= 0 ? '+' : '';
  return `${prefix}${fmtEs(delta)}${suffix}`;
}

export function buildMonthlyBalanceBullets(
  prev: SimulationState,
  next: SimulationState,
  expiredTitles: string[]
): string[] {
  const ipcDelta = round2(next.inflation.realMonthlyIpcPct - prev.inflation.realMonthlyIpcPct);
  const resDelta = round2(
    next.centralBank.netLiquidReservesBillionUsd - prev.centralBank.netLiquidReservesBillionUsd
  );
  const appDelta = round2(
    next.publicOpinion.managementApprovalPct - prev.publicOpinion.managementApprovalPct
  );
  const ipcDriver = pickIpcDriverLabel(next, expiredTitles.length);
  const fiscalTag =
    next.treasury.primaryResultPctGdp >= 0 ? 'superávit primario' : 'déficit primario';

  return [
    `Precios: IPC ${fmtEs(next.inflation.realMonthlyIpcPct)} % (${signedDelta(ipcDelta, ' pp')}) impulsado por ${ipcDriver}.`,
    `Reservas: US$ ${fmtEs(next.centralBank.netLiquidReservesBillionUsd)} MM netas (${signedDelta(resDelta, ' MM')}) con brecha en ${fmtEs(next.centralBank.exchangeBrechaPct)} %.`,
    `Clima político: aprobación ${fmtEs(next.publicOpinion.managementApprovalPct)} % (${signedDelta(appDelta, ' pp')}) con ${fiscalTag} de ${signedDelta(next.treasury.primaryResultPctGdp, ' % PBI')}.`
  ];
}

function buildExpiredMeasuresLogs(expiredTitles: string[]): string[] {
  return expiredTitles.map(
    (title) => `Venció la medida temporal "${title}" (rebote inflacionario/social y período de enfriamiento).`
  );
}

export function applyPoliticalCyclePostStep(
  prevState: SimulationState,
  rawNextState: SimulationState,
  temporal: TemporalLifecycleResult
): SimulationState {
  const promiseStep = stepCampaignPromises(rawNextState);
  const crisisStep = stepCrisisArcs(rawNextState);
  const cabinetStep = stepCabinetDynamics(rawNextState);
  const approvalAfter = round2(
    clamp(
      rawNextState.publicOpinion.managementApprovalPct +
        promiseStep.approvalDelta +
        crisisStep.approvalDelta +
        cabinetStep.approvalDelta,
      5,
      95
    )
  );
  const credAfter = round2(
    clamp(rawNextState.structural.anchorCredibilityIndex + promiseStep.credibilityDelta, 8, 98)
  );
  const riskAfter = Math.max(
    150,
    Math.round(rawNextState.countryRiskEmbiPb + crisisStep.riskDeltaPb + cabinetStep.riskDeltaPb)
  );

  const newLogs = [
    ...buildExpiredMeasuresLogs(temporal.expiredTitles),
    ...promiseStep.logs,
    ...cabinetStep.logs,
    ...(crisisStep.log ? [crisisStep.log] : [])
  ];

  const withPolitics: SimulationState = {
    ...rawNextState,
    measures: temporal.nextMeasures,
    ministers: cabinetStep.nextMinisters.length > 0 ? cabinetStep.nextMinisters : rawNextState.ministers,
    countryRiskEmbiPb: riskAfter,
    publicOpinion: { ...rawNextState.publicOpinion, managementApprovalPct: approvalAfter },
    structural: { ...rawNextState.structural, anchorCredibilityIndex: credAfter },
    campaignPromises: promiseStep.nextPromises,
    activeCrisisArc: crisisStep.nextArc,
    eventLog: [...newLogs, ...rawNextState.eventLog].slice(0, 15)
  };

  const midtermPatch = stepMidterm2029IfDue(withPolitics);
  const merged = { ...withPolitics, ...midtermPatch };
  const pendingDebtMilestone = detectDueDebtMilestone(merged);
  const withDebt = { ...merged, pendingDebtMilestone };
  return {
    ...withDebt,
    pendingOppositionBill: detectDueOppositionBill(withDebt),
    historySnapshots: appendMonthlyHistorySnapshot(prevState, merged),
    politicalCapital: replenishPoliticalCapital(merged),
    monthlyBalanceSummary: buildMonthlyBalanceBullets(prevState, merged, temporal.expiredTitles)
  };
}
