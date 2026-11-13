import type { SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

export interface DomainPolicyModifiers {
  rigiMonthlyExportsBillionUsd: number;
  rigiGdpGrowthBoostPp: number;
  rigiFiscalCostPctGdp: number;
  measuresFiscalCostPctGdp: number;
  measuresInflationDeltaPp: number;
  measuresApprovalDeltaPp: number;
  customTaxesRevenuePctGdp: number;
  cabinetExecutionIndex: number | null;
  cabinetAnchorBonus: number;
}

function computeRigiModifiers(state: SimulationState): Pick<
  DomainPolicyModifiers,
  'rigiMonthlyExportsBillionUsd' | 'rigiGdpGrowthBoostPp' | 'rigiFiscalCostPctGdp'
> {
  const sectors = state.rigiSectors;
  if (!sectors || sectors.length === 0) {
    return { rigiMonthlyExportsBillionUsd: 0, rigiGdpGrowthBoostPp: 0, rigiFiscalCostPctGdp: 0 };
  }
  let exports = 0;
  let gdpBoost = 0;
  let fiscalCost = 0;
  for (const s of sectors) {
    if (s.activeProjectsCount <= 0) continue;
    const scale = Math.min(1.5, s.activeProjectsCount * 0.35);
    const maturity = Math.max(0.25, s.maturityPct / 100);
    exports += (s.exportsBillionUsd / 12) * scale * maturity;
    gdpBoost += s.regimeInvestmentPpGdp * scale * 0.45;
    fiscalCost += s.fiscalCostPctGdp * Math.min(1.5, s.activeProjectsCount * 0.25);
  }
  return {
    rigiMonthlyExportsBillionUsd: round2(exports),
    rigiGdpGrowthBoostPp: round2(gdpBoost),
    rigiFiscalCostPctGdp: round2(fiscalCost)
  };
}

function computeMeasuresModifiers(state: SimulationState): Pick<
  DomainPolicyModifiers,
  'measuresFiscalCostPctGdp' | 'measuresInflationDeltaPp' | 'measuresApprovalDeltaPp'
> {
  const active = (state.measures ?? []).filter((m) => m.active);
  if (active.length === 0) {
    return { measuresFiscalCostPctGdp: 0, measuresInflationDeltaPp: 0, measuresApprovalDeltaPp: 0 };
  }
  let fiscalCost = 0;
  let infl = 0;
  let approval = 0;
  for (const m of active) {
    fiscalCost += m.fiscalCostPctGdp;
    infl += m.inflationEffectPp * 0.15;
    approval += m.approvalEffectPp * 0.2;
  }
  return {
    measuresFiscalCostPctGdp: round2(fiscalCost),
    measuresInflationDeltaPp: round2(clamp(infl, -1.5, 2.5)),
    measuresApprovalDeltaPp: round2(clamp(approval, -2.5, 2.5))
  };
}

function isMinisterVacant(ministerName: string): boolean {
  return !ministerName || ministerName.toLowerCase().includes('vacante');
}

function computeCabinetModifiers(state: SimulationState): Pick<
  DomainPolicyModifiers,
  'cabinetExecutionIndex' | 'cabinetAnchorBonus'
> {
  const ministers = state.ministers;
  if (!ministers || ministers.length === 0) {
    return { cabinetExecutionIndex: null, cabinetAnchorBonus: 0 };
  }
  const appointed = ministers.filter((m) => !isMinisterVacant(m.ministerName));
  const avgPerf = appointed.reduce((acc, m) => acc + m.performance, 0) / ministers.length;
  const avgRisk = appointed.length > 0 ? appointed.reduce((acc, m) => acc + m.risk, 0) / appointed.length : 45;
  return {
    cabinetExecutionIndex: round2(clamp(avgPerf, 20, 98)),
    cabinetAnchorBonus: round2(clamp((avgPerf - 55) * 0.025 - Math.max(0, avgRisk - 40) * 0.03, -2.2, 1.5))
  };
}

export function computeDomainPolicyModifiers(state: SimulationState): DomainPolicyModifiers {
  const customTaxesRevenuePctGdp = round2(
    (state.customTaxes ?? []).filter((t) => t.approvedByCongress).reduce((acc, t) => acc + t.estimatedRevenuePctGdp, 0)
  );
  return {
    ...computeRigiModifiers(state),
    ...computeMeasuresModifiers(state),
    ...computeCabinetModifiers(state),
    customTaxesRevenuePctGdp
  };
}
