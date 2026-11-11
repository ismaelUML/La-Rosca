import type {
  CentralBankBalance,
  HiddenStructuralVariables,
  PrivateBankingBalance,
  TreasuryBalance
} from '../models/SimulationTypes.js';
import { clamp, logisticCurve, round2 } from './mathUtils.js';

// El error clasico de otros juegos es tratar las Reservas Brutas como plata disponible.
// Cuando las Reservas Netas bajan de cero significa que el BCRA esta vendiendo los encajes
// de las cajas de ahorro en dolares de la gente (Argendolares). Ahi arranca el terror.

export function computeSilobolsaLiquidationBillionUsd(
  structural: HiddenStructuralVariables,
  exchangeBrechaPct: number,
  policyRateAnnualPct: number,
  monthOfYear: number
): { liquidatedBillionUsd: number; nextSilobolsaStockTons: number } {
  const isCoarseHarvestSeason = monthOfYear >= 4 && monthOfYear <= 6;
  const climateMultiplier = structural.climateRegime === 'EL_NINO' ? 1.25 : structural.climateRegime === 'LA_NINA' ? 0.58 : 1.0;
  const monthlyHarvestInflowTons = (isCoarseHarvestSeason ? 14.5 : 3.2) * climateMultiplier;

  // El chacarero compara cuanto espera que devalues en 90 dias contra el costo del credito en pesos.
  const hoardingIncentive =
    structural.expectedDevaluation3mPct + exchangeBrechaPct * 0.65 - policyRateAnnualPct / 4;
  const liquidationShare = 1 - logisticCurve(hoardingIncentive, 22, 0.08);
  const availableTons = structural.silobolsaStockMillionTons + monthlyHarvestInflowTons;
  const tonsSold = clamp(availableTons * clamp(liquidationShare, 0.08, 0.52), 1.1, availableTons * 0.65);

  return {
    liquidatedBillionUsd: round2(tonsSold * 0.44),
    nextSilobolsaStockTons: round2(Math.max(2.0, availableTons - tonsSold))
  };
}

export function computeParallelExchangeRates(
  officialDollarArs: number,
  centralBank: CentralBankBalance,
  structural: HiddenStructuralVariables,
  putsExecutedBillionArs: number
): { mepDollarArs: number; cclDollarArs: number; blueDollarArs: number; exchangeBrechaPct: number } {
  // Si no hay cepo (strictness < 15), la brecha tiende a comprimir casi a cero.
  // Con cepo duro + exceso de pesos (o ejecucion de PUTs bancarios), el CCL se vuela.
  const cepoFactor = centralBank.cepoStrictnessIndex / 100;
  const putsPressure = putsExecutedBillionArs * 0.004;
  const reserveFear = Math.max(0, -centralBank.netLiquidReservesBillionUsd) * 2.8;
  const rawBrecha =
    cepoFactor * (14 + structural.expectedDevaluation3mPct * 0.75 + reserveFear + putsPressure);

  const exchangeBrechaPct = round2(clamp(rawBrecha, 1.2, 165));
  const mepDollarArs = round2(officialDollarArs * (1 + exchangeBrechaPct / 100));
  const cclDollarArs = round2(mepDollarArs * 1.025);
  const blueDollarArs = round2(mepDollarArs * (1 + cepoFactor * 0.04));

  return { mepDollarArs, cclDollarArs, blueDollarArs, exchangeBrechaPct };
}

export function stepPrivateBankingBalance(
  banking: PrivateBankingBalance,
  centralBank: CentralBankBalance,
  treasury: TreasuryBalance,
  countryRiskEmbiPb: number
): PrivateBankingBalance {
  // Si el Riesgo Pais pasa de 1100 pb o el roll-over del Tesoro cae del 85%,
  // los bancos privados entran en panico y le ejecutan los PUTs en la cara al BCRA.
  const panicTrigger = countryRiskEmbiPb > 1100 || treasury.lastRolloverPct < 85;
  const putsExecutedThisMonthBillionArs = panicTrigger ? round2(banking.bcraPutsBillionArs * 0.28) : 0;

  // Cuando las Reservas Netas caen debajo de -4.500 M USD, la gente huele que el BCRA
  // esta tocando los encajes y empieza la cola en las sucursales para retirar billetes cara grande.
  const netReservesDeficit = Math.max(0, -4.5 - centralBank.netLiquidReservesBillionUsd);
  const argendolarDrainDailyMillionUsd = round2(clamp(netReservesDeficit * 38, 0, 420));
  const monthlyUsdDrainBillion = (argendolarDrainDailyMillionUsd * 22) / 1000;

  const nextArgendolares = round2(
    clamp(banking.argendolarPrivateDepositsUsdBillion - monthlyUsdDrainBillion + 0.18, 8.0, 38.0)
  );

  // Efecto Crowding-Out: si la tasa del BCRA es altisima o el Estado absorbe todo el balance,
  // los bancos hacen "banca vaga" y le cortan el descuento de cheques a las PyMEs y los hipotecarios UVA.
  const crowdingOutPenalty = (centralBank.policyRateAnnualPct - 28) * 0.025 + (banking.publicSectorExposurePct - 35) * 0.03;
  const privateCreditPctGdp = round2(clamp(banking.privateCreditPctGdp - crowdingOutPenalty * 0.15, 3.8, 28.0));

  return {
    ...banking,
    argendolarPrivateDepositsUsdBillion: nextArgendolares,
    branchCashUsdBillion: round2(clamp(nextArgendolares * 0.24, 1.5, 9.5)),
    publicSectorExposurePct: round2(clamp(banking.publicSectorExposurePct - putsExecutedThisMonthBillionArs * 0.002, 18, 68)),
    bcraPutsBillionArs: round2(Math.max(0, banking.bcraPutsBillionArs - putsExecutedThisMonthBillionArs)),
    privateCreditPctGdp,
    nonPerformingLoansPct: round2(clamp(2.4 + (centralBank.policyRateAnnualPct - 24) * 0.08, 1.5, 16.5)),
    argendolarDrainDailyMillionUsd,
    putsExecutedThisMonthBillionArs
  };
}

export function stepCentralBankBalance(
  centralBank: CentralBankBalance,
  banking: PrivateBankingBalance,
  structural: HiddenStructuralVariables,
  energyDeficitMillionUsd: number,
  monthOfYear: number
): { nextCentralBank: CentralBankBalance; nextSilobolsaTons: number } {
  const officialDollarArs = round2(centralBank.officialDollarArs * (1 + centralBank.crawlingPegMonthlyPct / 100));
  const { liquidatedBillionUsd, nextSilobolsaStockTons } = computeSilobolsaLiquidationBillionUsd(
    structural,
    centralBank.exchangeBrechaPct,
    centralBank.policyRateAnnualPct,
    monthOfYear
  );

  // Si la brecha es alta, los importadores sobrefacturan y adelantan compras vaciando el MULC
  const importDemandBillionUsd = 4.6 + Math.max(0, centralBank.exchangeBrechaPct - 25) * 0.032 + energyDeficitMillionUsd / 1000;
  const mulcNetInterventionBillionUsd = liquidatedBillionUsd - importDemandBillionUsd;

  const argendolarEncajesBillionUsd = round2(banking.argendolarPrivateDepositsUsdBillion * 0.52);
  const grossReservesBillionUsd = round2(
    clamp(centralBank.grossReservesBillionUsd + mulcNetInterventionBillionUsd, 14.0, 85.0)
  );
  const netLiquidReservesBillionUsd = round2(
    grossReservesBillionUsd - argendolarEncajesBillionUsd - centralBank.chinaSwapActivatedBillionUsd
  );

  // Deficit cuasifiscal: los pasivos remunerados devengan tasa todos los meses y emiten endogenamente
  const monthlyQuasiFiscalInterest =
    centralBank.remuneratedLiabilitiesBillionArs * (centralBank.policyRateAnnualPct / 12 / 100);
  const remuneratedLiabilitiesBillionArs = round2(
    Math.max(0, centralBank.remuneratedLiabilitiesBillionArs + monthlyQuasiFiscalInterest - banking.putsExecutedThisMonthBillionArs)
  );
  const monetaryBaseBillionArs = round2(
    centralBank.monetaryBaseBillionArs + banking.putsExecutedThisMonthBillionArs + monthlyQuasiFiscalInterest * 0.35
  );

  const parallelRates = computeParallelExchangeRates(
    officialDollarArs,
    { ...centralBank, netLiquidReservesBillionUsd },
    structural,
    banking.putsExecutedThisMonthBillionArs
  );

  return {
    nextCentralBank: {
      ...centralBank,
      grossReservesBillionUsd,
      argendolarEncajesBillionUsd,
      netLiquidReservesBillionUsd,
      monetaryBaseBillionArs,
      remuneratedLiabilitiesBillionArs,
      officialDollarArs,
      ...parallelRates
    },
    nextSilobolsaTons: nextSilobolsaStockTons
  };
}
