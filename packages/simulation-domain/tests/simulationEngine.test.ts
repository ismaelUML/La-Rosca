import { describe, expect, it } from 'vitest';
import {
  advanceSimulationMonth,
  applyPolicyAction,
  clamp,
  logisticCurve,
  round2,
  advanceRigiMonthlyQueue,
  approveRigiProject,
  type RigisectorItem,
  INITIAL_PARLIAMENTARY_BLOCS,
  INITIAL_CONGRESS_BILLS,
  computeBlocProbability,
  applyConcessionToBloc,
  simulateChamberVote,
  executeFullCongressVote,
  buildDynamicParliamentaryBlocs,
  applySetupConfigurationToState,
  buildCongressBlocsForScenario,
  deriveIdeologicalAllies,
  type CongressNegotiationBloc,
  type GameSetupConfiguration
} from '@argentina-sim/domain';
import {
  INITIAL_SECTOR_MEASURES,
  POLITICAL_PARTIES_2027,
  createInitialSimulationState2027,
  PROVINCES_2027_DATASET
} from '@argentina-sim/infrastructure';

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

  it('avanza la cola del RIGI, genera proyectos pendientes y permite aprobarlos acumulando inversion', () => {
    const dummySectors: RigisectorItem[] = [
      {
        id: 'MIN_LITIO',
        name: 'Minería: Litio',
        branch: 'MINERIA',
        minInvestmentMillionUsd: 200,
        regimeInvestmentPpGdp: 0.4,
        exportsBillionUsd: 2.5,
        fiscalExemptionCostArgentums: 25,
        maturityMonths: 36,
        enabledByDecree: true,
        activeProjectsCount: 0,
        accumulatedInvestmentMillionUsd: 0
      }
    ];

    const q1 = advanceRigiMonthlyQueue([], dummySectors);
    expect(q1.nextPending.length).toBe(1);
    expect(q1.nextPending[0]?.sectorId).toBe('MIN_LITIO');

    const approved = approveRigiProject(q1.nextPending[0]!.id, q1.nextPending, dummySectors);
    expect(approved.nextPending.length).toBe(0);
    expect(approved.nextSectors[0]?.activeProjectsCount).toBe(1);
    expect(approved.nextSectors[0]?.accumulatedInvestmentMillionUsd).toBeGreaterThan(0);
  });

  it('cuenta meses de problematicas institucionales y ejecuta intervencion federal con destitucion y elecciones en 6 meses', () => {
    let state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const formosa = state.provinces.find((p) => p.id === 'FORMOSA');
    expect(formosa?.problematicas?.length).toBe(6);

    state = applyPolicyAction(state, {
      type: 'INTERVENE_PROVINCE',
      provinceId: 'FORMOSA',
      interventorName: 'Dr. Interventor Federal'
    });

    const intervened = state.provinces.find((p) => p.id === 'FORMOSA');
    expect(intervened?.intervenida).toBe(true);
    expect(intervened?.eleccionEnMeses).toBe(6);
    expect(intervened?.interventorNombre).toBe('Dr. Interventor Federal');

    const nextMonth = advanceSimulationMonth(state);
    const formosaNext = nextMonth.provinces.find((p) => p.id === 'FORMOSA');
    expect(formosaNext?.eleccionEnMeses).toBe(5);
    expect(formosaNext?.intervenida).toBe(true);
  });

  it('negocia proyectos de ley bloque por bloque en el Congreso y promulga leyes con quórum estricto', () => {
    const pfBloc = INITIAL_PARLIAMENTARY_BLOCS.find((b) => b.id === 'PF')!;
    expect(pfBloc.currentStance).toBe('EN_DUDA');
    expect(pfBloc.probabilityYes).toBeLessThan(60);

    // Otorgar concesión de gobernadores y partidas
    const boosted = applyConcessionToBloc(pfBloc, 'GOBERNADORES', 55, false);
    expect(boosted.concessionsReceived).toContain('GOBERNADORES');
    expect(boosted.probabilityYes).toBeGreaterThanOrEqual(80);
    expect(boosted.currentStance).toBe('A_FAVOR');

    // Simulación de votación en Diputados
    const depVote = simulateChamberVote('DIPUTADOS', INITIAL_PARLIAMENTARY_BLOCS);
    expect(depVote.totalSeats).toBe(257);
    expect(depVote.quorumNeeded).toBe(129);

    // Votación completa con la Ley Bases 2.0
    const bill = INITIAL_CONGRESS_BILLS[0]!;
    const outcome = executeFullCongressVote(bill, INITIAL_PARLIAMENTARY_BLOCS);
    expect(outcome.billId).toBe('LEY_BASES_2');
    expect(typeof outcome.passed).toBe('boolean');

    // Promulgación en SimulationState (idempotente y con impacto fiscal/IPC completo)
    let state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const prevGdp = state.gdpGrowthAnnualPct;
    state = applyPolicyAction(state, { type: 'ENACT_CONGRESS_BILL', billId: 'LEY_BASES_2' });
    expect(state.gdpGrowthAnnualPct).toBeGreaterThan(prevGdp);
    expect(state.enactedBillIds).toContain('LEY_BASES_2');
    expect(state.eventLog[0]).toContain('Ley Bases 2.0');

    const gdpAfterOnce = state.gdpGrowthAnnualPct;
    state = applyPolicyAction(state, { type: 'ENACT_CONGRESS_BILL', billId: 'LEY_BASES_2' });
    expect(state.gdpGrowthAnnualPct).toBe(gdpAfterOnce);

    // Reformas institucionales persistidas con exclusión mutua
    state = applyPolicyAction(state, { type: 'TOGGLE_INSTITUTIONAL_REFORM', reformId: 'con_paso' });
    expect(state.activeReformIds).toContain('con_paso');
    state = applyPolicyAction(state, { type: 'TOGGLE_INSTITUTIONAL_REFORM', reformId: 'sin_paso' });
    expect(state.activeReformIds).toContain('sin_paso');
    expect(state.activeReformIds).not.toContain('con_paso');

    // Girar ATN mejora afinidad parlamentaria de bloques provinciales
    const beforeBlocs = buildDynamicParliamentaryBlocs(state);
    const provBefore = beforeBlocs.find((b) => b.id === 'PROVINCIALES')!.probabilityYes;
    for (const p of state.provinces.slice(0, 6)) {
      state = applyPolicyAction(state, { type: 'SEND_ATN_TO_PROVINCE', provinceId: p.id, amountPctGdp: 0.08 });
    }
    const afterBlocs = buildDynamicParliamentaryBlocs(state);
    const provAfter = afterBlocs.find((b) => b.id === 'PROVINCIALES')!.probabilityYes;
    expect(provAfter).toBeGreaterThanOrEqual(provBefore);

    // Medidas mutuamente excluyentes se desactivan entre sí
    state = { ...state, measures: INITIAL_SECTOR_MEASURES.map((m) => ({ ...m })) };
    state = applyPolicyAction(state, { type: 'TOGGLE_MEASURE', measureId: 'CONGELAMIENTO_TARIFAS_TRANSPORTE_AMBA' });
    expect(state.measures?.find((m) => m.id === 'CONGELAMIENTO_TARIFAS_TRANSPORTE_AMBA')?.active).toBe(true);
    state = applyPolicyAction(state, { type: 'TOGGLE_MEASURE', measureId: 'QUITA_SUBSIDIO_AMBA_AUMENTO_BOLETO' });
    expect(state.measures?.find((m) => m.id === 'QUITA_SUBSIDIO_AMBA_AUMENTO_BOLETO')?.active).toBe(true);
    expect(state.measures?.find((m) => m.id === 'CONGELAMIENTO_TARIFAS_TRANSPORTE_AMBA')?.active).toBe(false);
  });

  it('aplica configuracion de nueva partida: arquetipos, aliados ideologicos y escenarios de Camaras 257/72', () => {
    const party = POLITICAL_PARTIES_2027[0]!;
    const allies = deriveIdeologicalAllies(party);
    expect(allies.length).toBeGreaterThan(0);

    for (const scenario of ['ESTANDAR_2027', 'MINORIA_EXTREMA', 'COALICION_DIALOGUISTA', 'MAYORIA_PROPIA'] as const) {
      const blocs = buildCongressBlocsForScenario(scenario, party.sigla, allies);
      const totalDep = blocs.reduce((acc, b) => acc + b.deputiesSeats, 0);
      const totalSen = blocs.reduce((acc, b) => acc + b.senateSeats, 0);
      expect(totalDep).toBe(257);
      expect(totalSen).toBe(72);
    }

    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CORDOBA');
    const setupConfig: GameSetupConfiguration = {
      sessionId: 'test-session',
      characterMode: 'MI_PERSONAJE',
      characterName: 'Gobernador Cordobes',
      selectedPoliticianId: 'JAVIER_MILEI',
      role: 'PRESIDENTE',
      provinceId: 'CORDOBA',
      partyMode: 'PARTIDO_EXISTENTE',
      party,
      difficulty: 'ESTANDAR_2027',
      startMode: 'DIRECT_GOVERNMENT',
      characterArchetype: 'ECONOMISTA_ORTODOXO',
      congressScenario: 'MAYORIA_PROPIA'
    };

    const configured = applySetupConfigurationToState(base, setupConfig);
    expect(configured.countryRiskEmbiPb).toBe(base.countryRiskEmbiPb - 110);
    expect(configured.structural.anchorCredibilityIndex).toBe(base.structural.anchorCredibilityIndex + 10);
    const cordobaAfter = configured.provinces.find((p) => p.id === 'CORDOBA')!;
    const cordobaBefore = base.provinces.find((p) => p.id === 'CORDOBA')!;
    expect(cordobaAfter.governorLoyaltyToPresident).toBeCloseTo(cordobaBefore.governorLoyaltyToPresident + 4, 1);
    expect(configured.congressBlocs?.find((b) => b.id === 'LLA')?.deputiesSeats).toBe(132);

    // Compatibilidad retroactiva sin campos opcionales
    const legacySetup: GameSetupConfiguration = {
      sessionId: 'legacy',
      characterMode: 'UN_POLITICO_REAL',
      characterName: 'Javier Milei',
      selectedPoliticianId: 'JAVIER_MILEI',
      role: 'PRESIDENTE',
      provinceId: 'CABA',
      partyMode: 'PARTIDO_EXISTENTE',
      party,
      difficulty: 'ESTANDAR_2027'
    };
    const legacyConfigured = applySetupConfigurationToState(base, legacySetup);
    expect(legacyConfigured.congressBlocs?.reduce((acc, b) => acc + b.deputiesSeats, 0)).toBe(257);
  });
});

