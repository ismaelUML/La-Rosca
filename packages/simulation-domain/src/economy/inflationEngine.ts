import type {
  CentralBankBalance,
  EnergyMatrixState,
  HiddenStructuralVariables,
  InflationBreakdown,
  LaborMarketState
} from '../models/SimulationTypes.js';
import { clamp, round2 } from './mathUtils.js';

// En Argentina si modelas la inflacion solo como emision monetaria con rezago de 18 meses
// te da cualquier verdura. Aca sumamos los 4 motores reales: inercia paritaria/indexacion,
// pass-through del dolar, tarifazos de regulados y huida de la demanda de dinero.

export function computeInertiaComponent(
  previousInflationPct: number,
  anchorCredibilityIndex: number,
  indecCredibilityIndex: number
): number {
  // Cuando destruis el INDEC la gente indexa contratos mirando consultoras privadas con un margen extra por miedo
  const uncertaintyMarkup = indecCredibilityIndex < 60 ? 0.14 : 0;
  const inertiaWeight = clamp(0.62 - anchorCredibilityIndex * 0.0025 + uncertaintyMarkup, 0.3, 0.82);
  return round2(previousInflationPct * inertiaWeight);
}

export function computePassThroughComponent(
  crawlingPegPct: number,
  exchangeBrechaPct: number,
  anchorCredibilityIndex: number
): number {
  // Si la brecha pasa del 45%, los proveedores ya no miran el dolar oficial para fijar precios de reposicion,
  // empiezan a remarcar mirando el CCL aunque importen al oficial.
  const brechaSpillover = Math.max(0, exchangeBrechaPct - 35) * 0.035;
  const passThroughCoeff = clamp(0.45 - anchorCredibilityIndex * 0.002, 0.18, 0.55);
  return round2(crawlingPegPct * passThroughCoeff + brechaSpillover);
}

export function computeTarifazoComponent(
  previousTariffCoveragePct: number,
  currentTariffCoveragePct: number,
  ypfExportParityActive: boolean
): number {
  const tariffJumpDelta = Math.max(0, currentTariffCoveragePct - previousTariffCoveragePct);
  const fuelPressure = ypfExportParityActive ? 0.35 : 0;
  return round2(tariffJumpDelta * 0.065 + fuelPressure);
}

export function computeMonetaryDropComponent(
  centralBank: CentralBankBalance,
  structural: HiddenStructuralVariables
): number {
  // La tasa real negativa combinada con expectativa de devaluacion hace que la gente queme los pesos
  // (sube la velocidad de circulacion V aunque la Base Monetaria no haya crecido ese mes).
  const monthlyRatePct = centralBank.policyRateAnnualPct / 12;
  const realRateSpread = monthlyRatePct - structural.expectedInflation3mPct / 3;
  const moneyDemandFlight = Math.max(0, -realRateSpread * 0.38);
  const quasiFiscalPressure = (centralBank.remuneratedLiabilitiesBillionArs / Math.max(1, centralBank.monetaryBaseBillionArs)) * 0.45;
  return round2(clamp(moneyDemandFlight + quasiFiscalPressure - structural.anchorCredibilityIndex * 0.015, -0.4, 8.5));
}

export function computeNextInflationBreakdown(
  current: InflationBreakdown,
  centralBank: CentralBankBalance,
  energy: EnergyMatrixState,
  labor: LaborMarketState,
  structural: HiddenStructuralVariables,
  previousTariffCoveragePct: number
): InflationBreakdown {
  const inertiaComponentPp = computeInertiaComponent(
    current.realMonthlyIpcPct,
    structural.anchorCredibilityIndex,
    structural.indecCredibilityIndex
  );
  const passThroughComponentPp = computePassThroughComponent(
    centralBank.crawlingPegMonthlyPct,
    centralBank.exchangeBrechaPct,
    structural.anchorCredibilityIndex
  );
  const tarifazoComponentPp = computeTarifazoComponent(
    previousTariffCoveragePct,
    energy.userTariffCoveragePct,
    energy.ypfPolicy === 'EXPORT_PARITY'
  );
  const monetaryDropComponentPp = computeMonetaryDropComponent(centralBank, structural);

  const realMonthlyIpcPct = round2(
    clamp(inertiaComponentPp + passThroughComponentPp + tarifazoComponentPp + monetaryDropComponentPp, 0.2, 45)
  );

  // Si el gobierno interviene el INDEC (credibilidad < 60), dibuja el numero oficial a la mitad
  const officialIndecIpcPct =
    structural.indecCredibilityIndex < 60 ? round2(Math.min(realMonthlyIpcPct * 0.42, 1.4)) : realMonthlyIpcPct;

  const foodInflationMonthlyPct = round2(clamp(realMonthlyIpcPct + passThroughComponentPp * 0.45, 0.1, 55));
  const interannualIpcPct = round2(clamp(current.interannualIpcPct * 0.88 + realMonthlyIpcPct * 1.95, 4, 420));

  // Separamos Indigencia (CBA = comida) de Pobreza (CBT = comida + tarifas de servicios).
  const wageLagDelta = realMonthlyIpcPct - (labor.realWageIndex - 100) * 0.12;
  const indigenceCbaPct = round2(clamp(current.indigenceCbaPct + (foodInflationMonthlyPct - 2.2) * 0.24, 3.5, 32));
  const povertyCbtPct = round2(
    clamp(current.povertyCbtPct + (wageLagDelta - 2.0) * 0.35 + tarifazoComponentPp * 0.42, 16, 72)
  );

  return {
    inertiaComponentPp,
    passThroughComponentPp,
    tarifazoComponentPp,
    monetaryDropComponentPp,
    realMonthlyIpcPct,
    officialIndecIpcPct,
    privateCongressIpcPct: realMonthlyIpcPct,
    interannualIpcPct,
    foodInflationMonthlyPct,
    povertyCbtPct,
    indigenceCbaPct,
    giniCoefficient: round2(clamp(current.giniCoefficient + (povertyCbtPct - 32) * 0.02, 36, 54))
  };
}

