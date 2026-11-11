import type { DifficultyLevel, PlayableRole } from './SimulationTypes.js';

// Tipos para el creador de partida, politicos reales, espectro ideologico,
// generador vectorial de insignias partidarias, gabinete y series de tiempo.

export type EmblemShape = 'ESCUDO' | 'CIRCULO' | 'CUADRADO' | 'HEXAGONO' | 'ROMBO' | 'BANDERA';

export type EmblemPattern =
  | 'LISO'
  | 'MITADES_VERTICALES'
  | 'MITADES_HORIZONTALES'
  | 'DIAGONAL'
  | 'FRANJAS_HORIZONTALES'
  | 'FRANJAS_VERTICALES'
  | 'RAYOS'
  | 'CRUZ'
  | 'PUNTOS'
  | 'OLAS'
  | 'CHEVRON'
  | 'DEGRADE'
  | 'ANILLOS'
  | 'CUADRANTES'
  | 'TABLERO'
  | 'BANDA_DIAGONAL'
  | 'TRIANGULOS';

export type EmblemSymbol =
  | 'ESTRELLA'
  | 'SOL'
  | 'ENGRANAJE'
  | 'ESPIGA'
  | 'LLAMA'
  | 'LIBRO'
  | 'PALOMA'
  | 'ARBOL'
  | 'MONTANA'
  | 'OLA'
  | 'ANTORCHA'
  | 'CORAZON'
  | 'RAYO'
  | 'LAURELES'
  | 'EDIFICIO'
  | 'FLECHA';

export type EmblemDisc =
  | 'SIN_FONDO'
  | 'DISCO_DE_COLOR'
  | 'DISCO_CLARO'
  | 'DISCO_OSCURO'
  | 'DISCO_TERCER_COLOR';

export interface PartyEmblemConfig {
  shape: EmblemShape;
  pattern: EmblemPattern;
  primaryColor: string;
  secondaryColor: string;
  thirdColor: string;
  symbol: EmblemSymbol;
  symbolColor: string;
  disc: EmblemDisc;
  customImageDataUrl: string | null;
}

export interface PoliticalPartyPreset {
  id: string;
  sigla: string;
  name: string;
  colorName: string;
  primaryColor: string;
  ideology: string;
  description: string;
  economicPosition: number;
  culturalPosition: number;
  socialBase: string;
  emblem: PartyEmblemConfig;
}

export interface RealPoliticianPreset {
  id: string;
  name: string;
  partyId: string;
  partySigla: string;
  ideology: string;
  roleDescription: string;
  difficultyLabel: string;
  difficulty: DifficultyLevel;
  styleTrait: 'Dogmático' | 'Dialoguista' | 'Pragmático' | 'Combativo';
  accentColor: string;
  defaultRole: PlayableRole;
  defaultProvinceId: string;
}

export interface CabinetMinister {
  id: string;
  ministryName: string;
  ministerName: string;
  partySigla: string;
  affinityPct: number;
  isCoalitionQuota: boolean;
  competence: number;
  loyalty: number;
  risk: number;
  performance: number;
  monthlyEffectText: string;
}

export type IndicatorCategory =
  | 'PRECIOS'
  | 'EMPLEO'
  | 'ACTIVIDAD'
  | 'INGRESOS'
  | 'SOCIEDAD'
  | 'SEGURIDAD'
  | 'SECTOR_EXTERNO'
  | 'FINANZAS'
  | 'FINANZAS_PUBLICAS'
  | 'OPINION_PUBLICA'
  | 'DEFENSA';

export interface IndicatorPoint {
  label: string;
  value: number;
}

export interface IndicatorSeriesCard {
  id: string;
  category: IndicatorCategory;
  title: string;
  unit: string;
  currentValue: number;
  monthlyVariation: number;
  variationUnit: string;
  minValue: number;
  maxValue: number;
  subtitle?: string;
  invertColorLogic?: boolean;
  points: IndicatorPoint[];
}

export interface EconomicLeverItem {
  id: string;
  title: string;
  description: string;
  level: -2 | -1 | 0 | 1 | 2;
  levelLabels: [string, string, string, string, string];
}

export interface MeasureEffectBadge {
  label: string;
  rangeText: string;
  isPositive: boolean;
}

export interface SectorMeasureCard {
  id: string;
  sectorId: string;
  title: string;
  description: string;
  durationType: 'TEMPORAL' | 'PERMANENTE';
  frequencyLabel?: string;
  cooldownMonths?: number;
  ideologyTag?: 'IZQUIERDA' | 'CENTRO' | 'DERECHA';
  effectsBadges?: MeasureEffectBadge[];
  active: boolean;
  fiscalCostPctGdp: number;
  inflationEffectPp: number;
  approvalEffectPp: number;
}

export interface RigisectorItem {
  id: string;
  name: string;
  description: string;
  enabledByDecree: boolean;
  monthlyInvestmentMillionUsd: number;
  exportBoostBillionUsd: number;
  localConflictRiskPct: number;
}

export interface CustomTaxProposal {
  id: string;
  name: string;
  articlesText: string;
  ratePct: number;
  estimatedRevenuePctGdp: number;
  approvedByCongress: boolean;
}

export interface GameSetupConfiguration {
  sessionId: string;
  characterMode: 'MI_PERSONAJE' | 'UN_POLITICO_REAL';
  characterName: string;
  selectedPoliticianId: string;
  role: PlayableRole;
  provinceId: string;
  partyMode: 'PARTIDO_EXISTENTE' | 'CREAR_MI_PARTIDO';
  party: PoliticalPartyPreset;
  difficulty: DifficultyLevel;
}

