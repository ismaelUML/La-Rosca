import type {
  GovernmentRuntimeState,
  MandateStatus,
  SimulationState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { seededUnit } from '../campaign/countryMoodEngine.js';
import { advanceSimulationMonth } from '../engine/SimulationEngine.js';
import {
  GOVERNMENT_EVENTS,
  ZERO_EFFECTS,
  findGovernmentEvent,
  govAvgGovernorLoyalty,
  type GovernmentEventEffects
} from './governmentEventsCatalog.js';

// Capa de gobierno por encima del motor macro: cada mes avanza la economía, mide qué tan
// gobernable está el país, puede disparar una "Situación de Gobierno" que el jugador debe
// resolver, y decide si el mandato termina (renuncia, juicio político, default, hiperinflación)
// o llega a los 48 meses. Las tiradas usan semilla por mes: recargar la página no re-rolea nada.

export const MANDATE_MONTHS = 48;
export const GRACE_MONTHS = 3;
const EVENT_COOLDOWN_MONTHS = 18;
const BASE_EVENT_PROBABILITY = 0.35;
const CRISIS_EVENT_BONUS = 0.15;
const LOW_GOVERNABILITY = 25;
const LOW_APPROVAL = 22;
const DEFAULT_RISK_PB = 2400;
const HYPERINFLATION_MONTHLY_PCT = 30;

export function createInitialGovernmentRuntime(): GovernmentRuntimeState {
  return {
    pendingEventId: null,
    eventHistory: [],
    lowGovernabilityMonths: 0,
    lowApprovalMonths: 0,
    defaultRiskMonths: 0,
    hyperinflationMonths: 0,
    mandateStatus: 'EN_CURSO'
  };
}

export function getGovernmentRuntime(state: SimulationState): GovernmentRuntimeState {
  return state.government ?? createInitialGovernmentRuntime();
}

function riskScore(riskPb: number): number {
  return clamp(100 - (riskPb - 300) / 30, 0, 100);
}

function inflationScore(monthlyIpcPct: number): number {
  return clamp(100 - monthlyIpcPct * 6, 0, 100);
}

function unemploymentScore(unemploymentPct: number): number {
  return clamp(100 - (unemploymentPct - 5) * 6, 0, 100);
}

function reservesScore(grossReservesBillionUsd: number): number {
  return clamp((grossReservesBillionUsd - 10) * 2.5, 0, 100);
}

// Índice 0-100 de "qué tan gobernable está el país": mezcla de aprobación, riesgo país,
// inflación, desempleo y reservas. Por debajo de 25 sostenido, el poder se evapora.
export function computeGovernabilityIndex(state: SimulationState): number {
  const raw =
    state.publicOpinion.managementApprovalPct * 0.35 +
    riskScore(state.countryRiskEmbiPb) * 0.2 +
    inflationScore(state.inflation.realMonthlyIpcPct) * 0.2 +
    unemploymentScore(state.labor.unemploymentPct) * 0.1 +
    reservesScore(state.centralBank.grossReservesBillionUsd) * 0.15;
  return round2(clamp(raw, 0, 100));
}

function povertyScore(povertyCbtPct: number): number {
  return clamp(100 - povertyCbtPct * 1.6, 0, 100);
}

function interannualInflationScore(interannualIpcPct: number): number {
  return clamp(100 - interannualIpcPct * 1.1, 0, 100);
}

// Puntaje final del mandato: cómo dejás el país, no cómo lo recibiste.
export function computeMandateScore(state: SimulationState): number {
  const raw =
    state.publicOpinion.managementApprovalPct * 0.25 +
    interannualInflationScore(state.inflation.interannualIpcPct) * 0.2 +
    povertyScore(state.inflation.povertyCbtPct) * 0.2 +
    riskScore(state.countryRiskEmbiPb) * 0.2 +
    reservesScore(state.centralBank.grossReservesBillionUsd) * 0.15;
  return round2(clamp(raw, 0, 100));
}

const GRADE_THRESHOLDS: Array<{ min: number; label: string }> = [
  { min: 75, label: 'Historia grande: te van a poner una estatua' },
  { min: 55, label: 'Mandato decoroso: entregás el poder con la frente alta' },
  { min: 35, label: 'Sobreviviste: el país sigue en pie y vos también' }
];

export function describeMandateGrade(score: number): string {
  const hit = GRADE_THRESHOLDS.find((g) => score >= g.min);
  return hit ? hit.label : 'Pesadilla: el próximo gobierno va a heredar un campo minado';
}

function streak(previous: number, active: boolean): number {
  return active ? previous + 1 : 0;
}

function updateCounters(state: SimulationState, gov: GovernmentRuntimeState): GovernmentRuntimeState {
  return {
    ...gov,
    lowGovernabilityMonths: streak(gov.lowGovernabilityMonths, computeGovernabilityIndex(state) < LOW_GOVERNABILITY),
    lowApprovalMonths: streak(gov.lowApprovalMonths, state.publicOpinion.managementApprovalPct < LOW_APPROVAL),
    defaultRiskMonths: streak(gov.defaultRiskMonths, state.countryRiskEmbiPb > DEFAULT_RISK_PB),
    hyperinflationMonths: streak(gov.hyperinflationMonths, state.inflation.realMonthlyIpcPct > HYPERINFLATION_MONTHLY_PCT)
  };
}

type FailureStatus = Exclude<MandateStatus, 'EN_CURSO' | 'MANDATO_COMPLETADO'>;

interface EndRule {
  status: FailureStatus;
  reason: string;
  test: (state: SimulationState, gov: GovernmentRuntimeState) => boolean;
}

// El orden importa: gana la primera regla que se cumple.
const END_RULES: EndRule[] = [
  {
    status: 'HIPERINFLACION',
    reason: 'La inflación mensual superó el 30% durante dos meses seguidos: la moneda dejó de funcionar como moneda y el gobierno perdió el control de la economía.',
    test: (_s, g) => g.hyperinflationMonths >= 2
  },
  {
    status: 'DEFAULT_SOBERANO',
    reason: 'Con el riesgo país por encima de los 2.400 puntos durante tres meses seguidos, el país quedó sin acceso al crédito y se declaró el default.',
    test: (_s, g) => g.defaultRiskMonths >= 3
  },
  {
    status: 'JUICIO_POLITICO',
    reason: 'Sin imagen y sin gobernadores que te respalden, el Congreso reunió los dos tercios y te destituyó por mal desempeño.',
    test: (s, g) => g.lowApprovalMonths >= 4 && govAvgGovernorLoyalty(s) < 45
  },
  {
    status: 'RENUNCIA',
    reason: 'Cuatro meses de ingobernabilidad sostenida: sin respaldo social, económico ni político, presentaste la renuncia ante la Asamblea Legislativa.',
    test: (_s, g) => g.lowGovernabilityMonths >= 4
  }
];

export interface MandateVerdict {
  status: MandateStatus;
  reason?: string;
}

export function evaluateMandateStatus(state: SimulationState, gov: GovernmentRuntimeState): MandateVerdict {
  const monthsInOffice = state.turnMonth - 1;
  if (monthsInOffice >= MANDATE_MONTHS) {
    return { status: 'MANDATO_COMPLETADO', reason: describeMandateGrade(computeMandateScore(state)) };
  }
  if (monthsInOffice < GRACE_MONTHS) {
    return { status: 'EN_CURSO' };
  }
  const hit = END_RULES.find((rule) => rule.test(state, gov));
  return hit ? { status: hit.status, reason: hit.reason } : { status: 'EN_CURSO' };
}

function eventProbability(state: SimulationState): number {
  const crisis = computeGovernabilityIndex(state) < 40 ? CRISIS_EVENT_BONUS : 0;
  return BASE_EVENT_PROBABILITY + crisis;
}

function isOnCooldown(eventId: string, repeatable: boolean, state: SimulationState, gov: GovernmentRuntimeState): boolean {
  const last = gov.eventHistory.filter((h) => h.eventId === eventId).pop();
  if (!last) {
    return false;
  }
  return !repeatable || state.turnMonth - last.turnMonth < EVENT_COOLDOWN_MONTHS;
}

function buildEventPool(state: SimulationState, gov: GovernmentRuntimeState): Array<{ id: string; weight: number }> {
  return GOVERNMENT_EVENTS.map((e) => ({
    id: e.id,
    weight: isOnCooldown(e.id, e.repeatable, state, gov) ? 0 : e.weight(state)
  })).filter((entry) => entry.weight > 0);
}

function pickWeighted(pool: Array<{ id: string; weight: number }>, unit: number): string | null {
  const total = pool.reduce((acc, e) => acc + e.weight, 0);
  let cursor = unit * total;
  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor < 0) {
      return entry.id;
    }
  }
  return pool.length > 0 ? pool[pool.length - 1]!.id : null;
}

export function rollGovernmentEvent(state: SimulationState, gov: GovernmentRuntimeState): string | null {
  const seed = `gov-evt-${state.difficulty}-${state.selectedProvinceId}-${state.turnMonth}`;
  if (seededUnit(`${seed}-roll`) >= eventProbability(state)) {
    return null;
  }
  return pickWeighted(buildEventPool(state, gov), seededUnit(`${seed}-pick`));
}

function finishMandate(state: SimulationState, gov: GovernmentRuntimeState, verdict: MandateVerdict): SimulationState {
  const score = computeMandateScore(state);
  return {
    ...state,
    government: { ...gov, pendingEventId: null, mandateStatus: verdict.status, endReason: verdict.reason, finalScore: score },
    eventLog: [`Fin del mandato (${verdict.status}): ${verdict.reason}`, ...state.eventLog.slice(0, 14)]
  };
}

function settleGovernmentMonth(advanced: SimulationState, previous: GovernmentRuntimeState): SimulationState {
  const counters = updateCounters(advanced, previous);
  const verdict = evaluateMandateStatus(advanced, counters);
  if (verdict.status !== 'EN_CURSO') {
    return finishMandate(advanced, counters, verdict);
  }
  const inGrace = advanced.turnMonth - 1 < GRACE_MONTHS;
  const pendingEventId = inGrace ? null : rollGovernmentEvent(advanced, counters);
  return { ...advanced, government: { ...counters, pendingEventId } };
}

// Reemplaza a advanceSimulationMonth en el flujo de gobierno. No avanza si hay una situación
// sin resolver o si el mandato ya terminó.
export function advanceGovernmentMonth(state: SimulationState): SimulationState {
  const gov = getGovernmentRuntime(state);
  if (gov.pendingEventId !== null || gov.mandateStatus !== 'EN_CURSO') {
    return state;
  }
  return settleGovernmentMonth(advanceSimulationMonth(state), gov);
}

function shift(value: number, delta: number, min: number, max: number): number {
  return round2(clamp(value + delta, min, max));
}

function applyOpinionEffects(state: SimulationState, e: GovernmentEventEffects): SimulationState {
  const segments = state.publicOpinion.segments.map((seg) => ({
    ...seg,
    approvalPct: shift(seg.approvalPct, e.approvalPts, 12, 88)
  }));
  const weighted = segments.reduce((acc, s) => acc + s.approvalPct * (s.populationSharePct / 100), 0);
  const managementApprovalPct = round2(clamp(weighted, 14, 85));
  return {
    ...state,
    publicOpinion: {
      ...state.publicOpinion,
      segments,
      managementApprovalPct,
      expectation12MonthsPct: shift(state.publicOpinion.expectation12MonthsPct, e.expectationPts, 15, 86),
      presidentialPersonalImagePct: shift(state.publicOpinion.presidentialPersonalImagePct, e.approvalPts * 0.55, 16, 88)
    }
  };
}

function applyMacroEffects(state: SimulationState, e: GovernmentEventEffects): SimulationState {
  const reserves = shift(state.centralBank.grossReservesBillionUsd, e.grossReservesBillionUsd, 3, 300);
  return {
    ...state,
    countryRiskEmbiPb: Math.round(clamp(state.countryRiskEmbiPb + e.countryRiskPb, 110, 3400)),
    centralBank: {
      ...state.centralBank,
      grossReservesBillionUsd: reserves,
      netLiquidReservesBillionUsd: round2(state.centralBank.netLiquidReservesBillionUsd + (reserves - state.centralBank.grossReservesBillionUsd)),
      exchangeBrechaPct: shift(state.centralBank.exchangeBrechaPct, e.brechaPct, 2, 120)
    },
    structural: {
      ...state.structural,
      anchorCredibilityIndex: shift(state.structural.anchorCredibilityIndex, e.anchorCredibility, 8, 98)
    }
  };
}

function applyLaborAndEnergyEffects(state: SimulationState, e: GovernmentEventEffects): SimulationState {
  return {
    ...state,
    labor: {
      ...state.labor,
      unemploymentPct: shift(state.labor.unemploymentPct, e.unemploymentPct, 4.5, 18.5),
      paritarias: state.labor.paritarias.map((p) => ({
        ...p,
        strikeConflictIndex: shift(p.strikeConflictIndex, e.strikeConflictPts, 5, 98)
      }))
    },
    energy: { ...state.energy, blackoutRiskPct: shift(state.energy.blackoutRiskPct, e.blackoutRiskPct, 2, 88) }
  };
}

function applyInstitutionalEffects(state: SimulationState, e: GovernmentEventEffects): SimulationState {
  return {
    ...state,
    provinces: state.provinces.map((p) => ({
      ...p,
      governorLoyaltyToPresident: shift(p.governorLoyaltyToPresident, e.governorLoyaltyPts, 8, 96)
    })),
    judicial: {
      ...state.judicial,
      judicialInterferenceTraceIndex: shift(state.judicial.judicialInterferenceTraceIndex, e.judicialInterference, 0, 100)
    }
  };
}

const EFFECT_APPLIERS = [applyOpinionEffects, applyMacroEffects, applyLaborAndEnergyEffects, applyInstitutionalEffects];

export function applyEventEffects(state: SimulationState, effects: Partial<GovernmentEventEffects>): SimulationState {
  const full: GovernmentEventEffects = { ...ZERO_EFFECTS, ...effects };
  return EFFECT_APPLIERS.reduce((acc, apply) => apply(acc, full), state);
}

// Resuelve la situación pendiente con la opción elegida. Si el id no existe, no hace nada.
export function applyGovernmentEventChoice(state: SimulationState, optionId: string): SimulationState {
  const gov = getGovernmentRuntime(state);
  const event = findGovernmentEvent(gov.pendingEventId);
  const option = event?.options.find((o) => o.id === optionId);
  if (!event || !option) {
    return state;
  }
  const applied = applyEventEffects(state, option.effects);
  return {
    ...applied,
    government: {
      ...gov,
      pendingEventId: null,
      eventHistory: [...gov.eventHistory, { eventId: event.id, optionId: option.id, turnMonth: state.turnMonth }]
    },
    eventLog: [`${event.title}: ${option.title}.`, ...applied.eventLog.slice(0, 14)]
  };
}
