import type { IndicatorPoint, IndicatorSeriesCard, SimulationState } from '@argentina-sim/domain';
import { round2 } from '@argentina-sim/domain';

// Construye las series historicas (dic 26 -> mes actual) para las 13 categorias de indicadores
// organizadas en subfunciones de responsabilidad unica para mantener CC <= 3 en cada bloque.

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
  const coreIpc = round2(state.inflation.realMonthlyIpcPct * 0.88);
  const sipaMillions = round2(6.32 + (8.0 - state.labor.unemploymentPct) * 0.14);
  const cgtConflictScore = round2(
    Math.max(12, Math.min(95, 38 + (100 - state.labor.realWageIndex) * 0.9 + Number(state.labor.activeNationalStrike) * 22))
  );

  return [
    createCard(
      'INF_MENSUAL',
      'PRECIOS',
      'Inflación mensual (IPC General)',
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
      'Inflación interanual acumulada',
      '%',
      33.0,
      state.inflation.interannualIpcPct,
      'pp',
      t,
      'Variación acumulada del nivel general de precios en 12 meses.',
      true
    ),
    createCard(
      'INF_ALIMENTOS',
      'PRECIOS',
      'Inflación de alimentos y bebidas',
      '%',
      2.4,
      state.inflation.foodInflationMonthlyPct,
      'pp',
      t,
      'Impacto directo sobre la Canasta Básica Alimentaria (CBA).',
      true
    ),
    createCard(
      'INF_NUCLEO',
      'PRECIOS',
      'IPC Núcleo (Core sin estacionales)',
      '%',
      1.9,
      coreIpc,
      'pp',
      t,
      'Tendencia subyacente de precios excluyendo tarifas reguladas.',
      true
    ),
    createCard('DESEMPLEO', 'EMPLEO', 'Desempleo abierto (EPH)', '%', 7.6, state.labor.unemploymentPct, 'pp', t, 'Población económicamente activa buscando empleo.', true),
    createCard('INFORMALIDAD', 'EMPLEO', 'Informalidad laboral', '%', 42.0, state.labor.informalityPct, 'pp', t, 'Trabajadores no registrados sin descuentos jubilatorios.', true),
    createCard('EMPLEO_PRIVADO', 'EMPLEO', 'Empleo privado registrado (SIPA)', 'M puestos', 6.28, sipaMillions, 'M', t, 'Puestos formales en empresas privadas declarados en AFIP.'),
    createCard('CONFLICTIVIDAD_GREMIAL', 'EMPLEO', 'Tensión sindical y paros (CGT/CTA)', '/100', 38.0, cgtConflictScore, 'pts', t, 'Probabilidad de huelga general y bloqueos sectoriales.', true)
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
    createCard('ACTIVIDAD_INDUSTRIAL', 'ACTIVIDAD', 'Actividad industrial (EMI)', 'pts', 98.4, indVal, 'pts', t, 'Estimador Mensual Industrial (INDEC base 100).'),
    createCard('PROD_AGRO', 'ACTIVIDAD', 'Producción agropecuaria', 'M Ton', 128.5, agroVal, 'M Ton', t, 'Cosecha fina y gruesa proyectada en la campaña.'),
    createCard('CONSUMO_PRIVADO', 'ACTIVIDAD', 'Consumo privado masivo', 'pts', 101.2, consVal, 'pts', t, 'Ventas en supermercados, autoservicios y shoppings.'),
    createCard('INVERSION', 'ACTIVIDAD', 'Inversión bruta fija (IBIF)', '% PIB', 17.2, invVal, 'pp', t, 'Inversión en maquinaria, equipo productivo y construcción.'),
    createCard('PIB_CREC', 'ACTIVIDAD', 'Crecimiento del PIB', '%', 0.8, state.gdpGrowthAnnualPct, 'pp', t),
    createCard('PIB_NOMINAL', 'ACTIVIDAD', 'PBI nominal anual', 'mil M USD', 690, state.gdpNominalBillionUsd, 'mil M', t, `PIB hoy: ${state.gdpGrowthAnnualPct}% anual.`),
    createCard('CAPACIDAD_INSTALADA', 'ACTIVIDAD', 'Utilización de capacidad industrial', '%', 58.4, capVal, 'pp', t, 'Capacidad instalada fabril operativa.'),
    createCard('CONFIANZA_ECONOMICA', 'ACTIVIDAD', 'Confianza económica', 'pts', 46.5, confVal, 'pts', t, 'Índice de clima de negocios y expectativas.'),
    createCard('PBI_PER_CAPITA', 'ACTIVIDAD', 'PBI per cápita', 'USD', 14850, perCapVal, 'USD', t, 'PBI anual por habitante en dólares.')
  ];
}

function buildIncomeAndSocietyIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const pensionVal = round2(96.0 + (state.labor.realWageIndex - 100) * 0.7 - (state.inflation.realMonthlyIpcPct > 3 ? 2.5 : 0));
  const wageUsd = round2((state.labor.realWageIndex * 11.4) * (1650 / Math.max(900, state.centralBank.cclDollarArs)));
  const middleClassPct = round2(Math.max(24, Math.min(62, 78 - state.inflation.povertyCbtPct * 0.92)));

  return [
    createCard('SALARIO_REAL', 'INGRESOS', 'Salario real (RIPTE)', 'pts', 99.5, state.labor.realWageIndex, 'pts', t, 'Índice base 100 = Diciembre 2027.'),
    createCard('JUBILACION_REAL', 'INGRESOS', 'Jubilación real (Haber mínimo)', 'pts', 96.0, pensionVal, 'pts', t, 'Poder de compra del haber jubilatorio mínimo y bonos.'),
    createCard('SALARIO_USD', 'INGRESOS', 'Salario medio en dólares (CCL)', 'USD', 1080, wageUsd, 'USD', t, 'Remuneración formal promedio medida al dólar financiero.'),
    createCard('POBREZA', 'SOCIEDAD', 'Pobreza urbana (CBT)', '%', 35.8, state.inflation.povertyCbtPct, 'pp', t, 'Población bajo la línea de Canasta Básica Total.', true),
    createCard('INDIGENCIA', 'SOCIEDAD', 'Indigencia (CBA)', '%', 9.2, state.inflation.indigenceCbaPct, 'pp', t, 'Hogares que no cubren la canasta alimentaria básica.', true),
    createCard('GINI', 'SOCIEDAD', 'Desigualdad (Gini × 100)', 'pts', 42.0, state.inflation.giniCoefficient, 'pts', t, 'Coeficiente de concentración del ingreso (0 = igualdad).', true),
    createCard('CLASE_MEDIA', 'SOCIEDAD', 'Estrato de Clase Media (EPH)', '%', 44.5, middleClassPct, 'pp', t, 'Proporción de hogares integrados de ingresos medios.')
  ];
}

function buildSecurityIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const homVal = round2(4.2 + (state.inflation.povertyCbtPct > 40 ? 0.5 : -0.2));
  const robVal = round2(920 + (state.labor.unemploymentPct > 8 ? 75 : -35));

  return [
    createCard('HOMICIDIOS_100K', 'SEGURIDAD', 'Homicidios cada 100.000 hab.', 'tasa', 4.2, homVal, 'pts', t, 'Tasa nacional anualizada cada 100.000 habitantes (SNIC).', true),
    createCard('ROBOS_100K', 'SEGURIDAD', 'Delitos contra la propiedad / 100k', 'tasa', 920, robVal, 'pts', t, 'Denuncias de robos y hurtos urbanos registradas.', true),
    createCard('INSEGURIDAD', 'SEGURIDAD', 'Índice de temor e inseguridad', '/100', 60.6, round2(58 - state.treasury.publicWorksPctGdp * 2), 'pts', t, 'Percepción ciudadana de delito en grandes aglomerados.', true)
  ];
}

function buildExternalSectorIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const expVal = round2(6950 + state.energy.userTariffCoveragePct * 8 + (state.centralBank.cclDollarArs > 1500 ? 350 : 0));
  const impVal = round2(5380 + state.gdpGrowthAnnualPct * 220);
  const balVal = round2(expVal - impVal);
  const tcrVal = round2(100 * (state.centralBank.officialDollarArs / 1450) / (1 + state.inflation.realMonthlyIpcPct / 100));
  const totVal = round2(104.5 + (state.structural.silobolsaStockMillionTons > 15 ? 2.5 : -1.2));

  return [
    createCard('EXPORTACIONES', 'SECTOR_EXTERNO', 'Exportaciones (FOB)', 'M USD/mes', 7120, expVal, 'M USD', t, 'Despachos del complejo agro, energía y manufacturas.'),
    createCard('IMPORTACIONES', 'SECTOR_EXTERNO', 'Importaciones (CIF)', 'M USD/mes', 5450, impVal, 'M USD', t, 'Insumos intermedios, bienes de capital y energía.', true),
    createCard('BALANZA_COMERCIAL', 'SECTOR_EXTERNO', 'Balanza comercial mensual', 'M USD/mes', 1670, balVal, 'M USD', t, 'Superávit o déficit comercial mensual en dólares.'),
    createCard('TIPO_CAMBIO_REAL', 'SECTOR_EXTERNO', 'Tipo de cambio real (ITCRM)', 'pts', 98.0, tcrVal, 'pts', t, 'Competitividad cambiaria multilateral del BCRA (base 100).'),
    createCard('BRECHA', 'SECTOR_EXTERNO', 'Brecha cambiaria (CCL vs Oficial)', '%', 18.0, state.centralBank.exchangeBrechaPct, 'pp', t, undefined, true),
    createCard(
      'RESERVAS_BRUTAS',
      'SECTOR_EXTERNO',
      'Reservas internacionales BCRA',
      'mil M USD',
      42.0,
      state.centralBank.grossReservesBillionUsd,
      'mil M',
      t,
      `Reservas Netas Líquidas reales: ${state.centralBank.netLiquidReservesBillionUsd} mil M USD.`
    ),
    createCard('TERMINOS_INTERCAMBIO', 'SECTOR_EXTERNO', 'Términos de intercambio', 'pts', 104.5, totVal, 'pts', t, 'Poder de compra de las exportaciones frente a importaciones.'),
    createCard('SILOBOLSAS', 'SECTOR_EXTERNO', 'Granos retenidos en Silobolsas', 'M Ton', 16.5, state.structural.silobolsaStockMillionTons, 'M Ton', t, 'Stock retenido por productores esperando liquidar.', true),
    createCard('DOLAR_OFICIAL', 'SECTOR_EXTERNO', 'Dólar oficial mayorista (A3500)', '$', 1450, state.centralBank.officialDollarArs, '$', t),
    createCard('DOLAR_CCL', 'SECTOR_EXTERNO', 'Dólar Contado con Liquidación (CCL)', '$', 1680, state.centralBank.cclDollarArs, '$', t, undefined, true)
  ];
}

function buildFinanceAndPublicFinanceIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const emisionVal = round2(state.centralBank.crawlingPegMonthlyPct * 0.75 + (state.treasury.primaryResultPctGdp < 0 ? 1.2 : 0));
  const debtGdp = round2(Math.max(32, 42.5 - state.treasury.primaryResultPctGdp * 0.9));

  return [
    createCard('EMISION_MONETARIA', 'FINANZAS', 'Emisión monetaria', '% mes', 1.8, emisionVal, 'pp', t, 'Expansión de base monetaria para financiar Tesoro/pasivos.', true),
    createCard('TASA_BCRA', 'FINANZAS', 'Tasa de política monetaria', '% anual', 36, state.centralBank.policyRateAnnualPct, 'pp', t),
    createCard('RIESGO_PAIS', 'FINANZAS', 'Riesgo país (JP Morgan EMBI+)', 'pb', 720, state.countryRiskEmbiPb, 'pb', t, 'Sobretasa de bonos soberanos argentinos sobre el Tesoro de EE.UU.', true),
    createCard('EXPOSICION_BANCOS', 'FINANZAS', 'Exposición bancaria al Tesoro', '% Activo', 48, state.bankingSystem.publicSectorExposurePct, 'pp', t, 'Títulos públicos y LEFI en cartera de los bancos comerciales.', true),
    createCard('DEUDA_PUBLICA', 'FINANZAS_PUBLICAS', 'Deuda pública consolidada', '% PIB', 42.5, debtGdp, 'pp', t, 'Deuda soberana bruta del Tesoro Nacional sobre el PIB.', true),
    createCard('INTERESES_DEUDA', 'FINANZAS_PUBLICAS', 'Carga de intereses de deuda', '% PIB', 0.18, 0.13, 'pp', t, 'Servicio mensual de intereses del Tesoro.', true),
    createCard('RECAUDACION', 'FINANZAS_PUBLICAS', 'Recaudación tributaria nacional', '% PIB', 15.2, state.treasury.revenuePctGdp, 'pp', t, 'Ingresos por IVA, Ganancias, Retenciones y tributos AFIP.'),
    createCard('GASTO_PRIMARIO', 'FINANZAS_PUBLICAS', 'Gasto primario nacional', '% PIB', 16.4, state.treasury.primarySpendingPctGdp, 'pp', t, undefined, true),
    createCard('RESULTADO_FISCAL', 'FINANZAS_PUBLICAS', 'Resultado fiscal primario', '% PIB', 0.3, state.treasury.primaryResultPctGdp, 'pp', t, `Subsidio mensual a CAMMESA: -${state.energy.cammesaMonthlyDeficitMillionUsd} M USD/mes.`)
  ];
}

function buildEnergyAndEducationIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const vacaMuertaBbl = round2(445 + t * 8.5 + (state.countryRiskEmbiPb < 850 ? 28 : 0));
  const energyBal = round2(610 + t * 22 - state.energy.cammesaMonthlyDeficitMillionUsd * 0.45);
  const miningExp = round2(420 + t * 16);
  const eduScore = round2(58.4 + state.treasury.publicWorksPctGdp * 1.8 - (state.inflation.povertyCbtPct - 35) * 0.25);
  const healthIndex = round2(64.0 + (state.labor.realWageIndex - 100) * 0.35);

  return [
    createCard('VACA_MUERTA_CRUDO', 'ENERGIA_Y_MINERIA', 'Producción de crudo Vaca Muerta', 'mil bbl/d', 430, vacaMuertaBbl, 'mil bbl', t, 'Extracción no convencional en la Cuenca Neuquina.'),
    createCard('BALANZA_ENERGETICA', 'ENERGIA_Y_MINERIA', 'Balanza comercial energética', 'M USD/mes', 540, energyBal, 'M USD', t, 'Exportaciones de crudo y gas menos importaciones de GNL.'),
    createCard('COBERTURA_TARIFARIA', 'ENERGIA_Y_MINERIA', 'Cobertura tarifaria eléctrica (CAMMESA)', '%', 68, state.energy.userTariffCoveragePct, 'pp', t, 'Porcentaje del costo mayorista cubierto por la boleta del usuario.'),
    createCard('EXPORT_LITIO_COBRE', 'ENERGIA_Y_MINERIA', 'Exportación minera (Litio y Cobre)', 'M USD/mes', 395, miningExp, 'M USD', t, 'Despachos de carbonato de litio y proyectos metalíferos cordilleranos.'),
    createCard('PRUEBAS_APRENDER', 'EDUCACION_Y_SALUD', 'Índice de desempeño educativo (Aprender)', '/100', 57.5, eduScore, 'pts', t, 'Comprensión lectora y resolución matemática en nivel secundario.'),
    createCard('COBERTURA_SALUD', 'EDUCACION_Y_SALUD', 'Capacidad sanitaria y acceso a salud', '/100', 63.0, healthIndex, 'pts', t, 'Abastecimiento hospitalario, obras sociales sindicales y prepagas.')
  ];
}

function buildOpinionAndDefenseIndicators(state: SimulationState, t: number): IndicatorSeriesCard[] {
  const defVal = round2(58 + state.treasury.primaryResultPctGdp * 2.5);
  const borderVal = round2(61 + state.treasury.publicWorksPctGdp * 1.9);

  return [
    createCard('APROBACION', 'OPINION_PUBLICA', 'Imagen positiva presidencial', '%', 51.2, state.publicOpinion.presidentialPersonalImagePct, 'pp', t, `Expectativa a 12 meses: ${state.publicOpinion.expectation12MonthsPct}%.`),
    createCard('APROBACION_GESTION', 'OPINION_PUBLICA', 'Aprobación de la gestión de Gobierno', '%', 49.0, state.publicOpinion.managementApprovalPct, 'pp', t, 'Evaluación ciudadana del rumbo económico e institucional.'),
    createCard('EXPECTATIVA_12M', 'OPINION_PUBLICA', 'Índice de optimismo a 12 meses', '%', 53.0, state.publicOpinion.expectation12MonthsPct, 'pp', t, 'Hogares que creen que la economía estará mejor dentro de un año.'),
    createCard('ALISTAMIENTO_FFAA', 'DEFENSA', 'Alistamiento operativo de las FF.AA.', '%', 54.0, defVal, 'pp', t, 'Equipamiento, horas de vuelo/navegación y ejecución del FONDEF.'),
    createCard('CONTROL_FRONTERAS', 'DEFENSA', 'Radarización Norte y Patrullaje Milla 200', '%', 59.0, borderVal, 'pp', t, 'Vigilancia aeroespacial SINVICA y control pesquero en el Atlántico Sur.')
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
    ...buildEnergyAndEducationIndicators(state, t),
    ...buildOpinionAndDefenseIndicators(state, t)
  ];
}
