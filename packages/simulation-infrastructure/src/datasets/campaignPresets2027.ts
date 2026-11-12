import {
  createInitialCountryMood,
  resolvePartyAxis,
  type CampaignActionCard,
  type CampaignSimulationState,
  type CandidateDemographics,
  type CandidatePersonalAttributes,
  type CandidatePublicImage,
  type CandidateVotingIntention,
  type InternalPoll,
  type PlayableRole,
  type PoliticalPartyPreset,
  type ProvinceCampaignInfo,
  type RealPoliticianPreset
} from '@argentina-sim/domain';

// Catalogo completo de las 9 acciones de campana y fabrica de estados
// electorales preconfigurados por cada fuerza politica real y personalizada.

export const CAMPAIGN_ACTIONS_CATALOG: CampaignActionCard[] = [
  {
    id: 'RECORRIDA',
    title: 'Recorrida',
    description: 'Visitar una provincia (o zona, si competís por una gobernación).',
    cost: 8.6,
    needsProvince: true,
    requirementText: 'Requisito: El efecto depende de cuánto coincide la provincia con tu ideología y de cuántas veces ya la visitaste.',
    effects: [
      { label: 'IMAGEN EN LA ZONA', rangeText: '+2,4/+9,7' },
      { label: 'IMAGEN POSITIVA', rangeText: '+2,5/+9,8' },
      { label: 'RELEVANCIA', rangeText: '+0,5/+1,5' },
      { label: 'APOYO PARTIDARIO', rangeText: '+0,3/+1,2' },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+0,3', isWarning: true },
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '-0,2/0', isWarning: true }
    ]
  },
  {
    id: 'ENTREVISTA',
    title: 'Entrevista',
    description: 'Entrevista en radio, TV o streaming.',
    cost: 3.6,
    effects: [
      { label: 'IMAGEN POSITIVA', rangeText: '0/+0,3' },
      { label: 'DESCONOCIMIENTO', rangeText: '-3,5/-0,6' },
      { label: 'RELEVANCIA', rangeText: '+0,3/+1,8' },
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '-1,9/+2,3' },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+1,2', isWarning: true }
    ]
  },
  {
    id: 'PUBLICIDAD',
    title: 'Publicidad',
    description: 'Campaña en medios y redes pagas.',
    cost: 10.8,
    effects: [
      { label: 'DESCONOCIMIENTO', rangeText: '-9,2/-3,5' },
      { label: 'IMAGEN POSITIVA', rangeText: '0/+0,3' },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+1,7', isWarning: true },
      { label: 'RELEVANCIA', rangeText: '+0,6/+1,7' },
      { label: 'CONVENCIMIENTO', rangeText: '0/+1,4' }
    ]
  },
  {
    id: 'ACTO_PARTIDARIO',
    title: 'Acto partidario',
    description: 'Un acto con militancia y dirigentes.',
    cost: 7.2,
    effects: [
      { label: 'APOYO PARTIDARIO', rangeText: '+0,7/+2,5' },
      { label: 'CONVENCIMIENTO', rangeText: '+0,9/+2,8' },
      { label: 'RELEVANCIA', rangeText: '+0,3/+1,6' },
      { label: 'IMAGEN POSITIVA', rangeText: '-0,3/0', isWarning: true }
    ]
  },
  {
    id: 'FORMACION_EQUIPOS',
    title: 'Formación de equipos',
    description: 'Sumar técnicos y referentes al equipo de campaña.',
    cost: 5.4,
    effects: [
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '+1,2/+3,9' },
      { label: 'APOYO PARTIDARIO', rangeText: '+0,5/+2,1' },
      { label: 'VULNERABILIDAD', rangeText: '0/+0,4', isWarning: true }
    ]
  },
  {
    id: 'DEBATE',
    title: 'Debate',
    description: 'Participar en un debate público o partidario.',
    cost: 4.5,
    minRelevanceRequired: 25,
    requirementText: 'Requisito: Relevancia mínima de 25.',
    effects: [
      { label: 'RELEVANCIA', rangeText: '+0,9/+3,2' },
      { label: 'IMAGEN POSITIVA', rangeText: '-3,4/+0,4' },
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '-1,7/+4' },
      { label: 'CONVENCIMIENTO', rangeText: '-0,9/+3,5' },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+1,7', isWarning: true }
    ]
  },
  {
    id: 'MILITANCIA_DIGITAL',
    title: 'Militancia digital',
    description: 'Coordinar presencia en redes sociales.',
    cost: 4.5,
    effects: [
      { label: 'RELEVANCIA', rangeText: '+0,9/+2,5' },
      { label: 'APOYO PARTIDARIO', rangeText: '+0,2/+1' },
      { label: 'DESCONOCIMIENTO', rangeText: '-2,9/-0,6' },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+0,7', isWarning: true },
      { label: 'VULNERABILIDAD', rangeText: '0/+0,7', isWarning: true }
    ]
  },
  {
    id: 'REUNION_AFILIADOS',
    title: 'Reunión con afiliados',
    description: 'Encuentros con afiliados y delegados.',
    cost: 2.7,
    onlyBeforeInternal: true,
    requirementText: 'Requisito: Solo antes de la interna partidaria.',
    effects: [
      { label: 'APOYO PARTIDARIO', rangeText: '+0,8/+2,8' },
      { label: 'CONVENCIMIENTO', rangeText: '+0,3/+1,4' }
    ]
  },
  {
    id: 'NEGOCIACION_SECTORES',
    title: 'Negociación con sectores',
    description: 'Acuerdos con sectores internos y delegaciones.',
    cost: 3.6,
    onlyBeforeInternal: true,
    requirementText: 'Requisito: Solo antes de la interna partidaria.',
    effects: [
      { label: 'APOYO PARTIDARIO', rangeText: '+0,7/+2,4' },
      { label: 'NEGOCIACIÓN', rangeText: '+0,6/+2,3' },
      { label: 'CONVENCIMIENTO', rangeText: '-0,5/0', isWarning: true },
      { label: 'IMAGEN NEGATIVA', rangeText: '0/+0,3', isWarning: true }
    ]
  },
  {
    id: 'CARPETAZO_MEDIATICO',
    title: 'Carpetazo mediático',
    description: 'Filtrar a la prensa o streamers afines una contradicción o escándalo del rival interno más cercano.',
    cost: 6.0,
    requirementText: 'Requisito: Vulnerabilidad menor a 40 para no recibir un contragolpe.',
    effects: [
      { label: 'RIVAL INTERNO', rangeText: '-3,2/-7,5', isWarning: true },
      { label: 'RELEVANCIA', rangeText: '+1,5/+3,0' },
      { label: 'VULNERABILIDAD', rangeText: '+1,2/+2,5', isWarning: true },
      { label: 'IMAGEN NEGATIVA', rangeText: '+0,5/+1,8', isWarning: true }
    ]
  },
  {
    id: 'PACTO_CON_INTENDENTES',
    title: 'Pacto con intendentes y punteros',
    description: 'Asegurar el aparato territorial, la entrega de boletas y la fiscalización en los distritos clave.',
    cost: 12.0,
    effects: [
      { label: 'PISO ELECTORAL', rangeText: '+2,0/+4,5' },
      { label: 'APOYO PARTIDARIO', rangeText: '+1,8/+3,5' },
      { label: 'CONVENCIMIENTO', rangeText: '+0,5/+1,5' },
      { label: 'NEGOCIACIÓN', rangeText: '+1,0/+2,5' }
    ]
  },
  {
    id: 'ACTO_ESTADIO_PLAZA',
    title: 'Acto masivo en estadio o plaza',
    description: 'Demostración de fuerza popular con liturgia militante, banderas y discurso épico transmitido en vivo.',
    cost: 14.5,
    minRelevanceRequired: 40,
    requirementText: 'Requisito: Relevancia mínima de 40 para llenar la convocatoria.',
    effects: [
      { label: 'CONVENCIMIENTO', rangeText: '+3,5/+6,2' },
      { label: 'RELEVANCIA', rangeText: '+2,8/+4,5' },
      { label: 'APOYO PARTIDARIO', rangeText: '+2,0/+3,8' },
      { label: 'IMAGEN POSITIVA', rangeText: '+1,0/+2,4' }
    ]
  },
  {
    id: 'CONCILIACION_CIRCULO_ROJO',
    title: 'Almuerzo con el Círculo Rojo (IDEA / UIA)',
    description: 'Reunión reservada con directores ejecutivos y banqueros para presentar tus equipos económicos y fondear la campaña.',
    cost: 1.5,
    effects: [
      { label: 'PRESUPUESTO DE CAMPAÑA', rangeText: '+45,0 ¥' },
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '+1,8/+3,5' },
      { label: 'IMAGEN EN POPULARES', rangeText: '-0,8/0', isWarning: true }
    ]
  },
  {
    id: 'GIRA_INTERNACIONAL',
    title: 'Gira internacional (Washington / Madrid / Roma)',
    description: 'Fotos protocolares con líderes extranjeros y think tanks para proyectar estatura de estadista internacional.',
    cost: 8.5,
    effects: [
      { label: 'IMAGEN POSITIVA', rangeText: '+2,0/+4,2' },
      { label: 'INTELIGENCIA PERCIBIDA', rangeText: '+2,5/+4,8' },
      { label: 'RELEVANCIA', rangeText: '+1,2/+2,5' }
    ]
  },
  {
    id: 'DESPLIEGUE_STREAMERS',
    title: 'Estrategia en streamers e influencers',
    description: 'Copar plataformas de streaming (Twitch, Kick, YouTube) y micro-segmentación en TikTok para el voto sub-30.',
    cost: 5.0,
    effects: [
      { label: 'VOTO 16 A 29 AÑOS', rangeText: '+4,5/+8,0' },
      { label: 'DESCONOCIMIENTO', rangeText: '-4,2/-1,5' },
      { label: 'RELEVANCIA', rangeText: '+1,8/+3,4' }
    ]
  }
];

function resolvePartyPollPresets(
  partySigla: string,
  candidateName: string
): {
  attributes: CandidatePersonalAttributes;
  image: CandidatePublicImage;
  votingIntention: CandidateVotingIntention;
  internalPoll: InternalPoll;
  demographics: CandidateDemographics;
} {
  if (partySigla === 'PRO') {
    return {
      attributes: {
        inteligenciaPercibida: 54.4,
        convencimiento: 43.8,
        relevancia: 62.5,
        apoyoPartidario: 56.8,
        vulnerabilidad: 24.0,
        negociacion: 48.0,
        espacioEstado: 'DEBILITADO',
        espacioEstadoDescripcion: 'Espacio establecido pero debilitado: pesan sobre todo la inteligencia percibida y el convencimiento.'
      },
      image: { imagenPositiva: 56.6, imagenNegativa: 35.1, desconocimiento: 8.3 },
      votingIntention: { intencionVotoGeneral: 7.2, piso: 6.4, techo: 21.5, tuInterna: 49.0 },
      internalPoll: {
        candidates: [
          { id: 'MACRI', name: `${candidateName} (vos)`, partySigla: 'PRO', isPlayer: true, voteSharePct: 49.0, color: '#eab308' },
          { id: 'VIDAL', name: 'María Eugenia Vidal', partySigla: 'PRO', isPlayer: false, voteSharePct: 18.7, color: '#eab308' },
          { id: 'TORRES', name: 'Ignacio Torres', partySigla: 'PRO', isPlayer: false, voteSharePct: 17.6, color: '#a855f7' },
          { id: 'LARRETA', name: 'Horacio Rodríguez Larreta', partySigla: 'PRO', isPlayer: false, voteSharePct: 14.7, color: '#38bdf8' }
        ],
        undecidedPct: 9.0,
        marginOfErrorPp: 4.0
      },
      demographics: {
        byIdeology: [
          { id: 'IZQ', name: 'Izquierda', approvalPct: 32.3, electorateWeightPct: 30, dotColor: '#ef4444' },
          { id: 'CEN', name: 'Centro', approvalPct: 65.2, electorateWeightPct: 38, dotColor: '#14b8a6' },
          { id: 'DER', name: 'Derecha', approvalPct: 69.3, electorateWeightPct: 32, dotColor: '#3b82f6' }
        ],
        byAge: [
          { id: 'A1', name: '16 a 29 años', approvalPct: 57.7, electorateWeightPct: 22, dotColor: '#f97316' },
          { id: 'A2', name: '30 a 44 años', approvalPct: 57.0, electorateWeightPct: 28, dotColor: '#eab308' },
          { id: 'A3', name: '45 a 59 años', approvalPct: 56.2, electorateWeightPct: 24, dotColor: '#a855f7' },
          { id: 'A4', name: '60 años o más', approvalPct: 55.8, electorateWeightPct: 26, dotColor: '#8b5cf6' }
        ],
        byIncome: [
          { id: 'I1', name: 'Poder adquisitivo bajo', approvalPct: 52.8, electorateWeightPct: 40, dotColor: '#f43f5e' },
          { id: 'I2', name: 'Poder adquisitivo medio', approvalPct: 57.1, electorateWeightPct: 42, dotColor: '#38bdf8' },
          { id: 'I3', name: 'Poder adquisitivo alto', approvalPct: 64.1, electorateWeightPct: 18, dotColor: '#10b981' }
        ]
      }
    };
  }

  if (partySigla === 'LLA') {
    return {
      attributes: {
        inteligenciaPercibida: 68.2,
        convencimiento: 74.5,
        relevancia: 88.0,
        apoyoPartidario: 71.0,
        vulnerabilidad: 32.0,
        negociacion: 34.0,
        espacioEstado: 'EN_ASCENSO',
        espacioEstadoDescripcion: 'Espacio oficialista con fuerte polarización: liderazgo indiscutido pero alta resistencia opositora.'
      },
      image: { imagenPositiva: 52.4, imagenNegativa: 42.1, desconocimiento: 5.5 },
      votingIntention: { intencionVotoGeneral: 34.5, piso: 28.0, techo: 48.0, tuInterna: 58.2 },
      internalPoll: {
        candidates: [
          { id: 'MILEI', name: `${candidateName} (vos)`, partySigla: 'LLA', isPlayer: true, voteSharePct: 58.2, color: '#8b5cf6' },
          { id: 'VILLARRUEL', name: 'Victoria Villarruel', partySigla: 'LLA', isPlayer: false, voteSharePct: 22.4, color: '#7c3aed' },
          { id: 'BULLRICH', name: 'Patricia Bullrich', partySigla: 'LLA', isPlayer: false, voteSharePct: 12.1, color: '#c084fc' },
          { id: 'CAPUTO_S', name: 'Santiago Caputo', partySigla: 'LLA', isPlayer: false, voteSharePct: 7.3, color: '#6d28d9' }
        ],
        undecidedPct: 6.0,
        marginOfErrorPp: 3.5
      },
      demographics: {
        byIdeology: [
          { id: 'IZQ', name: 'Izquierda', approvalPct: 12.0, electorateWeightPct: 30, dotColor: '#ef4444' },
          { id: 'CEN', name: 'Centro', approvalPct: 48.5, electorateWeightPct: 38, dotColor: '#14b8a6' },
          { id: 'DER', name: 'Derecha', approvalPct: 84.0, electorateWeightPct: 32, dotColor: '#3b82f6' }
        ],
        byAge: [
          { id: 'A1', name: '16 a 29 años', approvalPct: 68.4, electorateWeightPct: 22, dotColor: '#f97316' },
          { id: 'A2', name: '30 a 44 años', approvalPct: 55.2, electorateWeightPct: 28, dotColor: '#eab308' },
          { id: 'A3', name: '45 a 59 años', approvalPct: 47.1, electorateWeightPct: 24, dotColor: '#a855f7' },
          { id: 'A4', name: '60 años o más', approvalPct: 42.0, electorateWeightPct: 26, dotColor: '#8b5cf6' }
        ],
        byIncome: [
          { id: 'I1', name: 'Poder adquisitivo bajo', approvalPct: 44.5, electorateWeightPct: 40, dotColor: '#f43f5e' },
          { id: 'I2', name: 'Poder adquisitivo medio', approvalPct: 54.0, electorateWeightPct: 42, dotColor: '#38bdf8' },
          { id: 'I3', name: 'Poder adquisitivo alto', approvalPct: 68.0, electorateWeightPct: 18, dotColor: '#10b981' }
        ]
      }
    };
  }

  return {
    attributes: {
      inteligenciaPercibida: 58.0,
      convencimiento: 52.0,
      relevancia: 60.0,
      apoyoPartidario: 62.0,
      vulnerabilidad: 26.0,
      negociacion: 55.0,
      espacioEstado: 'DIVIDIDO',
      espacioEstadoDescripcion: 'Espacio en disputa interna: la clave radica en consolidar la base territorial y sumar desencantados.'
    },
    image: { imagenPositiva: 48.0, imagenNegativa: 38.0, desconocimiento: 14.0 },
    votingIntention: { intencionVotoGeneral: 18.0, piso: 12.0, techo: 34.0, tuInterna: 48.0 },
    internalPoll: {
      candidates: [
        { id: 'PLAYER', name: `${candidateName} (vos)`, partySigla, isPlayer: true, voteSharePct: 48.0, color: '#38bdf8' },
        { id: 'RIVAL_1', name: 'Referente de los Gobernadores', partySigla, isPlayer: false, voteSharePct: 28.0, color: '#60a5fa' },
        { id: 'RIVAL_2', name: 'Delegado Metropolitano', partySigla, isPlayer: false, voteSharePct: 24.0, color: '#93c5fd' }
      ],
      undecidedPct: 8.5,
      marginOfErrorPp: 4.0
    },
    demographics: {
      byIdeology: [
        { id: 'IZQ', name: 'Izquierda', approvalPct: 45.0, electorateWeightPct: 30, dotColor: '#ef4444' },
        { id: 'CEN', name: 'Centro', approvalPct: 56.0, electorateWeightPct: 38, dotColor: '#14b8a6' },
        { id: 'DER', name: 'Derecha', approvalPct: 42.0, electorateWeightPct: 32, dotColor: '#3b82f6' }
      ],
      byAge: [
        { id: 'A1', name: '16 a 29 años', approvalPct: 49.0, electorateWeightPct: 22, dotColor: '#f97316' },
        { id: 'A2', name: '30 a 44 años', approvalPct: 51.0, electorateWeightPct: 28, dotColor: '#eab308' },
        { id: 'A3', name: '45 a 59 años', approvalPct: 52.0, electorateWeightPct: 24, dotColor: '#a855f7' },
        { id: 'A4', name: '60 años o más', approvalPct: 53.0, electorateWeightPct: 26, dotColor: '#8b5cf6' }
      ],
      byIncome: [
        { id: 'I1', name: 'Poder adquisitivo bajo', approvalPct: 55.0, electorateWeightPct: 40, dotColor: '#f43f5e' },
        { id: 'I2', name: 'Poder adquisitivo medio', approvalPct: 51.0, electorateWeightPct: 42, dotColor: '#38bdf8' },
        { id: 'I3', name: 'Poder adquisitivo alto', approvalPct: 44.0, electorateWeightPct: 18, dotColor: '#10b981' }
      ]
    }
  };
}

const BASE_PROVINCES_CONFIG: Array<{ id: string; name: string; affinity: 'AFIN' | 'NEUTRAL' | 'HOSTIL'; mult: number }> = [
  { id: 'PBA', name: 'Buenos Aires', affinity: 'AFIN', mult: 0.99 },
  { id: 'CABA', name: 'Ciudad de Buenos Aires', affinity: 'AFIN', mult: 1.25 },
  { id: 'CORDOBA', name: 'Córdoba', affinity: 'AFIN', mult: 1.15 },
  { id: 'SANTA_FE', name: 'Santa Fe', affinity: 'AFIN', mult: 1.1 },
  { id: 'MENDOZA', name: 'Mendoza', affinity: 'AFIN', mult: 1.12 },
  { id: 'TUCUMAN', name: 'Tucumán', affinity: 'NEUTRAL', mult: 0.9 },
  { id: 'ENTRE_RIOS', name: 'Entre Ríos', affinity: 'AFIN', mult: 1.05 },
  { id: 'SALTA', name: 'Salta', affinity: 'NEUTRAL', mult: 0.88 },
  { id: 'CHACO', name: 'Chaco', affinity: 'NEUTRAL', mult: 0.85 },
  { id: 'CORRIENTES', name: 'Corrientes', affinity: 'AFIN', mult: 1.02 },
  { id: 'MISIONES', name: 'Misiones', affinity: 'NEUTRAL', mult: 0.92 },
  { id: 'SAN_JUAN', name: 'San Juan', affinity: 'NEUTRAL', mult: 0.94 },
  { id: 'JUJUY', name: 'Jujuy', affinity: 'NEUTRAL', mult: 0.9 },
  { id: 'RIO_NEGRO', name: 'Río Negro', affinity: 'NEUTRAL', mult: 0.95 },
  { id: 'NEUQUEN', name: 'Neuquén', affinity: 'NEUTRAL', mult: 0.98 },
  { id: 'FORMOSA', name: 'Formosa', affinity: 'HOSTIL', mult: 0.72 },
  { id: 'CHUBUT', name: 'Chubut', affinity: 'AFIN', mult: 1.08 },
  { id: 'SAN_LUIS', name: 'San Luis', affinity: 'AFIN', mult: 1.04 },
  { id: 'CATAMARCA', name: 'Catamarca', affinity: 'NEUTRAL', mult: 0.86 },
  { id: 'LA_RIOJA', name: 'La Rioja', affinity: 'HOSTIL', mult: 0.75 },
  { id: 'LA_PAMPA', name: 'La Pampa', affinity: 'NEUTRAL', mult: 0.9 },
  { id: 'SANTIAGO_ESTERO', name: 'Santiago del Estero', affinity: 'HOSTIL', mult: 0.7 },
  { id: 'SANTA_CRUZ', name: 'Santa Cruz', affinity: 'NEUTRAL', mult: 0.88 },
  { id: 'TIERRA_DEL_FUEGO', name: 'Tierra del Fuego', affinity: 'NEUTRAL', mult: 0.85 }
];

const PBA_LOCAL_ZONES = [
  { id: 'LA_PLATA', name: 'La Plata y Gran La Plata', visitsCount: 0 },
  { id: 'CONURBANO_NORTE', name: 'Conurbano norte', visitsCount: 0 },
  { id: 'CONURBANO_SUR_OESTE', name: 'Conurbano sur y oeste', visitsCount: 0 },
  { id: 'INTERIOR_BONAERENSE', name: 'Interior bonaerense', visitsCount: 0 }
];

const GENERIC_LOCAL_ZONES = [
  { id: 'CAPITAL', name: 'Capital provincial y alrededores', visitsCount: 0 },
  { id: 'INTERIOR_PRODUCTIVO', name: 'Interior productivo', visitsCount: 0 },
  { id: 'ZONA_NORTE', name: 'Zona norte y valles', visitsCount: 0 },
  { id: 'ZONA_SUR', name: 'Zona sur y sierras', visitsCount: 0 }
];

export function createInitialCampaignState(
  candidate: RealPoliticianPreset | { id: string; name: string },
  party: PoliticalPartyPreset,
  role: PlayableRole,
  provinceId: string
): CampaignSimulationState {
  const presets = resolvePartyPollPresets(party.sigla, candidate.name);

  const provinces: ProvinceCampaignInfo[] = BASE_PROVINCES_CONFIG.map((p) => ({
    provinceId: p.id,
    provinceName: p.name,
    visitsCount: p.id === provinceId ? 1 : 0,
    ideologicalAffinity: p.affinity,
    affinityMultiplier: p.mult,
    leadingCandidateName: candidate.name,
    leadingPartyColor: party.primaryColor,
    playerVotePct: presets.votingIntention.intencionVotoGeneral * p.mult
  }));

  const localZones = provinceId === 'PBA' ? PBA_LOCAL_ZONES : GENERIC_LOCAL_ZONES;

  return {
    stage: {
      stage: 'INTERNA',
      stageLabel: 'Campaña · Interna',
      objectiveTitle: 'Ganar la interna partidaria del 25 de abril de 2027',
      currentMonthIndex: 1,
      formattedDate: '1 de enero de 2027'
    },
    candidateId: candidate.id,
    candidateName: candidate.name,
    partyId: party.id,
    partySigla: party.sigla,
    partyColor: party.primaryColor,
    partyAxis: resolvePartyAxis(party.sigla),
    countryMood: createInitialCountryMood(),
    diplomacy: {
      endorsements: {},
      defections: {},
      coalitions: {},
      delegateId: null
    },
    targetRole: role,
    targetProvinceId: provinceId,
    // Estado inicial de la rosca: sin fatiga acumulada en spots, sin dirigentes bloqueados
    // por mandarles mensaje un domingo a la noche, y sin coaliciones cerradas de antemano.
    actionUsageCount: {},
    politicianCooldowns: {},
    isCandidacyConfirmed: false,
    coalitionParties: [],
    runningMateId: null,
    rejectedAlliances: [],
    attributes: presets.attributes,
    image: presets.image,
    votingIntention: presets.votingIntention,
    internalPoll: presets.internalPoll,
    demographics: presets.demographics,
    provinces,
    localZones,
    budgetArgentums: 125.0,
    actionsRemainingThisMonth: 4,
    actionsTotalThisMonth: 4,
    historyLog: [
      `Inicio de campaña 2027: postulación registrada para ${role} con base en ${provinceId}.`,
      'Objetivo inicial: consolidar la interna partidaria del 25 de abril de 2027.'
    ]
  };
}

