import type {
  ComodoroPyCase,
  InflationBreakdown,
  JudicialStage,
  JudicialState,
  LaborMarketState,
  ProvinceSummary,
  PublicOpinionSegment,
  PublicOpinionState,
  SectorParitaria,
  SupremeCourtJustice
} from '../models/SimulationTypes.js';
import { clamp, round2 } from './../economy/mathUtils.js';

// Comodoro Py no funciona con plazos del Codigo Procesal Penal: funciona con olfato politico.
// Mientras el Presidente mida arriba del 48% las causas contra el oficialismo quedan en
// "Falta de Merito". Cuando bajas del 36%, se reactivan todos los expedientes juntos.

const STAGE_ORDER: JudicialStage[] = [
  'BOLILLERO',
  'INSTRUCCION',
  'INDAGATORIA',
  'FALTA_DE_MERITO',
  'PROCESAMIENTO',
  'CAMARA',
  'JUICIO_ORAL_TOF',
  'CASACION',
  'CORTE_SUPREMA'
];

function advanceStageByOne(currentStage: JudicialStage): JudicialStage {
  const idx = STAGE_ORDER.indexOf(currentStage);
  const nextIdx = Math.min(STAGE_ORDER.length - 1, idx + 1);
  return STAGE_ORDER[nextIdx] ?? currentStage;
}

export interface JudicialStepContext {
  activeNationalStrike?: boolean;
  trustCongress?: number;
  trustMarkets?: number;
}

function stepOfficialistCase(stage: JudicialStage, executiveStrengthPct: number): JudicialStage {
  if (executiveStrengthPct > 45 && stage === 'INDAGATORIA') {
    return 'FALTA_DE_MERITO';
  }
  if (executiveStrengthPct < 36) {
    return advanceStageByOne(stage);
  }
  return stage;
}

function stepUnionCase(stage: JudicialStage, executiveStrengthPct: number, activeStrike: boolean): JudicialStage {
  if (activeStrike && executiveStrengthPct > 42) {
    return advanceStageByOne(stage);
  }
  return stage;
}

function stepOppositionCase(stage: JudicialStage, executiveStrengthPct: number, interferenceTrace: number): JudicialStage {
  if (executiveStrengthPct > 54 && interferenceTrace < 50) {
    return advanceStageByOne(stage);
  }
  if (executiveStrengthPct < 40 && stage === 'INDAGATORIA') {
    return 'FALTA_DE_MERITO';
  }
  return stage;
}

export function computeNextJudicialStage(
  docket: ComodoroPyCase,
  executiveStrengthPct: number,
  activeNationalStrike: boolean = false,
  judicialInterferenceTraceIndex: number = 0
): JudicialStage {
  if (docket.accusedFaction === 'OFICIALISMO') {
    return stepOfficialistCase(docket.stage, executiveStrengthPct);
  }
  if (docket.accusedFaction === 'SINDICATOS') {
    return stepUnionCase(docket.stage, executiveStrengthPct, activeNationalStrike);
  }
  return stepOppositionCase(docket.stage, executiveStrengthPct, judicialInterferenceTraceIndex);
}

interface DoctrineSignalInput {
  institutionalCorrelation: number;
  governorsSupport: number;
  trustCongress: number;
  trustMarkets: number;
  interferenceTrace: number;
}

const DOCTRINE_SIGNAL_CALC: Record<SupremeCourtJustice['doctrine'], (s: DoctrineSignalInput) => number> = {
  INSTITUCIONALISTA: (s) => s.institutionalCorrelation * 0.5 + s.trustCongress * 0.5 - s.interferenceTrace * 0.25,
  GARANTISTA: (s) => s.institutionalCorrelation * 0.4 + s.trustCongress * 0.35 + 10 - s.interferenceTrace * 0.35,
  PRO_MERCADO: (s) => s.institutionalCorrelation * 0.45 + s.trustMarkets * 0.55,
  FEDERALISTA: (s) => s.governorsSupport * 0.65 + s.trustCongress * 0.25 + s.institutionalCorrelation * 0.1
};

function stepSupremeCourtMembers(
  supremeCourt: SupremeCourtJustice[],
  signalInput: DoctrineSignalInput
): SupremeCourtJustice[] {
  return supremeCourt.map((justice) => {
    // A los 74-75 anos por el fallo Schiffrin el juez necesita acuerdo del Senado para seguir 5 anos mas
    const ageNegotiationBonus = justice.age >= 74 ? 8 : 0;
    const doctrineTarget = DOCTRINE_SIGNAL_CALC[justice.doctrine](signalInput);
    const alignmentWithExecutive = round2(
      clamp(justice.alignmentWithExecutive * 0.7 + doctrineTarget * 0.3 + ageNegotiationBonus, 10, 92)
    );
    return {
      ...justice,
      requiresSenateReconfirmationSoon: justice.age >= 74,
      alignmentWithExecutive
    };
  });
}

function resolveCautelaresBlockingCount(supremeCourt: SupremeCourtJustice[]): number {
  const avgCourtAlignment =
    supremeCourt.reduce((acc, j) => acc + j.alignmentWithExecutive, 0) / Math.max(1, supremeCourt.length);
  if (avgCourtAlignment < 45) return 3;
  return avgCourtAlignment < 60 ? 1 : 0;
}

export function stepJudicialAndLawfare(
  judicial: JudicialState,
  presidentialImagePct: number,
  coparticipableRevenuePctGdp: number,
  context: JudicialStepContext = {}
): JudicialState {
  const governorsSupport = clamp(coparticipableRevenuePctGdp * 6.2, 20, 85);
  const institutionalCorrelation = round2(presidentialImagePct * 0.6 + governorsSupport * 0.4);
  const signalInput: DoctrineSignalInput = {
    institutionalCorrelation,
    governorsSupport,
    trustCongress: context.trustCongress ?? 52,
    trustMarkets: context.trustMarkets ?? 55,
    interferenceTrace: judicial.judicialInterferenceTraceIndex
  };

  const supremeCourt = stepSupremeCourtMembers(judicial.supremeCourt, signalInput);
  const activeStrike = context.activeNationalStrike ?? false;
  const activeCases = judicial.activeCases.map((docket) => ({
    ...docket,
    stage: computeNextJudicialStage(
      docket,
      institutionalCorrelation,
      activeStrike,
      judicial.judicialInterferenceTraceIndex
    ),
    monthsStalled: docket.stage === 'FALTA_DE_MERITO' ? docket.monthsStalled + 1 : 0
  }));

  return {
    ...judicial,
    supremeCourt,
    cautelaresBlockingDnuCount: resolveCautelaresBlockingCount(supremeCourt),
    activeCases
  };
}

export function stepSingleParitaria(
  paritaria: SectorParitaria,
  realMonthlyIpcPct: number,
  crawlingPegMonthlyPct: number
): SectorParitaria {
  // Si la Secretaria de Trabajo pisa la homologacion, el aumento efectivo queda topado a la pauta oficial
  // pero el conflicto sindical en la rama se dispara.
  const effectiveWageIncreasePct = paritaria.homologatedByState
    ? round2(realMonthlyIpcPct * 0.96)
    : round2(Math.min(paritaria.agreedMonthlyIncreasePct, crawlingPegMonthlyPct + 0.5));

  const wageLag = Math.max(0, realMonthlyIpcPct - effectiveWageIncreasePct);
  const nonHomologatedAnger = paritaria.homologatedByState ? -4 : 14;
  const strikeConflictIndex = round2(clamp(paritaria.strikeConflictIndex + wageLag * 4.5 + nonHomologatedAnger, 5, 98));

  // Costo Laboral Unitario en USD: si los salarios en pesos suben mas rapido que el dolar oficial,
  // las fabricas se encarecen en dolares frente a Brasil y China.
  const dollarCostDrift = effectiveWageIncreasePct - crawlingPegMonthlyPct;
  const unitLaborCostUsdIndex = round2(clamp(paritaria.unitLaborCostUsdIndex + dollarCostDrift * 0.85, 65, 165));

  return {
    ...paritaria,
    agreedMonthlyIncreasePct: effectiveWageIncreasePct,
    strikeConflictIndex,
    unitLaborCostUsdIndex
  };
}

export function stepLaborMarket(
  labor: LaborMarketState,
  realMonthlyIpcPct: number,
  crawlingPegMonthlyPct: number,
  gdpGrowthAnnualPct: number
): LaborMarketState {
  const paritarias = labor.paritarias.map((p) => stepSingleParitaria(p, realMonthlyIpcPct, crawlingPegMonthlyPct));
  const avgConflict = paritarias.reduce((acc, p) => acc + p.strikeConflictIndex, 0) / Math.max(1, paritarias.length);
  const avgIncrease = paritarias.reduce((acc, p) => acc + p.agreedMonthlyIncreasePct, 0) / Math.max(1, paritarias.length);

  // Con alta "Industria del Juicio" (multas Ley 24.013), aunque crezca el PBI las PyMEs contratan en negro
  const formalHiringFriction = (labor.laborLitigationMultiplier - 1.0) * 0.45;
  const informalityPct = round2(clamp(labor.informalityPct + formalHiringFriction - gdpGrowthAnnualPct * 0.08, 26, 54));
  const unemploymentPct = round2(clamp(labor.unemploymentPct - gdpGrowthAnnualPct * 0.12 + formalHiringFriction * 0.2, 4.5, 18.5));
  const realWageIndex = round2(clamp(labor.realWageIndex + (avgIncrease - realMonthlyIpcPct) * 0.9, 62, 135));

  return {
    ...labor,
    unemploymentPct,
    informalityPct,
    realWageIndex,
    activeNationalStrike: avgConflict > 72,
    paritarias
  };
}

function computeProblematicaMonths(prov: ProvinceSummary): number {
  const problems = prov.problematicas || [];
  if (problems.length < 5) return 0;
  const current = prov.mesesCon5OMasProblematicas || 0;
  return current + 1;
}

function computeInterventionStatus(prov: ProvinceSummary) {
  const electionIn = prov.eleccionEnMeses !== undefined ? prov.eleccionEnMeses : 6;
  const remaining = electionIn - 1;
  const stillIntervened = remaining > 0;
  return {
    mesesCon5OMasProblematicas: 0,
    intervenida: stillIntervened,
    eleccionEnMeses: Math.max(0, remaining),
    interventorNombre: stillIntervened ? prov.interventorNombre : undefined
  };
}

function updateProvinceCrisisAndIntervention(prov: ProvinceSummary) {
  if (!prov.intervenida) {
    return {
      mesesCon5OMasProblematicas: computeProblematicaMonths(prov),
      intervenida: false
    };
  }
  return computeInterventionStatus(prov);
}

export function stepProvincesState(
  provinces: ProvinceSummary[],
  coparticipableRevenuePctGdp: number,
  discretionaryAtnPctGdp: number
): ProvinceSummary[] {
  return provinces.map((prov) => {
    const coparticipationFlow = (coparticipableRevenuePctGdp - 9.5) * (prov.coparticipationDependencyPct / 100) * 1.4;
    const fiscalBalancePct = round2(clamp(prov.fiscalBalancePct + coparticipationFlow + discretionaryAtnPctGdp * 2.2, -6.5, 4.5));
    // Si una provincia muy dependiente entra en deficit agudo sin ATN, emite cuasimoneda (Chachos / Patacones)
    const quasiCurrencyIssued = prov.quasiCurrencyIssued || (fiscalBalancePct < -3.8 && prov.coparticipationDependencyPct > 75);
    const governorLoyaltyToPresident = round2(
      clamp(prov.governorLoyaltyToPresident + fiscalBalancePct * 1.8 + discretionaryAtnPctGdp * 12, 8, 96)
    );
    const crisisInfo = updateProvinceCrisisAndIntervention(prov);

    return {
      ...prov,
      fiscalBalancePct,
      quasiCurrencyIssued,
      governorLoyaltyToPresident,
      ...crisisInfo
    };
  });
}

export interface PublicOpinionStepOptions {
  gdpGrowthAnnualPct?: number;
  approvalPainMult?: number;
  measuresApprovalDeltaPp?: number;
}

function computeInflationApprovalDelta(realMonthlyIpcPct: number, painMult: number): number {
  if (realMonthlyIpcPct > 1.8) {
    return -(realMonthlyIpcPct - 1.8) * 1.15 * painMult;
  }
  return (1.8 - realMonthlyIpcPct) * 0.45;
}

function computeActivityDelta(gdpGrowth: number, painMult: number): number {
  return gdpGrowth < 0 ? gdpGrowth * 0.35 * painMult : Math.min(0.35, gdpGrowth * 0.1);
}

function computeExpectationDelta(
  realMonthlyIpcPct: number,
  exchangeBrechaPct: number,
  activityDelta: number,
  painMult: number
): number {
  const inflMult = realMonthlyIpcPct > 2.0 ? painMult : 0.7;
  return (2.0 - realMonthlyIpcPct) * 1.35 * inflMult - Math.max(0, exchangeBrechaPct - 35) * 0.12 + activityDelta * 0.5;
}

function computeOpinionNetDelta(
  inflation: InflationBreakdown,
  labor: LaborMarketState,
  gdpGrowth: number,
  painMult: number,
  measuresDelta: number
): number {
  const inflationDelta = computeInflationApprovalDelta(inflation.realMonthlyIpcPct, painMult);
  const povertyPain = Math.max(0, inflation.povertyCbtPct - 33) * 0.1 * painMult;
  const activityDelta = computeActivityDelta(gdpGrowth, painMult);
  const wageRelief = (labor.realWageIndex - 100) * 0.16;
  return inflationDelta + wageRelief + activityDelta - povertyPain + measuresDelta;
}

function resolveOpinionOptions(options: PublicOpinionStepOptions) {
  return {
    painMult: options.approvalPainMult ?? 1.0,
    gdpGrowth: options.gdpGrowthAnnualPct ?? 0,
    measuresDelta: options.measuresApprovalDeltaPp ?? 0
  };
}

export function stepPublicOpinion(
  opinion: PublicOpinionState,
  inflation: InflationBreakdown,
  labor: LaborMarketState,
  exchangeBrechaPct: number,
  options: PublicOpinionStepOptions = {}
): PublicOpinionState {
  const { painMult, gdpGrowth, measuresDelta } = resolveOpinionOptions(options);
  const activityDelta = computeActivityDelta(gdpGrowth, painMult);
  const netDelta = computeOpinionNetDelta(inflation, labor, gdpGrowth, painMult, measuresDelta);

  const segments: PublicOpinionSegment[] = opinion.segments.map((seg) => ({
    ...seg,
    approvalPct: round2(clamp(seg.approvalPct + netDelta, 8, 88))
  }));

  const weightedApproval = segments.reduce((acc, s) => acc + s.approvalPct * (s.populationSharePct / 100), 0);
  const managementApprovalPct = round2(clamp(weightedApproval, 10, 85));

  // La expectativa mejora solo con inflacion claramente domada (< 2%) y sin brecha descontrolada
  const expectationDelta = computeExpectationDelta(
    inflation.realMonthlyIpcPct,
    exchangeBrechaPct,
    activityDelta,
    painMult
  );
  const expectation12MonthsPct = round2(clamp(opinion.expectation12MonthsPct + expectationDelta, 12, 86));
  const presidentialPersonalImagePct = round2(
    clamp(managementApprovalPct * 0.55 + expectation12MonthsPct * 0.3 + opinion.oppositionRejectionPct * 0.15, 12, 88)
  );

  const agendaSlot1 = inflation.realMonthlyIpcPct > 5.0 ? 'Inflacion de Alimentos y Tarifas' : 'Estabilidad Macro y Credito';
  const agendaSlot2 = exchangeBrechaPct > 45 ? 'Tensión en el Dólar CCL/Blue y Silobolsas' : 'Negociación de Leyes en el Congreso';

  return {
    ...opinion,
    presidentialPersonalImagePct,
    managementApprovalPct,
    expectation12MonthsPct,
    agendaSlots: [agendaSlot1, agendaSlot2, opinion.agendaSlots[2]],
    segments
  };
}
