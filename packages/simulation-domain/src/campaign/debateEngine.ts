import { clamp, round2 } from '../economy/mathUtils.js';
import type { CampaignSimulationState } from '../models/CampaignTypes.js';

// Motor puro de Debates Presidenciales (CNE / Ley 27.337):
// arma atriles reales segun tu partida (5 en generales/campana, 2 cara a cara en balotaje),
// sortea 4 bloques tematicos sin repetir y calcula cruces y derechos a replica en vivo.

export type DebateMode = 'CAMPAÑA' | 'GENERALES' | 'BALOTAJE';

export type DebateThemeId =
  | 'ECONOMIA'
  | 'TRABAJO_SOCIAL'
  | 'SEGURIDAD_JUSTICIA'
  | 'EDUCACION_SALUD'
  | 'FEDERALISMO_ENERGIA'
  | 'MODELO_PAIS';

export type DebateReplyTone = 'TECNICO' | 'CHICANA' | 'CONSENSO';

export interface DebateRivalSeat {
  partySigla: string;
  partyName: string;
  candidateName: string;
  partyColor: string;
  pollingPct: number;
  styleTag: 'LIBERAL' | 'POPULAR' | 'FEDERAL' | 'IZQUIERDA';
}

export interface DebateReplyOption {
  tone: DebateReplyTone;
  toneLabel: string;
  replyText: string;
  imageDelta: number;
  negDelta: number;
  convDelta: number;
  voteDelta: number;
  relDelta: number;
  intDelta: number;
  headline: string;
}

export interface DebatePromptSpec {
  id: string;
  theme: DebateThemeId;
  themeLabel: string;
  attackerStyle: 'LIBERAL' | 'POPULAR' | 'FEDERAL' | 'IZQUIERDA' | 'ANY';
  promptTemplate: string;
  options: [DebateReplyOption, DebateReplyOption, DebateReplyOption];
}

export interface DebateRebuttalSpec {
  id: string;
  triggerTheme: DebateThemeId | 'ANY';
  label: string;
  counterText: string;
  bonusImageDelta: number;
  bonusConvDelta: number;
  bonusVoteDelta: number;
  riskNegDelta: number;
  headline: string;
}

export interface ResolvedDebateRound {
  roundNumber: number;
  promptId: string;
  theme: DebateThemeId;
  themeLabel: string;
  challenger: DebateRivalSeat;
  questionText: string;
  options: [DebateReplyOption, DebateReplyOption, DebateReplyOption];
}

export interface DebateSession {
  mode: DebateMode;
  title: string;
  subtitle: string;
  isMandatory: boolean;
  podiums: DebateRivalSeat[];
  playerPodiumIndex: number;
  rounds: ResolvedDebateRound[];
  rebuttals: DebateRebuttalSpec[];
  maxRebuttals: number;
}

export interface DebateImpactSummary {
  imageDelta: number;
  negDelta: number;
  convDelta: number;
  voteDelta: number;
  relDelta: number;
  intDelta: number;
  rebuttalsUsed: number;
  lastHeadline: string;
}

const PRESET_RIVALS: DebateRivalSeat[] = [
  {
    partySigla: 'LLA',
    partyName: 'La Libertad Avanza',
    candidateName: 'Javier Milei',
    partyColor: '#8b5cf6',
    pollingPct: 33,
    styleTag: 'LIBERAL'
  },
  {
    partySigla: 'UxP',
    partyName: 'Fuerza Patria / UxP',
    candidateName: 'Axel Kicillof',
    partyColor: '#0284c7',
    pollingPct: 32,
    styleTag: 'POPULAR'
  },
  {
    partySigla: 'PRO',
    partyName: 'Propuesta Republicana',
    candidateName: 'Mauricio Macri',
    partyColor: '#eab308',
    pollingPct: 14,
    styleTag: 'LIBERAL'
  },
  {
    partySigla: 'PF',
    partyName: 'Provincias Unidas',
    candidateName: 'Juan Schiaretti',
    partyColor: '#2563eb',
    pollingPct: 9,
    styleTag: 'FEDERAL'
  },
  {
    partySigla: 'UCR',
    partyName: 'Unión Cívica Radical',
    candidateName: 'Maximiliano Pullaro',
    partyColor: '#dc2626',
    pollingPct: 8,
    styleTag: 'FEDERAL'
  },
  {
    partySigla: 'FIT',
    partyName: 'Frente de Izquierda',
    candidateName: 'Myriam Bregman',
    partyColor: '#e11d48',
    pollingPct: 4,
    styleTag: 'IZQUIERDA'
  }
];

function computeDeterministicSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function resolvePlayerSeatStyle(state: CampaignSimulationState): DebateRivalSeat['styleTag'] {
  const econ = state.partyAxis?.economic ?? 50;
  if (econ >= 68) return 'LIBERAL';
  if (econ <= 18) return 'IZQUIERDA';
  if (econ <= 40) return 'POPULAR';
  return 'FEDERAL';
}

export function resolveDebateRivals(
  state: CampaignSimulationState,
  mode: DebateMode
): DebateRivalSeat[] {
  const excluded = new Set([state.partySigla, ...(state.coalitionParties ?? [])]);
  const polling = state.countryMood?.partyPolling ?? {};
  const maxRivals = mode === 'BALOTAJE' ? 1 : 4;

  return PRESET_RIVALS
    .filter((r) => !excluded.has(r.partySigla))
    .map((r) => ({ ...r, pollingPct: round2(polling[r.partySigla] ?? r.pollingPct) }))
    .sort((a, b) => b.pollingPct - a.pollingPct)
    .slice(0, maxRivals);
}

function rotateWithSeed<T>(items: readonly T[], seed: number): T[] {
  if (items.length <= 1) return [...items];
  const copy = [...items];
  let s = seed || 17;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

function formatPromptQuestion(template: string, challenger: DebateRivalSeat, state: CampaignSimulationState): string {
  return template
    .replace(/\{rival\}/g, challenger.candidateName)
    .replace(/\{party\}/g, challenger.partySigla)
    .replace(/\{candidate\}/g, state.candidateName);
}

function pickPromptForRound(
  shuffled: DebatePromptSpec[],
  challenger: DebateRivalSeat,
  usedIds: Set<string>,
  usedThemes: Set<DebateThemeId>
): DebatePromptSpec {
  const exact = shuffled.find(
    (p) =>
      !usedIds.has(p.id) &&
      !usedThemes.has(p.theme) &&
      (p.attackerStyle === challenger.styleTag || p.attackerStyle === 'ANY')
  );
  if (exact) return exact;

  const freshTheme = shuffled.find((p) => !usedIds.has(p.id) && !usedThemes.has(p.theme));
  if (freshTheme) return freshTheme;

  return shuffled.find((p) => !usedIds.has(p.id)) ?? shuffled[0]!;
}

function resolveSessionMeta(mode: DebateMode) {
  if (mode === 'BALOTAJE') {
    return {
      title: 'Debate Presidencial de Balotaje · Cara a Cara',
      subtitle: 'Facultad de Derecho UBA · Cadena obligatoria de radio y TV · Mano a mano decisivo',
      isMandatory: true
    };
  }
  if (mode === 'GENERALES') {
    return {
      title: 'Debate Presidencial Obligatorio · Ley 27.337',
      subtitle: 'Cámara Nacional Electoral · Todos los frentes en cadena televisiva nacional',
      isMandatory: true
    };
  }
  return {
    title: 'Estudio TV 3D · Debate Abierto de Campaña',
    subtitle: 'Transmisión multiplataforma en vivo · Bloques temáticos y derecho a réplica',
    isMandatory: false
  };
}

export function buildDebateSession(
  state: CampaignSimulationState,
  mode: DebateMode,
  promptsCatalog: readonly DebatePromptSpec[],
  rebuttalsCatalog: readonly DebateRebuttalSpec[],
  seedOffset: number = 0
): DebateSession {
  const rivals = resolveDebateRivals(state, mode);
  const playerSeat: DebateRivalSeat = {
    partySigla: state.partySigla,
    partyName: state.partySigla,
    candidateName: state.candidateName,
    partyColor: state.partyColor,
    pollingPct: state.votingIntention.intencionVotoGeneral,
    styleTag: resolvePlayerSeatStyle(state)
  };

  const podiums = mode === 'BALOTAJE' ? [playerSeat, rivals[0]!] : [rivals[0]!, rivals[1]!, playerSeat, ...rivals.slice(2)];
  const playerPodiumIndex = podiums.indexOf(playerSeat);

  const seed = computeDeterministicSeed(`${state.candidateId}-${state.partySigla}-${state.stage.currentMonthIndex}-${mode}-${seedOffset}`);
  const shuffledPrompts = rotateWithSeed(promptsCatalog, seed);
  const usedIds = new Set<string>();
  const usedThemes = new Set<DebateThemeId>();

  const rounds: ResolvedDebateRound[] = [0, 1, 2, 3].map((idx) => {
    const challenger = rivals[idx % rivals.length]!;
    const spec = pickPromptForRound(shuffledPrompts, challenger, usedIds, usedThemes);
    usedIds.add(spec.id);
    usedThemes.add(spec.theme);
    return {
      roundNumber: idx + 1,
      promptId: spec.id,
      theme: spec.theme,
      themeLabel: spec.themeLabel,
      challenger,
      questionText: formatPromptQuestion(spec.promptTemplate, challenger, state),
      options: spec.options
    };
  });

  const rebuttals = rotateWithSeed(rebuttalsCatalog, seed + 71).slice(0, 6);
  const meta = resolveSessionMeta(mode);

  return {
    mode,
    ...meta,
    podiums,
    playerPodiumIndex,
    rounds,
    rebuttals,
    maxRebuttals: mode === 'BALOTAJE' ? 3 : 2
  };
}

function isTechnicalBonusActive(state: CampaignSimulationState, tone: DebateReplyTone): boolean {
  return tone === 'TECNICO' && state.attributes.inteligenciaPercibida >= 56;
}

function isVulnerableCarpetazoActive(state: CampaignSimulationState, tone: DebateReplyTone): boolean {
  return tone === 'CHICANA' && (state.attributes.vulnerabilidad ?? 20) >= 34;
}

export function evaluateDebateReplyOutcome(
  state: CampaignSimulationState,
  opt: DebateReplyOption
): DebateReplyOption & { liveTag: string } {
  if (isTechnicalBonusActive(state, opt.tone)) {
    return {
      ...opt,
      convDelta: round2(opt.convDelta + 0.8),
      voteDelta: round2(opt.voteDelta + 0.4),
      liveTag: 'DATO SÓLIDO (+CONVENCIMIENTO)'
    };
  }
  if (isVulnerableCarpetazoActive(state, opt.tone)) {
    return {
      ...opt,
      negDelta: round2(opt.negDelta + 1.4),
      imageDelta: round2(opt.imageDelta - 0.6),
      liveTag: 'CONTRAGOLPE AL AIRE (VULNERABILIDAD)'
    };
  }
  const tag = opt.tone === 'CHICANA' ? 'TENDENCIA VIRAL' : 'RESPUESTA FIRME';
  return { ...opt, liveTag: tag };
}

function resolveDebateTagForMode(mode: DebateMode): string | null {
  if (mode === 'BALOTAJE') return 'BALOTAJE_2027';
  if (mode === 'GENERALES') return 'GENERALES_2027';
  return null;
}

function appendResolvedDebateTag(existing: string[] | undefined, mode: DebateMode): string[] | undefined {
  const tag = resolveDebateTagForMode(mode);
  const current = existing ?? [];
  if (!tag || current.includes(tag)) return existing;
  return [...current, tag];
}

function formatSignedDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
}

export function applyDebateOutcomeToCampaign(
  state: CampaignSimulationState,
  mode: DebateMode,
  summary: DebateImpactSummary
): CampaignSimulationState {
  const nextPos = clamp(state.image.imagenPositiva + summary.imageDelta, 5, 88);
  const nextNeg = clamp(state.image.imagenNegativa + summary.negDelta, 5, 88);
  const nextDesc = Math.max(2, round2(100 - nextPos - nextNeg));
  const resolvedDebates = appendResolvedDebateTag(state.resolvedDebates, mode);
  const logLine = `Debate Presidencial (${mode}): ${summary.lastHeadline} (Img ${formatSignedDelta(summary.imageDelta)} · Voto ${formatSignedDelta(summary.voteDelta)}%).`;

  return {
    ...state,
    activeDebateMode: null,
    resolvedDebates,
    image: {
      imagenPositiva: round2(nextPos),
      imagenNegativa: round2(nextNeg),
      desconocimiento: nextDesc
    },
    attributes: {
      ...state.attributes,
      relevancia: round2(clamp(state.attributes.relevancia + summary.relDelta, 0, 100)),
      inteligenciaPercibida: round2(clamp(state.attributes.inteligenciaPercibida + summary.intDelta, 0, 100)),
      convencimiento: round2(clamp(state.attributes.convencimiento + summary.convDelta, 0, 100))
    },
    votingIntention: {
      ...state.votingIntention,
      intencionVotoGeneral: round2(clamp(state.votingIntention.intencionVotoGeneral + summary.voteDelta, 2, 75))
    },
    historyLog: [logLine, ...state.historyLog]
  };
}

export function applySkipDebatePenalty(
  state: CampaignSimulationState,
  mode: DebateMode
): CampaignSimulationState {
  return applyDebateOutcomeToCampaign(state, mode, {
    imageDelta: -2.5,
    negDelta: 3.2,
    convDelta: -2.0,
    voteDelta: -1.8,
    relDelta: -2.5,
    intDelta: -1.0,
    rebuttalsUsed: 0,
    lastHeadline: 'ATRIL VACÍO: FALTÓ AL DEBATE OFICIAL Y RECIBIÓ SANCIÓN DE PAUTA'
  });
}
