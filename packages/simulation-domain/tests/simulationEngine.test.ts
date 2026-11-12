import { describe, expect, it } from 'vitest';
import {
  advanceSimulationMonth,
  applyPolicyAction,
  clamp,
  logisticCurve,
  round2
} from '@argentina-sim/domain';
import { createInitialSimulationState2027, PROVINCES_2027_DATASET } from '@argentina-sim/infrastructure';

describe('Motor Macroeconomico, Judicial y Laboral Argentino 2027', () => {
  it('verifica que las 24 jurisdicciones sumen exactamente las 257 bancas de la Camara de Diputados', () => {
    const totalBancas = PROVINCES_2027_DATASET.reduce((acc, p) => acc + p.nationalDeputiesCount, 0);
    expect(PROVINCES_2027_DATASET.length).toBe(24);
    expect(totalBancas).toBe(257);
  });

  it('calcula los 4 motores de inflacion y separa IPC Oficial de IPC Congreso cuando se interviene el INDEC', () => {
    const initial = createInitialSimulationState2027('PRESIDENTE', 'HERENCIA_MALDITA', 'PBA');
    const intervened = applyPolicyAction(initial, { type: 'TOGGLE_INDEC_INTERVENTION', intervene: true });
    const nextMonth = advanceSimulationMonth(intervened);

    expect(nextMonth.structural.indecCredibilityIndex).toBeLessThan(60);
    expect(nextMonth.inflation.officialIndecIpcPct).toBeLessThan(nextMonth.inflation.privateCongressIpcPct);
    expect(nextMonth.inflation.realMonthlyIpcPct).toBe(nextMonth.inflation.privateCongressIpcPct);
  });

  it('destruye credibilidad del ancla (-28 pts) y dispara el costo de CAMMESA ante una devaluacion discreta de shock', () => {
    const initial = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const devalued = applyPolicyAction(initial, { type: 'DISCRETE_DEVALUATION', devaluationPct: 50 });
    const stepped = advanceSimulationMonth(devalued);

    expect(devalued.centralBank.officialDollarArs).toBeGreaterThan(initial.centralBank.officialDollarArs);
    expect(devalued.structural.anchorCredibilityIndex).toBe(initial.structural.anchorCredibilityIndex - 28);
    expect(stepped.energy.cammesaMonthlyDeficitMillionUsd).toBeGreaterThan(initial.energy.cammesaMonthlyDeficitMillionUsd);
  });

  it('ejecuta PUTs bancarios y drena depositos en dolares (Argendolares) en escenario Diciembre 2001', () => {
    const crisisState = createInitialSimulationState2027('PRESIDENTE', 'DICIEMBRE_2001', 'PBA');
    const next = advanceSimulationMonth(crisisState);

    expect(next.centralBank.netLiquidReservesBillionUsd).toBeLessThan(0);
    expect(next.bankingSystem.putsExecutedThisMonthBillionArs).toBeGreaterThan(0);
    expect(next.bankingSystem.argendolarDrainDailyMillionUsd).toBeGreaterThan(0);
  });

  it('aplica la amplia gama de PolicyActions sobre paritarias, impuestos, ATN, Comodoro Py y Reforma Laboral', () => {
    let state = createInitialSimulationState2027('GOBERNADOR', 'ESTANDAR_2027', 'MENDOZA');
    state = applyPolicyAction(state, { type: 'SET_CRAWLING_PEG', monthlyPct: 2.0 });
    state = applyPolicyAction(state, { type: 'SET_POLICY_RATE', annualRatePct: 45 });
    state = applyPolicyAction(state, { type: 'SET_CEPO_STRICTNESS', strictnessIndex: 25 });
    state = applyPolicyAction(state, { type: 'SET_TARIFF_COVERAGE', coveragePct: 85 });
    state = applyPolicyAction(state, { type: 'SET_YPF_POLICY', policy: 'EXPORT_PARITY' });
    state = applyPolicyAction(state, { type: 'TOGGLE_INDUSTRIAL_GAS_CUT', cutActive: true });
    state = applyPolicyAction(state, { type: 'TOGGLE_PARITARIA_HOMOLOGATION', paritariaId: 'CAMIONEROS' });
    state = applyPolicyAction(state, { type: 'EXECUTE_LABOR_REFORM' });
    state = applyPolicyAction(state, { type: 'EXECUTE_ANSES_INTRA_STATE_SWAP' });
    state = applyPolicyAction(state, { type: 'SEND_ATN_TO_PROVINCE', provinceId: 'LA_RIOJA', amountPctGdp: 0.25 });
    state = applyPolicyAction(state, { type: 'OPERATE_COMODORO_PY_CASE', caseId: 'CAUSA_01', operation: 'FREEZE' });
    state = applyPolicyAction(state, { type: 'UPDATE_TAX_RATE', taxId: 'IVA_GRAL', newRatePct: 23 });

    const stepped = advanceSimulationMonth(state);
    expect(stepped.turnMonth).toBe(2);
    expect(stepped.currentYear).toBe(2028);
    expect(stepped.currentMonthOfYear).toBe(1);
    expect(clamp(150, 0, 100)).toBe(100);
    expect(round2(1.239)).toBe(1.24);
    expect(logisticCurve(0, 0, 1)).toBeCloseTo(0.5, 2);
  });

  it('calcula la productoria geometrica interanual de 12 meses, inercia con smoothing y ajuste de tcReal/priceLevel', () => {
    const state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    expect(state.inflation.interannualIpcPct).toBe(33.0);
    expect(state.inflation.inflHist?.length).toBe(12);

    const nextState = advanceSimulationMonth(state);
    expect(nextState.inflation.inflHist?.length).toBe(12);
    expect(nextState.inflation.interannualIpcPct).toBeGreaterThan(0);
    expect(nextState.inflation.tcReal).toBeDefined();
    expect(nextState.inflation.priceLevel).toBeGreaterThan(100);
  });
});

