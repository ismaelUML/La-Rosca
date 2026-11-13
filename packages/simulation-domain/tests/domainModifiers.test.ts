import { describe, expect, it } from 'vitest';
import { advanceSimulationMonth, computeDomainPolicyModifiers } from '@argentina-sim/domain';
import {
  INITIAL_RIGI_SECTORS,
  INITIAL_SECTOR_MEASURES,
  INITIAL_VACANT_CABINET_2027,
  createInitialSimulationState2027
} from '@argentina-sim/infrastructure';

describe('Impacto real de Gabinete, RIGI, Medidas e Impuestos Propios en el motor macro', () => {
  it('proyectos RIGI aprobados suman exportaciones al BCRA, crecimiento del PBI y costo fiscal', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const withRigi = {
      ...base,
      rigiSectors: INITIAL_RIGI_SECTORS.map((s, idx) =>
        idx < 2 ? { ...s, enabledByDecree: true, activeProjectsCount: 2, maturityPct: 80 } : s
      )
    };

    const nextBase = advanceSimulationMonth(base);
    const nextRigi = advanceSimulationMonth(withRigi);

    expect(nextRigi.centralBank.grossReservesBillionUsd).toBeGreaterThan(nextBase.centralBank.grossReservesBillionUsd);
    expect(nextRigi.gdpGrowthAnnualPct).toBeGreaterThan(nextBase.gdpGrowthAnnualPct);
  });

  it('impuestos propios aprobados suman recaudacion y medidas activas modifican gasto e inflacion', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const modified = {
      ...base,
      customTaxes: [
        {
          id: 'TAX_TEST',
          name: 'Tasa Grandes Fortunas',
          articlesText: 'Art 1',
          ratePct: 2,
          estimatedRevenuePctGdp: 0.9,
          approvedByCongress: true
        }
      ],
      measures: INITIAL_SECTOR_MEASURES.slice(0, 3).map((m) => ({
        ...m,
        active: true,
        fiscalCostPctGdp: 0.4,
        inflationEffectPp: 1.5,
        approvalEffectPp: 2.0
      }))
    };

    const nextBase = advanceSimulationMonth(base);
    const nextMod = advanceSimulationMonth(modified);

    expect(nextMod.treasury.revenuePctGdp).toBeGreaterThan(nextBase.treasury.revenuePctGdp);
    expect(nextMod.treasury.primarySpendingPctGdp).toBeGreaterThan(nextBase.treasury.primarySpendingPctGdp);
    expect(nextMod.inflation.realMonthlyIpcPct).toBeGreaterThan(nextBase.inflation.realMonthlyIpcPct);
  });

  it('un gabinete designado y competente mejora capacidad de ejecucion frente a ministerios vacantes', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const vacant = { ...base, ministers: INITIAL_VACANT_CABINET_2027 };
    const fullCabinet = {
      ...base,
      ministers: INITIAL_VACANT_CABINET_2027.map((m) => ({
        ...m,
        ministerName: 'Ministro Designado',
        performance: 82,
        risk: 15
      }))
    };

    const modVacant = computeDomainPolicyModifiers(vacant);
    const modFull = computeDomainPolicyModifiers(fullCabinet);

    expect(modFull.cabinetExecutionIndex!).toBeGreaterThan(modVacant.cabinetExecutionIndex!);
    expect(modFull.cabinetAnchorBonus).toBeGreaterThan(modVacant.cabinetAnchorBonus);
  });
});
