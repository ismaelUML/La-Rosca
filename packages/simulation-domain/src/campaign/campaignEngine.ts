import type {
  CampaignActionCard,
  CampaignExecutePayload,
  CampaignSimulationState,
  CampaignStageType,
  LocalJurisdictionZone
} from '../models/CampaignTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { evolveCountryMood } from './countryMoodEngine.js';

// Motor puro de campana electoral: ejecucion de las 9 acciones,
// actualizacion de imagen y transicion de etapas (Interna -> PASO -> General -> Balotaje -> Gobierno).

const STAGE_MILESTONES: Record<number, { stage: CampaignStageType; label: string; objective: string; date: string }> = {
  1: { stage: 'INTERNA', label: 'Campaña · Interna', objective: 'Ganar la interna partidaria del 25 de abril de 2027', date: '1 de enero de 2027' },
  2: { stage: 'INTERNA', label: 'Campaña · Interna', objective: 'Ganar la interna partidaria del 25 de abril de 2027', date: '1 de febrero de 2027' },
  3: { stage: 'INTERNA', label: 'Campaña · Interna', objective: 'Ganar la interna partidaria del 25 de abril de 2027', date: '1 de marzo de 2027' },
  4: { stage: 'INTERNA', label: 'Campaña · Interna', objective: 'Ganar la interna partidaria del 25 de abril de 2027', date: '25 de abril de 2027' },
  5: { stage: 'PASO', label: 'Campaña · PASO', objective: 'Superar las elecciones primarias PASO del 8 de agosto de 2027', date: '1 de mayo de 2027' },
  6: { stage: 'PASO', label: 'Campaña · PASO', objective: 'Superar las elecciones primarias PASO del 8 de agosto de 2027', date: '1 de junio de 2027' },
  7: { stage: 'PASO', label: 'Campaña · PASO', objective: 'Superar las elecciones primarias PASO del 8 de agosto de 2027', date: '1 de julio de 2027' },
  8: { stage: 'PASO', label: 'Campaña · PASO', objective: 'Superar las elecciones primarias PASO del 8 de agosto de 2027', date: '8 de agosto de 2027' },
  9: { stage: 'GENERAL', label: 'Campaña · General', objective: 'Ganar la elección general del 24 de octubre de 2027', date: '1 de septiembre de 2027' },
  10: { stage: 'GENERAL', label: 'Campaña · General', objective: 'Ganar la elección general del 24 de octubre de 2027', date: '24 de octubre de 2027' },
  11: { stage: 'BALOTAJE', label: 'Campaña · Balotaje', objective: 'Ganar el balotaje del 21 de noviembre de 2027', date: '21 de noviembre de 2027' },
  12: { stage: 'GOBIERNO', label: 'Gobierno', objective: 'Asunción formal del mandato constitucional', date: '10 de diciembre de 2027' }
};

function checkResourceAvailability(
  actionsLeft: number,
  budget: number,
  cost: number
): { allowed: boolean; reason?: string } {
  if (actionsLeft <= 0) {
    return { allowed: false, reason: 'No te quedan acciones este mes.' };
  }
  if (budget < cost) {
    return { allowed: false, reason: 'Presupuesto de campaña insuficiente.' };
  }
  return { allowed: true };
}

function checkRelevanceRequirement(
  relevance: number,
  minRelevance?: number
): { allowed: boolean; reason?: string } {
  if (minRelevance && relevance < minRelevance) {
    return { allowed: false, reason: `Requisito: Relevancia mínima de ${minRelevance}.` };
  }
  return { allowed: true };
}

function checkInternalStageRequirement(
  isOnlyBeforeInternal?: boolean,
  isInternalStage?: boolean
): { allowed: boolean; reason?: string } {
  if (isOnlyBeforeInternal && !isInternalStage) {
    return { allowed: false, reason: 'Solo se puede realizar antes de la interna partidaria.' };
  }
  return { allowed: true };
}

export function canExecuteCampaignAction(
  state: CampaignSimulationState,
  action: CampaignActionCard
): { allowed: boolean; reason?: string } {
  const res = checkResourceAvailability(state.actionsRemainingThisMonth, state.budgetArgentums, action.cost);
  if (!res.allowed) return res;

  const rel = checkRelevanceRequirement(state.attributes.relevancia, action.minRelevanceRequired);
  if (!rel.allowed) return rel;

  return checkInternalStageRequirement(action.onlyBeforeInternal, state.stage.stage === 'INTERNA');
}

function normalizeCandidateImage(pos: number, neg: number): { pos: number; neg: number; desc: number } {
  const boundedPos = clamp(pos, 5, 88);
  const boundedNeg = clamp(neg, 5, 88);
  const remaining = Math.max(2, 100 - boundedPos - boundedNeg);
  return {
    pos: round2(boundedPos),
    neg: round2(boundedNeg),
    desc: round2(remaining)
  };
}

function applyLocalZoneBonus(
  zones: LocalJurisdictionZone[] | undefined,
  targetId: string
): LocalJurisdictionZone[] | undefined {
  if (!zones) return undefined;
  return zones.map((z) => (z.id === targetId ? { ...z, visitsCount: z.visitsCount + 1 } : z));
}

function applyRecorridaBonus(
  state: CampaignSimulationState,
  targetProvinceId: string
): CampaignSimulationState {
  const provIndex = state.provinces.findIndex((p) => p.provinceId === targetProvinceId);
  const nextLocalZones = applyLocalZoneBonus(state.localZones, targetProvinceId);
  if (provIndex === -1 && !nextLocalZones) {
    return state;
  }
  const prov = state.provinces[provIndex] ?? state.provinces[0]!;
  const nextProvinces = [...state.provinces];
  const mult = prov.affinityMultiplier;

  if (provIndex !== -1) {
    nextProvinces[provIndex] = {
      ...prov,
      visitsCount: prov.visitsCount + 1,
      playerVotePct: round2(prov.playerVotePct + 3.2 * mult)
    };
  }

  const norm = normalizeCandidateImage(
    state.image.imagenPositiva + 2.8 * mult,
    state.image.imagenNegativa + 0.1
  );

  return {
    ...state,
    provinces: nextProvinces,
    localZones: nextLocalZones,
    attributes: {
      ...state.attributes,
      relevancia: round2(clamp(state.attributes.relevancia + 0.7, 0, 100)),
      apoyoPartidario: round2(clamp(state.attributes.apoyoPartidario + 0.5, 0, 100))
    },
    image: { imagenPositiva: norm.pos, imagenNegativa: norm.neg, desconocimiento: norm.desc },
    votingIntention: {
      ...state.votingIntention,
      intencionVotoGeneral: round2(state.votingIntention.intencionVotoGeneral + 0.5 * mult),
      tuInterna: round2(state.votingIntention.tuInterna + 0.8 * mult)
    }
  };
}

export function executeCampaignAction(
  state: CampaignSimulationState,
  action: CampaignActionCard,
  payload: CampaignExecutePayload
): CampaignSimulationState {
  const check = canExecuteCampaignAction(state, action);
  if (!check.allowed) {
    return state;
  }

  const extraBudget = action.id === 'CONCILIACION_CIRCULO_ROJO' ? 45.0 : 0;
  const nextBudget = round2(state.budgetArgentums - action.cost + extraBudget);
  const nextActions = state.actionsRemainingThisMonth - 1;

  const updatedState: CampaignSimulationState = {
    ...state,
    budgetArgentums: nextBudget,
    actionsRemainingThisMonth: nextActions,
    historyLog: [`Se ejecutó "${action.title}" (-${action.cost} argentums).`, ...state.historyLog]
  };

  if (payload.actionId === 'RECORRIDA') {
    return applyRecorridaBonus(updatedState, payload.selectedProvinceId);
  }

  return applyStandardActionEffects(updatedState, action.id);
}

interface ActionEffectDeltas {
  dRelevancia: number;
  dInteligencia: number;
  dConvencimiento: number;
  dApoyo: number;
  dNegociacion: number;
  dPositiva: number;
  dNegativa: number;
  internaBoost: number;
  generalBoost: number;
}

const ACTION_DELTAS_MAP: Record<CampaignActionCard['id'], ActionEffectDeltas> = {
  RECORRIDA: { dRelevancia: 0, dInteligencia: 0, dConvencimiento: 0, dApoyo: 0, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 0, generalBoost: 0 },
  ENTREVISTA: { dRelevancia: 1.2, dInteligencia: 0.9, dConvencimiento: 0, dApoyo: 0, dNegociacion: 0, dPositiva: 0.4, dNegativa: 0, internaBoost: 0, generalBoost: 0 },
  PUBLICIDAD: { dRelevancia: 1.5, dInteligencia: 0, dConvencimiento: 0.8, dApoyo: 0, dNegociacion: 0, dPositiva: 0.3, dNegativa: 0, internaBoost: 0, generalBoost: 0.6 },
  ACTO_PARTIDARIO: { dRelevancia: 0, dInteligencia: 0, dConvencimiento: 1.4, dApoyo: 1.8, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 1.2, generalBoost: 0 },
  FORMACION_EQUIPOS: { dRelevancia: 0, dInteligencia: 2.5, dConvencimiento: 0, dApoyo: 1.1, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 0, generalBoost: 0 },
  DEBATE: { dRelevancia: 2.2, dInteligencia: 1.4, dConvencimiento: 0, dApoyo: 0, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 1.5, generalBoost: 1.0 },
  MILITANCIA_DIGITAL: { dRelevancia: 1.6, dInteligencia: 0, dConvencimiento: 0, dApoyo: 0.6, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 0, generalBoost: 0 },
  REUNION_AFILIADOS: { dRelevancia: 0, dInteligencia: 0, dConvencimiento: 0.9, dApoyo: 1.9, dNegociacion: 0, dPositiva: 0, dNegativa: 0, internaBoost: 1.4, generalBoost: 0 },
  NEGOCIACION_SECTORES: { dRelevancia: 0, dInteligencia: 0, dConvencimiento: 0, dApoyo: 1.5, dNegociacion: 1.5, dPositiva: 0, dNegativa: 0, internaBoost: 1.1, generalBoost: 0 },
  CARPETAZO_MEDIATICO: { dRelevancia: 2.2, dInteligencia: 0, dConvencimiento: 0, dApoyo: 0, dNegociacion: 0, dPositiva: 0, dNegativa: 1.1, internaBoost: 4.5, generalBoost: 0 },
  PACTO_CON_INTENDENTES: { dRelevancia: 1.0, dInteligencia: 0, dConvencimiento: 1.0, dApoyo: 2.8, dNegociacion: 1.8, dPositiva: 0.5, dNegativa: 0, internaBoost: 2.5, generalBoost: 2.0 },
  ACTO_ESTADIO_PLAZA: { dRelevancia: 3.5, dInteligencia: 0, dConvencimiento: 4.8, dApoyo: 3.0, dNegociacion: 0, dPositiva: 1.5, dNegativa: 0, internaBoost: 3.2, generalBoost: 1.5 },
  CONCILIACION_CIRCULO_ROJO: { dRelevancia: 1.0, dInteligencia: 2.8, dConvencimiento: 0, dApoyo: 0.5, dNegociacion: 1.5, dPositiva: 0, dNegativa: 0.5, internaBoost: 0.5, generalBoost: 0 },
  GIRA_INTERNACIONAL: { dRelevancia: 2.0, dInteligencia: 3.8, dConvencimiento: 0, dApoyo: 0, dNegociacion: 0, dPositiva: 3.0, dNegativa: 0, internaBoost: 1.5, generalBoost: 1.8 },
  DESPLIEGUE_STREAMERS: { dRelevancia: 2.5, dInteligencia: 0, dConvencimiento: 2.0, dApoyo: 0, dNegociacion: 0, dPositiva: 1.5, dNegativa: 0, internaBoost: 2.0, generalBoost: 1.5 }
};

function applyStandardActionEffects(
  state: CampaignSimulationState,
  actionId: CampaignActionCard['id']
): CampaignSimulationState {
  const d = ACTION_DELTAS_MAP[actionId];
  const attrs = {
    ...state.attributes,
    relevancia: round2(clamp(state.attributes.relevancia + d.dRelevancia, 0, 100)),
    inteligenciaPercibida: round2(clamp(state.attributes.inteligenciaPercibida + d.dInteligencia, 0, 100)),
    convencimiento: round2(clamp(state.attributes.convencimiento + d.dConvencimiento, 0, 100)),
    apoyoPartidario: round2(clamp(state.attributes.apoyoPartidario + d.dApoyo, 0, 100)),
    negociacion: round2(clamp(state.attributes.negociacion + d.dNegociacion, 0, 100))
  };

  const norm = normalizeCandidateImage(
    state.image.imagenPositiva + d.dPositiva,
    state.image.imagenNegativa + d.dNegativa
  );

  const updatedPoll = updateInternalPollVoteShares(state.internalPoll, d.internaBoost);

  return {
    ...state,
    attributes: attrs,
    image: { imagenPositiva: norm.pos, imagenNegativa: norm.neg, desconocimiento: norm.desc },
    internalPoll: updatedPoll,
    votingIntention: {
      ...state.votingIntention,
      tuInterna: round2(state.votingIntention.tuInterna + d.internaBoost),
      intencionVotoGeneral: round2(state.votingIntention.intencionVotoGeneral + d.generalBoost)
    }
  };
}

function updateInternalPollVoteShares(poll: CampaignSimulationState['internalPoll'], playerBoost: number) {
  if (playerBoost === 0) {
    return poll;
  }
  const nextCandidates = poll.candidates.map((c) => {
    if (c.isPlayer) {
      return { ...c, voteSharePct: round2(c.voteSharePct + playerBoost) };
    }
    const deduction = playerBoost / Math.max(1, poll.candidates.length - 1);
    return { ...c, voteSharePct: round2(Math.max(4, c.voteSharePct - deduction)) };
  });
  return { ...poll, candidates: nextCandidates };
}

export function advanceCampaignMonth(state: CampaignSimulationState): CampaignSimulationState {
  const nextMonthIndex = state.stage.currentMonthIndex + 1;
  const milestone = STAGE_MILESTONES[nextMonthIndex] ?? STAGE_MILESTONES[12]!;

  const replenishedBudget = round2(state.budgetArgentums + 40.0);
  const nextHistory = [
    `Mes ${nextMonthIndex} (${milestone.date}): Se asignaron 4 nuevas acciones y presupuesto de campaña.`,
    ...state.historyLog
  ];
  const nextMood = state.countryMood ? evolveCountryMood(state.countryMood, nextMonthIndex) : undefined;

  return {
    ...state,
    stage: {
      stage: milestone.stage,
      stageLabel: milestone.label,
      objectiveTitle: milestone.objective,
      currentMonthIndex: nextMonthIndex,
      formattedDate: milestone.date
    },
    countryMood: nextMood,
    budgetArgentums: replenishedBudget,
    actionsRemainingThisMonth: 4,
    historyLog: nextHistory
  };
}
