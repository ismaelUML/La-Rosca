// Si dejamos estos tipos acoplados a la UI o a respuestas de red, a las dos semanas
// terminamos importando React adentro del calculo de inflacion. Este archivo es 100% puro.

export type PlayableRole = 'PRESIDENTE' | 'GOBERNADOR' | 'DIPUTADO' | 'SENADOR';

export type DifficultyLevel =
  | 'VIENTO_DE_COLA'
  | 'ESTANDAR_2027'
  | 'HERENCIA_MALDITA'
  | 'TORMENTA_PERFECTA'
  | 'DICIEMBRE_2001';

export type ClimateRegime = 'EL_NINO' | 'NEUTRO' | 'LA_NINA';

export type YpfPricingPolicy = 'BARRIL_CRIOLLO' | 'EXPORT_PARITY';

export type JudicialStage =
  | 'BOLILLERO'
  | 'INSTRUCCION'
  | 'INDAGATORIA'
  | 'FALTA_DE_MERITO'
  | 'PROCESAMIENTO'
  | 'CAMARA'
  | 'JUICIO_ORAL_TOF'
  | 'CASACION'
  | 'CORTE_SUPREMA';

export interface TreasuryBalance {
  revenuePctGdp: number;
  coparticipableRevenuePctGdp: number;
  nonCoparticipableRevenuePctGdp: number;
  ansesPensionsPctGdp: number;
  cammesaSubsidiesPctGdp: number;
  socialProgramsPctGdp: number;
  publicWagesPctGdp: number;
  publicWorksPctGdp: number;
  discretionaryAtnPctGdp: number;
  primarySpendingPctGdp: number;
  debtInterestPctGdp: number;
  primaryResultPctGdp: number;
  financialResultPctGdp: number;
  lastRolloverPct: number;
}

export interface CentralBankBalance {
  grossReservesBillionUsd: number;
  argendolarEncajesBillionUsd: number;
  chinaSwapActivatedBillionUsd: number;
  netLiquidReservesBillionUsd: number;
  monetaryBaseBillionArs: number;
  remuneratedLiabilitiesBillionArs: number;
  policyRateAnnualPct: number;
  crawlingPegMonthlyPct: number;
  cepoStrictnessIndex: number;
  officialDollarArs: number;
  mepDollarArs: number;
  cclDollarArs: number;
  blueDollarArs: number;
  exchangeBrechaPct: number;
}

export interface PrivateBankingBalance {
  privateDepositsArsBillion: number;
  argendolarPrivateDepositsUsdBillion: number;
  branchCashUsdBillion: number;
  publicSectorExposurePct: number;
  bcraPutsBillionArs: number;
  privateCreditPctGdp: number;
  nonPerformingLoansPct: number;
  argendolarDrainDailyMillionUsd: number;
  putsExecutedThisMonthBillionArs: number;
}

export interface InflationBreakdown {
  inertiaComponentPp: number;
  passThroughComponentPp: number;
  tarifazoComponentPp: number;
  monetaryDropComponentPp: number;
  realMonthlyIpcPct: number;
  officialIndecIpcPct: number;
  privateCongressIpcPct: number;
  interannualIpcPct: number;
  foodInflationMonthlyPct: number;
  povertyCbtPct: number;
  indigenceCbaPct: number;
  giniCoefficient: number;
  inflHist?: number[];
  tcReal?: number;
  priceLevel?: number;
}

export interface EnergyMatrixState {
  thermalSharePct: number;
  hydroSharePct: number;
  nuclearSharePct: number;
  renewableSharePct: number;
  generationCostUsdPerMwh: number;
  userTariffCoveragePct: number;
  cammesaMonthlyDeficitMillionUsd: number;
  gasPipelineCapacityPct: number;
  ypfPolicy: YpfPricingPolicy;
  industrialGasCutActive: boolean;
  blackoutRiskPct: number;
}

export interface SectorParitaria {
  id: string;
  sectorName: string;
  unionName: string;
  workersCountThousands: number;
  agreedMonthlyIncreasePct: number;
  homologatedByState: boolean;
  strikeConflictIndex: number;
  unitLaborCostUsdIndex: number;
}

export interface LaborMarketState {
  unemploymentPct: number;
  informalityPct: number;
  realWageIndex: number;
  laborLitigationMultiplier: number;
  activeNationalStrike: boolean;
  paritarias: SectorParitaria[];
}

export interface SupremeCourtJustice {
  id: string;
  name: string;
  age: number;
  doctrine: 'INSTITUCIONALISTA' | 'GARANTISTA' | 'PRO_MERCADO' | 'FEDERALISTA';
  requiresSenateReconfirmationSoon: boolean;
  alignmentWithExecutive: number;
}

export interface ComodoroPyCase {
  id: string;
  title: string;
  accusedFaction: 'OFICIALISMO' | 'OPOSICION' | 'SINDICATOS';
  stage: JudicialStage;
  judgeId: number;
  monthsStalled: number;
  politicalImpact: number;
}

export interface JudicialState {
  supremeCourt: SupremeCourtJustice[];
  cautelaresBlockingDnuCount: number;
  magistracyCouncilExecutiveControlPct: number;
  judicialInterferenceTraceIndex: number;
  activeCases: ComodoroPyCase[];
}

export interface ProvinceSummary {
  id: string;
  name: string;
  region: 'AMBA' | 'PAMPEANA' | 'PATAGONIA' | 'NOA' | 'NEA' | 'CUYO';
  nationalDeputiesCount: number;
  reelectionAllowed: boolean;
  coparticipationDependencyPct: number;
  governorLoyaltyToPresident: number;
  quasiCurrencyIssued: boolean;
  fiscalBalancePct: number;
  boletaUnicaActive: boolean;
  apparatusFiscalizacionPct: number;
  keyEconomicDriver: string;
  problematicas?: string[];
  mesesCon5OMasProblematicas?: number;
  intervenida?: boolean;
  interventorNombre?: string;
  eleccionEnMeses?: number;
}

export interface PublicOpinionSegment {
  id: string;
  name: string;
  populationSharePct: number;
  approvalPct: number;
  mainConcern: string;
}

export interface PublicOpinionState {
  presidentialPersonalImagePct: number;
  managementApprovalPct: number;
  expectation12MonthsPct: number;
  oppositionRejectionPct: number;
  traditionalMediaShieldPct: number;
  streamingAndYouthViralPct: number;
  agendaSlots: [string, string, string];
  segments: PublicOpinionSegment[];
}

export interface DebtInstrumentSlice {
  id: string;
  name: string;
  currency: 'ARS_FIJA' | 'ARS_CER' | 'ARS_DOLLAR_LINKED' | 'USD_LOCAL' | 'USD_NY' | 'USD_FMI';
  jurisdiction: 'BUENOS_AIRES' | 'NEW_YORK' | 'WASHINGTON_FMI';
  amountBillionUsdEquivalent: number;
  parityUsd: number;
  vultureHoldoutSharePct: number;
}

export interface HiddenStructuralVariables {
  expectedDevaluation3mPct: number;
  expectedInflation3mPct: number;
  anchorCredibilityIndex: number;
  stateCapacityArcaIndex: number;
  stateCapacityExecutionIndex: number;
  indecCredibilityIndex: number;
  silobolsaStockMillionTons: number;
  climateRegime: ClimateRegime;
}

// En Argentina los impuestos no son todos iguales ni a palos: hay 6 que el Ejecutivo
// puede tocar por decreto/resolucion (retenciones, aranceles, combustibles) y 11 que
// si no pasan por el Congreso te clavan una cautelar en la Corte a las dos horas.
export type TaxCategory =
  | 'COMERCIO_EXTERIOR'
  | 'CONSUMO'
  | 'RENTA'
  | 'TRABAJO'
  | 'FINANCIERO'
  | 'PATRIMONIO';

export interface TaxItem {
  id: string;
  name: string;
  category?: TaxCategory;
  legalMechanism: 'LEY_CONGRESO' | 'DECRETO_EJECUTIVO';
  isCoparticipable: boolean;
  currentRatePct: number;
  initialRatePct: number;
  revenuePctGdp: number;
  revenueMillionUsdMonthly?: number;
  evasionPct: number;
}

export interface SimulationState {
  turnMonth: number;
  currentYear: number;
  currentMonthOfYear: number;
  role: PlayableRole;
  selectedProvinceId: string;
  difficulty: DifficultyLevel;
  gdpNominalBillionUsd: number;
  gdpGrowthAnnualPct: number;
  countryRiskEmbiPb: number;
  treasury: TreasuryBalance;
  centralBank: CentralBankBalance;
  bankingSystem: PrivateBankingBalance;
  inflation: InflationBreakdown;
  energy: EnergyMatrixState;
  labor: LaborMarketState;
  judicial: JudicialState;
  provinces: ProvinceSummary[];
  publicOpinion: PublicOpinionState;
  debtPortfolio: DebtInstrumentSlice[];
  taxes: TaxItem[];
  structural: HiddenStructuralVariables;
  eventLog: string[];
}

export type PolicyAction =
  | { type: 'SET_CRAWLING_PEG'; monthlyPct: number }
  | { type: 'DISCRETE_DEVALUATION'; devaluationPct: number }
  | { type: 'SET_POLICY_RATE'; annualRatePct: number }
  | { type: 'SET_CEPO_STRICTNESS'; strictnessIndex: number }
  | { type: 'SET_TARIFF_COVERAGE'; coveragePct: number }
  | { type: 'SET_YPF_POLICY'; policy: YpfPricingPolicy }
  | { type: 'TOGGLE_INDUSTRIAL_GAS_CUT'; cutActive: boolean }
  | { type: 'TOGGLE_PARITARIA_HOMOLOGATION'; paritariaId: string }
  | { type: 'EXECUTE_LABOR_REFORM' }
  | { type: 'TOGGLE_INDEC_INTERVENTION'; intervene: boolean }
  | { type: 'EXECUTE_ANSES_INTRA_STATE_SWAP' }
  | { type: 'SEND_ATN_TO_PROVINCE'; provinceId: string; amountPctGdp: number }
  | { type: 'OPERATE_COMODORO_PY_CASE'; caseId: string; operation: 'PUSH' | 'FREEZE' }
  | { type: 'UPDATE_TAX_RATE'; taxId: string; newRatePct: number }
  | { type: 'INTERVENE_PROVINCE'; provinceId: string; interventorName: string };

