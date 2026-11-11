import type {
  CabinetMinister,
  EconomicLeverItem,
  PoliticalPartyPreset,
  RealPoliticianPreset,
  RigisectorItem,
  SectorMeasureCard
} from '@argentina-sim/domain';

// Dataset real de los espacios politicos, figuras de la politica argentina 2027,
// gabinete ministerial y palancas sectoriales tal cual se ven en el juego pero conectados al motor.

export const POLITICAL_PARTIES_2027: PoliticalPartyPreset[] = [
  {
    id: 'LLA',
    sigla: 'LLA',
    name: 'La Libertad Avanza',
    colorName: 'Violeta',
    primaryColor: '#8b5cf6',
    ideology: 'Liberalismo',
    description:
      'Fuerza libertaria con eje en el ajuste del gasto público, el superávit fiscal y la desregulación económica. Es el oficialismo del escenario inicial.',
    economicPosition: 90,
    culturalPosition: 82,
    socialBase: 'Jóvenes nativos digitales, cuentapropistas y sectores anti-establishment',
    emblem: {
      shape: 'ESCUDO',
      pattern: 'MITADES_VERTICALES',
      primaryColor: '#7c3aed',
      secondaryColor: '#5b21b6',
      thirdColor: '#ffffff',
      symbol: 'LLAMA',
      symbolColor: '#fbbf24',
      disc: 'SIN_FONDO',
      customImageDataUrl: null
    }
  },
  {
    id: 'PRO',
    sigla: 'PRO',
    name: 'Propuesta Republicana',
    colorName: 'Amarillo',
    primaryColor: '#eab308',
    ideology: 'Conservadurismo',
    description:
      'Espacio de centroderecha republicano, con gestión urbana, gobernadores aliados, cuadros financieros y equipos técnicos.',
    economicPosition: 74,
    culturalPosition: 66,
    socialBase: 'Clases medias-altas urbanas, profesionales y sector agroexportador',
    emblem: {
      shape: 'CUADRADO',
      pattern: 'DIAGONAL',
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      thirdColor: '#1e293b',
      symbol: 'SOL',
      symbolColor: '#0f172a',
      disc: 'SIN_FONDO',
      customImageDataUrl: null
    }
  },
  {
    id: 'PF',
    sigla: 'PF',
    name: 'Peronismo Federal / Provincias Unidas',
    colorName: 'Azul Federal',
    primaryColor: '#2563eb',
    ideology: 'Desarrollismo Federal',
    description:
      'Liga de gobernadores productivistas del interior (Región Centro, Patagonia y Norte), pragmáticos y defensores de las cajas provinciales.',
    economicPosition: 52,
    culturalPosition: 56,
    socialBase: 'Interior productivo, complejo agroindustrial, petróleo y minería',
    emblem: {
      shape: 'HEXAGONO',
      pattern: 'FRANJAS_HORIZONTALES',
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      thirdColor: '#ffffff',
      symbol: 'ENGRANAJE',
      symbolColor: '#ffffff',
      disc: 'DISCO_OSCURO',
      customImageDataUrl: null
    }
  },
  {
    id: 'UCR',
    sigla: 'UCR',
    name: 'Unión Cívica Radical',
    colorName: 'Rojo y blanco',
    primaryColor: '#dc2626',
    ideology: 'Socialdemocracia',
    description:
      'El partido más antiguo del país (1891): radicalismo de centroizquierda, socialdemócrata, republicano y federal, con gobernadores, intendentes y comités.',
    economicPosition: 38,
    culturalPosition: 34,
    socialBase: 'Clases medias del interior, universidades nacionales y municipios',
    emblem: {
      shape: 'ESCUDO',
      pattern: 'MITADES_HORIZONTALES',
      primaryColor: '#dc2626',
      secondaryColor: '#f8fafc',
      thirdColor: '#991b1b',
      symbol: 'ANTORCHA',
      symbolColor: '#dc2626',
      disc: 'DISCO_CLARO',
      customImageDataUrl: null
    }
  },
  {
    id: 'UxP',
    sigla: 'UxP',
    name: 'Unión por la Patria / PJ',
    colorName: 'Celeste',
    primaryColor: '#0ea5e9',
    ideology: 'Peronismo / Kirchnerismo',
    description:
      'Principal coalición nacional-popular opositora, con fuerte base en el Conurbano bonaerense, sindicatos de la CGT y movimientos sociales.',
    economicPosition: 23,
    culturalPosition: 26,
    socialBase: 'Trabajadores sindicalizados, Conurbano bonaerense y sectores populares',
    emblem: {
      shape: 'CIRCULO',
      pattern: 'RAYOS',
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      thirdColor: '#ffffff',
      symbol: 'SOL',
      symbolColor: '#facc15',
      disc: 'DISCO_DE_COLOR',
      customImageDataUrl: null
    }
  },
  {
    id: 'FIT',
    sigla: 'FIT',
    name: 'Frente de Izquierda y de Trabajadores',
    colorName: 'Rojo Intenso',
    primaryColor: '#e11d48',
    ideology: 'Socialismo Trotskista',
    description:
      'Frente obrero y socialista: ruptura con el FMI, no pago de la deuda externa, nacionalización de la banca y movilización en las calles.',
    economicPosition: 8,
    culturalPosition: 10,
    socialBase: 'Sindicatos combativos de base, movimientos piqueteros y juventud universitaria',
    emblem: {
      shape: 'BANDERA',
      pattern: 'BANDA_DIAGONAL',
      primaryColor: '#be123c',
      secondaryColor: '#881337',
      thirdColor: '#ffffff',
      symbol: 'ESTRELLA',
      symbolColor: '#ffffff',
      disc: 'SIN_FONDO',
      customImageDataUrl: null
    }
  }
];

export { REAL_POLITICIANS_2027 } from './realPoliticiansCatalog158.js';

export const INITIAL_CABINET_2027: CabinetMinister[] = [
  {
    id: 'JEFATURA',
    ministryName: 'Jefatura de Gabinete',
    ministerName: 'Marcos Peña',
    partySigla: 'PRO',
    affinityPct: 87,
    isCoalitionQuota: true,
    competence: 66,
    loyalty: 70,
    risk: 22,
    performance: 48,
    monthlyEffectText: 'Coordinación parlamentaria +0,4 pts'
  },
  {
    id: 'INTERIOR',
    ministryName: 'Interior',
    ministerName: 'Rogelio Frigerio',
    partySigla: 'PRO',
    affinityPct: 87,
    isCoalitionQuota: true,
    competence: 66,
    loyalty: 60,
    risk: 20,
    performance: 50,
    monthlyEffectText: 'Lealtad gobernadores +0,6 pts/mes'
  },
  {
    id: 'ECONOMIA',
    ministryName: 'Economía',
    ministerName: 'Hernán Lacunza',
    partySigla: 'PRO',
    affinityPct: 87,
    isCoalitionQuota: true,
    competence: 66,
    loyalty: 60,
    risk: 18,
    performance: 44,
    monthlyEffectText: 'Credibilidad ancla fiscal +0,5 pts'
  },
  {
    id: 'SEGURIDAD',
    ministryName: 'Seguridad',
    ministerName: 'Patricia Bullrich',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 68,
    loyalty: 70,
    risk: 28,
    performance: 48,
    monthlyEffectText: 'Índice de inseguridad -0,48/mes'
  },
  {
    id: 'JUSTICIA',
    ministryName: 'Justicia',
    ministerName: 'Julieta Cabrera',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 63,
    loyalty: 79,
    risk: 14,
    performance: 51,
    monthlyEffectText: 'Contención Comodoro Py +0,3'
  },
  {
    id: 'DEFENSA',
    ministryName: 'Defensa',
    ministerName: 'Carlos Presti',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 58,
    loyalty: 70,
    risk: 20,
    performance: 44,
    monthlyEffectText: 'Alistamiento FF.AA. +0,4%'
  },
  {
    id: 'SALUD',
    ministryName: 'Salud',
    ministerName: 'Mario Lugones',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 60,
    loyalty: 68,
    risk: 22,
    performance: 47,
    monthlyEffectText: 'Cobertura PAMI y hospitales estable'
  },
  {
    id: 'CAPITAL_HUMANO',
    ministryName: 'Capital Humano',
    ministerName: 'Sandra Pettovello',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 52,
    loyalty: 80,
    risk: 28,
    performance: 42,
    monthlyEffectText: 'Auditoría planes y comedores directa'
  },
  {
    id: 'CANCILLERIA',
    ministryName: 'Relaciones Exteriores',
    ministerName: 'Gerardo Werthein',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 60,
    loyalty: 66,
    risk: 26,
    performance: 48,
    monthlyEffectText: 'riesgo país -2,4 pb · Vínculo Washington'
  },
  {
    id: 'INFRAESTRUCTURA',
    ministryName: 'Desregulación e Infraestructura',
    ministerName: 'Federico Sturzenegger',
    partySigla: 'LLA',
    affinityPct: 100,
    isCoalitionQuota: false,
    competence: 66,
    loyalty: 66,
    risk: 22,
    performance: 49,
    monthlyEffectText: 'Productividad sectorial +0,3%'
  }
];

export const INITIAL_ECONOMIC_LEVERS: EconomicLeverItem[] = [
  { id: 'GASTO_PUBLICO', title: 'Gasto público', description: 'Nivel del gasto primario del Estado.', level: 0, levelLabels: ['Motosierra', 'Ajuste', 'Neutral', 'Expansivo', 'Plan Platita'] },
  { id: 'TIPO_CAMBIO', title: 'Tipo de cambio', description: 'Ritmo de ajuste del dólar oficial (Crawling Peg).', level: 0, levelLabels: ['Ancla 0%', 'Lento 1%', 'Neutral 1,5%', 'Acelerado 4%', 'Devaluación'] },
  { id: 'CONTROL_CAMBIOS', title: 'Controles de cambios', description: 'Cupos, parking y límites para comprar divisas (Cepo).', level: 0, levelLabels: ['Libre', 'Suave', 'Neutral', 'Cepo Duro', 'Feriado Cambiario'] },
  { id: 'TASA_INTERES', title: 'Tasa de interés', description: 'Costo del dinero y pases en la economía (BCRA).', level: 0, levelLabels: ['Licuación', 'Baja', 'Neutral', 'Positiva', 'Super-Tasa'] },
  { id: 'SALARIOS_PARITARIAS', title: 'Salarios y paritarias', description: 'Homologación en Secretaría de Trabajo y salario mínimo.', level: 0, levelLabels: ['Techo Duro', 'Pauta', 'Neutral', 'Indexada', 'Suma Fija'] },
  { id: 'SUBSIDIOS_TARIFAS', title: 'Subsidios y tarifas', description: 'Energía (CAMMESA), gas, transporte y agua.', level: 0, levelLabels: ['Tarifazo 100%', 'Quita Gradual', 'Neutral', 'Segmentado', 'Congelado'] },
  { id: 'PLANES_SOCIALES', title: 'Planes sociales', description: 'AUH, Tarjeta Alimentar y transferencias vulnerables.', level: 0, levelLabels: ['Recorte', 'Sin Punteros', 'Neutral', 'Refuerzo CBA', 'Universal'] },
  { id: 'OBRA_PUBLICA', title: 'Obra pública', description: 'Rutas, gasoductos, vivienda e infraestructura.', level: 0, levelLabels: ['Obra Cero', 'Concesión Privada', 'Neutral', 'Federal', 'Plan Quinquenal'] },
  { id: 'JUBILACIONES', title: 'Jubilaciones (ANSES)', description: 'Movilidad previsional, bonos y haberes.', level: 0, levelLabels: ['Licuadora', 'Bono Fijo', 'Neutral IPC', 'Recomposición', '82% Móvil'] },
  { id: 'EMPRESAS_PUBLICAS', title: 'Empresas públicas', description: 'Tamaño del Estado empresario (YPF, AA, AySA, Trenes).', level: 0, levelLabels: ['Privatizar Todo', 'Privatizar', 'Neutral', 'Saneamiento', 'Estatizar'] }
];

export const INITIAL_RIGI_SECTORS: RigisectorItem[] = [
  { id: 'RIGI_GNL', name: 'Gas Natural Licuado (GNL) y Oleoductos Vaca Muerta Sur', description: 'Plantas de licuefacción en Río Negro y expansión de transporte desde Neuquén.', enabledByDecree: true, monthlyInvestmentMillionUsd: 420, exportBoostBillionUsd: 4.8, localConflictRiskPct: 8 },
  { id: 'RIGI_LITIO_COBRE', name: 'Megaminería de Cobre y Salares de Litio (Cordillera y Puna)', description: 'Proyectos en San Juan, Salta, Jujuy, Catamarca y Mendoza (Estabilidad 30 años).', enabledByDecree: true, monthlyInvestmentMillionUsd: 380, exportBoostBillionUsd: 5.2, localConflictRiskPct: 26 },
  { id: 'RIGI_SIDERURGIA', name: 'Siderurgia, Petroquímica e Infraestructura Portuaria', description: 'Plantas industriales pesadas y modernización de puertos agroexportadores.', enabledByDecree: false, monthlyInvestmentMillionUsd: 210, exportBoostBillionUsd: 2.1, localConflictRiskPct: 12 },
  { id: 'RIGI_TECH_IA', name: 'Data Centers de Inteligencia Artificial y Energía Nuclear', description: 'Polos tecnológicos alimentados por reactores en Patagonia.', enabledByDecree: false, monthlyInvestmentMillionUsd: 290, exportBoostBillionUsd: 3.0, localConflictRiskPct: 14 }
];

export const SECTOR_CATEGORIES_SUMMARY: Array<{
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  tempCount: number;
  permCount: number;
}> = [
  { id: 'PRECIOS', icon: '%', title: 'Precios', subtitle: 'Inflación, tarifas, canasta y competencia.', tempCount: 11, permCount: 4 },
  { id: 'INGRESOS', icon: '$', title: 'Ingresos y jubilaciones', subtitle: 'Salarios, haberes previsionales y transferencias.', tempCount: 9, permCount: 11 },
  { id: 'SOCIAL', icon: '♥', title: 'Social y vivienda', subtitle: 'Pobreza, indigencia, hábitat y alquileres.', tempCount: 6, permCount: 11 },
  { id: 'TRABAJO', icon: '⚒', title: 'Trabajo y empleo', subtitle: 'Empleo, informalidad, industria del juicio y paritarias.', tempCount: 6, permCount: 9 },
  { id: 'PRODUCCION', icon: '⚙', title: 'Producción e industria', subtitle: 'Industria, PyMEs, Tierra del Fuego y conocimiento.', tempCount: 12, permCount: 4 },
  { id: 'AGRO', icon: '❀', title: 'Agro y comercio exterior', subtitle: 'Campo, silobolsas, retenciones, Hidrovía y divisas.', tempCount: 11, permCount: 9 },
  { id: 'ENERGIA', icon: '⚡', title: 'Energía y ambiente', subtitle: 'CAMMESA, Vaca Muerta, YPF, litio, cobre y ambiente.', tempCount: 11, permCount: 10 },
  { id: 'OBRA_PUBLICA', icon: '⛏', title: 'Obra pública y transporte', subtitle: 'Infraestructura, rutas, trenes de carga y agua.', tempCount: 10, permCount: 7 },
  { id: 'IMPUESTOS', icon: '⚖', title: 'Impuestos y fiscal', subtitle: 'Recaudación, Coparticipación, ARCA y cuentas públicas.', tempCount: 9, permCount: 10 },
  { id: 'DEUDA', icon: '₿', title: 'Deuda y finanzas', subtitle: 'Bonos, Riesgo País, PUTs bancarios, FMI y sistema financiero.', tempCount: 8, permCount: 8 },
  { id: 'ESTADO', icon: '⌂', title: 'Estado y transparencia', subtitle: 'Capacidad estatal, empresas públicas, INDEC y auditoría.', tempCount: 7, permCount: 9 },
  { id: 'SEGURIDAD', icon: '⛨', title: 'Seguridad y justicia', subtitle: 'Delito, Rosario, Comodoro Py, Corte Suprema y cautelares.', tempCount: 8, permCount: 8 }
];

export const INITIAL_SECTOR_MEASURES: SectorMeasureCard[] = [
  {
    id: 'LEY_GONDOLAS',
    sectorId: 'PRECIOS',
    title: 'Ley de góndolas',
    description: 'Espacio obligatorio para pymes y marcas alternativas en supermercados.',
    durationType: 'PERMANENTE',
    ideologyTag: 'CENTRO',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,5/-0,3', isPositive: true },
      { label: 'ACTIVIDAD INDUSTRIAL', rangeText: '+0,9/+1,5', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.0,
    inflationEffectPp: -0.4,
    approvalEffectPp: 0.8
  },
  {
    id: 'OBSERVATORIO_PRECIOS',
    sectorId: 'PRECIOS',
    title: 'Observatorio de precios con sanciones',
    description: 'Monitoreo permanente de márgenes y multas por abusos.',
    durationType: 'PERMANENTE',
    ideologyTag: 'IZQUIERDA',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,6/-0,4', isPositive: true },
      { label: 'CONFIANZA ECONÓMICA', rangeText: '-1,3/-0,8', isPositive: false },
      { label: 'APROBACIÓN', rangeText: '+0,5/+0,8', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.05,
    inflationEffectPp: -0.5,
    approvalEffectPp: 0.65
  },
  {
    id: 'LIBRE_IMPORTACION_INSUMOS',
    sectorId: 'PRECIOS',
    title: 'Libre importación de insumos',
    description: 'Arancel cero para insumos sin producción local.',
    durationType: 'PERMANENTE',
    ideologyTag: 'DERECHA',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,5/-0,3', isPositive: true },
      { label: 'ACTIVIDAD INDUSTRIAL', rangeText: '+0,9/+1,5', isPositive: true },
      { label: 'IMPORTACIONES', rangeText: '+1,8/+3', isPositive: true },
      { label: 'RECAUDACIÓN', rangeText: '-0,2/-0,1', isPositive: false }
    ],
    active: false,
    fiscalCostPctGdp: 0.15,
    inflationEffectPp: -0.4,
    approvalEffectPp: 0.5
  },
  {
    id: 'METAS_INFLACION_BCRA',
    sectorId: 'PRECIOS',
    title: 'Régimen de metas de inflación',
    description: 'El Banco Central fija y comunica metas con tasa de interés como herramienta.',
    durationType: 'PERMANENTE',
    ideologyTag: 'CENTRO',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,9/-0,5', isPositive: true },
      { label: 'TASA DE INTERÉS', rangeText: '+2,3/+3,8', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.1,
    inflationEffectPp: -0.7,
    approvalEffectPp: 1.1
  },
  {
    id: 'DEFENSA_COMPETENCIA',
    sectorId: 'PRECIOS',
    title: 'Mesa de defensa de la competencia',
    description: 'Investigación de cartelización en cadenas de alimentos y medicamentos.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'CENTRO',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,3/0', isPositive: true },
      { label: 'APROBACIÓN', rangeText: '+0,3/+1,1', isPositive: true },
      { label: 'CONFIANZA ECONÓMICA', rangeText: '-0,4/+0,6', isPositive: false }
    ],
    active: false,
    fiscalCostPctGdp: 0.02,
    inflationEffectPp: -0.15,
    approvalEffectPp: 0.7
  },
  {
    id: 'FERIAS_PRODUCTOR_CONSUMIDOR',
    sectorId: 'PRECIOS',
    title: 'Ferias del productor al consumidor',
    description: 'Mercados itinerantes sin intermediarios en barrios populares.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'IZQUIERDA',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,1/0', isPositive: true },
      { label: 'POBREZA', rangeText: '-0,2/0', isPositive: true },
      { label: 'APROBACIÓN', rangeText: '+0,3/+1', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.04,
    inflationEffectPp: -0.05,
    approvalEffectPp: 0.65
  },
  {
    id: 'DESREGULACION_MERCADOS',
    sectorId: 'PRECIOS',
    title: 'Desregulación de mercados regulados',
    description: 'Elimina restricciones en mercados de alquileres, medicamentos y transporte.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'DERECHA',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,2/+0,1', isPositive: true },
      { label: 'INVERSIÓN', rangeText: '+0,3/+0,8', isPositive: true },
      { label: 'APROBACIÓN', rangeText: '-0,7/+0,4', isPositive: false },
      { label: 'CONFIANZA ECONÓMICA', rangeText: '+1,3/+3,8', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.0,
    inflationEffectPp: -0.1,
    approvalEffectPp: 0.2
  },
  {
    id: 'ACUERDO_PRECIOS_CADENAS',
    sectorId: 'PRECIOS',
    title: 'Acuerdo de precios con cadenas',
    description: 'Pacto voluntario con supermercados y productores.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'CENTRO',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,4/-0,1', isPositive: true },
      { label: 'APROBACIÓN', rangeText: '+0,2/+0,6', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.0,
    inflationEffectPp: -0.25,
    approvalEffectPp: 0.4
  },
  {
    id: 'CONGELAMIENTO_TARIFAS',
    sectorId: 'PRECIOS',
    title: 'Congelamiento de tarifas por 6 meses',
    description: 'Posterga aumentos de energía y transporte.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'IZQUIERDA',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,7/-0,3', isPositive: true },
      { label: 'GASTO PRIMARIO', rangeText: '+0,8/+1,2', isPositive: false },
      { label: 'APROBACIÓN', rangeText: '+1,2/+2,5', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.8,
    inflationEffectPp: -0.5,
    approvalEffectPp: 1.8
  },
  {
    id: 'PACTO_SOCIAL_PRECIOS_SALARIOS',
    sectorId: 'PRECIOS',
    title: 'Pacto social de precios y salarios',
    description: 'Acuerdo tripartito: gobierno, empresas y sindicatos.',
    durationType: 'TEMPORAL',
    frequencyLabel: 'CADA 6 M.',
    cooldownMonths: 3,
    ideologyTag: 'CENTRO',
    effectsBadges: [
      { label: 'INFLACIÓN MENSUAL', rangeText: '-0,5/-0,2', isPositive: true },
      { label: 'CONFLICTIVIDAD', rangeText: '-1,5/-0,8', isPositive: true }
    ],
    active: false,
    fiscalCostPctGdp: 0.0,
    inflationEffectPp: -0.35,
    approvalEffectPp: 1.0
  },
  { id: 'M_PRECIOS_IMPORT', sectorId: 'PRECIOS', title: 'Apertura de Importación de Alimentos Canasta Básica', description: 'Elimina trabas de ANMAT y baja aranceles a alimentos importados.', durationType: 'TEMPORAL', active: false, fiscalCostPctGdp: 0.12, inflationEffectPp: -0.45, approvalEffectPp: 1.8 },
  { id: 'M_AGRO_DOLAR_BLEND', sectorId: 'AGRO', title: 'Programa Dólar Exportador Blend (80/20)', description: 'Acelera la liquidación de silobolsas en el corto plazo.', durationType: 'TEMPORAL', active: false, fiscalCostPctGdp: 0.2, inflationEffectPp: 0.3, approvalEffectPp: 1.1 },
  { id: 'M_TRABAJO_FONDO_CESE', sectorId: 'TRABAJO', title: 'Ley de Fondo de Cese Laboral y Fin de Multas 24.013', description: 'Desarma la industria del juicio laboral y reduce informalidad.', durationType: 'PERMANENTE', active: false, fiscalCostPctGdp: 0.05, inflationEffectPp: -0.1, approvalEffectPp: 2.2 },
  { id: 'M_ENERGIA_REVERSION_NORTE', sectorId: 'ENERGIA', title: 'Reversión del Gasoducto Norte', description: 'Reemplaza el gas importado de Bolivia con gas de Vaca Muerta.', durationType: 'PERMANENTE', active: true, fiscalCostPctGdp: 0.35, inflationEffectPp: -0.25, approvalEffectPp: 2.5 },
  { id: 'M_SEGURIDAD_ANTIMAFIA', sectorId: 'SEGURIDAD', title: 'Ley Antimafia y Despliegue en Rosario', description: 'Aplica penas de asociación ilícita a bandas narco.', durationType: 'PERMANENTE', active: true, fiscalCostPctGdp: 0.18, inflationEffectPp: 0.0, approvalEffectPp: 3.4 },
  { id: 'M_DEUDA_DESARME_PUTS', sectorId: 'DEUDA', title: 'Recompra de PUTs Bancarios y LEFIs', description: 'Elimina el seguro de emisión endógena bancaria.', durationType: 'PERMANENTE', active: false, fiscalCostPctGdp: 0.4, inflationEffectPp: -0.6, approvalEffectPp: 1.5 }
];

