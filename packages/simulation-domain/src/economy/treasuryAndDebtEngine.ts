import type {
  CentralBankBalance,
  DebtInstrumentSlice,
  EnergyMatrixState,
  HiddenStructuralVariables,
  TaxItem,
  TreasuryBalance
} from '../models/SimulationTypes.js';
import { clamp, round2 } from './mathUtils.js';

// Aca vive la guerra real entre Casa Rosada y los 24 Gobernadores:
// IVA y Ganancias se coparticipan (57% va directo a provincias por goteo automatico),
// pero Retenciones e Impuesto al Cheque van casi 100% a la caja del Presidente.

export function stepSingleTaxCollection(
  tax: TaxItem,
  monthlyInflationPct: number,
  stateCapacityArcaIndex: number,
  gdpGrowthAnnualPct: number
): TaxItem {
  const rateRatio = tax.currentRatePct / Math.max(0.1, tax.initialRatePct);
  // Curva de Laffer + evasion: si subis la alicuota muy por encima de la base historica,
  // la gente se pasa a vender en negro ("sin factura") sobre todo si ARCA/AFIP no tiene capacidad tecnica.
  const lafferPenalty = Math.max(0, rateRatio - 1.08) * 14.5;
  const arcaEnforcementBonus = (stateCapacityArcaIndex - 65) * 0.18;
  const evasionPct = round2(clamp(tax.evasionPct + lafferPenalty - arcaEnforcementBonus, 4, 68));

  // Efecto Olivera-Tanzi: la inflacion alta licua el valor real de los impuestos entre el devengamiento y el cobro
  const oliveraTanziErosion = 1 / Math.pow(1 + monthlyInflationPct / 100, 0.65);
  const activityFactor = 1 + gdpGrowthAnnualPct / 100 / 12;
  const effectiveCollectionRatio = rateRatio * ((100 - evasionPct) / (100 - 28)) * oliveraTanziErosion * activityFactor;

  // El ratio es una fórmula de NIVEL respecto de la recaudación de partida: si lo multiplicamos
  // sobre la recaudación ya actualizada se acumula mes a mes (+15% mensual) y el superávit
  // primario explota hasta 30% del PBI. Por eso se guarda la base y se aplica siempre sobre ella.
  const baseRevenuePctGdp = tax.baseRevenuePctGdp ?? tax.revenuePctGdp;

  return {
    ...tax,
    evasionPct,
    baseRevenuePctGdp,
    revenuePctGdp: round2(clamp(baseRevenuePctGdp * clamp(effectiveCollectionRatio, 0.85, 1.15), 0.05, 9.5))
  };
}

function computeWinterLngCostUsd(monthOfYear: number, industrialGasCutActive: boolean): number {
  const isWinterPeak = monthOfYear >= 6 && monthOfYear <= 8;
  if (!isWinterPeak) return 0;
  return industrialGasCutActive ? 0 : 34.0;
}

function computeSummerHeatBaseRisk(monthOfYear: number): number {
  const isSummerPeak = monthOfYear === 1 || monthOfYear === 2;
  return isSummerPeak ? 22 : 6;
}

export function stepEnergyAndCammesa(
  energy: EnergyMatrixState,
  officialDollarArs: number,
  climateRegime: HiddenStructuralVariables['climateRegime'],
  monthOfYear: number
): EnergyMatrixState {
  const hydroSharePct = climateRegime === 'LA_NINA' ? 15.5 : 23.0;
  const winterLngPenaltyUsd = computeWinterLngCostUsd(monthOfYear, energy.industrialGasCutActive);
  const generationCostUsdPerMwh = round2(clamp(72 + winterLngPenaltyUsd - (hydroSharePct - 20) * 1.1, 58, 135));

  // Si devaluas el dolar oficial y no subis las tarifas, el subsidio de CAMMESA explota en pesos
  const devaluationStress = Math.max(0, (officialDollarArs - 1500) / 1500) * 14;
  const effectiveCoveragePct = round2(clamp(energy.userTariffCoveragePct - devaluationStress, 18, 100));
  const uncoveredShare = (100 - effectiveCoveragePct) / 100;
  const cammesaMonthlyDeficitMillionUsd = round2(uncoveredShare * generationCostUsdPerMwh * 9.8);

  const underinvestmentRisk = (100 - effectiveCoveragePct) * 0.45;
  const blackoutRiskPct = round2(clamp(computeSummerHeatBaseRisk(monthOfYear) + underinvestmentRisk, 2, 88));

  return {
    ...energy,
    hydroSharePct,
    thermalSharePct: round2(100 - hydroSharePct - energy.nuclearSharePct - energy.renewableSharePct),
    generationCostUsdPerMwh,
    userTariffCoveragePct: effectiveCoveragePct,
    cammesaMonthlyDeficitMillionUsd,
    blackoutRiskPct
  };
}

export function stepTreasuryBalance(
  treasury: TreasuryBalance,
  taxes: TaxItem[],
  energy: EnergyMatrixState,
  gdpNominalBillionUsd: number,
  anchorCredibilityIndex: number
): TreasuryBalance {
  let coparticipableRevenuePctGdp = 0;
  let nonCoparticipableRevenuePctGdp = 0;

  for (const tax of taxes) {
    if (tax.isCoparticipable) {
      coparticipableRevenuePctGdp += tax.revenuePctGdp;
    } else {
      nonCoparticipableRevenuePctGdp += tax.revenuePctGdp;
    }
  }

  // Ley 23.548: de la masa coparticipable Nacion se queda ~42%, el resto se va directo a las 24 provincias
  const nationalShareOfCoparticipable = coparticipableRevenuePctGdp * 0.42;
  const revenuePctGdp = round2(nationalShareOfCoparticipable + nonCoparticipableRevenuePctGdp);

  const cammesaSubsidiesPctGdp = round2(((energy.cammesaMonthlyDeficitMillionUsd * 12) / 1000 / gdpNominalBillionUsd) * 100);
  const primarySpendingPctGdp = round2(
    treasury.ansesPensionsPctGdp +
      cammesaSubsidiesPctGdp +
      treasury.socialProgramsPctGdp +
      treasury.publicWagesPctGdp +
      treasury.publicWorksPctGdp +
      treasury.discretionaryAtnPctGdp
  );

  const primaryResultPctGdp = round2(revenuePctGdp - primarySpendingPctGdp);
  const financialResultPctGdp = round2(primaryResultPctGdp - treasury.debtInterestPctGdp);
  const lastRolloverPct = round2(clamp(72 + anchorCredibilityIndex * 0.42 + primaryResultPctGdp * 6.5, 45, 135));

  return {
    ...treasury,
    revenuePctGdp,
    coparticipableRevenuePctGdp: round2(coparticipableRevenuePctGdp),
    nonCoparticipableRevenuePctGdp: round2(nonCoparticipableRevenuePctGdp),
    cammesaSubsidiesPctGdp,
    primarySpendingPctGdp,
    primaryResultPctGdp,
    financialResultPctGdp,
    lastRolloverPct
  };
}

export function stepDebtAndCountryRisk(
  debtPortfolio: DebtInstrumentSlice[],
  treasury: TreasuryBalance,
  centralBank: CentralBankBalance,
  currentRiskPb: number
): { nextDebtPortfolio: DebtInstrumentSlice[]; nextCountryRiskPb: number } {
  const fiscalBonus = treasury.primaryResultPctGdp * 85;
  const reservesBonus = centralBank.netLiquidReservesBillionUsd * 24;
  const nextCountryRiskPb = Math.round(clamp(currentRiskPb * 0.78 + 420 - fiscalBonus - reservesBonus, 110, 3400));

  const nextDebtPortfolio = debtPortfolio.map((slice) => {
    const parityUsd = round2(clamp(96 - (nextCountryRiskPb - 120) * 0.038, 19, 99));
    // Cuando los Globales Ley NY caen debajo de 32 centavos por dolar, los fondos Real Money
    // venden a perdida y entran los Fondos Buitre comprando para bloquear las CACs (umbral 25-33%).
    const vultureEntryDelta = slice.jurisdiction === 'NEW_YORK' && parityUsd < 34 ? 2.4 : -0.3;
    const vultureHoldoutSharePct = round2(clamp(slice.vultureHoldoutSharePct + vultureEntryDelta, 2, 42));

    return {
      ...slice,
      parityUsd,
      vultureHoldoutSharePct
    };
  });

  return { nextDebtPortfolio, nextCountryRiskPb };
}
