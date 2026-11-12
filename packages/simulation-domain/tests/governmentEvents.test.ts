import { describe, expect, it } from 'vitest';
import {
  GOVERNMENT_EVENTS,
  advanceGovernmentMonth,
  applyGovernmentEventChoice,
  applyPolicyAction,
  createInitialGovernmentRuntime,
  describeEventEffects,
  evaluateMandateStatus,
  findGovernmentEvent,
  getGovernmentRuntime,
  type GovernmentRuntimeState,
  type PolicyAction,
  type SimulationState
} from '@argentina-sim/domain';
import { createInitialSimulationState2027 } from '@argentina-sim/infrastructure';

function baseState(): SimulationState {
  return createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'PBA');
}

function withRuntime(state: SimulationState, patch: Partial<GovernmentRuntimeState>): SimulationState {
  return { ...state, government: { ...createInitialGovernmentRuntime(), ...patch } };
}

// Resuelve cualquier situación pendiente con la primera opción y avanza hasta terminar el mandato.
function playUntilEnd(initial: SimulationState, maxMonths: number, monthlyPolicy?: (s: SimulationState, m: number) => SimulationState) {
  let state = initial;
  for (let m = 0; m < maxMonths; m++) {
    const gov = getGovernmentRuntime(state);
    if (gov.mandateStatus !== 'EN_CURSO') {
      break;
    }
    if (gov.pendingEventId) {
      state = applyGovernmentEventChoice(state, findGovernmentEvent(gov.pendingEventId)!.options[0]!.id);
    }
    state = monthlyPolicy ? monthlyPolicy(state, m) : state;
    state = advanceGovernmentMonth(state);
  }
  return state;
}

describe('Catálogo de situaciones de gobierno', () => {
  it('tiene ids únicos y todas las opciones cambian algo del estado', () => {
    const ids = GOVERNMENT_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const event of GOVERNMENT_EVENTS) {
      expect(event.options.length).toBeGreaterThanOrEqual(2);
      for (const option of event.options) {
        expect(describeEventEffects(option.effects).length).toBeGreaterThan(0);
      }
    }
  });

  it('marca como negativo lo que sube el riesgo país y como positivo lo que baja el desempleo', () => {
    const badges = describeEventEffects({ countryRiskPb: 120, unemploymentPct: -0.4, approvalPts: -3 });
    expect(badges.find((b) => b.label.startsWith('RIESGO PAÍS'))?.isPositive).toBe(false);
    expect(badges.find((b) => b.label.startsWith('DESEMPLEO'))?.isPositive).toBe(true);
    expect(badges.find((b) => b.label.startsWith('APROBACIÓN'))?.isPositive).toBe(false);
  });
});

describe('Avance mensual con situaciones de gobierno', () => {
  it('es determinista: la misma partida produce el mismo historial de situaciones', () => {
    const run = () => playUntilEnd(baseState(), 18).government!.eventHistory;
    expect(run()).toEqual(run());
    expect(run().length).toBeGreaterThan(0);
  });

  it('no avanza el mes mientras haya una situación sin resolver', () => {
    const pending = withRuntime(baseState(), { pendingEventId: 'CORRIDA_CAMBIARIA' });
    expect(advanceGovernmentMonth(pending)).toBe(pending);
  });

  it('aplica los efectos de la opción elegida y libera el avance', () => {
    const pending = withRuntime(baseState(), { pendingEventId: 'CORRIDA_CAMBIARIA' });
    const resolved = applyGovernmentEventChoice(pending, 'VENDER_RESERVAS');
    expect(resolved.centralBank.grossReservesBillionUsd).toBeCloseTo(pending.centralBank.grossReservesBillionUsd - 2.5, 1);
    expect(resolved.centralBank.exchangeBrechaPct).toBeLessThan(pending.centralBank.exchangeBrechaPct);
    expect(resolved.government?.pendingEventId).toBeNull();
    expect(resolved.government?.eventHistory).toHaveLength(1);
    expect(advanceGovernmentMonth(resolved).turnMonth).toBe(resolved.turnMonth + 1);
  });

  it('ignora opciones inexistentes sin tocar el estado', () => {
    const pending = withRuntime(baseState(), { pendingEventId: 'CORRIDA_CAMBIARIA' });
    expect(applyGovernmentEventChoice(pending, 'NO_EXISTE')).toBe(pending);
  });

  it('una partida guardada sin el campo government sigue funcionando', () => {
    const legacy = baseState();
    expect(legacy.government).toBeUndefined();
    const next = advanceGovernmentMonth(legacy);
    expect(next.turnMonth).toBe(2);
    expect(next.government?.mandateStatus).toBe('EN_CURSO');
  });
});

describe('Fin del mandato', () => {
  const lateState = (turnMonth: number) => ({ ...baseState(), turnMonth });

  it('no corta el mandato durante los meses de gracia', () => {
    const gov = { ...createInitialGovernmentRuntime(), hyperinflationMonths: 5 };
    expect(evaluateMandateStatus(lateState(3), gov).status).toBe('EN_CURSO');
  });

  it('dispara cada causal de fin cuando se sostiene el tiempo requerido', () => {
    const base = createInitialGovernmentRuntime();
    expect(evaluateMandateStatus(lateState(10), { ...base, hyperinflationMonths: 2 }).status).toBe('HIPERINFLACION');
    expect(evaluateMandateStatus(lateState(10), { ...base, defaultRiskMonths: 3 }).status).toBe('DEFAULT_SOBERANO');
    expect(evaluateMandateStatus(lateState(10), { ...base, lowGovernabilityMonths: 4 }).status).toBe('RENUNCIA');
    expect(evaluateMandateStatus(lateState(10), { ...base, hyperinflationMonths: 1 }).status).toBe('EN_CURSO');
  });

  it('el juicio político necesita imagen hundida Y gobernadores que no te respaldan', () => {
    const gov = { ...createInitialGovernmentRuntime(), lowApprovalMonths: 4 };
    const loyal = lateState(10);
    expect(evaluateMandateStatus(loyal, gov).status).toBe('EN_CURSO');
    const abandoned = { ...loyal, provinces: loyal.provinces.map((p) => ({ ...p, governorLoyaltyToPresident: 20 })) };
    expect(evaluateMandateStatus(abandoned, gov).status).toBe('JUICIO_POLITICO');
  });

  it('completa el mandato a los 48 meses con un puntaje entre 0 y 100 y congela la partida', () => {
    const finished = playUntilEnd(baseState(), 60);
    const gov = finished.government!;
    expect(gov.mandateStatus).toBe('MANDATO_COMPLETADO');
    expect(gov.finalScore).toBeGreaterThanOrEqual(0);
    expect(gov.finalScore).toBeLessThanOrEqual(100);
    expect(advanceGovernmentMonth(finished)).toBe(finished);
  });

  it('gobernar a propósito mal termina en hiperinflación en pocos meses', () => {
    const reckless = (s: SimulationState, m: number) => {
      const actions: PolicyAction[] = [
        { type: 'SET_CRAWLING_PEG', monthlyPct: 25 },
        { type: 'SET_POLICY_RATE', annualRatePct: 8 },
        { type: 'SET_CEPO_STRICTNESS', strictnessIndex: 0 },
        { type: 'SET_TARIFF_COVERAGE', coveragePct: 15 },
        ...(m % 3 === 0 ? [{ type: 'DISCRETE_DEVALUATION', devaluationPct: 60 } as PolicyAction] : [])
      ];
      return actions.reduce((acc, a) => applyPolicyAction(acc, a), s);
    };
    const ended = playUntilEnd(baseState(), 24, reckless);
    expect(ended.government?.mandateStatus).toBe('HIPERINFLACION');
    expect(ended.turnMonth - 1).toBeLessThan(12);
  });
});

describe('Recaudación (regresión)', () => {
  it('no se acumula mes a mes: tras 36 meses sin intervenir el superávit primario sigue en rango plausible', () => {
    let state = baseState();
    for (let m = 0; m < 36; m++) {
      state = advanceGovernmentMonth(getGovernmentRuntime(state).pendingEventId ? applyGovernmentEventChoice(state, findGovernmentEvent(state.government!.pendingEventId)!.options[0]!.id) : state);
    }
    expect(state.treasury.primaryResultPctGdp).toBeLessThan(8);
  });
});
