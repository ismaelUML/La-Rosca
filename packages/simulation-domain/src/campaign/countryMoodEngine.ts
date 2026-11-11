import type { CountryMoodSnapshot } from '../models/CampaignTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// El clima del país durante la campaña 2027. Mientras el motor macro completo no corra en
// la etapa de campaña (eso es la fase 2), usamos un paseo aleatorio con reversión a la media
// y semilla por mes: así dos jugadores en el mismo mes ven el mismo país y nadie
// puede "rerolear" la inflación recargando la página.

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededUnit(text: string): number {
  return (hashSeed(text) % 100000) / 100000;
}

export function seededJitter(text: string, amplitude: number): number {
  return (seededUnit(text) * 2 - 1) * amplitude;
}

interface PhaseRule {
  test: (m: CountryMoodSnapshot) => boolean;
  label: string;
}

// Orden importa: la primera que matchea gana. Las crisis van arriba porque tapan todo lo demás.
const PHASE_RULES: PhaseRule[] = [
  { test: (m) => m.inflationMonthlyPct > 6, label: 'Espiral inflacionaria: todos huyen del oficialismo' },
  { test: (m) => m.riskPremiumBps > 1500, label: 'Crisis de deuda: el mercado huele default' },
  { test: (m) => m.governmentApprovalPct < 35, label: 'Gobierno en caída libre: la oposición se envalentona' },
  { test: (m) => m.governmentApprovalPct > 52, label: 'Luna de miel oficialista: nadie quiere pelearse con la Rosada' },
  { test: (m) => m.inflationMonthlyPct < 2.5, label: 'Desinflación con el bolsillo flaco' }
];

export function describeCountryPhase(mood: CountryMoodSnapshot): string {
  const hit = PHASE_RULES.find((rule) => rule.test(mood));
  return hit ? hit.label : 'Estancamiento tenso: nadie arriesga nada';
}

export function createInitialCountryMood(): CountryMoodSnapshot {
  const base: CountryMoodSnapshot = {
    inflationMonthlyPct: 2.1,
    povertyPct: 34.5,
    unemploymentPct: 7.4,
    governmentApprovalPct: 46,
    riskPremiumBps: 640,
    polarizationIndex: 66,
    incumbentPartySigla: 'LLA',
    partyPolling: { LLA: 37.5, UxP: 31.0, PF: 8.0, PRO: 7.2, UCR: 6.0, FIT: 4.5 },
    phaseLabel: ''
  };
  return { ...base, phaseLabel: describeCountryPhase(base) };
}

function nextInflation(mood: CountryMoodSnapshot, month: number): number {
  const meanReversion = (2.0 - mood.inflationMonthlyPct) * 0.25;
  return round2(clamp(mood.inflationMonthlyPct + meanReversion + seededJitter(`inf-${month}`, 0.45), 0.2, 25));
}

function nextApproval(mood: CountryMoodSnapshot, inflation: number, month: number): number {
  // La inflación es el impuesto más odiado: cada punto arriba del 2 % le come aprobación al gobierno.
  const inflationPain = (inflation - 2.0) * 0.9;
  const drift = seededJitter(`apr-${month}`, 2.4);
  return round2(clamp(mood.governmentApprovalPct + drift - inflationPain, 15, 75));
}

function nextRisk(mood: CountryMoodSnapshot, approval: number, month: number): number {
  const politicalPremium = (45 - approval) * 6;
  const target = 600 + politicalPremium;
  return Math.round(clamp(mood.riskPremiumBps + (target - mood.riskPremiumBps) * 0.3 + seededJitter(`rsk-${month}`, 40), 250, 4000));
}

function nextPolarization(mood: CountryMoodSnapshot, month: number): number {
  // Cerca de octubre todo se polariza: la grieta es el negocio electoral de los dos polos.
  const electoralHeat = month >= 6 ? 1.6 : 0.2;
  return round2(clamp(mood.polarizationIndex + electoralHeat + seededJitter(`pol-${month}`, 1.2), 30, 95));
}

function shiftIncumbentPolling(
  polling: Record<string, number>,
  incumbent: string,
  approvalDelta: number
): Record<string, number> {
  const transfer = approvalDelta * 0.35;
  const next: Record<string, number> = {};
  for (const [sigla, value] of Object.entries(polling)) {
    const delta = sigla === incumbent ? transfer : -transfer / 5;
    next[sigla] = round2(clamp(value + delta, 0.5, 60));
  }
  return next;
}

export function evolveCountryMood(mood: CountryMoodSnapshot, monthIndex: number): CountryMoodSnapshot {
  const inflation = nextInflation(mood, monthIndex);
  const approval = nextApproval(mood, inflation, monthIndex);
  const evolved: CountryMoodSnapshot = {
    ...mood,
    inflationMonthlyPct: inflation,
    governmentApprovalPct: approval,
    riskPremiumBps: nextRisk(mood, approval, monthIndex),
    polarizationIndex: nextPolarization(mood, monthIndex),
    povertyPct: round2(clamp(mood.povertyPct + (inflation - 2.2) * 0.6, 15, 65)),
    unemploymentPct: round2(clamp(mood.unemploymentPct + seededJitter(`une-${monthIndex}`, 0.15), 4, 20)),
    partyPolling: shiftIncumbentPolling(mood.partyPolling, mood.incumbentPartySigla, approval - mood.governmentApprovalPct)
  };
  return { ...evolved, phaseLabel: describeCountryPhase(evolved) };
}

