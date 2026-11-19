import type {
  IndicatorPoint,
  IndicatorSeriesCard,
  MonthlyHistorySnapshot,
  SimulationState
} from '@argentina-sim/domain';
import { round2 } from '@argentina-sim/domain';

// Construye las series historicas para las 13 categorias de indicadores:
// cuando existen snapshots reales de la partida (historySnapshots) grafica los datos
// exactos mes a mes; en el turno 1 arranca con base pre-asuncion limpia sin fechas futuras falsas.

const SNAPSHOT_EXTRACTORS: Record<string, (s: MonthlyHistorySnapshot) => number> = {
  INF_MENSUAL: (s) => s.monthlyIpcPct,
  INF_INTERANUAL: (s) => s.interannualIpcPct,
  INF_ALIMENTOS: (s) => s.foodInflationPct,
  INF_NUCLEO: (s) => round2(s.monthlyIpcPct * 0.88),
  DESEMPLEO: (s) => s.unemploymentPct,
  INFORMALIDAD: (s) => s.informalityPct,
  EMPLEO_PRIVADO: (s) => round2(6.32 + (8.0 - s.unemploymentPct) * 0.14),
  PIB_CREC: (s) => s.gdpGrowthPct,
  PIB_NOMINAL: (s) => s.gdpNominalUsdB,
  SALARIO_REAL: (s) => s.realWageIndex,
  POBREZA: (s) => s.povertyPct,
  INDIGENCIA: (s) => s.indigencePct,
  GINI: (s) => s.giniCoefficient,
  BRECHA: (s) => s.brechaPct,
  RESERVAS_BRUTAS: (s) => s.grossReservesUsdB,
  DOLAR_OFICIAL: (s) => s.officialDollarArs,
  DOLAR_CCL: (s) => s.cclDollarArs,
  TASA_BCRA: (s) => s.policyRatePct,
  RIESGO_PAIS: (s) => s.countryRiskPb,
  RECAUDACION: (s) => s.revenuePctGdp,
  GASTO_PRIMARIO: (s) => s.primarySpendingPctGdp,
  RESULTADO_FISCAL: (s) => s.primaryResultPctGdp,
  COBERTURA_TARIFARIA: (s) => s.tariffCoveragePct,
  APROBACION: (s) => s.personalImagePct,
  APROBACION_GESTION: (s) => s.approvalPct,
  EXPECTATIVA_12M: (s) => s.expectation12mPct
};

const PRE_TERM_LABELS = ['dic 26', 'feb 27', 'abr 27', 'jun 27', 'ago 27', 'oct 27', 'dic 27'] as const;

function buildBaselinePoints(baseStart: number, currentVal: number): IndicatorPoint[] {
  const total = PRE_TERM_LABELS.length;
  return PRE_TERM_LABELS.map((label, i) => {
    const t = i / (total - 1);
    const value = round2(baseStart + (currentVal - baseStart) * t);
    return { label, value };
  });
}

function buildPointsFromSnapshots(
  id: string,
  baseStart: number,
  currentVal: number,
  snapshots?: MonthlyHistorySnapshot[]
): IndicatorPoint[] {
  const extractor = SNAPSHOT_EXTRACTORS[id];
  if (!snapshots || snapshots.length < 2 || !extractor) {
    return buildBaselinePoints(baseStart, currentVal);
  }
  const preTerm = buildBaselinePoints(baseStart, extractor(snapshots[0]!)).slice(0, 5);
  const realPoints = snapshots.map((s) => ({ label: s.label, value: round2(extractor(s)) }));
  const lastIdx = realPoints.length - 1;
  realPoints[lastIdx] = { label: realPoints[lastIdx]!.label, value: round2(currentVal) };
  return [...preTerm, ...realPoints];
}

function createCard(
  id: string,
  category: IndicatorSeriesCard['category'],
  title: string,
  unit: string,
  startVal: number,
  currentValue: number,
  variationUnit: string,
  snapshots: MonthlyHistorySnapshot[] | undefined,
  subtitle?: string,
  invertColorLogic?: boolean
): IndicatorSeriesCard {
  const points = buildPointsFromSnapshots(id, startVal, currentValue, snapshots);
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

function buildPricesAndEmploymentIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
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
      snaps,
      `INDEC Oficial: ${state.inflation.officialIndecIpcPct}% · Alimentos: ${state.inflation.foodInflationMonthlyPct}%`,
      true
    ),
    createCard(
      'INF_INTERANUAL',
      'PRECIOS',
      'Inflación interanual acumulada',
      '%',
      35.5,
      state.inflation.interannualIpcPct,
      'pp',
      snaps,
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
      snaps,
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
      snaps,
      'Tendencia subyacente de precios excluyendo tarifas reguladas.',
      true
    ),
    createCard('DESEMPLEO', 'EMPLEO', 'Desempleo abierto (EPH)', '%', 7.6, state.labor.unemploymentPct, 'pp', snaps, 'Población económicamente activa buscando empleo.', true),
    createCard('INFORMALIDAD', 'EMPLEO', 'Informalidad laboral', '%', 42.0, state.labor.informalityPct, 'pp', snaps, 'Trabajadores no registrados sin descuentos jubilatorios.', true),
    createCard('EMPLEO_PRIVADO', 'EMPLEO', 'Empleo privado registrado (SIPA)', 'M puestos', 6.28, sipaMillions, 'M', snaps, 'Puestos formales en empresas privadas declarados en AFIP.'),
    createCard('CONFLICTIVIDAD_GREMIAL', 'EMPLEO', 'Tensión sindical y paros (CGT/CTA)', '/100', 38.0, cgtConflictScore, 'pts', snaps, 'Probabilidad de huelga general y bloqueos sectoriales.', true)
  ];
}

function buildActivityIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const indVal = round2(98.4 + state.gdpGrowthAnnualPct * 1.6);
  const agroVal = round2(128.0 + (state.structural.silobolsaStockMillionTons > 15 ? 4.5 : -2.0));
  const consVal = round2(100.0 + (state.labor.realWageIndex - 100) * 0.85);
  const invVal = round2(17.2 + (state.countryRiskEmbiPb < 800 ? 1.4 : -0.9));
  const capVal = round2(58.5 + state.gdpGrowthAnnualPct * 1.1);
  const confVal = round2(46.0 + state.publicOpinion.expectation12MonthsPct * 0.32);
  const perCapVal = round2((state.gdpNominalBillionUsd * 1000) / 46.5);

  return [
    createCard('ACTIVIDAD_INDUSTRIAL', 'ACTIVIDAD', 'Actividad industrial (EMI)', 'pts', 98.4, indVal, 'pts', snaps, 'Estimador Mensual Industrial (INDEC base 100).'),
    createCard('PROD_AGRO', 'ACTIVIDAD', 'Producción agropecuaria', 'M Ton', 128.5, agroVal, 'M Ton', snaps, 'Cosecha fina y gruesa proyectada en la campaña.'),
    createCard('CONSUMO_PRIVADO', 'ACTIVIDAD', 'Consumo privado masivo', 'pts', 101.2, consVal, 'pts', snaps, 'Ventas en supermercados, autoservicios y shoppings.'),
    createCard('INVERSION', 'ACTIVIDAD', 'Inversión bruta fija (IBIF)', '% PIB', 17.2, invVal, 'pp', snaps, 'Inversión en maquinaria, equipo productivo y construcción.'),
    createCard('PIB_CREC', 'ACTIVIDAD', 'Crecimiento del PIB', '%', 0.8, state.gdpGrowthAnnualPct, 'pp', snaps),
    createCard('PIB_NOMINAL', 'ACTIVIDAD', 'PBI nominal anual', 'mil M USD', 690, state.gdpNominalBillionUsd, 'mil M', snaps, `PIB hoy: ${state.gdpGrowthAnnualPct}% anual.`),
    createCard('CAPACIDAD_INSTALADA', 'ACTIVIDAD', 'Utilización de capacidad industrial', '%', 58.4, capVal, 'pp', snaps, 'Capacidad instalada fabril operativa.'),
    createCard('CONFIANZA_ECONOMICA', 'ACTIVIDAD', 'Confianza económica', 'pts', 46.5, confVal, 'pts', snaps, 'Índice de clima de negocios y expectativas.'),
    createCard('PBI_PER_CAPITA', 'ACTIVIDAD', 'PBI per cápita', 'USD', 14850, perCapVal, 'USD', snaps, 'PBI anual por habitante en dólares.')
  ];
}

function buildIncomeAndSocietyIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const pensionVal = round2(96.0 + (state.labor.realWageIndex - 100) * 0.7 - (state.inflation.realMonthlyIpcPct > 3 ? 2.5 : 0));
  const wageUsd = round2((state.labor.realWageIndex * 11.4) * (1650 / Math.max(900, state.centralBank.cclDollarArs)));
  const middleClassPct = round2(Math.max(24, Math.min(62, 78 - state.inflation.povertyCbtPct * 0.92)));

  return [
    createCard('SALARIO_REAL', 'INGRESOS', 'Salario real (RIPTE)', 'pts', 99.5, state.labor.realWageIndex, 'pts', snaps, 'Índice base 100 = Diciembre 2027.'),
    createCard('JUBILACION_REAL', 'INGRESOS', 'Jubilación real (Haber mínimo)', 'pts', 96.0, pensionVal, 'pts', snaps, 'Poder de compra del haber jubilatorio mínimo y bonos.'),
    createCard('SALARIO_USD', 'INGRESOS', 'Salario medio en dólares (CCL)', 'USD', 1080, wageUsd, 'USD', snaps, 'Remuneración formal promedio medida al dólar financiero.'),
    createCard('POBREZA', 'SOCIEDAD', 'Pobreza urbana (CBT)', '%', 35.8, state.inflation.povertyCbtPct, 'pp', snaps, 'Población bajo la línea de Canasta Básica Total.', true),
    createCard('INDIGENCIA', 'SOCIEDAD', 'Indigencia (CBA)', '%', 9.2, state.inflation.indigenceCbaPct, 'pp', snaps, 'Hogares que no cubren la canasta alimentaria básica.', true),
    createCard('GINI', 'SOCIEDAD', 'Desigualdad (Gini × 100)', 'pts', 42.0, state.inflation.giniCoefficient, 'pts', snaps, 'Coeficiente de concentración del ingreso (0 = igualdad).', true),
    createCard('CLASE_MEDIA', 'SOCIEDAD', 'Estrato de Clase Media (EPH)', '%', 44.5, middleClassPct, 'pp', snaps, 'Proporción de hogares integrados de ingresos medios.')
  ];
}

function buildSecurityIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const homVal = round2(4.2 + (state.inflation.povertyCbtPct > 40 ? 0.5 : -0.2));
  const robVal = round2(920 + (state.labor.unemploymentPct > 8 ? 75 : -35));

  return [
    createCard('HOMICIDIOS_100K', 'SEGURIDAD', 'Homicidios cada 100.000 hab.', 'tasa', 4.2, homVal, 'pts', snaps, 'Tasa nacional anualizada cada 100.000 habitantes (SNIC).', true),
    createCard('ROBOS_100K', 'SEGURIDAD', 'Delitos contra la propiedad / 100k', 'tasa', 920, robVal, 'pts', snaps, 'Denuncias de robos y hurtos urbanos registradas.', true),
    createCard('INSEGURIDAD', 'SEGURIDAD', 'Índice de temor e inseguridad', '/100', 60.6, round2(58 - state.treasury.publicWorksPctGdp * 2), 'pts', snaps, 'Percepción ciudadana de delito en grandes aglomerados.', true)
  ];
}

function buildExternalSectorIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const expVal = round2(6950 + state.energy.userTariffCoveragePct * 8 + (state.centralBank.cclDollarArs > 1500 ? 350 : 0));
  const impVal = round2(5380 + state.gdpGrowthAnnualPct * 220);
  const balVal = round2(expVal - impVal);
  const tcrVal = round2(100 * (state.centralBank.officialDollarArs / 1450) / (1 + state.inflation.realMonthlyIpcPct / 100));
  const totVal = round2(104.5 + (state.structural.silobolsaStockMillionTons > 15 ? 2.5 : -1.2));

  return [
    createCard('EXPORTACIONES', 'SECTOR_EXTERNO', 'Exportaciones (FOB)', 'M USD/mes', 7120, expVal, 'M USD', snaps, 'Despachos del complejo agro, energía y manufacturas.'),
    createCard('IMPORTACIONES', 'SECTOR_EXTERNO', 'Importaciones (CIF)', 'M USD/mes', 5450, impVal, 'M USD', snaps, 'Insumos intermedios, bienes de capital y energía.', true),
    createCard('BALANZA_COMERCIAL', 'SECTOR_EXTERNO', 'Balanza comercial mensual', 'M USD/mes', 1670, balVal, 'M USD', snaps, 'Superávit o déficit comercial mensual en dólares.'),
    createCard('TIPO_CAMBIO_REAL', 'SECTOR_EXTERNO', 'Tipo de cambio real (ITCRM)', 'pts', 98.0, tcrVal, 'pts', snaps, 'Competitividad cambiaria multilateral del BCRA (base 100).'),
    createCard('BRECHA', 'SECTOR_EXTERNO', 'Brecha cambiaria (CCL vs Oficial)', '%', 18.0, state.centralBank.exchangeBrechaPct, 'pp', snaps, undefined, true),
    createCard(
      'RESERVAS_BRUTAS',
      'SECTOR_EXTERNO',
      'Reservas internacionales BCRA',
      'mil M USD',
      42.0,
      state.centralBank.grossReservesBillionUsd,
      'mil M',
      snaps,
      `Reservas Netas Líquidas reales: ${state.centralBank.netLiquidReservesBillionUsd} mil M USD.`
    ),
    createCard('TERMINOS_INTERCAMBIO', 'SECTOR_EXTERNO', 'Términos de intercambio', 'pts', 104.5, totVal, 'pts', snaps, 'Poder de compra de las exportaciones frente a importaciones.'),
    createCard('SILOBOLSAS', 'SECTOR_EXTERNO', 'Granos retenidos en Silobolsas', 'M Ton', 16.5, state.structural.silobolsaStockMillionTons, 'M Ton', snaps, 'Stock retenido por productores esperando liquidar.', true),
    createCard('DOLAR_OFICIAL', 'SECTOR_EXTERNO', 'Dólar oficial mayorista (A3500)', '$', 1450, state.centralBank.officialDollarArs, '$', snaps),
    createCard('DOLAR_CCL', 'SECTOR_EXTERNO', 'Dólar Contado con Liquidación (CCL)', '$', 1680, state.centralBank.cclDollarArs, '$', snaps, undefined, true)
  ];
}

function buildFinanceAndPublicFinanceIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const emisionVal = round2(state.centralBank.crawlingPegMonthlyPct * 0.75 + (state.treasury.primaryResultPctGdp < 0 ? 1.2 : 0));
  const debtGdp = round2(Math.max(32, 42.5 - state.treasury.primaryResultPctGdp * 0.9));

  return [
    createCard('EMISION_MONETARIA', 'FINANZAS', 'Emisión monetaria', '% mes', 1.8, emisionVal, 'pp', snaps, 'Expansión de base monetaria para financiar Tesoro/pasivos.', true),
    createCard('TASA_BCRA', 'FINANZAS', 'Tasa de política monetaria', '% anual', 36, state.centralBank.policyRateAnnualPct, 'pp', snaps),
    createCard('RIESGO_PAIS', 'FINANZAS', 'Riesgo país (JP Morgan EMBI+)', 'pb', 720, state.countryRiskEmbiPb, 'pb', snaps, 'Sobretasa de bonos soberanos argentinos sobre el Tesoro de EE.UU.', true),
    createCard('EXPOSICION_BANCOS', 'FINANZAS', 'Exposición bancaria al Tesoro', '% Activo', 48, state.bankingSystem.publicSectorExposurePct, 'pp', snaps, 'Títulos públicos y LEFI en cartera de los bancos comerciales.', true),
    createCard('DEUDA_PUBLICA', 'FINANZAS_PUBLICAS', 'Deuda pública consolidada', '% PIB', 42.5, debtGdp, 'pp', snaps, 'Deuda soberana bruta del Tesoro Nacional sobre el PIB.', true),
    createCard('INTERESES_DEUDA', 'FINANZAS_PUBLICAS', 'Carga de intereses de deuda', '% PIB', 0.18, state.treasury.debtInterestPctGdp, 'pp', snaps, 'Servicio mensual de intereses del Tesoro.', true),
    createCard('RECAUDACION', 'FINANZAS_PUBLICAS', 'Recaudación tributaria nacional', '% PIB', 15.2, state.treasury.revenuePctGdp, 'pp', snaps, 'Ingresos por IVA, Ganancias, Retenciones y tributos AFIP.'),
    createCard('GASTO_PRIMARIO', 'FINANZAS_PUBLICAS', 'Gasto primario nacional', '% PIB', 16.4, state.treasury.primarySpendingPctGdp, 'pp', snaps, undefined, true),
    createCard('RESULTADO_FISCAL', 'FINANZAS_PUBLICAS', 'Resultado fiscal primario', '% PIB', 0.3, state.treasury.primaryResultPctGdp, 'pp', snaps, `Subsidio mensual a CAMMESA: -${state.energy.cammesaMonthlyDeficitMillionUsd} M USD/mes.`)
  ];
}

function buildEnergyAndEducationIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const t = state.turnMonth;
  const vacaMuertaBbl = round2(445 + t * 8.5 + (state.countryRiskEmbiPb < 850 ? 28 : 0));
  const energyBal = round2(610 + t * 22 - state.energy.cammesaMonthlyDeficitMillionUsd * 0.45);
  const miningExp = round2(420 + t * 16);
  const eduScore = round2(58.4 + state.treasury.publicWorksPctGdp * 1.8 - (state.inflation.povertyCbtPct - 35) * 0.25);
  const healthIndex = round2(64.0 + (state.labor.realWageIndex - 100) * 0.35);

  return [
    createCard('VACA_MUERTA_CRUDO', 'ENERGIA_Y_MINERIA', 'Producción de crudo Vaca Muerta', 'mil bbl/d', 430, vacaMuertaBbl, 'mil bbl', snaps, 'Extracción no convencional en la Cuenca Neuquina.'),
    createCard('BALANZA_ENERGETICA', 'ENERGIA_Y_MINERIA', 'Balanza comercial energética', 'M USD/mes', 540, energyBal, 'M USD', snaps, 'Exportaciones de crudo y gas menos importaciones de GNL.'),
    createCard('COBERTURA_TARIFARIA', 'ENERGIA_Y_MINERIA', 'Cobertura tarifaria eléctrica (CAMMESA)', '%', 68, state.energy.userTariffCoveragePct, 'pp', snaps, 'Porcentaje del costo mayorista cubierto por la boleta del usuario.'),
    createCard('EXPORT_LITIO_COBRE', 'ENERGIA_Y_MINERIA', 'Exportación minera (Litio y Cobre)', 'M USD/mes', 395, miningExp, 'M USD', snaps, 'Despachos de carbonato de litio y proyectos metalíferos cordilleranos.'),
    createCard('PRUEBAS_APRENDER', 'EDUCACION_Y_SALUD', 'Índice de desempeño educativo (Aprender)', '/100', 57.5, eduScore, 'pts', snaps, 'Comprensión lectora y resolución matemática en nivel secundario.'),
    createCard('COBERTURA_SALUD', 'EDUCACION_Y_SALUD', 'Capacidad sanitaria y acceso a salud', '/100', 63.0, healthIndex, 'pts', snaps, 'Abastecimiento hospitalario, obras sociales sindicales y prepagas.')
  ];
}

function buildOpinionAndDefenseIndicators(
  state: SimulationState,
  snaps?: MonthlyHistorySnapshot[]
): IndicatorSeriesCard[] {
  const defVal = round2(58 + state.treasury.primaryResultPctGdp * 2.5);
  const borderVal = round2(61 + state.treasury.publicWorksPctGdp * 1.9);

  return [
    createCard('APROBACION', 'OPINION_PUBLICA', 'Imagen positiva presidencial', '%', 51.2, state.publicOpinion.presidentialPersonalImagePct, 'pp', snaps, `Expectativa a 12 meses: ${state.publicOpinion.expectation12MonthsPct}%.`),
    createCard('APROBACION_GESTION', 'OPINION_PUBLICA', 'Aprobación de la gestión de Gobierno', '%', 49.0, state.publicOpinion.managementApprovalPct, 'pp', snaps, 'Evaluación ciudadana del rumbo económico e institucional.'),
    createCard('EXPECTATIVA_12M', 'OPINION_PUBLICA', 'Índice de optimismo a 12 meses', '%', 53.0, state.publicOpinion.expectation12MonthsPct, 'pp', snaps, 'Hogares que creen que la economía estará mejor dentro de un año.'),
    createCard('ALISTAMIENTO_FFAA', 'DEFENSA', 'Alistamiento operativo de las FF.AA.', '%', 54.0, defVal, 'pp', snaps, 'Equipamiento, horas de vuelo/navegación y ejecución del FONDEF.'),
    createCard('CONTROL_FRONTERAS', 'DEFENSA', 'Radarización Norte y Patrullaje Milla 200', '%', 59.0, borderVal, 'pp', snaps, 'Vigilancia aeroespacial SINVICA y control pesquero en el Atlántico Sur.')
  ];
}

export function buildIndicatorsCatalog(state: SimulationState): IndicatorSeriesCard[] {
  const snaps = state.historySnapshots;
  return [
    ...buildPricesAndEmploymentIndicators(state, snaps),
    ...buildActivityIndicators(state, snaps),
    ...buildIncomeAndSocietyIndicators(state, snaps),
    ...buildSecurityIndicators(state, snaps),
    ...buildExternalSectorIndicators(state, snaps),
    ...buildFinanceAndPublicFinanceIndicators(state, snaps),
    ...buildEnergyAndEducationIndicators(state, snaps),
    ...buildOpinionAndDefenseIndicators(state, snaps)
  ];
}
