import type {
  ActiveCrisisArcState,
  CampaignPromiseMetricKey,
  CampaignPromiseRecord,
  CrisisArcId,
  SimulationState
} from '../models/SimulationTypes.js';
import type { CampaignSimulationState } from '../models/CampaignTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// Promesas de campaña y tramas escalonadas de 3 turnos: si prometiste algo en campaña o dejaste
// pudrir un frente tres meses seguidos, la factura cae en el despacho presidencial.

export interface SelectableCampaignPromise {
  id: string;
  title: string;
  targetSummary: string;
  metricKey: CampaignPromiseMetricKey;
  deadlineMonth: number;
  voteBoostPct: number;
}

export const CAMPAIGN_PROMISES_CATALOG: SelectableCampaignPromise[] = [
  {
    id: 'PROM_IPC',
    title: 'Domar la inflación mensual',
    targetSummary: 'IPC <= 2,0 % mensual (antes del Mes 12)',
    metricKey: 'IPC_BAJO',
    deadlineMonth: 12,
    voteBoostPct: 1.8
  },
  {
    id: 'PROM_FISCAL',
    title: 'Sostener superávit primario',
    targetSummary: 'Resultado primario >= +0,4 % PBI (Mes 18)',
    metricKey: 'SUPERAVIT_FISCAL',
    deadlineMonth: 18,
    voteBoostPct: 1.3
  },
  {
    id: 'PROM_BRECHA',
    title: 'Comprimir brecha cambiaria',
    targetSummary: 'Brecha <= 10,0 % (antes del Mes 24)',
    metricKey: 'BRECHA_BAJA',
    deadlineMonth: 24,
    voteBoostPct: 1.6
  },
  {
    id: 'PROM_POBREZA',
    title: 'Bajar la pobreza urbana',
    targetSummary: 'Pobreza INDEC <= 32,0 % (antes del Mes 18)',
    metricKey: 'POBREZA_BAJA',
    deadlineMonth: 18,
    voteBoostPct: 2.1
  },
  {
    id: 'PROM_RESERVAS',
    title: 'Blindar reservas del BCRA',
    targetSummary: 'Reservas netas >= US$ 24 MM (Mes 16)',
    metricKey: 'RESERVAS_ALTAS',
    deadlineMonth: 16,
    voteBoostPct: 1.4
  },
  {
    id: 'PROM_IMAGEN',
    title: 'Sostener respaldo popular',
    targetSummary: 'Aprobación >= 52,0 % (antes del Mes 22)',
    metricKey: 'IMAGEN_ALTA',
    deadlineMonth: 22,
    voteBoostPct: 1.5
  }
];

function toPromiseRecord(item: SelectableCampaignPromise): CampaignPromiseRecord {
  return {
    id: item.id,
    title: item.title,
    targetSummary: item.targetSummary,
    status: 'PENDIENTE',
    metricKey: item.metricKey,
    deadlineMonth: item.deadlineMonth
  };
}

export function buildPromisesFromSelection(
  selectedIds: string[] | undefined,
  partySigla: string
): CampaignPromiseRecord[] {
  const picked = (selectedIds ?? [])
    .map((id) => CAMPAIGN_PROMISES_CATALOG.find((p) => p.id === id))
    .filter((p): p is SelectableCampaignPromise => Boolean(p))
    .map(toPromiseRecord);
  const defaults = buildInitialCampaignPromises(partySigla);
  for (const fallback of defaults) {
    if (picked.length >= 3) break;
    if (!picked.some((p) => p.id === fallback.id)) picked.push(fallback);
  }
  return picked.slice(0, 3);
}

function formatPromiseToggleLog(item: SelectableCampaignPromise, removed: boolean): string {
  const boost = item.voteBoostPct.toFixed(1).replace('.', ',');
  if (removed) {
    return `Retiraste la promesa de campaña "${item.title}" (-${boost} % voto).`;
  }
  return `Promesa asumida en campaña: "${item.title}" (+${boost} % voto hoy; factura en Gobierno).`;
}

function computeNextPromiseIds(current: string[], promiseId: string, exists: boolean): string[] | null {
  if (exists) return current.filter((id) => id !== promiseId);
  if (current.length >= 3) return null;
  return [...current, promiseId];
}

export function toggleCampaignPromiseSelection(
  state: CampaignSimulationState,
  promiseId: string
): CampaignSimulationState {
  const item = CAMPAIGN_PROMISES_CATALOG.find((p) => p.id === promiseId);
  if (!item) return state;
  const current = state.selectedPromiseIds ?? [];
  const exists = current.includes(promiseId);
  const nextIds = computeNextPromiseIds(current, promiseId, exists);
  if (!nextIds) return state;

  const delta = exists ? -item.voteBoostPct : item.voteBoostPct;
  const nextVote = round2(clamp(state.votingIntention.intencionVotoGeneral + delta, 5, 68));
  return {
    ...state,
    selectedPromiseIds: nextIds,
    votingIntention: { ...state.votingIntention, intencionVotoGeneral: nextVote },
    historyLog: [formatPromiseToggleLog(item, exists), ...state.historyLog]
  };
}

const LIBERAL_PARTIES = new Set(['LLA', 'PRO', 'PD', 'MID']);
const POPULAR_PARTIES = new Set(['UXP', 'FDT', 'FIT', 'PS']);

const PROMISE_CHECKERS: Record<CampaignPromiseMetricKey, (s: SimulationState) => boolean> = {
  IPC_BAJO: (s) => s.inflation.realMonthlyIpcPct <= 2.0,
  SUPERAVIT_FISCAL: (s) => s.treasury.primaryResultPctGdp >= 0.4,
  POBREZA_BAJA: (s) => s.inflation.povertyCbtPct <= 32.0,
  RESERVAS_ALTAS: (s) => s.centralBank.netLiquidReservesBillionUsd >= 24.0,
  IMAGEN_ALTA: (s) => s.publicOpinion.managementApprovalPct >= 52.0,
  BRECHA_BAJA: (s) => s.centralBank.exchangeBrechaPct <= 10.0
};

export function buildInitialCampaignPromises(partySigla: string): CampaignPromiseRecord[] {
  const upper = partySigla.toUpperCase();
  if (LIBERAL_PARTIES.has(upper)) {
    return [
      { id: 'PROM_IPC', title: 'Domar la inflación mensual', targetSummary: 'IPC <= 2,0 % mensual (antes del Mes 12)', status: 'PENDIENTE', metricKey: 'IPC_BAJO', deadlineMonth: 12 },
      { id: 'PROM_FISCAL', title: 'Sostener superávit primario', targetSummary: 'Resultado primario >= +0,4 % PBI (Mes 18)', status: 'PENDIENTE', metricKey: 'SUPERAVIT_FISCAL', deadlineMonth: 18 },
      { id: 'PROM_BRECHA', title: 'Comprimir brecha cambiaria', targetSummary: 'Brecha <= 10,0 % (antes del Mes 24)', status: 'PENDIENTE', metricKey: 'BRECHA_BAJA', deadlineMonth: 24 }
    ];
  }
  if (POPULAR_PARTIES.has(upper)) {
    return [
      { id: 'PROM_POBREZA', title: 'Bajar la pobreza urbana', targetSummary: 'Pobreza INDEC <= 32,0 % (antes del Mes 18)', status: 'PENDIENTE', metricKey: 'POBREZA_BAJA', deadlineMonth: 18 },
      { id: 'PROM_RESERVAS', title: 'Blindar reservas del BCRA', targetSummary: 'Reservas netas >= US$ 24 MM (Mes 16)', status: 'PENDIENTE', metricKey: 'RESERVAS_ALTAS', deadlineMonth: 16 },
      { id: 'PROM_IMAGEN', title: 'Sostener respaldo popular', targetSummary: 'Aprobación >= 52,0 % (antes del Mes 22)', status: 'PENDIENTE', metricKey: 'IMAGEN_ALTA', deadlineMonth: 22 }
    ];
  }
  return [
    { id: 'PROM_IPC', title: 'Estabilizar precios sin recesión', targetSummary: 'IPC <= 2,0 % mensual (antes del Mes 14)', status: 'PENDIENTE', metricKey: 'IPC_BAJO', deadlineMonth: 14 },
    { id: 'PROM_RESERVAS', title: 'Recomponer reservas líquidas', targetSummary: 'Reservas netas >= US$ 24 MM (Mes 18)', status: 'PENDIENTE', metricKey: 'RESERVAS_ALTAS', deadlineMonth: 18 },
    { id: 'PROM_POBREZA', title: 'Recuperar ingreso y bajar pobreza', targetSummary: 'Pobreza INDEC <= 32,0 % (antes del Mes 24)', status: 'PENDIENTE', metricKey: 'POBREZA_BAJA', deadlineMonth: 24 }
  ];
}

function evaluateSinglePromise(
  promise: CampaignPromiseRecord,
  state: SimulationState
): { next: CampaignPromiseRecord; approvalDelta: number; credibilityDelta: number; log: string | null } {
  if (promise.status !== 'PENDIENTE' || state.turnMonth < 6) {
    return { next: promise, approvalDelta: 0, credibilityDelta: 0, log: null };
  }
  if (PROMISE_CHECKERS[promise.metricKey](state)) {
    return {
      next: { ...promise, status: 'CUMPLIDA' },
      approvalDelta: 1.4,
      credibilityDelta: 2.0,
      log: `Promesa cumplida: "${promise.title}" (+1,4 % aprobación, +2 credibilidad).`
    };
  }
  if (state.turnMonth >= promise.deadlineMonth) {
    return {
      next: { ...promise, status: 'ROTA' },
      approvalDelta: -2.0,
      credibilityDelta: -3.5,
      log: `Factura de campaña: incumpliste "${promise.title}" (-2,0 % aprobación, -3,5 credibilidad).`
    };
  }
  return { next: promise, approvalDelta: 0, credibilityDelta: 0, log: null };
}

export function stepCampaignPromises(state: SimulationState): {
  nextPromises: CampaignPromiseRecord[];
  approvalDelta: number;
  credibilityDelta: number;
  logs: string[];
} {
  const base = state.campaignPromises ?? buildInitialCampaignPromises(state.coalitionParties?.[0] ?? 'LLA');
  let approvalDelta = 0;
  let credibilityDelta = 0;
  const logs: string[] = [];
  const nextPromises = base.map((p) => {
    const res = evaluateSinglePromise(p, state);
    approvalDelta += res.approvalDelta;
    credibilityDelta += res.credibilityDelta;
    if (res.log) logs.push(res.log);
    return res.next;
  });
  return { nextPromises, approvalDelta: round2(approvalDelta), credibilityDelta: round2(credibilityDelta), logs };
}

function avgGovernorLoyalty(state: SimulationState): number {
  if (state.provinces.length === 0) return 60;
  const sum = state.provinces.reduce((acc, p) => acc + p.governorLoyaltyToPresident, 0);
  return sum / state.provinces.length;
}

const CRISIS_ARC_COPY: Record<CrisisArcId, { title: string; stages: [string, string, string]; negotiate: string; confront: string }> = {
  CORRIDA_CITY: {
    title: 'Corrida en la City',
    stages: [
      'Mesas de dinero testean el piso de reservas y ensanchan la brecha.',
      'Bancos dolarizan carteras y sube la tensión sobre los encajes.',
      'Alerta roja cambiaria: riesgo de salto discreto del dólar libre.'
    ],
    negotiate: 'Negociar repo y ancla con bancos (-0,08 % PBI)',
    confront: 'Pulso seco y controles duros (preserva caja, -1,8 % imagen)'
  },
  REBELION_FEDERAL: {
    title: 'Rebelión de Gobernadores',
    stages: [
      'Mandatarios del interior coordinan una cumbre por fondos coparticipables.',
      'Bloques provinciales amenazan con frenar el quórum en Diputados.',
      'Bloqueo legislativo federal: gobernadores exigen pacto de emergencia.'
    ],
    negotiate: 'Girar paquete ATN federal (+0,08 % gasto, +6 lealtad)',
    confront: 'Cortar giros discrecionales (cuida déficit, -1,8 % imagen)'
  },
  INTERNA_FORMULA: {
    title: 'Interna en la Fórmula',
    stages: [
      'Trascienden roces públicos entre Casa Rosada y el entorno de tu vice.',
      'El Senado opera agenda propia y se filtran críticas al rumbo económico.',
      'Fractura abierta en la coalición de gobierno frente a los medios.'
    ],
    negotiate: 'Ceder espacios en mesa política (-0,05 % PBI, ordena coalición)',
    confront: 'Marcar conducción presidencial (+2,5 credibilidad, -1,8 % imagen)'
  }
};

function buildArcStage(id: CrisisArcId, stage: 1 | 2 | 3): ActiveCrisisArcState {
  const copy = CRISIS_ARC_COPY[id];
  const detail = copy.stages[stage - 1] ?? copy.stages[0];
  return {
    id,
    title: copy.title,
    stage,
    headline: `${copy.title} · Fase ${stage}/3`,
    detail,
    negotiateLabel: copy.negotiate,
    confrontLabel: copy.confront
  };
}

function isCrisisRecovered(id: CrisisArcId, state: SimulationState): boolean {
  if (id === 'CORRIDA_CITY') {
    return state.centralBank.exchangeBrechaPct < 15 && state.centralBank.netLiquidReservesBillionUsd > 16;
  }
  if (id === 'REBELION_FEDERAL') {
    return avgGovernorLoyalty(state) >= 56;
  }
  return state.publicOpinion.managementApprovalPct >= 50;
}

function isCityRunTriggered(state: SimulationState): boolean {
  return state.centralBank.exchangeBrechaPct >= 25 || state.centralBank.netLiquidReservesBillionUsd <= 12;
}

function detectNewCrisisId(state: SimulationState): CrisisArcId | null {
  if (state.turnMonth < 4) return null;
  if (isCityRunTriggered(state)) return 'CORRIDA_CITY';
  if (avgGovernorLoyalty(state) < 44) return 'REBELION_FEDERAL';
  if (state.publicOpinion.managementApprovalPct < 42) return 'INTERNA_FORMULA';
  return null;
}

export function stepCrisisArcs(state: SimulationState): {
  nextArc: ActiveCrisisArcState | null;
  approvalDelta: number;
  riskDeltaPb: number;
  log: string | null;
} {
  const current = state.activeCrisisArc ?? null;
  if (current) {
    if (isCrisisRecovered(current.id, state)) {
      return {
        nextArc: null,
        approvalDelta: 0.8,
        riskDeltaPb: -20,
        log: `Trama desactivada: "${current.title}" cedió al estabilizarse los indicadores.`
      };
    }
    const nextStage = Math.min(3, current.stage + 1) as 1 | 2 | 3;
    const escalated = buildArcStage(current.id, nextStage);
    return {
      nextArc: escalated,
      approvalDelta: round2(-0.7 * nextStage),
      riskDeltaPb: 25 * nextStage,
      log: `Trama en escalada (${escalated.headline}): ${escalated.detail}`
    };
  }
  const triggered = detectNewCrisisId(state);
  if (!triggered) return { nextArc: null, approvalDelta: 0, riskDeltaPb: 0, log: null };
  const fresh = buildArcStage(triggered, 1);
  return {
    nextArc: fresh,
    approvalDelta: -0.6,
    riskDeltaPb: 20,
    log: `Nueva crisis abierta (${fresh.headline}): ${fresh.detail}`
  };
}

function applyNegotiateCrisis(state: SimulationState, arc: ActiveCrisisArcState): SimulationState {
  const atnBump = arc.id === 'INTERNA_FORMULA' ? 0.05 : 0.08;
  const loyaltyBump = arc.id === 'REBELION_FEDERAL' ? 6 : 2;
  const nextProvinces = state.provinces.map((p) => ({
    ...p,
    governorLoyaltyToPresident: round2(clamp(p.governorLoyaltyToPresident + loyaltyBump, 10, 98))
  }));
  return {
    ...state,
    activeCrisisArc: null,
    provinces: nextProvinces,
    countryRiskEmbiPb: Math.max(180, state.countryRiskEmbiPb - 35),
    treasury: { ...state.treasury, discretionaryAtnPctGdp: round2(state.treasury.discretionaryAtnPctGdp + atnBump) },
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct + 1.0, 5, 95))
    },
    eventLog: [`Crisis desactivada por acuerdo: "${arc.title}" (+${atnBump.toFixed(2).replace('.', ',')} % PBI en acuerdos).`, ...state.eventLog.slice(0, 14)]
  };
}

function applyConfrontCrisis(state: SimulationState, arc: ActiveCrisisArcState): SimulationState {
  return {
    ...state,
    activeCrisisArc: null,
    countryRiskEmbiPb: state.countryRiskEmbiPb + 30,
    structural: {
      ...state.structural,
      anchorCredibilityIndex: round2(clamp(state.structural.anchorCredibilityIndex + 2.5, 8, 98))
    },
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: round2(clamp(state.publicOpinion.managementApprovalPct - 1.8, 5, 95))
    },
    eventLog: [`Crisis resuelta por confrontación: "${arc.title}" (+2,5 credibilidad, -1,8 % imagen).`, ...state.eventLog.slice(0, 14)]
  };
}

export function resolveCrisisArcAction(
  state: SimulationState,
  strategy: 'NEGOCIAR' | 'CONFRONTAR'
): SimulationState {
  const arc = state.activeCrisisArc;
  if (!arc) return state;
  return strategy === 'NEGOCIAR' ? applyNegotiateCrisis(state, arc) : applyConfrontCrisis(state, arc);
}
