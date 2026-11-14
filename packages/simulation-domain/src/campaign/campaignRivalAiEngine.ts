import { clamp, round2 } from '../economy/mathUtils.js';
import type { CampaignSimulationState, CountryMoodSnapshot, ProvinceCampaignInfo } from '../models/CampaignTypes.js';
import { seededUnit } from './countryMoodEngine.js';

// Utility AI determinista para las fuerzas rivales durante la campaña 2027.
// En vez de ser maniquíes con peso fijo hasta octubre, cada espacio evalúa el clima macro,
// su piso/techo y los meses que faltan para votar, elige táctica y disputa territorio.

export type RivalTacticalAction =
  | 'DEFENDER_BASTION'
  | 'DESEMBARCO_SWING'
  | 'CAMPANA_NEGATIVA'
  | 'ACUERDO_FEDERAL';

interface RivalProfile {
  label: string;
  bastions: string[];
  swingTargets: string[];
  baselineFloorPct: number;
  federalBias: number;
  negativeBias: number;
}

const RIVAL_PROFILES: Record<string, RivalProfile> = {
  UxP: {
    label: 'Unión por la Patria',
    bastions: ['PBA', 'FORMOSA', 'SANTIAGO_DEL_ESTERO'],
    swingTargets: ['SANTA_FE', 'MENDOZA', 'ENTRE_RIOS'],
    baselineFloorPct: 26,
    federalBias: 8,
    negativeBias: 16
  },
  LLA: {
    label: 'La Libertad Avanza',
    bastions: ['CORDOBA', 'MENDOZA', 'CABA'],
    swingTargets: ['PBA', 'SANTA_FE', 'TUCUMAN'],
    baselineFloorPct: 24,
    federalBias: 5,
    negativeBias: 18
  },
  PRO: {
    label: 'PRO',
    bastions: ['CABA', 'ENTRE_RIOS'],
    swingTargets: ['PBA', 'CORDOBA', 'SANTA_FE'],
    baselineFloorPct: 10,
    federalBias: 14,
    negativeBias: 11
  },
  PF: {
    label: 'Peronismo Federal',
    bastions: ['CORDOBA', 'SALTA', 'SAN_JUAN'],
    swingTargets: ['SANTA_FE', 'TUCUMAN', 'NEUQUEN'],
    baselineFloorPct: 8,
    federalBias: 24,
    negativeBias: 6
  },
  UCR: {
    label: 'UCR',
    bastions: ['SANTA_FE', 'CORRIENTES', 'JUJUY'],
    swingTargets: ['CORDOBA', 'MENDOZA', 'PBA'],
    baselineFloorPct: 7,
    federalBias: 22,
    negativeBias: 8
  },
  FIT: {
    label: 'Frente de Izquierda',
    bastions: ['JUJUY', 'CABA'],
    swingTargets: ['PBA', 'NEUQUEN', 'CORDOBA'],
    baselineFloorPct: 3.5,
    federalBias: 2,
    negativeBias: 20
  }
};

function computeCrisisHeat(sigla: string, mood: CountryMoodSnapshot): number {
  const inflationHeat = mood.inflationMonthlyPct > 3.5 ? 14 : 4;
  const approvalHeat = mood.governmentApprovalPct < 45 ? 14 : 0;
  const incumbentOffset = sigla !== mood.incumbentPartySigla ? 8 : 0;
  return inflationHeat + approvalHeat + incumbentOffset;
}

function scoreTacticalOptions(
  sigla: string,
  profile: RivalProfile,
  mood: CountryMoodSnapshot,
  monthIndex: number
): Record<RivalTacticalAction, number> {
  const share = mood.partyPolling[sigla] ?? profile.baselineFloorPct;
  const deficitVsFloor = Math.max(0, profile.baselineFloorPct - share);
  const lateCampaignPush = monthIndex >= 7 ? 18 : 6;
  const crisisHeat = computeCrisisHeat(sigla, mood);

  return {
    DEFENDER_BASTION: round2(32 + deficitVsFloor * 3.2 + mood.polarizationIndex * 0.25),
    DESEMBARCO_SWING: round2(28 + lateCampaignPush + Math.min(20, share * 0.65)),
    CAMPANA_NEGATIVA: round2(22 + profile.negativeBias + crisisHeat),
    ACUERDO_FEDERAL: round2(24 + profile.federalBias + (100 - mood.polarizationIndex) * 0.28)
  };
}

function pickBestRivalAction(
  sigla: string,
  profile: RivalProfile,
  mood: CountryMoodSnapshot,
  monthIndex: number
): RivalTacticalAction {
  const scores = scoreTacticalOptions(sigla, profile, mood, monthIndex);
  const entries = (Object.entries(scores) as Array<[RivalTacticalAction, number]>).map(([action, baseScore]) => {
    const tieJitter = seededUnit(`rival-ai-${sigla}-${monthIndex}-${action}`) * 4.5;
    return { action, score: baseScore + tieJitter };
  });
  entries.sort((a, b) => b.score - a.score);
  return entries[0]!.action;
}

function resolveTargetProvinceId(
  provinces: ProvinceCampaignInfo[],
  candidates: string[],
  monthIndex: number,
  sigla: string
): string | null {
  if (provinces.length === 0) return null;
  const available = candidates.filter((id) => provinces.some((p) => p.provinceId === id));
  const pool = available.length > 0 ? available : provinces.map((p) => p.provinceId);
  const idx = Math.floor(seededUnit(`rival-prov-${sigla}-${monthIndex}`) * pool.length);
  return pool[idx] ?? pool[0] ?? null;
}

function applyProvincePressure(
  provinces: ProvinceCampaignInfo[],
  targetProvinceId: string | null,
  playerPenaltyPp: number
): ProvinceCampaignInfo[] {
  if (!targetProvinceId) return provinces;
  return provinces.map((p) =>
    p.provinceId === targetProvinceId
      ? { ...p, playerVotePct: round2(clamp(p.playerVotePct - playerPenaltyPp, 5, 78)) }
      : p
  );
}

function formatRivalHeadline(
  sigla: string,
  profile: RivalProfile,
  action: RivalTacticalAction,
  provinceName: string | null
): string {
  const territory = provinceName ? ` en ${provinceName}` : '';
  const descriptions: Record<RivalTacticalAction, string> = {
    DEFENDER_BASTION: `${sigla} blindó su aparato territorial${territory} para retener voto propio.`,
    DESEMBARCO_SWING: `${profile.label} lanzó desembarco de campaña${territory} buscando voto indeciso.`,
    CAMPANA_NEGATIVA: `${sigla} endureció la pauta negativa contra el oficialismo por inflación y gestión.`,
    ACUERDO_FEDERAL: `${profile.label} cerró mesa de respaldo con referentes provinciales${territory}.`
  };
  return descriptions[action];
}

export interface RivalAiTurnOutput {
  nextMood: CountryMoodSnapshot;
  nextProvinces: ProvinceCampaignInfo[];
  rivalLastTurnSummary: string[];
  topHeadlines: string[];
}

const ACTION_POLLING_GAIN: Record<RivalTacticalAction, number> = {
  DEFENDER_BASTION: 0.45,
  DESEMBARCO_SWING: 0.72,
  CAMPANA_NEGATIVA: 0.55,
  ACUERDO_FEDERAL: 0.62
};

function applyIncumbentAttack(
  polling: Record<string, number>,
  incumbent: string,
  attackerSigla: string
): void {
  const incumbentPoll = polling[incumbent];
  if (incumbentPoll !== undefined && incumbent !== attackerSigla) {
    polling[incumbent] = round2(clamp(incumbentPoll - 0.45, 5, 55));
  }
}

interface RivalStepAcc {
  polling: Record<string, number>;
  provinces: ProvinceCampaignInfo[];
  summaries: string[];
}

function applyRivalActionEffect(
  action: RivalTacticalAction,
  nextPolling: Record<string, number>,
  provinces: ProvinceCampaignInfo[],
  incumbent: string,
  attackerSigla: string,
  targetProvId: string | null
): ProvinceCampaignInfo[] {
  if (action === 'CAMPANA_NEGATIVA') {
    applyIncumbentAttack(nextPolling, incumbent, attackerSigla);
    return provinces;
  }
  const penalty = action === 'DESEMBARCO_SWING' ? 0.35 : 0.2;
  return applyProvincePressure(provinces, targetProvId, penalty);
}

function executeSingleRivalTurn(
  acc: RivalStepAcc,
  sigla: string,
  profile: RivalProfile,
  mood: CountryMoodSnapshot,
  nextMonthIndex: number
): RivalStepAcc {
  const action = pickBestRivalAction(sigla, profile, mood, nextMonthIndex);
  const pool = action === 'DEFENDER_BASTION' ? profile.bastions : profile.swingTargets;
  const targetProvId = resolveTargetProvinceId(acc.provinces, pool, nextMonthIndex, sigla);
  const targetProvName = acc.provinces.find((p) => p.provinceId === targetProvId)?.provinceName ?? targetProvId;

  const currentPoll = acc.polling[sigla] ?? profile.baselineFloorPct;
  const stepGain = ACTION_POLLING_GAIN[action] + seededUnit(`gain-${sigla}-${nextMonthIndex}`) * 0.4;
  const nextPolling = { ...acc.polling, [sigla]: round2(clamp(currentPoll + stepGain, 1.5, 52)) };
  const nextProvinces = applyRivalActionEffect(
    action,
    nextPolling,
    acc.provinces,
    mood.incumbentPartySigla,
    sigla,
    targetProvId
  );

  return {
    polling: nextPolling,
    provinces: nextProvinces,
    summaries: [...acc.summaries, formatRivalHeadline(sigla, profile, action, targetProvName)]
  };
}

export function stepRivalCampaignAi(
  state: CampaignSimulationState,
  mood: CountryMoodSnapshot,
  provinces: ProvinceCampaignInfo[],
  nextMonthIndex: number
): RivalAiTurnOutput {
  const allied = new Set([state.partySigla, ...(state.coalitionParties ?? [])]);
  const activeRivals = Object.entries(RIVAL_PROFILES).filter(([sigla]) => !allied.has(sigla));
  const finalAcc = activeRivals.reduce<RivalStepAcc>(
    (acc, [sigla, profile]) => executeSingleRivalTurn(acc, sigla, profile, mood, nextMonthIndex),
    { polling: { ...mood.partyPolling }, provinces, summaries: [] }
  );

  return {
    nextMood: { ...mood, partyPolling: finalAcc.polling },
    nextProvinces: finalAcc.provinces,
    rivalLastTurnSummary: finalAcc.summaries,
    topHeadlines: finalAcc.summaries.slice(0, 2)
  };
}
