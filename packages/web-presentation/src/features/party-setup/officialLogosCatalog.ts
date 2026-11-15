export type LogoBackdropMode = 'light' | 'dark' | 'transparent';

export interface OfficialLogoSpec {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly officialName: string;
  readonly backdrop: LogoBackdropMode;
  readonly licenseNote: string;
}

const LLA_LOGO: OfficialLogoSpec = {
  id: 'LLA',
  src: '/logos/partido-lla.svg',
  alt: 'La Libertad Avanza',
  officialName: 'La Libertad Avanza (LLA)',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Partido La Libertad Avanza',
};

const PRO_LOGO: OfficialLogoSpec = {
  id: 'PRO',
  src: '/logos/partido-pro-2026.png',
  alt: 'Propuesta Republicana',
  officialName: 'PRO - Propuesta Republicana',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Logo PRO 2026',
};

const FUERZA_PATRIA_LOGO: OfficialLogoSpec = {
  id: 'UXP',
  src: '/logos/partido-fuerza-patria-png.png',
  alt: 'Fuerza Patria / Unión por la Patria',
  officialName: 'Fuerza Patria / Unión por la Patria (PJ)',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Coalición Fuerza Patria / UxP',
};

const PJ_LOGO: OfficialLogoSpec = {
  id: 'PJ',
  src: '/logos/partido-pj.svg',
  alt: 'Partido Justicialista',
  officialName: 'Partido Justicialista (PJ)',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Escudo Partido Justicialista',
};

const UCR_LOGO: OfficialLogoSpec = {
  id: 'UCR',
  src: '/logos/partido-ucr.svg',
  alt: 'Unión Cívica Radical',
  officialName: 'Unión Cívica Radical (UCR)',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Escudo oficial UCR',
};

const PROVINCIAS_UNIDAS_LOGO: OfficialLogoSpec = {
  id: 'PF',
  src: '/logos/partido-provincias-unidas.svg',
  alt: 'Provincias Unidas',
  officialName: 'Provincias Unidas / Hacemos',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Frente Provincias Unidas',
};

const INNOVACION_FEDERAL_LOGO: OfficialLogoSpec = {
  id: 'PROVINCIALES',
  src: '/logos/partido-innovacion-federal.png',
  alt: 'Innovación Federal',
  officialName: 'Innovación Federal y Bloques Provinciales',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Bloque Innovación Federal',
};

const FITU_LOGO: OfficialLogoSpec = {
  id: 'FIT',
  src: '/logos/partido-fitu.svg',
  alt: 'Frente de Izquierda y de Trabajadores - Unidad',
  officialName: 'Frente de Izquierda y de Trabajadores - Unidad (FIT-U)',
  backdrop: 'dark',
  licenseNote: 'Wikimedia Commons · Isologo FIT-U',
};

const CC_ARI_LOGO: OfficialLogoSpec = {
  id: 'CC',
  src: '/logos/partido-cc-ari.svg',
  alt: 'Coalición Cívica ARI',
  officialName: 'Coalición Cívica ARI',
  backdrop: 'light',
  licenseNote: 'Wikimedia Commons · Logo Coalición Cívica ARI',
};

// Varios alias porque los datasets viejos mezclan 'UxP', 'UXP', 'FP', 'PF', 'FIT-U'
export const PARTY_OFFICIAL_LOGOS: Record<string, OfficialLogoSpec> = {
  LLA: LLA_LOGO,
  PRO: PRO_LOGO,
  UXP: FUERZA_PATRIA_LOGO,
  UxP: FUERZA_PATRIA_LOGO,
  FP: FUERZA_PATRIA_LOGO,
  PJ: PJ_LOGO,
  UCR: UCR_LOGO,
  PF: PROVINCIAS_UNIDAS_LOGO,
  PU: PROVINCIAS_UNIDAS_LOGO,
  HXC: { ...PROVINCIAS_UNIDAS_LOGO, src: '/logos/partido-hacemos.svg', alt: 'Hacemos por Nuestro País' },
  PROVINCIALES: INNOVACION_FEDERAL_LOGO,
  PROV: INNOVACION_FEDERAL_LOGO,
  FIT: FITU_LOGO,
  FITU: FITU_LOGO,
  'FIT-U': FITU_LOGO,
  CC: CC_ARI_LOGO,
};

export type InstitutionalLogoId =
  | 'ESCUDO_NACIONAL'
  | 'PRESIDENCIA'
  | 'BOLETIN_OFICIAL'
  | 'DIPUTADOS'
  | 'DIPUTADOS_TV'
  | 'SENADO'
  | 'BCRA'
  | 'CSJN';

export const INSTITUTIONAL_LOGOS: Record<InstitutionalLogoId, OfficialLogoSpec> = {
  ESCUDO_NACIONAL: {
    id: 'ESCUDO_NACIONAL',
    src: '/logos/estado-escudo-nacional.svg',
    alt: 'Escudo Nacional Argentino',
    officialName: 'República Argentina · Escudo Nacional',
    backdrop: 'transparent',
    licenseNote: 'Dominio Público · Escudo de la República Argentina',
  },
  PRESIDENCIA: {
    id: 'PRESIDENCIA',
    src: '/logos/estado-presidencia.svg',
    alt: 'Presidencia de la Nación Argentina',
    officialName: 'Presidencia de la Nación Argentina',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Presidencia de la Nación',
  },
  BOLETIN_OFICIAL: {
    id: 'BOLETIN_OFICIAL',
    src: '/logos/estado-boletin-oficial.png',
    alt: 'Boletín Oficial de la República Argentina',
    officialName: 'Boletín Oficial de la República Argentina',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · BORA',
  },
  DIPUTADOS: {
    id: 'DIPUTADOS',
    src: '/logos/estado-diputados.svg',
    alt: 'Honorable Cámara de Diputados de la Nación',
    officialName: 'H. Cámara de Diputados de la Nación',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · HCDN',
  },
  DIPUTADOS_TV: {
    id: 'DIPUTADOS_TV',
    src: '/logos/estado-diputados-tv.png',
    alt: 'Diputados TV',
    officialName: 'Diputados TV (DTV)',
    backdrop: 'dark',
    licenseNote: 'Wikimedia Commons · Señal Diputados TV',
  },
  SENADO: {
    id: 'SENADO',
    src: '/logos/estado-senado-inverse.svg',
    alt: 'Honorable Senado de la Nación Argentina',
    officialName: 'H. Senado de la Nación Argentina',
    backdrop: 'dark',
    licenseNote: 'Wikimedia Commons · H. Senado de la Nación',
  },
  BCRA: {
    id: 'BCRA',
    src: '/logos/estado-bcra.svg',
    alt: 'Banco Central de la República Argentina',
    officialName: 'Banco Central de la República Argentina (BCRA)',
    backdrop: 'transparent',
    licenseNote: 'Wikimedia Commons · Emblema oficial BCRA',
  },
  CSJN: {
    id: 'CSJN',
    src: '/logos/estado-corte-suprema.png',
    alt: 'Corte Suprema de Justicia de la Nación',
    officialName: 'Corte Suprema de Justicia de la Nación',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · CSJN',
  },
};

export type MediaOutletLogoId =
  | 'CLARIN'
  | 'LA_NACION'
  | 'LN_MAS'
  | 'TN'
  | 'C5N'
  | 'CRONICA_TV'
  | 'A24'
  | 'CANAL_26'
  | 'TV_PUBLICA'
  | 'INFOBAE'
  | 'AMBITO'
  | 'CRONISTA'
  | 'PAGINA_12'
  | 'VOZ_INTERIOR'
  | 'EL_DESTAPE'
  | 'REVISTA_BARCELONA'
  | 'FORBES'
  | 'BLOOMBERG'
  | 'CNN_ESPANOL';

export const MEDIA_OUTLET_LOGOS: Record<MediaOutletLogoId, OfficialLogoSpec> = {
  CLARIN: {
    id: 'CLARIN',
    src: '/logos/medio-clarin.svg',
    alt: 'Diario Clarín',
    officialName: 'Clarín',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Clarín',
  },
  LA_NACION: {
    id: 'LA_NACION',
    src: '/logos/medio-la-nacion.png',
    alt: 'Diario La Nación',
    officialName: 'LA NACION',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · LA NACION',
  },
  LN_MAS: {
    id: 'LN_MAS',
    src: '/logos/medio-ln-mas.svg',
    alt: 'Señal LN+',
    officialName: 'LN+ (La Nación Más)',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · LN+',
  },
  TN: {
    id: 'TN',
    src: '/logos/medio-tn.svg',
    alt: 'Todo Noticias (TN)',
    officialName: 'TN (Todo Noticias)',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · TN',
  },
  C5N: {
    id: 'C5N',
    src: '/logos/medio-c5n.svg',
    alt: 'C5N Noticias',
    officialName: 'C5N',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · C5N',
  },
  CRONICA_TV: {
    id: 'CRONICA_TV',
    src: '/logos/medio-cronica-tv.png',
    alt: 'Crónica TV',
    officialName: 'Crónica TV',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Crónica TV',
  },
  A24: {
    id: 'A24',
    src: '/logos/medio-a24.svg',
    alt: 'A24 América 24',
    officialName: 'A24',
    backdrop: 'dark',
    licenseNote: 'Wikimedia Commons · A24',
  },
  CANAL_26: {
    id: 'CANAL_26',
    src: '/logos/medio-canal26.svg',
    alt: 'Canal 26',
    officialName: 'Canal 26',
    backdrop: 'transparent',
    licenseNote: 'Wikimedia Commons · Canal 26',
  },
  TV_PUBLICA: {
    id: 'TV_PUBLICA',
    src: '/logos/medio-tv-publica.svg',
    alt: 'Televisión Pública Argentina',
    officialName: 'TV Pública',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · TV Pública',
  },
  INFOBAE: {
    id: 'INFOBAE',
    src: '/logos/medio-infobae.svg',
    alt: 'Infobae',
    officialName: 'Infobae',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Infobae',
  },
  AMBITO: {
    id: 'AMBITO',
    src: '/logos/medio-ambito.png',
    alt: 'Ámbito Financiero',
    officialName: 'Ámbito Financiero',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Ámbito Financiero',
  },
  CRONISTA: {
    id: 'CRONISTA',
    src: '/logos/medio-cronista.png',
    alt: 'El Cronista Comercial',
    officialName: 'El Cronista',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · El Cronista',
  },
  PAGINA_12: {
    id: 'PAGINA_12',
    src: '/logos/medio-pagina12.svg',
    alt: 'Página/12',
    officialName: 'Página/12',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Página/12',
  },
  VOZ_INTERIOR: {
    id: 'VOZ_INTERIOR',
    src: '/logos/medio-lavoz.png',
    alt: 'La Voz del Interior',
    officialName: 'La Voz del Interior',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · La Voz del Interior',
  },
  EL_DESTAPE: {
    id: 'EL_DESTAPE',
    src: '/logos/medio-el-destape.png',
    alt: 'El Destape',
    officialName: 'El Destape',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · El Destape',
  },
  REVISTA_BARCELONA: {
    id: 'REVISTA_BARCELONA',
    src: '/logos/medio-revista-barcelona.jpg',
    alt: 'Revista Barcelona',
    officialName: 'Revista Barcelona',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Revista Barcelona',
  },
  FORBES: {
    id: 'FORBES',
    src: '/logos/medio-forbes.svg',
    alt: 'Forbes Argentina',
    officialName: 'Forbes Argentina',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Forbes',
  },
  BLOOMBERG: {
    id: 'BLOOMBERG',
    src: '/logos/medio-bloomberg.svg',
    alt: 'Bloomberg',
    officialName: 'Bloomberg Línea',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · Bloomberg',
  },
  CNN_ESPANOL: {
    id: 'CNN_ESPANOL',
    src: '/logos/medio-cnn-espanol.svg',
    alt: 'CNN en Español',
    officialName: 'CNN en Español',
    backdrop: 'light',
    licenseNote: 'Wikimedia Commons · CNN en Español',
  },
};

export function resolvePartyOfficialLogo(partyKey: string | null | undefined): OfficialLogoSpec | null {
  if (!partyKey) return null;
  const trimmed = partyKey.trim();
  return PARTY_OFFICIAL_LOGOS[trimmed] ?? PARTY_OFFICIAL_LOGOS[trimmed.toUpperCase()] ?? null;
}

const SELF_FRAMED_LOGO_TOKENS = ['fitu', 'senado-inverse', 'escudo-nacional', 'bcra', 'diputados-tv'];

// Algunos SVGs ya traen fondo oscuro o blanco interno; no meter caja blanca encima al pedo
export function logoNeedsLightBackdrop(src: string | null | undefined): boolean {
  if (!src) return false;
  return SELF_FRAMED_LOGO_TOKENS.every((token) => !src.includes(token));
}
