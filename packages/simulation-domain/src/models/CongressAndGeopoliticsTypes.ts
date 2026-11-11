// Separamos los tipos del Congreso (257 Dip + 72 Sen), el Arbol de Enfoques HOI4,
// las Fuerzas Armadas y la Campaña Electoral para que SimulationTypes no sea una sabana.

export type ParliamentaryBlocId =
  | 'OFICIALISMO_LLA'
  | 'PRO_ALIADOS'
  | 'UCR_DIALOGUISTAS'
  | 'HACEMOS_FEDERAL'
  | 'PROVINCIALES_SIN_TECHO'
  | 'UNION_POR_LA_PATRIA'
  | 'FRENTE_DE_IZQUIERDA';

export interface ParliamentaryBloc {
  id: ParliamentaryBlocId;
  name: string;
  deputiesSeats: number;
  senateSeats: number;
  baseLoyaltyToExecutive: number;
  governorControlledSharePct: number;
  syndicateControlledSharePct: number;
  givesQuorum: boolean;
}

export interface BillArticle {
  id: string;
  title: string;
  category: 'FISCAL' | 'LABORAL' | 'PRIVATIZACIONES' | 'FACULTADES_DELEGADAS' | 'CONCESION_PROVINCIAL';
  supportDeltaInParticular: number;
  approved: boolean;
}

export interface LegislativeBill {
  id: string;
  title: string;
  originChamber: 'DIPUTADOS' | 'SENADO';
  status: 'EN_COMISION' | 'EN_RECINTO' | 'MEDIA_SANCION' | 'SANCIONADA' | 'VETADA' | 'CAIDA_EN_PARTICULAR';
  articles: BillArticle[];
  generalVotesFor: number;
  generalVotesAgainst: number;
}

export interface ActiveDnu {
  id: string;
  title: string;
  rejectedByDeputies: boolean;
  rejectedBySenate: boolean;
  inForce: boolean;
}

export interface CongressState {
  blocs: ParliamentaryBloc[];
  quorumDeputiesCount: number;
  quorumSenateCount: number;
  vetoShieldHeroesCount: number;
  budgetCommitteeControlled: boolean;
  senateAgreementsBlocked: boolean;
  activeBills: LegislativeBill[];
  activeDnus: ActiveDnu[];
}

export type FocusBranch = 'ECONOMIA' | 'INSTITUCIONAL_FEDERAL' | 'DEFENSA_GEOPOLITICA';

export interface NationalFocusNode {
  id: string;
  title: string;
  branch: FocusBranch;
  durationMonths: number;
  progressMonths: number;
  status: 'DISPONIBLE' | 'EN_PROGRESO' | 'COMPLETADO' | 'BLOQUEADO_EXCLUYENTE';
  mutuallyExclusiveWithId: string | null;
  PrerequisiteId: string | null;
  effectSummary: string;
}

export interface MilitaryTheater {
  id: 'FRONTERA_NORTE' | 'ROSARIO_CONURBANO' | 'ATLANTICO_SUR_MILLA_200' | 'MALVINAS_ANTARTIDA';
  name: string;
  readinessPct: number;
  controlAndSovereigntyPct: number;
  illegalFishingOrNarcoPressurePct: number;
}

export interface GeopoliticsAndDefenseState {
  fondefBudgetPctGdp: number;
  armedForcesMoraleAndReadinessPct: number;
  equipmentAlignment: 'OTAN_F16_STRYKER' | 'CHINA_JF17' | 'AUTONOMIA_INVAP_FADEA';
  usAlignmentPct: number;
  chinaAlignmentPct: number;
  brazilMercosurAlignmentPct: number;
  ukMalvinasTensionIndex: number;
  imfQuarterlyTargetsMet: boolean;
  imfWaiverRequired: boolean;
  theaters: MilitaryTheater[];
  focusTree: NationalFocusNode[];
}

export interface ElectoralCampaignState {
  stage: 'GESTION_ORDINARIA' | 'INTERNAS_PASO' | 'PRIMERA_VUELTA' | 'BALOTAJE';
  playerVoteIntentionSurveyPct: number;
  mainRivalVoteIntentionPct: number;
  thirdForceVoteIntentionPct: number;
  conurbanoFiscalizacionCoveragePct: number;
  conurbanoMayorsScissorCutActive: boolean;
  boletaUnicaNacionalApproved: boolean;
  effectiveUrnaProjectedVotePct: number;
  winsInFirstRound45Or40Plus10: boolean;
}

