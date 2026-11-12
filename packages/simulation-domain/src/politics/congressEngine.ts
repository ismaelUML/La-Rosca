// Motor Parlamentario 1:1 con QQG: Negociacion bloque por bloque en Diputados (257) y Senado (72).
// En el Congreso argentino no se negocia banca por banca: se roscón con los jefes de bloque
// y los gobernadores. Sin los votos en duda de radicales, provinciales y peronismo federal,
// cualquier ley de fondo naufraga antes de llegar al recinto.

export type CongressBillCategory =
  | 'REFORMA_ESTRUCTURAL'
  | 'FISCAL_PRESUPUESTO'
  | 'LABORAL'
  | 'TRIBUTARIA'
  | 'INSTITUCIONAL';

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

export const INITIAL_CONGRESS_BILLS: CongressBillProject[] = [
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

export function computeBlocProbability(
  bloc: CongressNegotiationBloc,
  approvalPct: number = 50,
  billIsSoftened: boolean = false
): number {
  if (bloc.id === 'LLA') return 99;
  if (bloc.id === 'FIT') return 2;

  let base = bloc.baseAffinityPct;
  const moodDelta = Math.round((approvalPct - 45) * 0.25);
  base += moodDelta;

  if (billIsSoftened) {
    base += 15;
  }

  for (const c of bloc.concessionsReceived) {
    base += calculateConcessionBoost(c, bloc.id);
  }

  return Math.max(3, Math.min(95, base));
}

export function applyConcessionToBloc(
  bloc: CongressNegotiationBloc,
  concession: ConcessionType,
  approvalPct: number = 50,
  billIsSoftened: boolean = false
): CongressNegotiationBloc {
  if (bloc.concessionsReceived.includes(concession)) {
    return bloc;
  }
  const nextConcessions = [...bloc.concessionsReceived, concession];
  const updatedBloc = { ...bloc, concessionsReceived: nextConcessions };
  const nextProb = computeBlocProbability(updatedBloc, approvalPct, billIsSoftened);
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
