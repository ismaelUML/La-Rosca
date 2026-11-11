import type { PlayableRole } from '../models/SimulationTypes.js';
import type { RealPoliticianPreset } from '../models/PartyAndSetupTypes.js';
import type {
  CampaignSimulationState,
  CampaignStageType,
  CountryMoodSnapshot,
  IdeologicalAxisPosition
} from '../models/CampaignTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { seededJitter, seededUnit } from './countryMoodEngine.js';

// Motor de afinidad política: decide si un dirigente te apoya, si se pasa a tu partido
// y si otra fuerza acepta ir en coalición. Todo sale de una regresión logística con
// factores explicables, porque el jugador tiene que poder leer el "Por qué" y no sentir
// que la IA tira una moneda. La moneda existe (semilla por mes), pero está cargada.

export const PARTY_IDEOLOGY_AXIS: Record<string, IdeologicalAxisPosition> = {
  FIT: { economic: 5, cultural: 8 },
  UxP: { economic: 28, cultural: 30 },
  UCR: { economic: 50, cultural: 40 },
  PF: { economic: 52, cultural: 55 },
  PRO: { economic: 70, cultural: 55 },
  LLA: { economic: 88, cultural: 78 }
};

const CENTER_AXIS: IdeologicalAxisPosition = { economic: 50, cultural: 50 };

export function resolvePartyAxis(sigla: string): IdeologicalAxisPosition {
  return PARTY_IDEOLOGY_AXIS[sigla] ?? CENTER_AXIS;
}

export interface PoliticianProfile {
  id: string;
  name: string;
  partySigla: string;
  roleDescription: string;
  axis: IdeologicalAxisPosition;
  relevance: number;
  influence: number;
  partyLoyalty: number;
  ambition: number;
  isDogmatic: boolean;
  holdsOffice: boolean;
}

// Primera coincidencia gana, por eso "presidente de la nación" va antes que "presidente".
const ROLE_RELEVANCE_TABLE: Array<[string, number]> = [
  ['presidente de la nación', 96],
  ['expresident', 86],
  ['vicepresident', 84],
  ['jefe de gabinete', 78],
  ['jefe de gobierno', 77],
  ['gobernador', 76],
  ['exgobernador', 64],
  ['presidente de la cámara', 68],
  ['ministr', 66],
  ['canciller', 64],
  ['vocero', 60],
  ['senador', 60],
  ['secretari', 54],
  ['consultor', 56],
  ['diputad', 48],
  ['economista', 44],
  ['intendente', 42],
  ['armador', 38],
  ['legislador', 30],
  ['concejal', 22]
];

const OFFICE_KEYWORDS = ['ministr', 'secretari', 'presidente de la nación', 'gobernador', 'intendente', 'vocero', 'canciller', 'jefe de', 'vicepresident'];

const RUPTURE_MARKERS = ['distanciad', 'ruptura', 'disidente', 'crític', 'enfrentad'];

function baseRelevanceFromRole(roleDescription: string): number {
  const low = roleDescription.toLowerCase();
  const hit = ROLE_RELEVANCE_TABLE.find(([keyword]) => low.includes(keyword));
  return hit ? hit[1] : 34;
}

function holdsExecutiveOffice(roleDescription: string): boolean {
  // Solo miramos el primer tramo antes de la coma: "Senadora, exministra" no es funcionaria.
  const firstSegment = roleDescription.toLowerCase().split(',')[0] ?? '';
  const isFormer = firstSegment.trim().startsWith('ex');
  return !isFormer && OFFICE_KEYWORDS.some((keyword) => firstSegment.includes(keyword));
}

function pushFromCenter(value: number, amount: number): number {
  return value + Math.sign(value - 50) * amount;
}

function buildPoliticianAxis(preset: RealPoliticianPreset, isDogmatic: boolean): IdeologicalAxisPosition {
  const base = resolvePartyAxis(preset.partySigla);
  // Los dogmáticos tiran a los extremos de su espacio; los dialoguistas se corren al centro.
  const push = isDogmatic ? 6 : -4;
  return {
    economic: clamp(pushFromCenter(base.economic, push) + seededJitter(`${preset.id}-eco`, 7), 1, 100),
    cultural: clamp(pushFromCenter(base.cultural, push) + seededJitter(`${preset.id}-cul`, 7), 1, 100)
  };
}

function buildLoyalty(preset: RealPoliticianPreset, isDogmatic: boolean): number {
  const low = preset.roleDescription.toLowerCase();
  const dogmaBonus = isDogmatic ? 18 : 0;
  const rupturePenalty = RUPTURE_MARKERS.some((marker) => low.includes(marker)) ? -30 : 0;
  return round2(clamp(56 + dogmaBonus + rupturePenalty + seededJitter(`${preset.id}-loy`, 12), 4, 98));
}

export function buildPoliticianProfile(preset: RealPoliticianPreset): PoliticianProfile {
  const isDogmatic = preset.styleTrait === 'Dogmático';
  const relevance = round2(clamp(baseRelevanceFromRole(preset.roleDescription) + seededJitter(`${preset.id}-rel`, 6), 5, 99));
  return {
    id: preset.id,
    name: preset.name,
    partySigla: preset.partySigla,
    roleDescription: preset.roleDescription,
    axis: buildPoliticianAxis(preset, isDogmatic),
    relevance,
    influence: round2(clamp(relevance * 0.85 + seededJitter(`${preset.id}-inf`, 10), 3, 99)),
    partyLoyalty: buildLoyalty(preset, isDogmatic),
    ambition: round2(clamp(48 + (relevance - 50) * 0.3 + seededJitter(`${preset.id}-amb`, 28), 5, 98)),
    isDogmatic,
    holdsOffice: holdsExecutiveOffice(preset.roleDescription)
  };
}

export function ideologicalDistance(a: IdeologicalAxisPosition, b: IdeologicalAxisPosition): number {
  const de = a.economic - b.economic;
  const dc = a.cultural - b.cultural;
  // La economía pesa más que lo cultural a la hora de armar listas: el bolsillo manda.
  return round2(Math.sqrt(de * de * 0.65 + dc * dc * 0.35));
}

export function affinityPctFromDistance(distance: number): number {
  return Math.round(clamp(100 - distance * 1.25, 0, 100));
}

export interface PlayerStanding {
  partySigla: string;
  axis: IdeologicalAxisPosition;
  imagenPositiva: number;
  imagenNegativa: number;
  intencionVoto: number;
  relevancia: number;
  negociacion: number;
  stage: CampaignStageType;
  monthIndex: number;
  internalRivalNames: string[];
}

export function buildPlayerStanding(state: CampaignSimulationState): PlayerStanding {
  return {
    partySigla: state.partySigla,
    axis: state.partyAxis ?? resolvePartyAxis(state.partySigla),
    imagenPositiva: state.image.imagenPositiva,
    imagenNegativa: state.image.imagenNegativa,
    intencionVoto: state.votingIntention.intencionVotoGeneral,
    relevancia: state.attributes.relevancia,
    negociacion: state.attributes.negociacion,
    stage: state.stage.stage,
    monthIndex: state.stage.currentMonthIndex,
    internalRivalNames: state.internalPoll.candidates.filter((c) => !c.isPlayer).map((c) => c.name)
  };
}

export interface DecisionFactor {
  label: string;
  contribution: number;
}

export interface NegotiationAssessment {
  probabilityPct: number;
  blockedReason: string | null;
  factors: DecisionFactor[];
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-clamp(z, -20, 20)));
}

function rankFactors(factors: DecisionFactor[]): DecisionFactor[] {
  return factors
    .filter((f) => Math.abs(f.contribution) >= 0.05)
    .map((f) => ({ label: f.label, contribution: round2(f.contribution) }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

function assembleAssessment(base: number, factors: DecisionFactor[], blockedReason: string | null): NegotiationAssessment {
  const z = factors.reduce((acc, f) => acc + f.contribution, base);
  const probability = Math.round(clamp(sigmoid(z) * 100, 2, 97));
  return {
    probabilityPct: blockedReason ? 0 : probability,
    blockedReason,
    factors: rankFactors(factors)
  };
}

function boolWeight(flag: boolean, weight: number): number {
  return flag ? weight : 0;
}

function allTrue(...flags: boolean[]): boolean {
  return flags.every(Boolean);
}

function firstBlock(rules: Array<[boolean, string]>): string | null {
  const hit = rules.find(([condition]) => condition);
  return hit ? hit[1] : null;
}

function dogmaMultiplier(profile: PoliticianProfile): number {
  return profile.isDogmatic ? 1.6 : 1;
}

function isIncumbentSide(sigla: string, mood: CountryMoodSnapshot): boolean {
  return sigla === mood.incumbentPartySigla;
}

function approvalGap(mood: CountryMoodSnapshot): number {
  return (mood.governmentApprovalPct - 45) / 10;
}

function contextEndorsementShift(player: PlayerStanding, mood: CountryMoodSnapshot): number {
  // Oficialismo popular atrae avales; oficialismo hundido los espanta (y al revés para la oposición).
  return isIncumbentSide(player.partySigla, mood) ? approvalGap(mood) * 0.5 : -approvalGap(mood) * 0.35;
}

function endorsementFactors(profile: PoliticianProfile, player: PlayerStanding, mood: CountryMoodSnapshot): DecisionFactor[] {
  const distance = ideologicalDistance(profile.axis, player.axis);
  const sameParty = profile.partySigla === player.partySigla;
  return [
    { label: 'Distancia ideológica', contribution: -0.055 * distance * dogmaMultiplier(profile) },
    { label: 'Es de tu mismo partido', contribution: boolWeight(sameParty, 1.3) },
    { label: 'Tu imagen positiva', contribution: 0.04 * (player.imagenPositiva - 45) },
    { label: 'Tu imagen negativa', contribution: -0.035 * (player.imagenNegativa - 35) },
    { label: 'Tu intención de voto', contribution: 0.05 * (player.intencionVoto - 12) },
    { label: 'Su peso propio frente al tuyo', contribution: -0.025 * (profile.relevance - player.relevancia) },
    { label: 'Tiene cargo en otro gobierno', contribution: boolWeight(allTrue(profile.holdsOffice, !sameParty), -0.9) },
    { label: 'Momento del país', contribution: contextEndorsementShift(player, mood) }
  ];
}

function endorsementBlock(profile: PoliticianProfile, player: PlayerStanding): string | null {
  const outsider = profile.partySigla !== player.partySigla;
  const distance = ideologicalDistance(profile.axis, player.axis);
  return firstBlock([
    [player.internalRivalNames.includes(profile.name), 'Compite contra vos en la interna.'],
    [allTrue(player.stage === 'INTERNA', outsider), 'Antes de la interna solo podés pedir apoyo a dirigentes de tu partido.'],
    [allTrue(profile.isDogmatic, outsider, distance > 32), 'Dogmático: no apoya a quien está lejos de su ideología.'],
    [allTrue(profile.relevance > 90, outsider), 'Es candidato de otra fuerza.']
  ]);
}

export function assessEndorsement(profile: PoliticianProfile, player: PlayerStanding, mood: CountryMoodSnapshot): NegotiationAssessment {
  return assembleAssessment(0.6, endorsementFactors(profile, player, mood), endorsementBlock(profile, player));
}

function defectionMoodShift(profile: PoliticianProfile, mood: CountryMoodSnapshot): number {
  // Cuando el oficialismo se hunde, sus dirigentes buscan bote salvavidas; si la grieta está
  // caliente, cruzarse de vereda se paga caro y nadie se mueve.
  return isIncumbentSide(profile.partySigla, mood)
    ? (45 - mood.governmentApprovalPct) * 0.05
    : (mood.polarizationIndex - 50) * -0.015;
}

function defectionFactors(profile: PoliticianProfile, player: PlayerStanding, mood: CountryMoodSnapshot): DecisionFactor[] {
  const distance = ideologicalDistance(profile.axis, player.axis);
  const theirPolling = mood.partyPolling[profile.partySigla] ?? 5;
  return [
    { label: 'Distancia ideológica', contribution: -0.07 * distance * dogmaMultiplier(profile) },
    { label: 'Lealtad a su partido', contribution: -0.04 * (profile.partyLoyalty - 50) },
    { label: 'Ambición personal', contribution: 0.03 * (profile.ambition - 50) },
    { label: 'Tu espacio frente al suyo', contribution: 0.06 * (player.intencionVoto - theirPolling) },
    { label: 'Tu imagen positiva', contribution: 0.025 * (player.imagenPositiva - 45) },
    { label: 'Pez grande en pecera chica', contribution: -0.03 * Math.max(0, profile.relevance - player.relevancia) },
    { label: 'Perdería su cargo actual', contribution: boolWeight(profile.holdsOffice, -1.1) },
    { label: 'Su partido está en crisis', contribution: boolWeight(theirPolling < 8, 0.7) },
    { label: 'Clima político', contribution: defectionMoodShift(profile, mood) }
  ];
}

function defectionBlock(profile: PoliticianProfile, player: PlayerStanding): string | null {
  const distance = ideologicalDistance(profile.axis, player.axis);
  return firstBlock([
    [profile.partySigla === player.partySigla, 'Ya es de tu partido.'],
    [player.internalRivalNames.includes(profile.name), 'Compite contra vos en la interna.'],
    [allTrue(profile.isDogmatic, distance > 28), 'Dogmático: ni loco se pasa a un espacio tan lejano.'],
    [profile.relevance > 90, 'Es candidato de otra fuerza.']
  ]);
}

export function assessDefection(profile: PoliticianProfile, player: PlayerStanding, mood: CountryMoodSnapshot): NegotiationAssessment {
  return assembleAssessment(-1.4, defectionFactors(profile, player, mood), defectionBlock(profile, player));
}

function strongestRivalPolling(mood: CountryMoodSnapshot, excluded: string[]): number {
  const values = Object.entries(mood.partyPolling)
    .filter(([sigla]) => !excluded.includes(sigla))
    .map(([, value]) => value);
  return Math.max(0, ...values);
}

function sizeBalanceShift(partnerPoll: number, playerPoll: number): number {
  // Si vos sos más grande, el socio chico se sube (efecto arrastre). Si el socio es más grande,
  // solo le servís si aportás algo: con menos de la mitad de sus votos sos un estorbo.
  const ratio = playerPoll / Math.max(1, partnerPoll);
  return ratio >= 1 ? Math.min(ratio - 1, 3) * 0.35 : (ratio - 0.5) * 1.6;
}

function crisisIndex(mood: CountryMoodSnapshot): number {
  return Math.max(0, mood.inflationMonthlyPct - 3) / 2 + Math.max(0, 45 - mood.governmentApprovalPct) / 10;
}

// Clave: `${socioEsOficialismo}-${vosSosOficialismo}`. Tabla en vez de if anidados.
const COALITION_MOOD_RULES: Record<string, (mood: CountryMoodSnapshot) => number> = {
  'true-false': (mood) => -approvalGap(mood) * 0.4 - 0.3,
  'false-true': (mood) => approvalGap(mood) * 0.6,
  'false-false': (mood) => crisisIndex(mood) * 0.4,
  'true-true': () => 0
};

function coalitionMoodShift(partnerSigla: string, player: PlayerStanding, mood: CountryMoodSnapshot): number {
  const key = `${isIncumbentSide(partnerSigla, mood)}-${isIncumbentSide(player.partySigla, mood)}`;
  const rule = COALITION_MOOD_RULES[key] ?? COALITION_MOOD_RULES['false-false']!;
  return rule(mood);
}

function coalitionFactors(partnerSigla: string, player: PlayerStanding, mood: CountryMoodSnapshot): DecisionFactor[] {
  const distance = ideologicalDistance(resolvePartyAxis(partnerSigla), player.axis);
  const partnerPoll = mood.partyPolling[partnerSigla] ?? 5;
  const rivalLeader = strongestRivalPolling(mood, [partnerSigla, player.partySigla]);
  return [
    { label: 'Afinidad ideológica entre fuerzas', contribution: -0.06 * distance },
    { label: 'Juntos pueden ganarle al puntero', contribution: 0.05 * (partnerPoll + player.intencionVoto - rivalLeader) },
    { label: 'Equilibrio de tamaños', contribution: sizeBalanceShift(partnerPoll, player.intencionVoto) },
    { label: 'Tu imagen negativa', contribution: -0.03 * (player.imagenNegativa - 35) },
    { label: 'Tu capacidad de negociación', contribution: 0.02 * (player.negociacion - 50) },
    { label: 'Momento del país', contribution: coalitionMoodShift(partnerSigla, player, mood) },
    { label: 'Grieta y polarización', contribution: -0.012 * mood.polarizationIndex * Math.min(1, distance / 40) }
  ];
}

function coalitionBlock(partnerSigla: string, player: PlayerStanding): string | null {
  const distance = ideologicalDistance(resolvePartyAxis(partnerSigla), player.axis);
  return firstBlock([
    [partnerSigla === player.partySigla, 'Es tu propio partido.'],
    [distance > 62, 'Polarización insalvable: sus bases no se lo perdonarían.']
  ]);
}

export function assessCoalition(partnerSigla: string, player: PlayerStanding, mood: CountryMoodSnapshot): NegotiationAssessment {
  return assembleAssessment(0.4, coalitionFactors(partnerSigla, player, mood), coalitionBlock(partnerSigla, player));
}

export function rollNegotiation(assessment: NegotiationAssessment, seedText: string): boolean {
  if (assessment.blockedReason) {
    return false;
  }
  return seededUnit(seedText) * 100 < assessment.probabilityPct;
}

const DELEGATE_RELEVANCE_BY_ROLE: Record<PlayableRole, number> = {
  PRESIDENTE: 55,
  GOBERNADOR: 38,
  SENADOR: 30,
  DIPUTADO: 22
};

export interface DelegateAssessment {
  eligible: boolean;
  requiredRelevance: number;
  betrayalRiskPct: number;
  verdictText: string;
}

export function assessDelegateCandidacy(profile: PoliticianProfile, role: PlayableRole): DelegateAssessment {
  const required = DELEGATE_RELEVANCE_BY_ROLE[role];
  const eligible = profile.relevance >= required;
  // El clásico argentino: el delfín que una vez sentado en el sillón se olvida de quién lo puso.
  const betrayalRiskPct = Math.round(clamp(15 + (profile.ambition - 50) * 0.6 - (profile.partyLoyalty - 50) * 0.5, 3, 85));
  const verdictText = eligible
    ? `Tiene estatura para encabezar. Riesgo de que se corte solo una vez en el cargo: ${betrayalRiskPct} %.`
    : `Le falta estatura: relevancia ${Math.round(profile.relevance)} y se necesitan ${required} para este cargo.`;
  return { eligible, requiredRelevance: required, betrayalRiskPct, verdictText };
}

