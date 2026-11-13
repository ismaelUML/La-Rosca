import type { CampaignSimulationState } from '../models/CampaignTypes.js';
import type { CongressBlocAllocation, ProvinceSummary, SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

const BASE_BLOC_IDS = ['LLA', 'PRO', 'UCR', 'PF', 'PROVINCIALES', 'UXP', 'FIT'] as const;

const DEFAULT_SEATS: Record<string, { dep: number; sen: number; rel: number }> = {
  LLA: { dep: 38, sen: 7, rel: 100 },
  PRO: { dep: 37, sen: 6, rel: 78 },
  UCR: { dep: 34, sen: 13, rel: 42 },
  PF: { dep: 16, sen: 6, rel: 55 },
  PROVINCIALES: { dep: 28, sen: 7, rel: 50 },
  UXP: { dep: 99, sen: 33, rel: 0 },
  FIT: { dep: 5, sen: 0, rel: 5 }
};

function normalizeBlocId(sigla: string): string {
  const upper = sigla.toUpperCase();
  return upper === 'UXP' ? 'UXP' : upper;
}

function buildSeatScale(votePct: number, coalitionCount: number): number {
  const rawScale = 0.8 + (votePct - 35) * 0.025 + coalitionCount * 0.08;
  return clamp(rawScale, 0.65, 1.85);
}

function computeBlocAllocation(
  blocId: string,
  playerId: string,
  coalitionSet: Set<string>,
  seatScale: number
): CongressBlocAllocation {
  const base = DEFAULT_SEATS[blocId] ?? { dep: 10, sen: 2, rel: 30 };
  const isPlayer = blocId === playerId;
  const isAlly = coalitionSet.has(blocId);

  if (isPlayer) {
    return {
      id: blocId,
      deputiesSeats: Math.round(clamp(base.dep * seatScale, 18, 128)),
      senateSeats: Math.round(clamp(base.sen * seatScale, 4, 36)),
      relation: 100
    };
  }
  if (isAlly) {
    return {
      id: blocId,
      deputiesSeats: base.dep,
      senateSeats: base.sen,
      relation: Math.max(base.rel, 85)
    };
  }
  return { id: blocId, deputiesSeats: base.dep, senateSeats: base.sen, relation: base.rel };
}

function reconcileTotalDeputies(blocs: CongressBlocAllocation[], playerId: string): CongressBlocAllocation[] {
  const total = blocs.reduce((acc, b) => acc + b.deputiesSeats, 0);
  const diff = 257 - total;
  if (diff === 0) return blocs;

  const targetId = playerId === 'UXP' ? 'PRO' : 'UXP';
  return blocs.map((b) =>
    b.id === targetId ? { ...b, deputiesSeats: Math.max(10, b.deputiesSeats + diff) } : b
  );
}

export function buildCongressFromCampaign(campaign: CampaignSimulationState): CongressBlocAllocation[] {
  const playerId = normalizeBlocId(campaign.partySigla);
  const coalitionSet = new Set((campaign.coalitionParties ?? []).map(normalizeBlocId));
  const seatScale = buildSeatScale(campaign.votingIntention.intencionVotoGeneral, coalitionSet.size);

  const raw = BASE_BLOC_IDS.map((id) => computeBlocAllocation(id, playerId, coalitionSet, seatScale));
  return reconcileTotalDeputies(raw, playerId);
}

function mapCampaignProvinceToGov(
  prov: ProvinceSummary,
  campaignProvinces: CampaignSimulationState['provinces']
): ProvinceSummary {
  const match = campaignProvinces.find((cp) => cp.provinceId === prov.id);
  if (!match) return prov;
  const voteDelta = (match.playerVotePct - 35) * 0.45;
  return {
    ...prov,
    governorLoyaltyToPresident: round2(clamp(prov.governorLoyaltyToPresident + voteDelta, 12, 95))
  };
}

export function applyCampaignBridgeToGovernment(
  baseState: SimulationState,
  campaign: CampaignSimulationState
): SimulationState {
  const votePct = campaign.votingIntention.intencionVotoGeneral;
  const coalition = campaign.coalitionParties ?? [];
  const endorsementsCount = Object.values(campaign.diplomacy?.endorsements ?? {}).filter(
    (e) => e.verdict === 'ACEPTO'
  ).length;

  const initialApproval = round2(
    clamp(campaign.image.imagenPositiva * 0.55 + votePct * 0.55 + endorsementsCount * 0.8, 32, 76)
  );
  const personalImage = round2(clamp(initialApproval + 3.5, 34, 80));

  const congressBlocs = buildCongressFromCampaign(campaign);
  const provinces = baseState.provinces.map((p) => mapCampaignProvinceToGov(p, campaign.provinces));
  const coalitionLabel = coalition.length > 0 ? coalition.join(' + ') : campaign.partySigla;

  return {
    ...baseState,
    coalitionParties: coalition,
    runningMateId: campaign.runningMateId ?? null,
    congressBlocs,
    provinces,
    publicOpinion: {
      ...baseState.publicOpinion,
      managementApprovalPct: initialApproval,
      presidentialPersonalImagePct: personalImage
    },
    structural: {
      ...baseState.structural,
      anchorCredibilityIndex: round2(clamp(baseState.structural.anchorCredibilityIndex + endorsementsCount * 1.5, 20, 90))
    },
    eventLog: [
      `10 de Diciembre de 2027: Asume ${campaign.candidateName} (${coalitionLabel}) con ${votePct.toFixed(1)}% de respaldo electoral.`,
      ...baseState.eventLog.slice(0, 14)
    ]
  };
}

