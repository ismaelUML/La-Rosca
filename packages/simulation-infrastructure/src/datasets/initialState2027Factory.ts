import type {
  DebtInstrumentSlice,
  DifficultyLevel,
  PlayableRole,
  PublicOpinionSegment,
  SectorParitaria,
  SimulationState,
  SupremeCourtJustice,
  TaxItem
} from '@argentina-sim/domain';
import { PROVINCES_2027_DATASET } from './provinces2027Dataset.js';

// Separamos los bloques de datos base 2027 para no inflar la complejidad ciclomática
// de la funcion que ensambla el estado inicial segun dificultad.

export const INITIAL_TAXES_2027: TaxItem[] = [
  { id: 'IVA_GRAL', name: 'IVA General', legalMechanism: 'LEY_CONGRESO', isCoparticipable: true, currentRatePct: 21.0, initialRatePct: 21.0, revenuePctGdp: 6.4, evasionPct: 26 },
  { id: 'IVA_RED', name: 'IVA Reducido (Alimentos/Obra)', legalMechanism: 'LEY_CONGRESO', isCoparticipable: true, currentRatePct: 10.5, initialRatePct: 10.5, revenuePctGdp: 0.7, evasionPct: 22 },
  { id: 'GAN_SOC', name: 'Ganancias Sociedades', legalMechanism: 'LEY_CONGRESO', isCoparticipable: true, currentRatePct: 35.0, initialRatePct: 35.0, revenuePctGdp: 1.9, evasionPct: 24 },
  { id: 'GAN_PERS', name: 'Ganancias 4ta Categoría Personas', legalMechanism: 'LEY_CONGRESO', isCoparticipable: true, currentRatePct: 35.0, initialRatePct: 35.0, revenuePctGdp: 1.5, evasionPct: 12 },
  { id: 'CONTRIB_PAT', name: 'Contribuciones Patronales ANSES', legalMechanism: 'LEY_CONGRESO', isCoparticipable: false, currentRatePct: 20.4, initialRatePct: 20.4, revenuePctGdp: 3.0, evasionPct: 38 },
  { id: 'APORTES_PERS', name: 'Aportes Personales Jubilación/Obra Social', legalMechanism: 'LEY_CONGRESO', isCoparticipable: false, currentRatePct: 17.0, initialRatePct: 17.0, revenuePctGdp: 2.1, evasionPct: 38 },
  { id: 'CHEQUE', name: 'Impuesto al Cheque (Créditos y Débitos)', legalMechanism: 'LEY_CONGRESO', isCoparticipable: false, currentRatePct: 1.2, initialRatePct: 1.2, revenuePctGdp: 1.5, evasionPct: 8 },
  { id: 'RET_SOJA', name: 'Derechos de Exportación: Soja y Derivados', legalMechanism: 'DECRETO_EJECUTIVO', isCoparticipable: false, currentRatePct: 26.0, initialRatePct: 26.0, revenuePctGdp: 0.65, evasionPct: 14 },
  { id: 'RET_MAIZ_TRIGO', name: 'Derechos de Exportación: Maíz y Trigo', legalMechanism: 'DECRETO_EJECUTIVO', isCoparticipable: false, currentRatePct: 9.5, initialRatePct: 9.5, revenuePctGdp: 0.22, evasionPct: 12 },
  { id: 'RET_IND_ENERGIA', name: 'Derechos de Exportación: Petróleo y Minería', legalMechanism: 'DECRETO_EJECUTIVO', isCoparticipable: false, currentRatePct: 4.5, initialRatePct: 4.5, revenuePctGdp: 0.18, evasionPct: 6 },
  { id: 'ARANCEL_IMPO', name: 'Aranceles de Importación (AEC Mercosur)', legalMechanism: 'DECRETO_EJECUTIVO', isCoparticipable: false, currentRatePct: 11.5, initialRatePct: 11.5, revenuePctGdp: 0.72, evasionPct: 15 },
  { id: 'COMBUSTIBLES', name: 'Impuesto a los Combustibles Líquidos', legalMechanism: 'DECRETO_EJECUTIVO', isCoparticipable: false, currentRatePct: 100.0, initialRatePct: 100.0, revenuePctGdp: 0.42, evasionPct: 5 },
  { id: 'BIENES_PERS', name: 'Bienes Personales (Patrimonio)', legalMechanism: 'LEY_CONGRESO', isCoparticipable: true, currentRatePct: 0.5, initialRatePct: 0.5, revenuePctGdp: 0.25, evasionPct: 34 }
];

export const INITIAL_PARITARIAS_2027: SectorParitaria[] = [
  { id: 'COMERCIO', sectorName: 'Comercio y Servicios', unionName: 'FAECYS (Cavalieri)', workersCountThousands: 1250, agreedMonthlyIncreasePct: 2.1, homologatedByState: true, strikeConflictIndex: 22, unitLaborCostUsdIndex: 102 },
  { id: 'CAMIONEROS', sectorName: 'Transporte y Logística', unionName: 'Camioneros (Moyano) + UTA', workersCountThousands: 380, agreedMonthlyIncreasePct: 3.4, homologatedByState: true, strikeConflictIndex: 48, unitLaborCostUsdIndex: 114 },
  { id: 'INDUSTRIA', sectorName: 'Metalmecánica y Automotriz', unionName: 'UOM + SMATA', workersCountThousands: 410, agreedMonthlyIncreasePct: 2.4, homologatedByState: true, strikeConflictIndex: 36, unitLaborCostUsdIndex: 108 },
  { id: 'CONSTRUCCION', sectorName: 'Construcción (Fondo Cese Ley 22.250)', unionName: 'UOCRA (Martínez)', workersCountThousands: 440, agreedMonthlyIncreasePct: 2.2, homologatedByState: true, strikeConflictIndex: 28, unitLaborCostUsdIndex: 98 },
  { id: 'ACEITEROS', sectorName: 'Complejo Agroexportador y Puertos', unionName: 'Federación Aceitera + URGARA', workersCountThousands: 95, agreedMonthlyIncreasePct: 3.1, homologatedByState: true, strikeConflictIndex: 39, unitLaborCostUsdIndex: 112 },
  { id: 'BANCARIOS', sectorName: 'Sistema Financiero', unionName: 'La Bancaria (Palazzo)', workersCountThousands: 105, agreedMonthlyIncreasePct: 2.5, homologatedByState: true, strikeConflictIndex: 31, unitLaborCostUsdIndex: 116 },
  { id: 'PETROLEROS', sectorName: 'Hidrocarburos y Minería (Vaca Muerta)', unionName: 'Petroleros Privados + AOMA', workersCountThousands: 115, agreedMonthlyIncreasePct: 2.9, homologatedByState: true, strikeConflictIndex: 29, unitLaborCostUsdIndex: 118 },
  { id: 'ESTATALES', sectorName: 'Docentes y Administración Pública', unionName: 'CTERA + ATE + UPCN', workersCountThousands: 1650, agreedMonthlyIncreasePct: 1.8, homologatedByState: true, strikeConflictIndex: 54, unitLaborCostUsdIndex: 94 }
];

export const INITIAL_SUPREME_COURT_2027: SupremeCourtJustice[] = [
  { id: 'CSJN_1', name: 'Horacio Rosatti (Presidente CSJN)', age: 71, doctrine: 'FEDERALISTA', requiresSenateReconfirmationSoon: false, alignmentWithExecutive: 46 },
  { id: 'CSJN_2', name: 'Carlos Rosenkrantz', age: 69, doctrine: 'PRO_MERCADO', requiresSenateReconfirmationSoon: false, alignmentWithExecutive: 68 },
  { id: 'CSJN_3', name: 'Ricardo Lorenzetti', age: 72, doctrine: 'INSTITUCIONALISTA', requiresSenateReconfirmationSoon: false, alignmentWithExecutive: 58 },
  { id: 'CSJN_4', name: 'Silla Corte #4 (Acuerdo / Decreto)', age: 74, doctrine: 'INSTITUCIONALISTA', requiresSenateReconfirmationSoon: true, alignmentWithExecutive: 72 },
  { id: 'CSJN_5', name: 'Silla Corte #5 (Cuota Federal)', age: 64, doctrine: 'GARANTISTA', requiresSenateReconfirmationSoon: false, alignmentWithExecutive: 39 }
];

export const INITIAL_DEBT_PORTFOLIO_2027: DebtInstrumentSlice[] = [
  { id: 'LECAP', name: 'LECAPs y BONCAPs (Pesos Tasa Fija)', currency: 'ARS_FIJA', jurisdiction: 'BUENOS_AIRES', amountBillionUsdEquivalent: 52, parityUsd: 88, vultureHoldoutSharePct: 0 },
  { id: 'BONCER', name: 'Títulos BONCER Ajustados por IPC (CER)', currency: 'ARS_CER', jurisdiction: 'BUENOS_AIRES', amountBillionUsdEquivalent: 68, parityUsd: 84, vultureHoldoutSharePct: 0 },
  { id: 'DUAL_DL', name: 'Bonos Dollar-Linked y Duales (Seguro Cambio)', currency: 'ARS_DOLLAR_LINKED', jurisdiction: 'BUENOS_AIRES', amountBillionUsdEquivalent: 28, parityUsd: 86, vultureHoldoutSharePct: 0 },
  { id: 'BONARES', name: 'Bonares Ley Local (AL29 / AL30 / AL35)', currency: 'USD_LOCAL', jurisdiction: 'BUENOS_AIRES', amountBillionUsdEquivalent: 36, parityUsd: 68, vultureHoldoutSharePct: 4 },
  { id: 'GLOBALES', name: 'Globales Ley Nueva York (GD30 / GD35 - CACs)', currency: 'USD_NY', jurisdiction: 'NEW_YORK', amountBillionUsdEquivalent: 64, parityUsd: 71, vultureHoldoutSharePct: 9 },
  { id: 'FMI_EFF', name: 'Facilidades Extendidas FMI + Organismos', currency: 'USD_FMI', jurisdiction: 'WASHINGTON_FMI', amountBillionUsdEquivalent: 44, parityUsd: 100, vultureHoldoutSharePct: 0 }
];

export const INITIAL_OPINION_SEGMENTS_2027: PublicOpinionSegment[] = [
  { id: 'ABC1', name: 'ABC1 Profesional y Empresarial', populationSharePct: 8, approvalPct: 68, mainConcern: 'Salida del Cepo, Seguridad Jurídica y Presión Impositiva' },
  { id: 'CLASE_MEDIA', name: 'Clase Media Formal, Comerciantes y PyMEs', populationSharePct: 24, approvalPct: 56, mainConcern: 'Tarifas de Luz/Gas/Prepagas, Dólar Blue y Cuotas' },
  { id: 'SINDICALIZADOS', name: 'Trabajadores Formales Sindicalizados', populationSharePct: 18, approvalPct: 42, mainConcern: 'Paritarias vs Inflación, Ganancias y Empleo Industrial' },
  { id: 'INFORMALES', name: 'Trabajadores Informales / Cuentapropistas (En Negro)', populationSharePct: 22, approvalPct: 54, mainConcern: 'Inflación Semanal de Alimentos y Cortes de Calle' },
  { id: 'VULNERABLES', name: 'Sectores Vulnerables (AUH y Comedores)', populationSharePct: 10, approvalPct: 38, mainConcern: 'Canasta Básica Alimentaria (Indigencia) y Transferencias' },
  { id: 'JUBILADOS', name: 'Jubilados y Pensionados (ANSES / PAMI)', populationSharePct: 11, approvalPct: 41, mainConcern: 'Fórmula de Movilidad, Bono Previsional y Medicamentos PAMI' },
  { id: 'JOVENES', name: 'Jóvenes Sub-25 (Estudiantes y Primer Empleo)', populationSharePct: 7, approvalPct: 62, mainConcern: 'Estabilidad Monetaria, Empleo Tech y Universidad' }
];

interface DifficultyModifiers {
  grossReserves: number;
  countryRisk: number;
  monthlyIpc: number;
  climate: SimulationState['structural']['climateRegime'];
}

const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyModifiers> = {
  VIENTO_DE_COLA: { grossReserves: 52.0, countryRisk: 380, monthlyIpc: 1.4, climate: 'EL_NINO' },
  ESTANDAR_2027: { grossReserves: 38.5, countryRisk: 640, monthlyIpc: 2.4, climate: 'NEUTRO' },
  HERENCIA_MALDITA: { grossReserves: 25.0, countryRisk: 1180, monthlyIpc: 5.8, climate: 'NEUTRO' },
  TORMENTA_PERFECTA: { grossReserves: 22.5, countryRisk: 1450, monthlyIpc: 7.4, climate: 'LA_NINA' },
  DICIEMBRE_2001: { grossReserves: 19.5, countryRisk: 2150, monthlyIpc: 12.5, climate: 'LA_NINA' }
};

export function createInitialSimulationState2027(
  role: PlayableRole = 'PRESIDENTE',
  difficulty: DifficultyLevel = 'ESTANDAR_2027',
  selectedProvinceId = 'PBA'
): SimulationState {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const argendolarEncajes = 14.8;
  const chinaSwap = 18.0;
  const netReserves = Number((preset.grossReserves - argendolarEncajes - chinaSwap).toFixed(2));

  return {
    turnMonth: 1,
    currentYear: 2027,
    currentMonthOfYear: 12,
    role,
    selectedProvinceId,
    difficulty,
    gdpNominalBillionUsd: 690,
    gdpGrowthAnnualPct: 2.4,
    countryRiskEmbiPb: preset.countryRisk,
    treasury: {
      revenuePctGdp: 15.8,
      coparticipableRevenuePctGdp: 10.75,
      nonCoparticipableRevenuePctGdp: 11.29,
      ansesPensionsPctGdp: 7.4,
      cammesaSubsidiesPctGdp: 1.45,
      socialProgramsPctGdp: 2.1,
      publicWagesPctGdp: 2.6,
      publicWorksPctGdp: 0.9,
      discretionaryAtnPctGdp: 0.35,
      primarySpendingPctGdp: 14.8,
      debtInterestPctGdp: 1.4,
      primaryResultPctGdp: 1.0,
      financialResultPctGdp: -0.4,
      lastRolloverPct: 104
    },
    centralBank: {
      grossReservesBillionUsd: preset.grossReserves,
      argendolarEncajesBillionUsd: argendolarEncajes,
      chinaSwapActivatedBillionUsd: chinaSwap,
      netLiquidReservesBillionUsd: netReserves,
      monetaryBaseBillionArs: 28500,
      remuneratedLiabilitiesBillionArs: 19400,
      policyRateAnnualPct: 32,
      crawlingPegMonthlyPct: 1.5,
      cepoStrictnessIndex: 55,
      officialDollarArs: 1520,
      mepDollarArs: 1710,
      cclDollarArs: 1755,
      blueDollarArs: 1740,
      exchangeBrechaPct: 15.4
    },
    bankingSystem: {
      privateDepositsArsBillion: 64000,
      argendolarPrivateDepositsUsdBillion: 28.5,
      branchCashUsdBillion: 6.8,
      publicSectorExposurePct: 44,
      bcraPutsBillionArs: 8200,
      privateCreditPctGdp: 7.8,
      nonPerformingLoansPct: 3.1,
      argendolarDrainDailyMillionUsd: 0,
      putsExecutedThisMonthBillionArs: 0
    },
    inflation: {
      inertiaComponentPp: Number((preset.monthlyIpc * 0.55).toFixed(2)),
      passThroughComponentPp: Number((preset.monthlyIpc * 0.25).toFixed(2)),
      tarifazoComponentPp: 0.25,
      monetaryDropComponentPp: 0.2,
      realMonthlyIpcPct: preset.monthlyIpc,
      officialIndecIpcPct: preset.monthlyIpc,
      privateCongressIpcPct: preset.monthlyIpc,
      interannualIpcPct: Number((preset.monthlyIpc * 11.2).toFixed(1)),
      foodInflationMonthlyPct: Number((preset.monthlyIpc * 1.08).toFixed(2)),
      povertyCbtPct: 34.2,
      indigenceCbaPct: 8.4,
      giniCoefficient: 41.8
    },
    energy: {
      thermalSharePct: 57.5,
      hydroSharePct: 22.0,
      nuclearSharePct: 7.5,
      renewableSharePct: 13.0,
      generationCostUsdPerMwh: 74,
      userTariffCoveragePct: 68,
      cammesaMonthlyDeficitMillionUsd: 232,
      gasPipelineCapacityPct: 78,
      ypfPolicy: 'BARRIL_CRIOLLO',
      industrialGasCutActive: false,
      blackoutRiskPct: 16
    },
    labor: {
      unemploymentPct: 6.9,
      informalityPct: 39.4,
      realWageIndex: 100,
      laborLitigationMultiplier: 1.85,
      activeNationalStrike: false,
      paritarias: JSON.parse(JSON.stringify(INITIAL_PARITARIAS_2027))
    },
    judicial: {
      supremeCourt: JSON.parse(JSON.stringify(INITIAL_SUPREME_COURT_2027)),
      cautelaresBlockingDnuCount: 1,
      magistracyCouncilExecutiveControlPct: 45,
      judicialInterferenceTraceIndex: 14,
      activeCases: [
        {
          id: 'CAUSA_01',
          title: 'Causa Contrataciones y Sobreprecios Ministeriales',
          accusedFaction: 'OFICIALISMO',
          stage: 'INDAGATORIA',
          judgeId: 4,
          monthsStalled: 3,
          politicalImpact: 45
        },
        {
          id: 'CAUSA_02',
          title: 'Causa Obra Pública y Retornos Provinciales',
          accusedFaction: 'OPOSICION',
          stage: 'CASACION',
          judgeId: 10,
          monthsStalled: 1,
          politicalImpact: 52
        },
        {
          id: 'CAUSA_03',
          title: 'Causa Desvío de Fondos de Obras Sociales Sindicales',
          accusedFaction: 'SINDICATOS',
          stage: 'INSTRUCCION',
          judgeId: 7,
          monthsStalled: 6,
          politicalImpact: 38
        }
      ]
    },
    provinces: JSON.parse(JSON.stringify(PROVINCES_2027_DATASET)),
    publicOpinion: {
      presidentialPersonalImagePct: 54.2,
      managementApprovalPct: 51.8,
      expectation12MonthsPct: 58.5,
      oppositionRejectionPct: 61.0,
      traditionalMediaShieldPct: 50,
      streamingAndYouthViralPct: 64,
      agendaSlots: [
        'Asunción 2027 y Plan de Estabilización',
        'Negociación de Leyes en el Congreso',
        'Vencimientos con el FMI y Reservas Netas'
      ],
      segments: JSON.parse(JSON.stringify(INITIAL_OPINION_SEGMENTS_2027))
    },
    debtPortfolio: JSON.parse(JSON.stringify(INITIAL_DEBT_PORTFOLIO_2027)),
    taxes: JSON.parse(JSON.stringify(INITIAL_TAXES_2027)),
    structural: {
      expectedDevaluation3mPct: 14,
      expectedInflation3mPct: Number((preset.monthlyIpc * 3.1).toFixed(1)),
      anchorCredibilityIndex: 62,
      stateCapacityArcaIndex: 70,
      stateCapacityExecutionIndex: 66,
      indecCredibilityIndex: 92,
      silobolsaStockMillionTons: 14.2,
      climateRegime: preset.climate
    },
    eventLog: [
      '10 de Diciembre de 2027: Asunción de mando. El BCRA abre la rueda con Reservas Netas en tensión y el Congreso fragmentado.'
    ]
  };
}

