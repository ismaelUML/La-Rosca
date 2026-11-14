import type { GovernmentEventCategory } from '@argentina-sim/domain';

// Cabeceras y mapeo editorial de Diarios Argentinos para eventos estilo HOI4.
// Cada evento toma un diario coherente con la temática (o su override específico)
// y resuelve la ruta de fotografía en /img/events/ con fallback seguro por categoría.

export type NewspaperId =
  | 'BOLETIN_OFICIAL'
  | 'CLARIN'
  | 'LA_NACION'
  | 'AMBITO'
  | 'CRONISTA'
  | 'PAGINA_12'
  | 'INFOBAE'
  | 'VOZ_INTERIOR';

export interface NewspaperMastheadSpec {
  id: NewspaperId;
  name: string;
  subtitle: string;
  sectionTag: string;
  editionPrefix: string;
  accentBgClass: string;
  titleFontClass: string;
  badgeTextClass: string;
}

export const NEWSPAPER_MASTHEADS: Record<NewspaperId, NewspaperMastheadSpec> = {
  BOLETIN_OFICIAL: {
    id: 'BOLETIN_OFICIAL',
    name: 'BOLETÍN OFICIAL',
    subtitle: 'de la República Argentina · Primera Sección: Legislación y Avisos Oficiales',
    sectionTag: 'REPÚBLICA ARGENTINA · ACTO DE GOBIERNO',
    editionPrefix: 'AÑO CXXXV · N°',
    accentBgClass: 'bg-[#1c2738] text-[#f3ead3] border-[#3d4d66]',
    titleFontClass: 'font-serif tracking-[0.14em] font-black',
    badgeTextClass: 'text-[#1c2738]'
  },
  CLARIN: {
    id: 'CLARIN',
    name: 'Clarín',
    subtitle: 'El gran diario argentino · Edición Nacional',
    sectionTag: 'POLÍTICA Y SOCIEDAD',
    editionPrefix: 'AÑO LXXXII · EDICIÓN N°',
    accentBgClass: 'bg-[#8f1d24] text-white border-[#681319]',
    titleFontClass: 'font-serif tracking-tight font-black',
    badgeTextClass: 'text-[#8f1d24]'
  },
  LA_NACION: {
    id: 'LA_NACION',
    name: 'LA NACION',
    subtitle: 'Fundado por Bartolomé Mitre en 1870 · Tribuna de doctrina',
    sectionTag: 'ACTUALIDAD INSTITUCIONAL',
    editionPrefix: 'AÑO CLVIII · N°',
    accentBgClass: 'bg-[#13293d] text-[#f5efe2] border-[#1f3b56]',
    titleFontClass: 'font-serif tracking-[0.22em] font-black',
    badgeTextClass: 'text-[#13293d]'
  },
  AMBITO: {
    id: 'AMBITO',
    name: 'ámbito financiero',
    subtitle: 'El diario de los negocios, dólar y mercados',
    sectionTag: 'FINANZAS Y MERCADOS',
    editionPrefix: 'AÑO LI · CIERRE N°',
    accentBgClass: 'bg-[#163a5f] text-[#e8f1fa] border-[#265480]',
    titleFontClass: 'font-sans tracking-tighter font-black',
    badgeTextClass: 'text-[#163a5f]'
  },
  CRONISTA: {
    id: 'CRONISTA',
    name: 'El Cronista',
    subtitle: 'Economía, Energía, Industria y Comercio Exterior',
    sectionTag: 'ECONOMÍA REAL',
    editionPrefix: 'AÑO CXIX · N°',
    accentBgClass: 'bg-[#1a3a2f] text-[#e7f3ec] border-[#2d5a4b]',
    titleFontClass: 'font-serif tracking-tight font-extrabold',
    badgeTextClass: 'text-[#1a3a2f]'
  },
  PAGINA_12: {
    id: 'PAGINA_12',
    name: 'Página/12',
    subtitle: 'El país a diario · Crónica gremial y derechos',
    sectionTag: 'TRABAJO Y CALLE',
    editionPrefix: 'AÑO XL · N°',
    accentBgClass: 'bg-[#1b1f26] text-[#f5f2ea] border-[#343b46]',
    titleFontClass: 'font-sans tracking-tight font-black',
    badgeTextClass: 'text-[#1b1f26]'
  },
  INFOBAE: {
    id: 'INFOBAE',
    name: 'infobae',
    subtitle: 'Edición Especial Impresa · Último Momento',
    sectionTag: 'ALERTA POLÍTICA',
    editionPrefix: 'EDICIÓN ESPECIAL N°',
    accentBgClass: 'bg-[#9a4611] text-[#fff6ea] border-[#78350b]',
    titleFontClass: 'font-sans tracking-tight font-black lowercase',
    badgeTextClass: 'text-[#9a4611]'
  },
  VOZ_INTERIOR: {
    id: 'VOZ_INTERIOR',
    name: 'La Voz del Interior',
    subtitle: 'Red Federal · Córdoba, Cuyo, Litoral y Patagonia',
    sectionTag: 'EDICIÓN FEDERAL',
    editionPrefix: 'AÑO CXXIII · N°',
    accentBgClass: 'bg-[#2a3441] text-[#f4efe3] border-[#424f60]',
    titleFontClass: 'font-serif tracking-tight font-black',
    badgeTextClass: 'text-[#2a3441]'
  }
};

const EVENT_NEWSPAPER_OVERRIDES: Record<string, NewspaperId> = {
  // Base Gobierno
  PARO_GENERAL_CGT: 'CLARIN',
  SEQUIA_PAMPEANA: 'LA_NACION',
  CORRIDA_CAMBIARIA: 'AMBITO',
  AUDIOS_EN_LA_ROSADA: 'INFOBAE',
  BLACKOUT_DE_VERANO: 'CLARIN',
  GOBERNADORES_RECLAMAN: 'VOZ_INTERIOR',
  CAUTELAR_CONTRA_DNU: 'BOLETIN_OFICIAL',
  REVISION_FMI: 'AMBITO',
  FED_SUBE_TASAS: 'AMBITO',
  RENUNCIA_MINISTRO: 'BOLETIN_OFICIAL',
  MARCHA_FEDERAL: 'PAGINA_12',
  INVERSION_RECORD: 'CRONISTA',
  // Campaña
  DILEMMA_MES_5_EMPRESARIO: 'CLARIN',
  DILEMMA_MES_7_FILTRACION: 'INFOBAE',
  DILEMMA_MES_9_BARONES: 'CLARIN',
  // Expansión destacada
  VENCIMIENTO_BONO_WALL_STREET_DURO: 'AMBITO',
  DISPARADA_BRECHA_CCL_45: 'AMBITO',
  QUIEBRA_BANCO_MEDIANO_PROVINCIAL: 'AMBITO',
  JUICIO_YPF_EMBARGO_ACCIONES_EEUU: 'AMBITO',
  GUERRA_ORIENTE_MEDIO_SUBA_PETROLEO: 'AMBITO',
  FALLO_CORTE_INCONSTITUCIONAL_DNU: 'BOLETIN_OFICIAL',
  PEDIDO_INTERVENCION_FEDERAL_CRISIS_PROV: 'BOLETIN_OFICIAL',
  VETO_COMPENSADO_UNIVERSIDADES_JUBILADOS: 'BOLETIN_OFICIAL',
  NEGOCIACION_PLIEGOS_EMBAJADORES: 'BOLETIN_OFICIAL',
  CONFLICTO_LICITACION_PASAPORTES_DNI: 'BOLETIN_OFICIAL',
  OPERACION_CAMBIO_REGISTRO_PARTIDO: 'BOLETIN_OFICIAL',
  AMENAZA_CUASIMONEDA_PROVINCIAL: 'VOZ_INTERIOR',
  LIGA_GOBERNADORES_PATAGONICOS_CORTE_GAS: 'VOZ_INTERIOR',
  INUNDACIONES_LITORAL_Y_NUCLEO: 'VOZ_INTERIOR',
  INCENDIOS_FORESTALES_CORDOBA_PATAGONIA: 'VOZ_INTERIOR',
  BAJANTE_HISTORICA_RIO_PARANA: 'VOZ_INTERIOR',
  CORTE_PASO_CRISTO_REDENTOR_NIEVE: 'VOZ_INTERIOR',
  CRISIS_HIDRICA_CUYO_MENDOZA_SAN_JUAN: 'VOZ_INTERIOR',
  COLAPSO_PUENTE_RUTA_NACIONAL_CLAVE: 'VOZ_INTERIOR',
  SISMO_EN_CUYO_INFRAESTRUCTURA: 'VOZ_INTERIOR',
  PROTESTA_MEDICOS_RESIDENTES_GARRAHAN: 'PAGINA_12',
  MARCHA_JUBILADOS_CONGRESO_REPRESION: 'PAGINA_12',
  HUELGA_DOCENTE_INICIO_CLASES: 'PAGINA_12',
  ESCANDALO_SERVICIOS_INTELIGENCIA: 'PAGINA_12',
  DENUNCIA_VIOLENCIA_INST_EN_MARCHA: 'PAGINA_12',
  FILTRACION_CHATS_GABINETE: 'INFOBAE',
  FILTRACION_PANDORA_CUENTAS_MINISTRO: 'INFOBAE',
  HACKERS_ROBAN_BASE_RENAPER_O_ANses: 'INFOBAE',
  OPERETA_DEEPFAKE_EN_ELECCION: 'INFOBAE',
  SAQUEOS_COORDINADOS_CONURBANO: 'INFOBAE',
  CRIPTOESTAFAS_O_PUBLICIDAD_OFICIAL: 'INFOBAE'
};

const CATEGORY_DEFAULT_NEWSPAPER: Record<GovernmentEventCategory | 'CAMPANA', NewspaperId> = {
  ECONOMIA: 'AMBITO',
  SOCIAL: 'CLARIN',
  INSTITUCIONAL: 'LA_NACION',
  ENERGIA: 'CRONISTA',
  EXTERNO: 'LA_NACION',
  CAMPANA: 'CLARIN'
};

const CATEGORY_FALLBACK_FILE: Record<GovernmentEventCategory | 'CAMPANA', string> = {
  ECONOMIA: '/img/events/fallbacks/economia.webp',
  SOCIAL: '/img/events/fallbacks/social.webp',
  INSTITUCIONAL: '/img/events/fallbacks/institucional.webp',
  ENERGIA: '/img/events/fallbacks/energia.webp',
  EXTERNO: '/img/events/fallbacks/externo.webp',
  CAMPANA: '/img/events/fallbacks/campana.webp'
};

const EXACT_EVENT_PLATES = new Set<string>([
  'paro_general_cgt',
  'sequia_pampeana',
  'corrida_cambiaria',
  'audios_en_la_rosada',
  'blackout_de_verano',
  'gobernadores_reclaman',
  'cautelar_contra_dnu',
  'revision_fmi',
  'fed_sube_tasas',
  'renuncia_ministro',
  'inversion_record',
  'marcha_federal',
  'dilemma_mes_9_barones'
]);

const THEMATIC_PLATE_RULES: Array<[RegExp, string]> = [
  [/SOJA|MAIZ|CAMPO|LOCKOUT|INUNDACION|BAJANTE|PLAGA|HIDRICA|SEQUIA|AFTOSA/, 'sequia_pampeana'],
  [/WALL_STREET|BONO|BUITRE|MSCI|RESERVA|FMI|MERCOSUR|BRASIL|OCDE|CASA_BLANCA|CHINA/, 'fed_sube_tasas'],
  [/CORRIDA|BRECHA|CCL|BANCO|MONEY_MARKET|CHEQUES|INFLACION|TURISTICO/, 'corrida_cambiaria'],
  [/CORTE|CAUTELAR|AMPARO|JUICIO|YPF|CASACION|JUEZ|LICITACION|PROCESAMIENTO|LABORAL/, 'cautelar_contra_dnu'],
  [/UNIVERS|DOCENTE|JUBILAD|MEDICO|INQUILIN|PLEBISCITO/, 'marcha_federal'],
  [/PARO|CAMIONER|TOMA_PLANTA|ACAMPE|HUELGA|SAQUEO|CGT|MARCHA|TAXIS|CARAVANA/, 'paro_general_cgt'],
  [/LITIO|MINER|COBRE|PETROL|MEGAPLANTA|VACA_MUERTA|COMPRA_MULTINACIONAL/, 'inversion_record'],
  [/APAGON|BLACKOUT|OLA_POLAR|GNC|TORMENTA|REPRESA|INCENDIO|SISMO|PUENTE|DERRAME/, 'blackout_de_verano'],
  [/AUDIO|FILTRACION|CHAT|DEEPFAKE|HACKER|SIDE|CRIPTO|MEDIO|PAUTA|APORTES/, 'audios_en_la_rosada'],
  [/GOBERNADOR|CUASIMONEDA|BLOQUE|SENADO|DIPUTAD|INTERVENCION|HIDROVIA|OPOSICION|VETO/, 'gobernadores_reclaman'],
  [/RENUNCIA|MINISTRO|PLIEGO|EMPRESARIO|VICEPRESIDENTE|COLOQUIO|MOROSIDAD/, 'renuncia_ministro'],
  [/CAMPANA|ELECCION|FISCALIZACION|BARONES|DEBATE|ENCUESTA|OUTSIDER|PASAPORTE|REGISTRO/, 'dilemma_mes_9_barones']
];

function resolvePlateSlug(eventId: string, category: GovernmentEventCategory | 'CAMPANA'): string {
  const lower = eventId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (EXACT_EVENT_PLATES.has(lower)) {
    return lower;
  }
  const upper = eventId.toUpperCase();
  const hit = THEMATIC_PLATE_RULES.find(([pattern]) => pattern.test(upper));
  if (hit) {
    return hit[1];
  }
  const byCategory: Record<GovernmentEventCategory | 'CAMPANA', string> = {
    ECONOMIA: 'corrida_cambiaria',
    SOCIAL: 'paro_general_cgt',
    INSTITUCIONAL: 'cautelar_contra_dnu',
    ENERGIA: 'blackout_de_verano',
    EXTERNO: 'revision_fmi',
    CAMPANA: 'dilemma_mes_9_barones'
  };
  return byCategory[category];
}

export function resolveEventNewspaper(
  eventId: string,
  category: GovernmentEventCategory | 'CAMPANA'
): NewspaperMastheadSpec {
  const mappedId = EVENT_NEWSPAPER_OVERRIDES[eventId] ?? CATEGORY_DEFAULT_NEWSPAPER[category];
  return NEWSPAPER_MASTHEADS[mappedId];
}

export function resolveEventImagePaths(
  eventId: string,
  category: GovernmentEventCategory | 'CAMPANA'
): { primarySrc: string; fallbackSrc: string } {
  const plateSlug = resolvePlateSlug(eventId, category);
  return {
    primarySrc: `/img/events/${plateSlug}.webp`,
    fallbackSrc: CATEGORY_FALLBACK_FILE[category]
  };
}
