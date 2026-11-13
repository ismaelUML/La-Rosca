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

export function computeInterannualFromHistory(history: number[]): number {
  if (history.length === 0) return 33.0;
  let product = 1;
  const recent = history.slice(-12);
  for (const m of recent) {
    product *= 1 + m / 100;
  }
  if (recent.length < 12) {
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    for (let i = recent.length; i < 12; i++) {
      product *= 1 + avg / 100;
    }
  }
  return round2(clamp((product - 1) * 100, 3.0, 999.0));
}

function computeInertiaWeight(
  anchorCredibility: number,
  indecCredibility: number,
  inertiaFloor = 0.52
): number {
  const markup = indecCredibility < 60 ? 0.14 : 0;
  return clamp(0.72 - anchorCredibility * 0.0024 + markup, inertiaFloor, 0.9);
}

function computeSmoothedHistoryValue(history: number[], fallback: number): number {
  const slice = history.slice(-3);
  if (slice.length === 0) return fallback;
  const sum = slice.reduce((acc, val, idx) => acc + val * (idx + 1), 0);
  const weightSum = slice.reduce((acc, _, idx) => acc + (idx + 1), 0);
  return sum / weightSum;
}

export function computeInertiaFromHistory(
  history: number[],
  fallbackVal: number,
  anchorCredibilityIndex: number,
  indecCredibilityIndex: number,
  inertiaFloor = 0.55
): number {
  const weight = computeInertiaWeight(anchorCredibilityIndex, indecCredibilityIndex, inertiaFloor);
  const smoothed = computeSmoothedHistoryValue(history, fallbackVal);
  return round2(smoothed * weight);
}

function updateExchangeAndPriceLevel(
  prevTcReal: number,
  prevPriceLevel: number,
  crawlingPegPct: number,
  realMonthlyIpcPct: number
): { tcReal: number; priceLevel: number } {
  const devalRate = crawlingPegPct / 100;
  const inflRate = realMonthlyIpcPct / 100;
  const realMultiplier = (1 + devalRate) / (1 + inflRate + 0.0025);
  const tcReal = round2(clamp(prevTcReal * realMultiplier, 25, 250));
  const priceLevel = round2(prevPriceLevel * (1 + inflRate));
  return { tcReal, priceLevel };
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

export interface InflationStepOptions {
  inertiaFloor?: number;
  fiscalDeficitPctGdp?: number;
  deficitMonetizationMult?: number;
}

export function computeMonetaryDropComponent(
  centralBank: CentralBankBalance,
  structural: HiddenStructuralVariables,
  fiscalDeficitPctGdp = 0,
  deficitMonetizationMult = 1.0
): number {
  // La tasa real negativa combinada con expectativa de devaluacion hace que la gente queme los pesos
  // (sube la velocidad de circulacion V aunque la Base Monetaria no haya crecido ese mes).
  const monthlyRatePct = centralBank.policyRateAnnualPct / 12;
  const realRateSpread = monthlyRatePct - structural.expectedInflation3mPct / 3;
  const moneyDemandFlight = Math.max(0, -realRateSpread * 0.36);
  const quasiFiscalPressure = (centralBank.remuneratedLiabilitiesBillionArs / Math.max(1, centralBank.monetaryBaseBillionArs)) * 0.42;
  const fiscalPressure = Math.max(0, fiscalDeficitPctGdp) * 0.55 * deficitMonetizationMult;
  const reservePanic = Math.min(2.2, Math.max(0, -centralBank.netLiquidReservesBillionUsd) * 0.055);
  return round2(
    clamp(moneyDemandFlight + quasiFiscalPressure + fiscalPressure + reservePanic - structural.anchorCredibilityIndex * 0.014, -0.2, 16.0)
  );
}

function resolveOfficialIndecIpc(realMonthlyIpcPct: number, indecCredibilityIndex: number): number {
  return indecCredibilityIndex < 60 ? round2(Math.min(realMonthlyIpcPct * 0.42, 1.4)) : realMonthlyIpcPct;
}

export function computeNextInflationBreakdown(
  current: InflationBreakdown,
  centralBank: CentralBankBalance,
  energy: EnergyMatrixState,
  labor: LaborMarketState,
  structural: HiddenStructuralVariables,
  previousTariffCoveragePct: number,
  options: InflationStepOptions = {}
): InflationBreakdown {
  const currentHist = current.inflHist ?? [current.realMonthlyIpcPct];
  const inertiaComponentPp = computeInertiaFromHistory(
    currentHist,
    current.realMonthlyIpcPct,
    structural.anchorCredibilityIndex,
    structural.indecCredibilityIndex,
    options.inertiaFloor
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
  const monetaryDropComponentPp = computeMonetaryDropComponent(
    centralBank,
    structural,
    options.fiscalDeficitPctGdp,
    options.deficitMonetizationMult
  );

  const realMonthlyIpcPct = round2(
    clamp(inertiaComponentPp + passThroughComponentPp + tarifazoComponentPp + monetaryDropComponentPp, 0.2, 45)
  );

  const nextHist = [...currentHist, realMonthlyIpcPct].slice(-12);
  const interannualIpcPct = computeInterannualFromHistory(nextHist);
  const officialIndecIpcPct = resolveOfficialIndecIpc(realMonthlyIpcPct, structural.indecCredibilityIndex);

  const foodInflationMonthlyPct = round2(clamp(realMonthlyIpcPct + passThroughComponentPp * 0.45, 0.1, 55));

  // Separamos Indigencia (CBA = comida) de Pobreza (CBT = comida + tarifas de servicios).
  const wageLagDelta = realMonthlyIpcPct - (labor.realWageIndex - 100) * 0.12;
  const indigenceCbaPct = round2(clamp(current.indigenceCbaPct + (foodInflationMonthlyPct - 2.2) * 0.24, 3.5, 32));
  const povertyCbtPct = round2(
    clamp(current.povertyCbtPct + (wageLagDelta - 2.0) * 0.35 + tarifazoComponentPp * 0.42, 16, 72)
  );

  const { tcReal, priceLevel } = updateExchangeAndPriceLevel(
    current.tcReal ?? 100,
    current.priceLevel ?? 100,
    centralBank.crawlingPegMonthlyPct,
    realMonthlyIpcPct
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
    giniCoefficient: round2(clamp(current.giniCoefficient + (povertyCbtPct - 32) * 0.02, 36, 54)),
    inflHist: nextHist,
    tcReal,
    priceLevel
  };
}

