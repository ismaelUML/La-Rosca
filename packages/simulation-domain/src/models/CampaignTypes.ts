import type { PlayableRole } from './SimulationTypes.js';

// Modelos puros para el sistema electoral y campana politica previa al gobierno:
// interna partidaria, PASO, generales, balotaje, atributos de candidato y mapa provincial.

export type CampaignStageType = 'INTERNA' | 'PASO' | 'GENERAL' | 'BALOTAJE' | 'GOBIERNO';

export type SpaceVitalityState =
  | 'DEBILITADO'
  | 'EN_ASCENSO'
  | 'HEGEMONICO'
  | 'DIVIDIDO'
  | 'MARGINAL';

export interface CandidatePersonalAttributes {
  inteligenciaPercibida: number; // 0-100 (Turquesa)
  convencimiento: number; // 0-100 (Frambuesa)
  relevancia: number; // 0-100 (Azul)
  apoyoPartidario: number; // 0-100 (Naranja)
  vulnerabilidad: number; // 0-100
  negociacion: number; // 0-100
  espacioEstado: SpaceVitalityState;
  espacioEstadoDescripcion: string;
}

export interface CandidatePublicImage {
  imagenPositiva: number; // Verde
  imagenNegativa: number; // Rojo
  desconocimiento: number; // Gris (suma 100 con positiva y negativa)
}

export interface CandidateVotingIntention {
  intencionVotoGeneral: number;
  piso: number; // Bronce
  techo: number; // Azul
  tuInterna: number;
}

export interface InternalPollRival {
  id: string;
  name: string;
  partySigla: string;
  isPlayer: boolean;
  voteSharePct: number;
  color: string;
}

export interface InternalPoll {
  candidates: InternalPollRival[];
  undecidedPct: number;
  marginOfErrorPp: number;
}

export interface DemographicSegmentItem {
  id: string;
  name: string;
  approvalPct: number;
  electorateWeightPct: number;
  dotColor: string;
}

export interface CandidateDemographics {
  byIdeology: DemographicSegmentItem[];
  byAge: DemographicSegmentItem[];
  byIncome: DemographicSegmentItem[];
}

export type IdeologicalAffinity = 'AFIN' | 'NEUTRAL' | 'HOSTIL';

export interface ProvinceCampaignInfo {
  provinceId: string;
  provinceName: string;
  visitsCount: number;
  ideologicalAffinity: IdeologicalAffinity;
  affinityMultiplier: number;
  leadingCandidateName: string;
  leadingPartyColor: string;
  playerVotePct: number;
}

export type CampaignActionId =
  | 'RECORRIDA'
  | 'ENTREVISTA'
  | 'PUBLICIDAD'
  | 'ACTO_PARTIDARIO'
  | 'FORMACION_EQUIPOS'
  | 'DEBATE'
  | 'MILITANCIA_DIGITAL'
  | 'REUNION_AFILIADOS'
  | 'NEGOCIACION_SECTORES';

export interface CampaignActionEffectPill {
  label: string;
  rangeText: string;
  isWarning?: boolean;
}

export interface CampaignActionCard {
  id: CampaignActionId;
  title: string;
  description: string;
  cost: number;
  effects: CampaignActionEffectPill[];
  requirementText?: string;
  minRelevanceRequired?: number;
  onlyBeforeInternal?: boolean;
  needsProvince?: boolean;
}

export interface CampaignStage {
  stage: CampaignStageType;
  stageLabel: string;
  objectiveTitle: string;
  currentMonthIndex: number; // 1 = Enero 2027, 4 = Abril 2027 (Interna), 12 = Dic 2027
  formattedDate: string;
}

export interface CampaignSimulationState {
  stage: CampaignStage;
  candidateId: string;
  candidateName: string;
  partyId: string;
  partySigla: string;
  partyColor: string;
  targetRole: PlayableRole;
  targetProvinceId: string;
  attributes: CandidatePersonalAttributes;
  image: CandidatePublicImage;
  votingIntention: CandidateVotingIntention;
  internalPoll: InternalPoll;
  demographics: CandidateDemographics;
  provinces: ProvinceCampaignInfo[];
  budgetArgentums: number;
  actionsRemainingThisMonth: number;
  actionsTotalThisMonth: number;
  historyLog: string[];
}

export type CampaignExecutePayload =
  | { actionId: 'RECORRIDA'; selectedProvinceId: string }
  | { actionId: Exclude<CampaignActionId, 'RECORRIDA'> };
