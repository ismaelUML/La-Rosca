import type { DifficultyLevel, SimulationState } from '../models/SimulationTypes.js';
import { advanceRigiMonthlyQueue } from './rigiEngine.js';
import { computeDomainPolicyModifiers } from './domainModifiersEngine.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { computeNextInflationBreakdown } from '../economy/inflationEngine.js';
import { stepCentralBankBalance, stepPrivateBankingBalance } from '../economy/centralBankAndBankingEngine.js';
import {
  stepDebtAndCountryRisk,
  stepEnergyAndCammesa,
  stepSingleTaxCollection,
  stepTreasuryBalance
} from '../economy/treasuryAndDebtEngine.js';
import {
  stepJudicialAndLawfare,
  stepLaborMarket,
  stepProvincesState,
  stepPublicOpinion
} from '../politics/judicialLaborAndOpinionEngine.js';

// El orden del pipeline mensual importa muchisimo: primero impactan la energia y el mercado cambiario,
// despues se forma la inflacion del mes, luego se ajustan paritarias y recaudacion (con Olivera-Tanzi),
// y al final reaccionan los bancos, el Riesgo Pais, Comodoro Py y las encuestas.

function isCrisisRegime(brecha: number, reserves: number): boolean {
  return brecha > 35 || reserves < 35;
}

function isStabilizationRegime(primaryResult: number, monthlyIpc: number, brecha: number): boolean {
  return primaryResult >= 0 && monthlyIpc < 3.0 && brecha < 20;
}

function calculateAnchorGain(
  primaryResult: number,
  monthlyIpc: number,
  brecha: number,
  reserves: number
): number {
  if (isCrisisRegime(brecha, reserves)) return -4.5;
  if (isStabilizationRegime(primaryResult, monthlyIpc, brecha)) return 2.2;
  return primaryResult >= 0 ? 0.8 : -2.8;
}

function stepStructuralExpectations(
  state: SimulationState,
  nextInflationMonthlyPct: number,
  nextBrechaPct: number,
  primaryResultPctGdp: number
): SimulationState['structural'] {
  const anchorGain = calculateAnchorGain(
    primaryResultPctGdp,
    nextInflationMonthlyPct,
    nextBrechaPct,
    state.centralBank.grossReservesBillionUsd
  );
  const anchorCredibilityIndex = round2(clamp(state.structural.anchorCredibilityIndex + anchorGain, 8, 98));
  const expectedInflation3mPct = round2(clamp(nextInflationMonthlyPct * 3.1 - anchorCredibilityIndex * 0.04, 1.5, 140));
  const expectedDevaluation3mPct = round2(
    clamp(state.centralBank.crawlingPegMonthlyPct * 3 + Math.max(0, nextBrechaPct - 20) * 0.45, 2, 160)
  );

  return {
    ...state.structural,
    anchorCredibilityIndex,
    expectedInflation3mPct,
    expectedDevaluation3mPct
  };
}

interface DifficultyDynamics {
  inertiaFloor: number;
  deficitMonetizationMult: number;
  reserveDrainBillionUsd: number;
  approvalPainMult: number;
}

const DIFFICULTY_DYNAMICS: Record<DifficultyLevel, DifficultyDynamics> = {
  VIENTO_DE_COLA: { inertiaFloor: 0.42, deficitMonetizationMult: 0.7, reserveDrainBillionUsd: 0.0, approvalPainMult: 0.8 },
  ESTANDAR_2027: { inertiaFloor: 0.52, deficitMonetizationMult: 1.0, reserveDrainBillionUsd: 0.15, approvalPainMult: 1.0 },
  HERENCIA_MALDITA: { inertiaFloor: 0.62, deficitMonetizationMult: 1.25, reserveDrainBillionUsd: 0.45, approvalPainMult: 1.15 },
  TORMENTA_PERFECTA: { inertiaFloor: 0.68, deficitMonetizationMult: 1.45, reserveDrainBillionUsd: 0.75, approvalPainMult: 1.3 },
  DICIEMBRE_2001: { inertiaFloor: 0.74, deficitMonetizationMult: 1.75, reserveDrainBillionUsd: 1.05, approvalPainMult: 1.45 }
};

function stepRigiIfPresent(state: SimulationState): Pick<SimulationState, 'rigiPending' | 'eventLog'> {
  if (!state.rigiSectors) {
    return { rigiPending: state.rigiPending, eventLog: state.eventLog };
  }
  const rigiQueue = advanceRigiMonthlyQueue(state.rigiPending ?? [], state.rigiSectors);
  const eventLog =
    rigiQueue.desistedProjects.length > 0
      ? [
          `RIGI: Proyectos desistidos por falta de respuesta: ${rigiQueue.desistedProjects.join(', ')}.`,
          ...state.eventLog.slice(0, 14)
        ]
      : state.eventLog;
  return { rigiPending: rigiQueue.nextPending, eventLog };
}

export function advanceSimulationMonth(state: SimulationState): SimulationState {
  const nextTurnMonth = state.turnMonth + 1;
  const nextMonthOfYear = (state.currentMonthOfYear % 12) + 1;
  const nextYear = nextMonthOfYear === 1 ? state.currentYear + 1 : state.currentYear;
  const dynamics = DIFFICULTY_DYNAMICS[state.difficulty] ?? DIFFICULTY_DYNAMICS.ESTANDAR_2027;
  const fiscalDeficitPctGdp = Math.max(0, -state.treasury.financialResultPctGdp);
  const mod = computeDomainPolicyModifiers(state);

  const nextEnergy = stepEnergyAndCammesa(
    state.energy,
    state.centralBank.officialDollarArs,
    state.structural.climateRegime,
    nextMonthOfYear
  );

  const nextBanking = stepPrivateBankingBalance(
    state.bankingSystem,
    state.centralBank,
    state.treasury,
    state.countryRiskEmbiPb
  );

  const { nextCentralBank, nextSilobolsaTons } = stepCentralBankBalance(
    state.centralBank,
    nextBanking,
    state.structural,
    nextEnergy.cammesaMonthlyDeficitMillionUsd,
    nextMonthOfYear,
    {
      fiscalDeficitPctGdp,
      lastRolloverPct: state.treasury.lastRolloverPct,
      reserveDrainBillionUsd: dynamics.reserveDrainBillionUsd,
      deficitMonetizationMult: dynamics.deficitMonetizationMult,
      rigiExportsBillionUsd: mod.rigiMonthlyExportsBillionUsd
    }
  );

  const nextInflation = computeNextInflationBreakdown(
    state.inflation,
    nextCentralBank,
    nextEnergy,
    state.labor,
    state.structural,
    state.energy.userTariffCoveragePct,
    {
      inertiaFloor: dynamics.inertiaFloor,
      fiscalDeficitPctGdp,
      deficitMonetizationMult: dynamics.deficitMonetizationMult,
      measuresInflationDeltaPp: mod.measuresInflationDeltaPp
    }
  );

  const industrialGasPenalty = nextEnergy.industrialGasCutActive ? -1.4 : 0;
  const creditBoost = (nextBanking.privateCreditPctGdp - 8) * 0.14;
  const gdpGrowthAnnualPct = round2(
    clamp(
      state.gdpGrowthAnnualPct * 0.75 +
        creditBoost +
        industrialGasPenalty +
        mod.rigiGdpGrowthBoostPp -
        (nextInflation.realMonthlyIpcPct - 2.2) * 0.45,
      -9.5,
      8.5
    )
  );
  const gdpNominalBillionUsd = round2(state.gdpNominalBillionUsd * (1 + gdpGrowthAnnualPct / 100 / 12));

  const nextTaxes = state.taxes.map((t) =>
    stepSingleTaxCollection(t, nextInflation.realMonthlyIpcPct, state.structural.stateCapacityArcaIndex, gdpGrowthAnnualPct)
  );

  const nextTreasury = stepTreasuryBalance(
    state.treasury,
    nextTaxes,
    nextEnergy,
    gdpNominalBillionUsd,
    state.structural.anchorCredibilityIndex,
    {
      extraRevenuePctGdp: mod.customTaxesRevenuePctGdp,
      extraSpendingPctGdp: mod.measuresFiscalCostPctGdp + mod.rigiFiscalCostPctGdp
    }
  );

  const { nextDebtPortfolio, nextCountryRiskPb } = stepDebtAndCountryRisk(
    state.debtPortfolio,
    nextTreasury,
    nextCentralBank,
    state.countryRiskEmbiPb
  );

  const nextLabor = stepLaborMarket(
    state.labor,
    nextInflation.realMonthlyIpcPct,
    nextCentralBank.crawlingPegMonthlyPct,
    gdpGrowthAnnualPct
  );

  const nextProvinces = stepProvincesState(
    state.provinces,
    nextTreasury.coparticipableRevenuePctGdp,
    nextTreasury.discretionaryAtnPctGdp
  );

  const nextOpinion = stepPublicOpinion(
    state.publicOpinion,
    nextInflation,
    nextLabor,
    nextCentralBank.exchangeBrechaPct,
    {
      gdpGrowthAnnualPct,
      approvalPainMult: dynamics.approvalPainMult,
      measuresApprovalDeltaPp: mod.measuresApprovalDeltaPp
    }
  );
  const nextJudicial = stepJudicialAndLawfare(
    state.judicial,
    nextOpinion.presidentialPersonalImagePct,
    nextTreasury.coparticipableRevenuePctGdp
  );

  const steppedStructural = stepStructuralExpectations(
    state,
    nextInflation.realMonthlyIpcPct,
    nextCentralBank.exchangeBrechaPct,
    nextTreasury.primaryResultPctGdp
  );
  const nextStructural = {
    ...steppedStructural,
    anchorCredibilityIndex: round2(clamp(steppedStructural.anchorCredibilityIndex + mod.cabinetAnchorBonus, 8, 98)),
    stateCapacityExecutionIndex: mod.cabinetExecutionIndex ?? steppedStructural.stateCapacityExecutionIndex,
    silobolsaStockMillionTons: nextSilobolsaTons
  };

  const rigiStep = stepRigiIfPresent(state);

  return {
    ...state,
    turnMonth: nextTurnMonth,
    currentYear: nextYear,
    currentMonthOfYear: nextMonthOfYear,
    gdpNominalBillionUsd,
    gdpGrowthAnnualPct,
    countryRiskEmbiPb: nextCountryRiskPb,
    treasury: nextTreasury,
    centralBank: nextCentralBank,
    bankingSystem: nextBanking,
    inflation: nextInflation,
    energy: nextEnergy,
    labor: nextLabor,
    judicial: nextJudicial,
    provinces: nextProvinces,
    publicOpinion: nextOpinion,
    debtPortfolio: nextDebtPortfolio,
    taxes: nextTaxes,
    structural: nextStructural,
    ...rigiStep
  };
}

