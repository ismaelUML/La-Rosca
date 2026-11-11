import type { SimulationState } from '../models/SimulationTypes.js';
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

function stepStructuralExpectations(
  state: SimulationState,
  nextInflationMonthlyPct: number,
  nextBrechaPct: number,
  primaryResultPctGdp: number
): SimulationState['structural'] {
  const anchorGain = primaryResultPctGdp >= 0 && nextInflationMonthlyPct < 3.5 ? 1.8 : -3.2;
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

export function advanceSimulationMonth(state: SimulationState): SimulationState {
  const nextTurnMonth = state.turnMonth + 1;
  const nextMonthOfYear = (state.currentMonthOfYear % 12) + 1;
  const nextYear = nextMonthOfYear === 1 ? state.currentYear + 1 : state.currentYear;

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
    nextMonthOfYear
  );

  const nextInflation = computeNextInflationBreakdown(
    state.inflation,
    nextCentralBank,
    nextEnergy,
    state.labor,
    state.structural,
    state.energy.userTariffCoveragePct
  );

  const industrialGasPenalty = nextEnergy.industrialGasCutActive ? -1.4 : 0;
  const creditBoost = (nextBanking.privateCreditPctGdp - 8) * 0.14;
  const gdpGrowthAnnualPct = round2(
    clamp(state.gdpGrowthAnnualPct * 0.75 + creditBoost + industrialGasPenalty - (nextInflation.realMonthlyIpcPct - 2.2) * 0.45, -9.5, 8.5)
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
    state.structural.anchorCredibilityIndex
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

  const nextOpinion = stepPublicOpinion(state.publicOpinion, nextInflation, nextLabor, nextCentralBank.exchangeBrechaPct);
  const nextJudicial = stepJudicialAndLawfare(
    state.judicial,
    nextOpinion.presidentialPersonalImagePct,
    nextTreasury.coparticipableRevenuePctGdp
  );

  const nextStructural = {
    ...stepStructuralExpectations(state, nextInflation.realMonthlyIpcPct, nextCentralBank.exchangeBrechaPct, nextTreasury.primaryResultPctGdp),
    silobolsaStockMillionTons: nextSilobolsaTons
  };

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
    structural: nextStructural
  };
}
