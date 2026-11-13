import { describe, expect, it } from 'vitest';
import {
  advanceSimulationMonth,
  applyPolicyAction,
  type DifficultyLevel,
  type PolicyAction,
  type SimulationState
} from '@argentina-sim/domain';
import { createInitialSimulationState2027 } from '@argentina-sim/infrastructure';

function runMonths(
  initial: SimulationState,
  months: number,
  policyPerMonth?: (state: SimulationState, monthIdx: number) => PolicyAction[]
): SimulationState {
  let current = initial;
  for (let i = 0; i < months; i++) {
    const actions = policyPerMonth ? policyPerMonth(current, i) : [];
    for (const action of actions) {
      current = applyPolicyAction(current, action);
    }
    current = advanceSimulationMonth(current);
  }
  return current;
}

function getStabilizationActions(state: SimulationState, monthIdx: number): PolicyAction[] {
  if (monthIdx === 0) {
    return [
      { type: 'SET_TARIFF_COVERAGE', coveragePct: 92 },
      { type: 'SET_POLICY_RATE', annualRatePct: 48 },
      { type: 'SET_CRAWLING_PEG', monthlyPct: 1.0 },
      { type: 'SET_CEPO_STRICTNESS', strictnessIndex: 25 }
    ];
  }
  if (monthIdx === 12 && state.centralBank.netLiquidReservesBillionUsd > 0) {
    return [{ type: 'SET_CEPO_STRICTNESS', strictnessIndex: 10 }];
  }
  return [];
}

function getRecklessActions(_state: SimulationState, monthIdx: number): PolicyAction[] {
  if (monthIdx === 0) {
    return [
      { type: 'SET_TARIFF_COVERAGE', coveragePct: 25 },
      { type: 'SET_POLICY_RATE', annualRatePct: 15 },
      { type: 'SET_CRAWLING_PEG', monthlyPct: 6.5 },
      { type: 'SET_CEPO_STRICTNESS', strictnessIndex: 90 },
      { type: 'TOGGLE_INDEC_INTERVENTION', intervene: true }
    ];
  }
  return [];
}

describe('Balance macroeconomico a 48 meses (sin atractores gratis)', () => {
  it('el jugador pasivo en HERENCIA_MALDITA drena reservas y termina en crisis cambiaria/inflacionaria', () => {
    const start = createInitialSimulationState2027('PRESIDENTE', 'HERENCIA_MALDITA', 'PBA');
    const end = runMonths(start, 48);

    expect(end.centralBank.grossReservesBillionUsd).toBeLessThan(start.centralBank.grossReservesBillionUsd);
    expect(end.centralBank.netLiquidReservesBillionUsd).toBeLessThan(0);
    expect(end.inflation.realMonthlyIpcPct).toBeGreaterThan(4.5);
    expect(end.publicOpinion.managementApprovalPct).toBeLessThan(start.publicOpinion.managementApprovalPct);
  });

  it('el perfil irresponsable (atraso tarifario, tasa negativa, cepo duro e INDEC intervenido) colapsa mucho peor que el pasivo', () => {
    const startPassive = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const startReckless = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');

    const passiveEnd = runMonths(startPassive, 48);
    const recklessEnd = runMonths(startReckless, 48, getRecklessActions);

    expect(recklessEnd.inflation.realMonthlyIpcPct).toBeGreaterThan(passiveEnd.inflation.realMonthlyIpcPct);
    expect(recklessEnd.centralBank.exchangeBrechaPct).toBeGreaterThan(passiveEnd.centralBank.exchangeBrechaPct);
    expect(recklessEnd.countryRiskEmbiPb).toBeGreaterThan(passiveEnd.countryRiskEmbiPb);
  });

  it('el perfil racional estabilizador logra bajar inflacion y sostener reservas y aprobacion respecto al pasivo', () => {
    const startPassive = createInitialSimulationState2027('PRESIDENTE', 'HERENCIA_MALDITA', 'CABA');
    const startRational = createInitialSimulationState2027('PRESIDENTE', 'HERENCIA_MALDITA', 'CABA');

    const passiveEnd = runMonths(startPassive, 48);
    const rationalEnd = runMonths(startRational, 48, getStabilizationActions);

    expect(rationalEnd.inflation.realMonthlyIpcPct).toBeLessThan(passiveEnd.inflation.realMonthlyIpcPct);
    expect(rationalEnd.centralBank.grossReservesBillionUsd).toBeGreaterThan(passiveEnd.centralBank.grossReservesBillionUsd);
    expect(rationalEnd.countryRiskEmbiPb).toBeLessThan(passiveEnd.countryRiskEmbiPb);
  });

  it('la dificultad cambia la dinamica de reservas e inflacion aunque el jugador no haga nada', () => {
    const levels: DifficultyLevel[] = ['VIENTO_DE_COLA', 'ESTANDAR_2027', 'TORMENTA_PERFECTA'];
    const results = levels.map((diff) => runMonths(createInitialSimulationState2027('PRESIDENTE', diff, 'PBA'), 24));

    expect(results[0]!.centralBank.grossReservesBillionUsd).toBeGreaterThan(results[2]!.centralBank.grossReservesBillionUsd);
    expect(results[2]!.inflation.realMonthlyIpcPct).toBeGreaterThan(results[0]!.inflation.realMonthlyIpcPct);
  });
});

