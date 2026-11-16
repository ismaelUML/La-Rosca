import type {
  CampaignActionCard,
  CampaignExecutePayload,
  CampaignSimulationState,
  CampaignStageType,
  LocalJurisdictionZone,
  ProvinceCampaignInfo
} from '../models/CampaignTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { evolveCountryMood } from './countryMoodEngine.js';
import { stepRivalCampaignAi } from './campaignRivalAiEngine.js';

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

// Ley del rendimiento decreciente en campaña: si metés tres actos seguidos en La Matanza
// o spameás tres conferencias de prensa el mismo mes, los medios se saturan, la gente
// cambia de canal y el spot rinde cada vez menos. La hipérbola 1 / (1 + 0.40 * U) castiga
// el spam sin anular por completo la acción.
export function computeActionFatigueMultiplier(usageCount: number): number {
  return round2(1 / (1 + 0.4 * Math.max(0, usageCount)));
}

// Al pasar el mes, la fatiga de la opinión pública se disipa: la rosca se enfría y los
// electores se olvidan de que apareciste hasta en la sopa. Reducimos el contador en 1.
export function decayActionFatigue(usageMap?: Record<string, number>): Record<string, number> {
  if (!usageMap) return {};
  const next: Record<string, number> = {};
  for (const [key, val] of Object.entries(usageMap)) {
    if (val > 1) {
      next[key] = val - 1;
    }
  }
  return next;
}

// Cooldown de 5 meses para dirigentes que rechazaron tu llamado: si Pichetto o Kicillof
// te dijeron que no, no podés insistir al mes siguiente como un pesado de call center.
export function decayPoliticianCooldowns(cooldowns?: Record<string, number>): Record<string, number> {
  if (!cooldowns) return {};
  const next: Record<string, number> = {};
  for (const [id, months] of Object.entries(cooldowns)) {
    if (months > 1) {
      next[id] = months - 1;
    }
  }
  return next;
}

function applyLocalZoneBonus(
  zones: LocalJurisdictionZone[] | undefined,
  targetId: string
): LocalJurisdictionZone[] | undefined {
  if (!zones) return undefined;
  return zones.map((z) => (z.id === targetId ? { ...z, visitsCount: z.visitsCount + 1 } : z));
}

function computeRecorridaVisitMultiplier(visits: number, affinityMult: number = 1.0): number {
  if (visits <= 0) return 1.0 * affinityMult;
  if (visits === 1) return 0.65 * affinityMult;
  if (visits === 2) return 0.40 * affinityMult;
  if (visits === 3) return 0.25 * affinityMult;
  return 0.13 * affinityMult;
}

function computeRecorridaApoyoBoost(mult: number): number {
  if (mult > 0.2) return 0.5 * mult;
  return 0;
}

function updateProvincesVisits(
  provinces: ProvinceCampaignInfo[],
  targetProvinceId: string,
  mult: number
): ProvinceCampaignInfo[] {
  return provinces.map((p) => {
    if (p.provinceId !== targetProvinceId) return p;
    return {
      ...p,
      visitsCount: p.visitsCount + 1,
      playerVotePct: round2(p.playerVotePct + 3.2 * mult)
    };
  });
}

function applyRecorridaBonus(
  state: CampaignSimulationState,
  targetProvinceId: string
): CampaignSimulationState {
  const prov = state.provinces.find((p) => p.provinceId === targetProvinceId);
  const nextLocalZones = applyLocalZoneBonus(state.localZones, targetProvinceId);
  if (!prov && !nextLocalZones) {
    return state;
  }
  const affinity = prov ? prov.affinityMultiplier : 1.0;
  const visits = prov ? prov.visitsCount : 0;
  const mult = computeRecorridaVisitMultiplier(visits, affinity);
  const nextProvinces = updateProvincesVisits(state.provinces, targetProvinceId, mult);

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
      relevancia: round2(clamp(state.attributes.relevancia + 0.7 * mult, 0, 100)),
      apoyoPartidario: round2(clamp(state.attributes.apoyoPartidario + computeRecorridaApoyoBoost(mult), 0, 100))
    },
    image: { imagenPositiva: norm.pos, imagenNegativa: norm.neg, desconocimiento: norm.desc },
    votingIntention: {
      ...state.votingIntention,
      intencionVotoGeneral: round2(state.votingIntention.intencionVotoGeneral + 0.5 * mult),
      tuInterna: round2(state.votingIntention.tuInterna + 0.8 * mult)
    }
  };
}

function resolveActionUsage(
  usageMap: Record<string, number> | undefined,
  actionId: string
): { prevUsage: number; nextMap: Record<string, number> } {
  const current = usageMap?.[actionId] || 0;
  return {
    prevUsage: current,
    nextMap: { ...usageMap, [actionId]: current + 1 }
  };
}

function computeActionExtraBudget(actionId: string): number {
  if (actionId === 'CONCILIACION_CIRCULO_ROJO') return 45.0;
  if (actionId === 'CENA_RECAUDACION_PYME') return 26.0;
  if (actionId === 'DESAYUNO_UIA_BANQUEROS') return 18.0;
  return 0;
}

function formatFatigueNote(prevUsage: number, fatigueMult: number): string {
  if (prevUsage <= 0) {
    return '';
  }
  return ` (efecto al ${(fatigueMult * 100).toFixed(0)}% por saturación)`;
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

  const { prevUsage, nextMap } = resolveActionUsage(state.actionUsageCount, action.id);
  const fatigueMult = computeActionFatigueMultiplier(prevUsage);
  const extraBudget = computeActionExtraBudget(action.id);
  const nextBudget = round2(state.budgetArgentums - action.cost + extraBudget);
  const fatigueNote = formatFatigueNote(prevUsage, fatigueMult);

  const updatedState: CampaignSimulationState = {
    ...state,
    budgetArgentums: nextBudget,
    actionsRemainingThisMonth: state.actionsRemainingThisMonth - 1,
    actionUsageCount: nextMap,
    historyLog: [`Se ejecutó "${action.title}" (-${action.cost} argentums)${fatigueNote}.`, ...state.historyLog]
  };

  if (payload.actionId === 'RECORRIDA') {
    return applyRecorridaBonus(updatedState, payload.selectedProvinceId);
  }

  return applyStandardActionEffects(updatedState, action.id, fatigueMult);
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
  DESPLIEGUE_STREAMERS: { dRelevancia: 2.5, dInteligencia: 0, dConvencimiento: 2.0, dApoyo: 0, dNegociacion: 0, dPositiva: 1.5, dNegativa: 0, internaBoost: 2.0, generalBoost: 1.5 },
  PRIME_TIME_MANO_A_MANO: { dRelevancia: 2.6, dInteligencia: 1.2, dConvencimiento: 1.6, dApoyo: 0, dNegociacion: 0, dPositiva: 1.1, dNegativa: 0.4, internaBoost: 1.4, generalBoost: 1.6 },
  TAPA_DOMINICAL_PRENSA: { dRelevancia: 2.1, dInteligencia: 2.0, dConvencimiento: 1.2, dApoyo: 0.4, dNegociacion: 0, dPositiva: 1.3, dNegativa: 0.2, internaBoost: 1.0, generalBoost: 1.3 },
  RADIOS_DEL_INTERIOR: { dRelevancia: 1.7, dInteligencia: 0.8, dConvencimiento: 1.5, dApoyo: 1.0, dNegociacion: 0, dPositiva: 1.2, dNegativa: 0, internaBoost: 0.9, generalBoost: 1.4 },
  MICROSEGMENTACION_TIKTOK: { dRelevancia: 2.8, dInteligencia: 0, dConvencimiento: 1.9, dApoyo: 0.3, dNegociacion: 0, dPositiva: 1.4, dNegativa: 0.3, internaBoost: 1.6, generalBoost: 1.7 },
  PODCAST_POLITICO_LARGO: { dRelevancia: 1.5, dInteligencia: 2.4, dConvencimiento: 1.3, dApoyo: 0.5, dNegociacion: 0, dPositiva: 1.1, dNegativa: 0, internaBoost: 1.2, generalBoost: 0.9 },
  CONTRASPOT_DEMOLEDOR: { dRelevancia: 3.2, dInteligencia: 0, dConvencimiento: 1.2, dApoyo: 0.8, dNegociacion: 0, dPositiva: 0, dNegativa: 1.4, internaBoost: 2.8, generalBoost: 1.9 },
  SPOT_EMOCIONAL_PAIS: { dRelevancia: 2.0, dInteligencia: 0.5, dConvencimiento: 2.6, dApoyo: 0.8, dNegociacion: 0, dPositiva: 2.2, dNegativa: 0, internaBoost: 1.3, generalBoost: 1.8 },
  EJERCITO_TUITERO_X: { dRelevancia: 2.4, dInteligencia: 0, dConvencimiento: 0.6, dApoyo: 1.1, dNegociacion: 0, dPositiva: 0, dNegativa: 0.9, internaBoost: 2.1, generalBoost: 0.7 },
  AFICHES_VIA_PUBLICA: { dRelevancia: 2.2, dInteligencia: 0, dConvencimiento: 0.9, dApoyo: 0.7, dNegociacion: 0, dPositiva: 0.8, dNegativa: 0.3, internaBoost: 1.1, generalBoost: 1.2 },
  PRESENTACION_LIBRO_PLAN: { dRelevancia: 1.6, dInteligencia: 3.4, dConvencimiento: 1.4, dApoyo: 1.0, dNegociacion: 0.4, dPositiva: 1.2, dNegativa: 0, internaBoost: 1.3, generalBoost: 0.8 },
  BUNKER_FACT_CHECKING: { dRelevancia: 1.2, dInteligencia: 2.1, dConvencimiento: 1.1, dApoyo: 0.8, dNegociacion: 0.5, dPositiva: 1.5, dNegativa: -1.1, internaBoost: 0.7, generalBoost: 0.9 },
  CAMINATA_CONURBANO: { dRelevancia: 1.9, dInteligencia: 0, dConvencimiento: 2.2, dApoyo: 1.6, dNegociacion: 0, dPositiva: 1.9, dNegativa: 0.2, internaBoost: 1.7, generalBoost: 2.1 },
  CARAVANA_FEDERAL_MOTORHOME: { dRelevancia: 2.6, dInteligencia: 0, dConvencimiento: 2.1, dApoyo: 1.9, dNegociacion: 0.4, dPositiva: 2.0, dNegativa: 0, internaBoost: 1.5, generalBoost: 1.9 },
  VISITA_RURAL_PALERMO: { dRelevancia: 1.8, dInteligencia: 1.6, dConvencimiento: 1.4, dApoyo: 0.9, dNegociacion: 1.1, dPositiva: 1.5, dNegativa: 0.3, internaBoost: 0.9, generalBoost: 1.3 },
  PARQUES_INDUSTRIALES: { dRelevancia: 1.3, dInteligencia: 2.2, dConvencimiento: 1.7, dApoyo: 1.2, dNegociacion: 0.8, dPositiva: 1.6, dNegativa: 0, internaBoost: 0.8, generalBoost: 1.4 },
  CUMBRE_MINERIA_LITIO: { dRelevancia: 1.4, dInteligencia: 2.3, dConvencimiento: 1.1, dApoyo: 0.9, dNegociacion: 1.5, dPositiva: 1.1, dNegativa: 0, internaBoost: 0.7, generalBoost: 1.1 },
  ACTO_VACA_MUERTA: { dRelevancia: 2.0, dInteligencia: 2.5, dConvencimiento: 1.5, dApoyo: 1.0, dNegociacion: 1.3, dPositiva: 1.7, dNegativa: 0, internaBoost: 1.0, generalBoost: 1.5 },
  HOSPITALES_Y_BOMBEROS: { dRelevancia: 1.5, dInteligencia: 0.6, dConvencimiento: 2.4, dApoyo: 1.2, dNegociacion: 0, dPositiva: 2.6, dNegativa: -0.4, internaBoost: 1.1, generalBoost: 1.6 },
  ASAMBLEA_UNIVERSITARIA: { dRelevancia: 2.1, dInteligencia: 1.9, dConvencimiento: 1.8, dApoyo: 1.6, dNegociacion: 0, dPositiva: 1.4, dNegativa: 0.5, internaBoost: 1.8, generalBoost: 1.2 },
  PUERTA_A_PUERTA_BARRIAL: { dRelevancia: 1.1, dInteligencia: 0, dConvencimiento: 2.3, dApoyo: 2.1, dNegociacion: 0, dPositiva: 1.8, dNegativa: 0, internaBoost: 2.2, generalBoost: 1.5 },
  MESAS_AFILIACION_PLAZAS: { dRelevancia: 1.6, dInteligencia: 0, dConvencimiento: 1.0, dApoyo: 2.7, dNegociacion: 0, dPositiva: 0.9, dNegativa: 0, internaBoost: 2.4, generalBoost: 0.8 },
  CARAVANA_CORDOBA_CENTRO: { dRelevancia: 2.0, dInteligencia: 0.9, dConvencimiento: 1.9, dApoyo: 1.4, dNegociacion: 0.6, dPositiva: 1.7, dNegativa: 0, internaBoost: 1.2, generalBoost: 1.7 },
  CONURBANO_CLUBES_BARRIO: { dRelevancia: 1.3, dInteligencia: 0, dConvencimiento: 2.1, dApoyo: 2.0, dNegociacion: 0.8, dPositiva: 1.9, dNegativa: 0, internaBoost: 1.6, generalBoost: 1.5 },
  FERIA_EMPRENDEDORES_TECH: { dRelevancia: 1.7, dInteligencia: 2.6, dConvencimiento: 1.3, dApoyo: 0.6, dNegociacion: 0.5, dPositiva: 1.6, dNegativa: 0, internaBoost: 1.1, generalBoost: 1.2 },
  PARRILLADA_SINDICAL_CGT: { dRelevancia: 0.9, dInteligencia: 0.4, dConvencimiento: 1.0, dApoyo: 2.2, dNegociacion: 2.8, dPositiva: 0.4, dNegativa: 0.6, internaBoost: 1.4, generalBoost: 1.3 },
  DESAYUNO_UIA_BANQUEROS: { dRelevancia: 1.1, dInteligencia: 2.6, dConvencimiento: 0.4, dApoyo: 0.7, dNegociacion: 2.0, dPositiva: 0.5, dNegativa: 0.4, internaBoost: 0.6, generalBoost: 0.8 },
  CENA_RECAUDACION_PYME: { dRelevancia: 0.8, dInteligencia: 1.0, dConvencimiento: 0.5, dApoyo: 1.6, dNegociacion: 1.7, dPositiva: 0.6, dNegativa: 0.2, internaBoost: 0.9, generalBoost: 0.6 },
  CUMBRE_SEGURIDAD_MUNICIPAL: { dRelevancia: 1.9, dInteligencia: 1.5, dConvencimiento: 2.0, dApoyo: 1.4, dNegociacion: 1.9, dPositiva: 1.8, dNegativa: 0.2, internaBoost: 1.2, generalBoost: 1.9 },
  ACUERDO_RECTORES_CIENCIA: { dRelevancia: 1.4, dInteligencia: 2.8, dConvencimiento: 1.6, dApoyo: 1.1, dNegociacion: 1.6, dPositiva: 1.5, dNegativa: 0, internaBoost: 1.3, generalBoost: 1.1 },
  MESA_AGROPECUARIA_ROSARIO: { dRelevancia: 1.5, dInteligencia: 1.8, dConvencimiento: 1.4, dApoyo: 1.1, dNegociacion: 2.1, dPositiva: 1.4, dNegativa: 0, internaBoost: 0.9, generalBoost: 1.5 },
  ENCUENTRO_IGLESIAS_ONG: { dRelevancia: 1.2, dInteligencia: 0.5, dConvencimiento: 2.2, dApoyo: 1.9, dNegociacion: 1.4, dPositiva: 1.7, dNegativa: 0.2, internaBoost: 1.5, generalBoost: 1.4 },
  OPERATIVO_DESEMBARCO_GOBERNADORES: { dRelevancia: 1.8, dInteligencia: 1.4, dConvencimiento: 0.9, dApoyo: 2.4, dNegociacion: 3.1, dPositiva: 1.0, dNegativa: 0.2, internaBoost: 1.3, generalBoost: 2.0 },
  BLINDAJE_FISCALES_GENERALES: { dRelevancia: 0.7, dInteligencia: 0.8, dConvencimiento: 1.1, dApoyo: 3.4, dNegociacion: 1.5, dPositiva: 0.8, dNegativa: 0, internaBoost: 2.1, generalBoost: 2.3 },
  CAPACITACION_BOLETA_UNICA: { dRelevancia: 1.0, dInteligencia: 1.7, dConvencimiento: 1.8, dApoyo: 1.5, dNegociacion: 0.5, dPositiva: 1.3, dNegativa: 0, internaBoost: 1.2, generalBoost: 1.7 },
  AUDITORIA_PADRON_ELECTORAL: { dRelevancia: 0.9, dInteligencia: 2.2, dConvencimiento: 1.2, dApoyo: 2.1, dNegociacion: 1.1, dPositiva: 1.0, dNegativa: 0, internaBoost: 1.6, generalBoost: 1.4 },
  CUARTO_DE_GUERRA_DATOS: { dRelevancia: 1.4, dInteligencia: 3.1, dConvencimiento: 1.9, dApoyo: 1.2, dNegociacion: 0.9, dPositiva: 1.1, dNegativa: 0, internaBoost: 1.9, generalBoost: 1.6 },
  ESCUELA_CUADROS_TECNICOS: { dRelevancia: 0.8, dInteligencia: 3.5, dConvencimiento: 1.0, dApoyo: 2.2, dNegociacion: 1.2, dPositiva: 1.1, dNegativa: 0, internaBoost: 1.5, generalBoost: 0.9 }
};

function applyStandardActionEffects(
  state: CampaignSimulationState,
  actionId: CampaignActionCard['id'],
  fatigueMult: number = 1.0
): CampaignSimulationState {
  const d = ACTION_DELTAS_MAP[actionId];
  const mult = Math.max(0.15, fatigueMult);

  const attrs = {
    ...state.attributes,
    relevancia: round2(clamp(state.attributes.relevancia + d.dRelevancia * mult, 0, 100)),
    inteligenciaPercibida: round2(clamp(state.attributes.inteligenciaPercibida + d.dInteligencia * mult, 0, 100)),
    convencimiento: round2(clamp(state.attributes.convencimiento + d.dConvencimiento * mult, 0, 100)),
    apoyoPartidario: round2(clamp(state.attributes.apoyoPartidario + d.dApoyo * mult, 0, 100)),
    negociacion: round2(clamp(state.attributes.negociacion + d.dNegociacion * mult, 0, 100))
  };

  const norm = normalizeCandidateImage(
    state.image.imagenPositiva + d.dPositiva * mult,
    state.image.imagenNegativa + d.dNegativa * mult
  );

  const updatedPoll = updateInternalPollVoteShares(state.internalPoll, d.internaBoost * mult);

  return {
    ...state,
    attributes: attrs,
    image: { imagenPositiva: norm.pos, imagenNegativa: norm.neg, desconocimiento: norm.desc },
    internalPoll: updatedPoll,
    votingIntention: {
      ...state.votingIntention,
      tuInterna: round2(state.votingIntention.tuInterna + d.internaBoost * mult),
      intencionVotoGeneral: round2(state.votingIntention.intencionVotoGeneral + d.generalBoost * mult)
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

function decayProvincesFatigue(provinces: ProvinceCampaignInfo[]): ProvinceCampaignInfo[] {
  return provinces.map((p) => ({
    ...p,
    visitsCount: Math.max(0, p.visitsCount - 1)
  }));
}

function decayLocalZonesFatigue(zones?: LocalJurisdictionZone[]): LocalJurisdictionZone[] | undefined {
  if (!zones) return undefined;
  return zones.map((z) => ({
    ...z,
    visitsCount: Math.max(0, z.visitsCount - 1)
  }));
}

function runOptionalRivalTurn(
  state: CampaignSimulationState,
  evolvedMood: CampaignSimulationState['countryMood'],
  decayedProvinces: ProvinceCampaignInfo[],
  nextMonthIndex: number
) {
  if (!evolvedMood) {
    return { nextMood: undefined, nextProvinces: decayedProvinces, headlines: [] as string[], summary: undefined };
  }
  const out = stepRivalCampaignAi(state, evolvedMood, decayedProvinces, nextMonthIndex);
  return {
    nextMood: out.nextMood,
    nextProvinces: out.nextProvinces,
    headlines: out.topHeadlines,
    summary: out.rivalLastTurnSummary
  };
}

export function advanceCampaignMonth(state: CampaignSimulationState): CampaignSimulationState {
  const nextMonthIndex = state.stage.currentMonthIndex + 1;
  const milestone = STAGE_MILESTONES[nextMonthIndex] ?? STAGE_MILESTONES[12]!;

  const replenishedBudget = round2(state.budgetArgentums + 40.0);
  const evolvedMood = state.countryMood ? evolveCountryMood(state.countryMood, nextMonthIndex) : undefined;
  const decayedProvinces = decayProvincesFatigue(state.provinces);
  const rivalOut = runOptionalRivalTurn(state, evolvedMood, decayedProvinces, nextMonthIndex);
  const nextHistory = [
    ...rivalOut.headlines,
    `Mes ${nextMonthIndex} (${milestone.date}): Se asignaron 4 nuevas acciones y presupuesto de campaña.`,
    ...state.historyLog
  ];

  return {
    ...state,
    stage: {
      stage: milestone.stage,
      stageLabel: milestone.label,
      objectiveTitle: milestone.objective,
      currentMonthIndex: nextMonthIndex,
      formattedDate: milestone.date
    },
    countryMood: rivalOut.nextMood,
    actionUsageCount: decayActionFatigue(state.actionUsageCount),
    politicianCooldowns: decayPoliticianCooldowns(state.politicianCooldowns),
    provinces: rivalOut.nextProvinces,
    localZones: decayLocalZonesFatigue(state.localZones),
    budgetArgentums: replenishedBudget,
    actionsRemainingThisMonth: 4,
    historyLog: nextHistory,
    rivalLastTurnSummary: rivalOut.summary
  };
}
