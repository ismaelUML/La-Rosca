import type { IndicatorPoint, IndicatorSeriesCard, SimulationState } from '@argentina-sim/domain';
import { round2 } from '@argentina-sim/domain';

// Construye las series historicas (dic 26 -> mes actual) para las 11 categorias de indicadores
// exactamente como se ven en las tarjetas con graficos naranjas/verdes de la captura.

function buildSyntheticCurve(baseStart: number, currentVal: number, turnMonth: number): IndicatorPoint[] {
  const labels = ['dic 26', 'abr 27', 'ago 27', 'dic 27', 'abr 28', 'ago 28', 'nov 28'];
  const totalSteps = Math.max(7, Math.min(12, 6 + turnMonth));
  const points: IndicatorPoint[] = [];

  for (let i = 0; i < totalSteps; i += 1) {
    const t = i / (totalSteps - 1);
    const wave = Math.sin(i * 1.1) * (baseStart - currentVal) * 0.12;
    const interpolated = round2(baseStart + (currentVal - baseStart) * t + (i === totalSteps - 1 ? 0 : wave));
    const label = labels[i] ?? `mes +${i}`;
    points.push({ label, value: interpolated });
  }
  return points;
}

function createCard(
  id: string,
  category: IndicatorSeriesCard['category'],
  title: string,
  unit: string,
  startVal: number,
  currentValue: number,
  variationUnit: string,
  turnMonth: number,
  subtitle?: string,
  invertColorLogic?: boolean
): IndicatorSeriesCard {
  const points = buildSyntheticCurve(startVal, currentValue, turnMonth);
  const values = points.map((p) => p.value);
  const prev = points[points.length - 2]?.value ?? startVal;
  const monthlyVariation = round2(currentValue - prev);

  return {
    id,
    category,
    title,
    unit,
    currentValue: round2(currentValue),
    monthlyVariation,
    variationUnit,
    minValue: round2(Math.min(...values)),
    maxValue: round2(Math.max(...values)),
    subtitle,
    invertColorLogic,
    points
  };
}

export function buildIndicatorsCatalog(state: SimulationState): IndicatorSeriesCard[] {
  const t = state.turnMonth;
  return [
    createCard(
      'INF_MENSUAL',
      'PRECIOS',
      'Inflación mensual',
      '%',
      2.1,
      state.inflation.realMonthlyIpcPct,
      'pp',
      t,
      `INDEC Oficial: ${state.inflation.officialIndecIpcPct}% · Alimentos: ${state.inflation.foodInflationMonthlyPct}%`,
      true
    ),
    createCard(
      'INF_INTERANUAL',
      'PRECIOS',
      'Inflación interanual',
      '%',
      33.0,
      state.inflation.interannualIpcPct,
      'pp',
      t,
      'Acumulado de los últimos 12 meses.',
      true
    ),
    createCard('DESEMPLEO', 'EMPLEO', 'Desempleo', '%', 7.6, state.labor.unemploymentPct, 'pp', t, undefined, true),
    createCard('INFORMALIDAD', 'EMPLEO', 'Informalidad laboral', '%', 42.0, state.labor.informalityPct, 'pp', t, 'Trabajadores en negro sin aportes a ANSES.', true),
    createCard('PIB_CREC', 'ACTIVIDAD', 'Crecimiento del PIB', '%', 0.8, state.gdpGrowthAnnualPct, 'pp', t),
    createCard(
      'PIB_NOMINAL',
      'ACTIVIDAD',
      'PBI nominal anual',
      'mil M USD',
      690,
      state.gdpNominalBillionUsd,
      'mil M',
      t,
      `Crecimiento del PIB hoy: ${state.gdpGrowthAnnualPct}% anual.`
    ),
    createCard('SALARIO_REAL', 'INGRESOS', 'Salario real', 'pts', 99.5, state.labor.realWageIndex, 'pts', t, 'Índice base 100 = Diciembre 2027.'),
    createCard('POBREZA', 'SOCIEDAD', 'Pobreza (CBT)', '%', 35.8, state.inflation.povertyCbtPct, 'pp', t, undefined, true),
    createCard('INDIGENCIA', 'SOCIEDAD', 'Indigencia (CBA)', '%', 9.2, state.inflation.indigenceCbaPct, 'pp', t, undefined, true),
    createCard('GINI', 'SOCIEDAD', 'Desigualdad (Gini × 100)', 'pts', 42.0, state.inflation.giniCoefficient, 'pts', t, undefined, true),
    createCard('INSEGURIDAD', 'SEGURIDAD', 'Índice de inseguridad', '/100', 60.6, round2(58 - state.treasury.publicWorksPctGdp * 2), 'pts', t, undefined, true),
    createCard('SILOBOLSAS', 'SECTOR_EXTERNO', 'Stock retenido en Silobolsas', 'M Ton', 16.5, state.structural.silobolsaStockMillionTons, 'M Ton', t, 'Soja y maíz sin liquidar esperando tipo de cambio.'),
    createCard('DOLAR_OFICIAL', 'SECTOR_EXTERNO', 'Dólar oficial mayorista', '$', 1450, state.centralBank.officialDollarArs, '$', t),
    createCard('DOLAR_CCL', 'SECTOR_EXTERNO', 'Dólar Contado con Liquidación (CCL)', '$', 1680, state.centralBank.cclDollarArs, '$', t, undefined, true),
    createCard('BRECHA', 'SECTOR_EXTERNO', 'Brecha cambiaria', '%', 18.0, state.centralBank.exchangeBrechaPct, 'pp', t, undefined, true),
    createCard(
      'RESERVAS_BRUTAS',
      'SECTOR_EXTERNO',
      'Reservas internacionales brutas',
      'mil M USD',
      42.0,
      state.centralBank.grossReservesBillionUsd,
      'mil M',
      t,
      `Reservas Netas Líquidas reales: ${state.centralBank.netLiquidReservesBillionUsd} mil M USD.`
    ),
    createCard('TASA_BCRA', 'FINANZAS', 'Tasa de interés de política monetaria', '% anual', 36, state.centralBank.policyRateAnnualPct, 'pp', t),
    createCard('RIESGO_PAIS', 'FINANZAS', 'Riesgo país (EMBI+)', 'pb', 720, state.countryRiskEmbiPb, 'pb', t, undefined, true),
    createCard('EXPOSICION_BANCOS', 'FINANZAS', 'Exposición bancaria al Sector Público', '% Activo', 48, state.bankingSystem.publicSectorExposurePct, 'pp', t, 'Títulos del Tesoro + LEFI en balance de bancos privados.', true),
    createCard('RECAUDACION', 'FINANZAS_PUBLICAS', 'Recaudación nacional neta', '% PIB', 15.2, state.treasury.revenuePctGdp, 'pp', t),
    createCard('GASTO_PRIMARIO', 'FINANZAS_PUBLICAS', 'Gasto primario nacional', '% PIB', 16.4, state.treasury.primarySpendingPctGdp, 'pp', t, undefined, true),
    createCard(
      'RESULTADO_FISCAL',
      'FINANZAS_PUBLICAS',
      'Resultado fiscal primario',
      '% PIB',
      0.3,
      state.treasury.primaryResultPctGdp,
      'pp',
      t,
      `Subsidio mensual a CAMMESA: -${state.energy.cammesaMonthlyDeficitMillionUsd} M USD/mes.`
    ),
    createCard('APROBACION', 'OPINION_PUBLICA', 'Aprobación (imagen positiva)', '%', 51.2, state.publicOpinion.presidentialPersonalImagePct, 'pp', t, `Expectativa a 12 meses: ${state.publicOpinion.expectation12MonthsPct}%.`),
    createCard('ALISTAMIENTO_FFAA', 'DEFENSA', 'Alistamiento y Soberanía Atlántico Sur', '%', 54.0, round2(58 + state.treasury.primaryResultPctGdp * 2.5), 'pp', t, 'Patrullaje Milla 200, Radarización Norte y FONDEF.')
  ];
}
