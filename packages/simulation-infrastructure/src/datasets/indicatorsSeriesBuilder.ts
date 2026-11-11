import type { IndicatorPoint, IndicatorSeriesCard, SimulationState } from '@argentina-sim/domain';
import { round2 } from '@argentina-sim/domain';

// Construye las series históricas (dic 26 -> mes actual) para las 11 categorías de indicadores
// organizadas en subfunciones de responsabilidad única para mantener CC <= 3 en cada bloque.

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

function buildPricesAndEmploymentIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
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
    createCard('INFORMALIDAD', 'EMPLEO', 'Informalidad laboral', '%', 42.0, state.labor.informalityPct, 'pp', t, 'Trabajadores en negro sin aportes a ANSES.', true)
  ];
}

function buildActivityIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const indVal = round2(98.4 + state.gdpGrowthAnnualPct * 1.6);
  const agroVal = round2(128.0 + (state.structural.silobolsaStockMillionTons > 15 ? 4.5 : -2.0));
  const consVal = round2(100.0 + (state.labor.realWageIndex - 100) * 0.85);
  const invVal = round2(17.2 + (state.countryRiskEmbiPb < 800 ? 1.4 : -0.9));
  const capVal = round2(58.5 + state.gdpGrowthAnnualPct * 1.1);
  const confVal = round2(46.0 + state.publicOpinion.expectation12MonthsPct * 0.32);
  const perCapVal = round2((state.gdpNominalBillionUsd * 1000) / 46.5);

  return [
    createCard('ACTIVIDAD_INDUSTRIAL', 'ACTIVIDAD', 'Actividad industrial', 'pts', 98.4, indVal, 'pts', t, 'Estimador Mensual Industrial (INDEC base 100).'),
    createCard('PROD_AGRO', 'ACTIVIDAD', 'Producción agropecuaria', 'M Ton', 128.5, agroVal, 'M Ton', t, 'Cosecha fina y gruesa proyectada en la campaña.'),
    createCard('CONSUMO_PRIVADO', 'ACTIVIDAD', 'Consumo privado', 'pts', 101.2, consVal, 'pts', t, 'Ventas en supermercados, autoservicios y shoppings.'),
    createCard('INVERSION', 'ACTIVIDAD', 'Inversión', '% PIB', 17.2, invVal, 'pp', t, 'Inversión bruta interna fija (maquinaria y construcción).'),
    createCard('PIB_CREC', 'ACTIVIDAD', 'Crecimiento del PIB', '%', 0.8, state.gdpGrowthAnnualPct, 'pp', t),
    createCard('PIB_NOMINAL', 'ACTIVIDAD', 'PBI nominal anual', 'mil M USD', 690, state.gdpNominalBillionUsd, 'mil M', t, `PIB hoy: ${state.gdpGrowthAnnualPct}% anual.`),
    createCard('CAPACIDAD_INSTALADA', 'ACTIVIDAD', 'Utilización de la capacidad industrial', '%', 58.4, capVal, 'pp', t, 'Capacidad instalada fabril operativa.'),
    createCard('CONFIANZA_ECONOMICA', 'ACTIVIDAD', 'Confianza económica', 'pts', 46.5, confVal, 'pts', t, 'Índice de clima de negocios y expectativas.'),
    createCard('PBI_PER_CAPITA', 'ACTIVIDAD', 'PBI per cápita', 'USD', 14850, perCapVal, 'USD', t, 'PBI anual por habitante en dólares.')
  ];
}

function buildIncomeAndSocietyIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const pensionVal = round2(96.0 + (state.labor.realWageIndex - 100) * 0.7 - (state.inflation.realMonthlyIpcPct > 3 ? 2.5 : 0));

  return [
    createCard('SALARIO_REAL', 'INGRESOS', 'Salario real', 'pts', 99.5, state.labor.realWageIndex, 'pts', t, 'Índice base 100 = Diciembre 2027.'),
    createCard('JUBILACION_REAL', 'INGRESOS', 'Jubilación real', 'pts', 96.0, pensionVal, 'pts', t, 'Poder de compra del haber jubilatorio mínimo y bonos.'),
    createCard('POBREZA', 'SOCIEDAD', 'Pobreza (CBT)', '%', 35.8, state.inflation.povertyCbtPct, 'pp', t, undefined, true),
    createCard('INDIGENCIA', 'SOCIEDAD', 'Indigencia (CBA)', '%', 9.2, state.inflation.indigenceCbaPct, 'pp', t, undefined, true),
    createCard('GINI', 'SOCIEDAD', 'Desigualdad (Gini × 100)', 'pts', 42.0, state.inflation.giniCoefficient, 'pts', t, undefined, true)
  ];
}

function buildSecurityIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const homVal = round2(4.2 + (state.inflation.povertyCbtPct > 40 ? 0.5 : -0.2));
  const robVal = round2(920 + (state.labor.unemploymentPct > 8 ? 75 : -35));

  return [
    createCard('HOMICIDIOS_100K', 'SEGURIDAD', 'Homicidios cada 100.000 habitantes', 'tasa', 4.2, homVal, 'pts', t, 'Tasa nacional anualizada cada 100.000 hab.', true),
    createCard('ROBOS_100K', 'SEGURIDAD', 'Denuncias de robo cada 100.000 habitantes', 'tasa', 920, robVal, 'pts', t, 'Delitos contra la propiedad y asaltos registrados.', true),
    createCard('INSEGURIDAD', 'SEGURIDAD', 'Índice de inseguridad', '/100', 60.6, round2(58 - state.treasury.publicWorksPctGdp * 2), 'pts', t, undefined, true)
  ];
}

function buildExternalSectorIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const expVal = round2(6950 + state.energy.userTariffCoveragePct * 8 + (state.centralBank.cclDollarArs > 1500 ? 350 : 0));
  const impVal = round2(5380 + state.gdpGrowthAnnualPct * 220);
  const balVal = round2(expVal - impVal);
  const tcrVal = round2(100 * (state.centralBank.officialDollarArs / 1450) / (1 + state.inflation.realMonthlyIpcPct / 100));
  const totVal = round2(104.5 + (state.structural.silobolsaStockMillionTons > 15 ? 2.5 : -1.2));

  return [
    createCard('EXPORTACIONES', 'SECTOR_EXTERNO', 'Exportaciones', 'M USD/mes', 7120, expVal, 'M USD', t, 'Despachos del complejo agro, energía y manufacturas.'),
    createCard('IMPORTACIONES', 'SECTOR_EXTERNO', 'Importaciones', 'M USD/mes', 5450, impVal, 'M USD', t, 'Insumos intermedios, bienes de capital y energía.', true),
    createCard('BALANZA_COMERCIAL', 'SECTOR_EXTERNO', 'Balanza comercial', 'M USD/mes', 1670, balVal, 'M USD', t, 'Superávit comercial mensual en dólares.'),
    createCard('TIPO_CAMBIO_REAL', 'SECTOR_EXTERNO', 'Tipo de cambio real', 'pts', 98.0, tcrVal, 'pts', t, 'Competitividad cambiaria multilateral (base 100).'),
    createCard('BRECHA', 'SECTOR_EXTERNO', 'Brecha cambiaria', '%', 18.0, state.centralBank.exchangeBrechaPct, 'pp', t, undefined, true),
    createCard(
      'RESERVAS_BRUTAS',
      'SECTOR_EXTERNO',
      'Reservas internacionales',
      'mil M USD',
      42.0,
      state.centralBank.grossReservesBillionUsd,
      'mil M',
      t,
      `Reservas Netas Líquidas reales: ${state.centralBank.netLiquidReservesBillionUsd} mil M USD.`
    ),
    createCard('TERMINOS_INTERCAMBIO', 'SECTOR_EXTERNO', 'Términos de intercambio', 'pts', 104.5, totVal, 'pts', t, 'Poder de compra de las exportaciones frente a importaciones.'),
    createCard('SILOBOLSAS', 'SECTOR_EXTERNO', 'Stock retenido en Silobolsas', 'M Ton', 16.5, state.structural.silobolsaStockMillionTons, 'M Ton', t, 'Granos retenidos por productores esperando tipo de cambio.'),
    createCard('DOLAR_OFICIAL', 'SECTOR_EXTERNO', 'Dólar oficial mayorista', '$', 1450, state.centralBank.officialDollarArs, '$', t),
    createCard('DOLAR_CCL', 'SECTOR_EXTERNO', 'Dólar Contado con Liquidación (CCL)', '$', 1680, state.centralBank.cclDollarArs, '$', t, undefined, true)
  ];
}

function buildFinanceAndPublicFinanceIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const emisionVal = round2(state.centralBank.crawlingPegMonthlyPct * 0.75 + (state.treasury.primaryResultPctGdp < 0 ? 1.2 : 0));

  return [
    createCard('EMISION_MONETARIA', 'FINANZAS', 'Emisión monetaria', '% mes', 1.8, emisionVal, 'pp', t, 'Expansión de base monetaria para financiar Tesoro/pasivos.', true),
    createCard('TASA_BCRA', 'FINANZAS', 'Tasa de política monetaria', '% anual', 36, state.centralBank.policyRateAnnualPct, 'pp', t),
    createCard('RIESGO_PAIS', 'FINANZAS', 'Riesgo país (EMBI+)', 'pb', 720, state.countryRiskEmbiPb, 'pb', t, undefined, true),
    createCard('EXPOSICION_BANCOS', 'FINANZAS', 'Exposición bancaria al Sector Público', '% Activo', 48, state.bankingSystem.publicSectorExposurePct, 'pp', t, 'Títulos del Tesoro y LEFI en cartera bancaria.', true),
    createCard('DEUDA_PUBLICA', 'FINANZAS_PUBLICAS', 'Deuda pública', '% PIB', 42.5, 40.9, 'pp', t, 'Deuda soberana bruta consolidada sobre el PIB.', true),
    createCard('INTERESES_DEUDA', 'FINANZAS_PUBLICAS', 'Intereses de la deuda', '% PIB', 0.18, 0.13, 'pp', t, 'Servicio mensual de intereses del Tesoro (≈ 72 M USD/mes).', true),
    createCard('RECAUDACION', 'FINANZAS_PUBLICAS', 'Recaudación nacional neta', '% PIB', 15.2, state.treasury.revenuePctGdp, 'pp', t),
    createCard('GASTO_PRIMARIO', 'FINANZAS_PUBLICAS', 'Gasto primario nacional', '% PIB', 16.4, state.treasury.primarySpendingPctGdp, 'pp', t, undefined, true),
    createCard('RESULTADO_FISCAL', 'FINANZAS_PUBLICAS', 'Resultado fiscal primario', '% PIB', 0.3, state.treasury.primaryResultPctGdp, 'pp', t, `Subsidio mensual a CAMMESA: -${state.energy.cammesaMonthlyDeficitMillionUsd} M USD/mes.`)
  ];
}

export function buildIndicatorsCatalog(state: SimulationState): IndicatorSeriesCard[] {
  const t = state.turnMonth;
  return [
    ...buildPricesAndEmploymentIndicators(state, t),
    ...buildActivityIndicators(state, t),
    ...buildIncomeAndSocietyIndicators(state, t),
    ...buildSecurityIndicators(state, t),
    ...buildExternalSectorIndicators(state, t),
    ...buildFinanceAndPublicFinanceIndicators(state, t),
    createCard('APROBACION', 'OPINION_PUBLICA', 'Aprobación (imagen positiva)', '%', 51.2, state.publicOpinion.presidentialPersonalImagePct, 'pp', t, `Expectativa a 12 meses: ${state.publicOpinion.expectation12MonthsPct}%.`),
    createCard('ALISTAMIENTO_FFAA', 'DEFENSA', 'Alistamiento y Soberanía Atlántico Sur', '%', 54.0, round2(58 + state.treasury.primaryResultPctGdp * 2.5), 'pp', t, 'Patrullaje Milla 200, Radarización Norte y FONDEF.')
  ];
}
