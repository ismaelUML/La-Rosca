// Motor Parlamentario 1:1 con QQG: Negociacion bloque por bloque en Diputados (257) y Senado (72).
// En el Congreso argentino no se negocia banca por banca: se roscón con los jefes de bloque
// y los gobernadores. Sin los votos en duda de radicales, provinciales y peronismo federal,
// cualquier ley de fondo naufraga antes de llegar al recinto.

import type { SimulationState } from '../models/SimulationTypes.js';
import { readTrustScore } from '../engine/trustAndLagEngine.js';
import { CONGRESS_BILLS_EXPANSION_105 } from './congressBillsExpansionCatalog.js';

export type CongressBillCategory =
  | 'REFORMA_ESTRUCTURAL'
  | 'FISCAL_PRESUPUESTO'
  | 'LABORAL'
  | 'TRIBUTARIA'
  | 'INSTITUCIONAL'
  | 'SEGURIDAD_JUSTICIA'
  | 'ENERGIA_INFRAESTRUCTURA'
  | 'PRODUCCION_SOCIAL';

export type BlocStance = 'A_FAVOR' | 'EN_DUDA' | 'EN_CONTRA';

export type ConcessionType = 'ARGENTUMS' | 'GABINETE' | 'SUAVIZAR' | 'GOBERNADORES';

export interface CongressConcessionsCost {
  argentums: number;
  politicalCapital: number;
}

export const CONCESSION_COSTS: Record<ConcessionType, CongressConcessionsCost> = {
  ARGENTUMS: { argentums: 30, politicalCapital: 0 },
  GABINETE: { argentums: 0, politicalCapital: 10 },
  SUAVIZAR: { argentums: 0, politicalCapital: 0 },
  GOBERNADORES: { argentums: 15, politicalCapital: 5 }
};

export interface CongressBillConsequences {
  gdpGrowthDelta?: number;
  inflationDelta?: number;
  countryRiskDelta?: number;
  primaryBalanceDelta?: number;
  publicApprovalDelta?: number;
}

export interface CongressBillProject {
  id: string;
  title: string;
  shortDescription: string;
  category: CongressBillCategory;
  urgency: 'ALTA' | 'MEDIA' | 'ESTRUCTURAL';
  concessionsApplied?: ConcessionType[];
  isSoftened?: boolean;
  cooldownMonths?: number;
  status: 'PENDIENTE' | 'EN_NEGOCIACION' | 'APROBADA' | 'RECHAZADA';
  consequences: CongressBillConsequences;
}

export interface CongressNegotiationBloc {
  id: string;
  name: string;
  shortLabel: string;
  deputiesSeats: number;
  senateSeats: number;
  color: string;
  badgeBg: string;
  baseAffinityPct: number;
  currentStance: BlocStance;
  probabilityYes: number;
  concessionsReceived: ConcessionType[];
}

export interface ChamberVoteDetail {
  chamber: 'DIPUTADOS' | 'SENADO';
  totalSeats: number;
  quorumNeeded: number;
  majorityNeeded: number;
  quorumReached: boolean;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  passed: boolean;
  blocVotes: Record<string, { yes: number; no: number; abstention: number }>;
}

export interface CongressVoteOutcome {
  billId: string;
  billTitle: string;
  deputies: ChamberVoteDetail;
  senate: ChamberVoteDetail;
  passed: boolean;
  summaryMessage: string;
}

export const INITIAL_PARLIAMENTARY_BLOCS: CongressNegotiationBloc[] = [
  {
    id: 'LLA',
    name: 'La Libertad Avanza (Oficialismo)',
    shortLabel: 'LLA',
    deputiesSeats: 38,
    senateSeats: 7,
    color: '#a855f7',
    badgeBg: 'bg-purple-600 text-white',
    baseAffinityPct: 100,
    currentStance: 'A_FAVOR',
    probabilityYes: 99,
    concessionsReceived: []
  },
  {
    id: 'PRO',
    name: 'Propuesta Republicana (PRO)',
    shortLabel: 'PRO',
    deputiesSeats: 37,
    senateSeats: 6,
    color: '#facc15',
    badgeBg: 'bg-amber-400 text-slate-950',
    baseAffinityPct: 78,
    currentStance: 'A_FAVOR',
    probabilityYes: 82,
    concessionsReceived: []
  },
  {
    id: 'PF',
    name: 'Peronismo Federal / Provincias Unidas',
    shortLabel: 'PF',
    deputiesSeats: 16,
    senateSeats: 6,
    color: '#2563eb',
    badgeBg: 'bg-blue-600 text-white',
    baseAffinityPct: 55,
    currentStance: 'EN_DUDA',
    probabilityYes: 52,
    concessionsReceived: []
  },
  {
    id: 'PROVINCIALES',
    name: 'Bloques Provinciales y Fuerzas Locales',
    shortLabel: 'PROV',
    deputiesSeats: 28,
    senateSeats: 7,
    color: '#10b981',
    badgeBg: 'bg-emerald-600 text-white',
    baseAffinityPct: 50,
    currentStance: 'EN_DUDA',
    probabilityYes: 48,
    concessionsReceived: []
  },
  {
    id: 'UCR',
    name: 'Unión Cívica Radical',
    shortLabel: 'UCR',
    deputiesSeats: 34,
    senateSeats: 13,
    color: '#dc2626',
    badgeBg: 'bg-red-600 text-white',
    baseAffinityPct: 42,
    currentStance: 'EN_DUDA',
    probabilityYes: 40,
    concessionsReceived: []
  },
  {
    id: 'UXP',
    name: 'Unión por la Patria',
    shortLabel: 'UxP',
    deputiesSeats: 99,
    senateSeats: 33,
    color: '#38bdf8',
    badgeBg: 'bg-sky-500 text-slate-950',
    baseAffinityPct: 10,
    currentStance: 'EN_CONTRA',
    probabilityYes: 6,
    concessionsReceived: []
  },
  {
    id: 'FIT',
    name: 'Frente de Izquierda y de Trabajadores',
    shortLabel: 'FIT',
    deputiesSeats: 5,
    senateSeats: 0,
    color: '#ef4444',
    badgeBg: 'bg-red-700 text-white',
    baseAffinityPct: 2,
    currentStance: 'EN_CONTRA',
    probabilityYes: 2,
    concessionsReceived: []
  }
];

const BASE_CONGRESS_BILLS: CongressBillProject[] = [
  {
    id: 'LEY_BASES_2',
    title: 'Ley Bases 2.0 y Facultades Delegadas',
    shortDescription:
      'Desregulación económica de hidrocarburos, reforma del Estado, privatizaciones estratégicas y consolidación del marco de inversiones.',
    category: 'REFORMA_ESTRUCTURAL',
    urgency: 'ALTA',
    status: 'PENDIENTE',
    consequences: {
      gdpGrowthDelta: 1.2,
      countryRiskDelta: -160,
      publicApprovalDelta: 2.5
    }
  },
  {
    id: 'PRESUPUESTO_DEFICIT_CERO',
    title: 'Presupuesto Déficit Cero Estricto',
    shortDescription:
      'Regla fiscal vinculante que prohíbe emitir deuda o moneda para gasto primario sin partida específica compensada.',
    category: 'FISCAL_PRESUPUESTO',
    urgency: 'ALTA',
    status: 'PENDIENTE',
    consequences: {
      primaryBalanceDelta: 1.8,
      inflationDelta: -1.5,
      countryRiskDelta: -220
    }
  },
  {
    id: 'REFORMA_LABORAL_INTEGRAL',
    title: 'Reforma Laboral Integral y Cese Laboral',
    shortDescription:
      'Fondo voluntario de cese laboral por convenio, baja de multas registrales e incentivo fiscal al empleo joven.',
    category: 'LABORAL',
    urgency: 'MEDIA',
    status: 'PENDIENTE',
    consequences: {
      gdpGrowthDelta: 0.9,
      countryRiskDelta: -75,
      publicApprovalDelta: -1.0
    }
  },
  {
    id: 'PACTO_FISCAL_FEDERAL',
    title: 'Pacto Fiscal y Simplificación de Impuestos',
    shortDescription:
      'Tope a Ingresos Brutos provinciales a cambio de transferencias automáticas y eliminación de anticipos distorsivos.',
    category: 'TRIBUTARIA',
    urgency: 'MEDIA',
    status: 'PENDIENTE',
    consequences: {
      gdpGrowthDelta: 0.8,
      inflationDelta: -0.6,
      publicApprovalDelta: 1.5
    }
  },
  {
    id: 'INTERVENCION_FEDERAL_EMERGENCIA',
    title: 'Intervención Federal por Crisis Institucional',
    shortDescription:
      'Remoción del Poder Ejecutivo provincial en distritos con avasallamiento de poderes y convocatoria a elecciones en 6 meses.',
    category: 'INSTITUCIONAL',
    urgency: 'ESTRUCTURAL',
    status: 'PENDIENTE',
    consequences: {
      publicApprovalDelta: 1.0,
      countryRiskDelta: -30
    }
  }
];

export const INITIAL_CONGRESS_BILLS: CongressBillProject[] = [
  ...BASE_CONGRESS_BILLS,
  ...CONGRESS_BILLS_EXPANSION_105
];

function resolveGovernorBoost(blocId: string): number {
  return blocId === 'PF' || blocId === 'PROVINCIALES' ? 35 : 12;
}

const STATIC_CONCESSION_BOOST: Record<Exclude<ConcessionType, 'GOBERNADORES'>, number> = {
  ARGENTUMS: 24,
  GABINETE: 28,
  SUAVIZAR: 20
};

function calculateConcessionBoost(type: ConcessionType, blocId: string): number {
  if (type === 'GOBERNADORES') {
    return resolveGovernorBoost(blocId);
  }
  return STATIC_CONCESSION_BOOST[type];
}

function resolveStanceByProbability(prob: number): BlocStance {
  if (prob >= 60) return 'A_FAVOR';
  if (prob >= 35) return 'EN_DUDA';
  return 'EN_CONTRA';
}

export function computeProvincialLoyaltyCongressDelta(state: SimulationState): number {
  const list = state.provinces;
  if (!list || list.length === 0) return 0;
  const avgLoyalty = list.reduce((acc, p) => acc + p.governorLoyaltyToPresident, 0) / list.length;
  const quasiPenalty = list.filter((p) => p.quasiCurrencyIssued).length * 4;
  return Math.round((avgLoyalty - 50) * 0.45 - quasiPenalty);
}

function resolveBlocBaseAffinity(bloc: CongressNegotiationBloc, state: SimulationState, provDelta: number): number {
  const stateBloc = state.congressBlocs?.find((item) => item.id === bloc.id);
  const relationShift = stateBloc ? Math.round((stateBloc.relation - 50) * 0.25) : 0;
  const coalitionBonus = state.coalitionParties?.includes(bloc.id) ? 14 : 0;
  const isRegional = bloc.id === 'PF' || bloc.id === 'PROVINCIALES';
  return Math.max(2, Math.min(99, bloc.baseAffinityPct + relationShift + coalitionBonus + (isRegional ? provDelta : 0)));
}

// Matriz programatica por bloque y tematica de ley: se acabo votar todo igual como robots.
const BLOC_CATEGORY_AFFINITY: Record<string, Partial<Record<CongressBillCategory, number>>> = {
  LLA: {
    REFORMA_ESTRUCTURAL: 12,
    FISCAL_PRESUPUESTO: 10,
    LABORAL: 12,
    TRIBUTARIA: 8,
    SEGURIDAD_JUSTICIA: 10,
    ENERGIA_INFRAESTRUCTURA: 8,
    INSTITUCIONAL: -6,
    PRODUCCION_SOCIAL: -28
  },
  PRO: {
    REFORMA_ESTRUCTURAL: 8,
    FISCAL_PRESUPUESTO: 10,
    LABORAL: 9,
    TRIBUTARIA: 7,
    SEGURIDAD_JUSTICIA: 12,
    ENERGIA_INFRAESTRUCTURA: 8,
    INSTITUCIONAL: 4,
    PRODUCCION_SOCIAL: -16
  },
  PF: {
    ENERGIA_INFRAESTRUCTURA: 14,
    PRODUCCION_SOCIAL: 14,
    FISCAL_PRESUPUESTO: 4,
    TRIBUTARIA: 6,
    LABORAL: -10,
    SEGURIDAD_JUSTICIA: -4
  },
  PROVINCIALES: {
    ENERGIA_INFRAESTRUCTURA: 18,
    TRIBUTARIA: 12,
    FISCAL_PRESUPUESTO: 8,
    PRODUCCION_SOCIAL: 8,
    INSTITUCIONAL: -12
  },
  UCR: {
    INSTITUCIONAL: 16,
    PRODUCCION_SOCIAL: 10,
    FISCAL_PRESUPUESTO: 4,
    LABORAL: -12,
    SEGURIDAD_JUSTICIA: -6
  },
  UXP: {
    PRODUCCION_SOCIAL: 26,
    ENERGIA_INFRAESTRUCTURA: 10,
    INSTITUCIONAL: 6,
    LABORAL: -18,
    REFORMA_ESTRUCTURAL: -16,
    FISCAL_PRESUPUESTO: -14
  },
  FIT: {
    PRODUCCION_SOCIAL: 16,
    INSTITUCIONAL: 6,
    LABORAL: -20,
    SEGURIDAD_JUSTICIA: -20
  }
};

function resolveCategoryShift(blocId: string, billCategory?: CongressBillCategory): number {
  if (!billCategory) return 0;
  return BLOC_CATEGORY_AFFINITY[blocId]?.[billCategory] ?? 0;
}

export function buildDynamicParliamentaryBlocs(
  state: SimulationState,
  billCategory?: CongressBillCategory
): CongressNegotiationBloc[] {
  const provDelta = computeProvincialLoyaltyCongressDelta(state);
  const approval = state.publicOpinion?.managementApprovalPct ?? 50;
  const congressTrust = readTrustScore(state.trustLedger, 'CONGRESO');
  return INITIAL_PARLIAMENTARY_BLOCS.map((bloc) => {
    const stateBloc = state.congressBlocs?.find((item) => item.id === bloc.id);
    const updatedBase = resolveBlocBaseAffinity(bloc, state, provDelta);
    const merged: CongressNegotiationBloc = {
      ...bloc,
      deputiesSeats: stateBloc?.deputiesSeats ?? bloc.deputiesSeats,
      senateSeats: stateBloc?.senateSeats ?? bloc.senateSeats,
      baseAffinityPct: updatedBase
    };
    const probabilityYes = computeBlocProbability(merged, approval, false, billCategory, congressTrust);
    return { ...merged, probabilityYes, currentStance: resolveStanceByProbability(probabilityYes) };
  });
}

function sumConcessionsWithFatigue(concessions: ConcessionType[], blocId: string): number {
  return concessions.reduce((acc, c, idx) => {
    const fatigueFactor = 1 / (1 + idx * 0.35);
    return acc + Math.round(calculateConcessionBoost(c, blocId) * fatigueFactor);
  }, 0);
}

export function computeBlocProbability(
  bloc: CongressNegotiationBloc,
  approvalPct: number = 50,
  billIsSoftened: boolean = false,
  billCategory?: CongressBillCategory,
  congressTrustPct: number = 52
): number {
  const categoryShift = resolveCategoryShift(bloc.id, billCategory);
  const moodDelta = Math.round((approvalPct - 45) * 0.25);
  const trustDelta = Math.round((congressTrustPct - 52) * 0.28);
  const softenedBonus = billIsSoftened ? 15 : 0;
  const concessionBoost = sumConcessionsWithFatigue(bloc.concessionsReceived, bloc.id);

  // Bloque oficialista responde fuerte igual salvo leyes abiertamente contrarias a su programa
  const isOfficialist = bloc.id === 'LLA';
  const raw = isOfficialist
    ? bloc.baseAffinityPct + categoryShift + softenedBonus * 0.3 + moodDelta * 0.2
    : bloc.baseAffinityPct + categoryShift + moodDelta + trustDelta + softenedBonus + concessionBoost;

  const upperBound = isOfficialist ? 99 : 95;
  const lowerBound = bloc.id === 'FIT' ? 2 : 3;
  return Math.max(lowerBound, Math.min(upperBound, Math.round(raw)));
}

export function applyConcessionToBloc(
  bloc: CongressNegotiationBloc,
  concession: ConcessionType,
  approvalPct: number = 50,
  billIsSoftened: boolean = false,
  billCategory?: CongressBillCategory,
  congressTrustPct: number = 52
): CongressNegotiationBloc {
  if (bloc.concessionsReceived.includes(concession)) {
    return bloc;
  }
  const nextConcessions = [...bloc.concessionsReceived, concession];
  const updatedBloc = { ...bloc, concessionsReceived: nextConcessions };
  const nextProb = computeBlocProbability(updatedBloc, approvalPct, billIsSoftened, billCategory, congressTrustPct);
  const nextStance = resolveStanceByProbability(nextProb);

  return {
    ...updatedBloc,
    probabilityYes: nextProb,
    currentStance: nextStance
  };
}

function computeVoteSplit(
  seats: number,
  probYes: number,
  seed: number
): { yes: number; no: number; abstention: number } {
  if (seats <= 0) return { yes: 0, no: 0, abstention: 0 };
  const variance = (seed % 11) - 5;
  const effectiveProb = Math.max(2, Math.min(98, probYes + variance)) / 100;

  const rawYes = Math.round(seats * effectiveProb);
  const yes = Math.min(seats, Math.max(0, rawYes));
  const remaining = seats - yes;

  const abstentionRate = probYes > 30 && probYes < 65 ? 0.15 : 0.05;
  const abstention = Math.min(remaining, Math.round(remaining * abstentionRate));
  const no = Math.max(0, remaining - abstention);

  return { yes, no, abstention };
}

export function simulateChamberVote(
  chamber: 'DIPUTADOS' | 'SENADO',
  blocs: CongressNegotiationBloc[],
  seedBase: number = 42
): ChamberVoteDetail {
  const totalSeats = chamber === 'DIPUTADOS' ? 257 : 72;
  const quorumNeeded = chamber === 'DIPUTADOS' ? 129 : 37;
  const majorityNeeded = quorumNeeded;

  let totalYes = 0;
  let totalNo = 0;
  let totalAbs = 0;
  const blocVotes: Record<string, { yes: number; no: number; abstention: number }> = {};

  blocs.forEach((b, idx) => {
    const seats = chamber === 'DIPUTADOS' ? b.deputiesSeats : b.senateSeats;
    const split = computeVoteSplit(seats, b.probabilityYes, seedBase + idx * 7);
    blocVotes[b.id] = split;
    totalYes += split.yes;
    totalNo += split.no;
    totalAbs += split.abstention;
  });

  const presentSeats = totalYes + totalNo + totalAbs;
  const quorumReached = presentSeats >= quorumNeeded;
  const passed = quorumReached && totalYes >= majorityNeeded;

  return {
    chamber,
    totalSeats,
    quorumNeeded,
    majorityNeeded,
    quorumReached,
    yesVotes: totalYes,
    noVotes: totalNo,
    abstentions: totalAbs,
    passed,
    blocVotes
  };
}

export function executeFullCongressVote(
  bill: CongressBillProject,
  blocs: CongressNegotiationBloc[],
  turnSeed: number = 100
): CongressVoteOutcome {
  const deputies = simulateChamberVote('DIPUTADOS', blocs, turnSeed);
  const senate = simulateChamberVote('SENADO', blocs, turnSeed + 77);
  const passed = deputies.passed && senate.passed;

  let summaryMessage = `Ley "${bill.title}": Sancionada con éxito en ambas cámaras.`;
  if (!deputies.passed) {
    summaryMessage = `Ley "${bill.title}": Rechazada en Diputados (${deputies.yesVotes}/${deputies.totalSeats} votos).`;
  } else if (!senate.passed) {
    summaryMessage = `Ley "${bill.title}": Aprobada en Diputados pero bloqueada en el Senado (${senate.yesVotes}/${senate.totalSeats} votos).`;
  }

  return {
    billId: bill.id,
    billTitle: bill.title,
    deputies,
    senate,
    passed,
    summaryMessage
  };
}
