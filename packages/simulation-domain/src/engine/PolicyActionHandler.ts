import type { PolicyAction, SimulationState } from '../models/SimulationTypes.js';
import type { SectorMeasureCard } from '../models/PartyAndSetupTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { INITIAL_CONGRESS_BILLS } from '../politics/congressEngine.js';
import { INITIAL_FIXED_REFORMS, toggleFixedReformState } from '../politics/reformasInstitucionalesEngine.js';
import { approveAllRigiProjects, approveRigiProject } from './rigiEngine.js';
import { adjustTrustLedger, enqueueMacroShock } from './trustAndLagEngine.js';

// Partimos el despacho de acciones en handlers chiquitos por dominio para mantener CC <= 5
// y que cada medida explique exactamente que cable toca y que rompe de rebote.

function applyMonetaryAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'SET_CRAWLING_PEG') {
    const monthlyPct = clamp(action.monthlyPct, 0, 25);
    return {
      ...state,
      centralBank: { ...state.centralBank, crawlingPegMonthlyPct: monthlyPct },
      eventLog: [`BCRA fijo el ritmo de crawling peg oficial en ${monthlyPct}% mensual.`, ...state.eventLog.slice(0, 14)]
    };
  }
  if (action.type === 'DISCRETE_DEVALUATION') {
    const pct = clamp(action.devaluationPct, 5, 120);
    const factor = 1 + pct / 100;
    const officialDollarArs = round2(state.centralBank.officialDollarArs * factor);
    // Devaluar de golpe te rompe la credibilidad del ancla en el acto (-28 puntos, ley de histeresis)
    const anchorCredibilityIndex = clamp(state.structural.anchorCredibilityIndex - 28, 5, 100);
    const laggedMacroShocks = enqueueMacroShock(state.laggedMacroShocks, {
      id: `deval-${state.turnMonth}`,
      sourceLabel: `Pass-through devaluatorio (${pct}%)`,
      monthsRemaining: 3,
      inflationDeltaPerMonth: round2(clamp(pct * 0.045, 0.4, 4.5)),
      gdpGrowthDeltaPerMonth: round2(-clamp(pct * 0.015, 0.2, 1.4)),
      approvalDeltaPerMonth: -0.35
    });
    return {
      ...state,
      centralBank: {
        ...state.centralBank,
        officialDollarArs,
        exchangeBrechaPct: round2(Math.max(2, state.centralBank.exchangeBrechaPct - action.devaluationPct * 0.65))
      },
      structural: { ...state.structural, anchorCredibilityIndex, expectedDevaluation3mPct: 12 },
      trustLedger: adjustTrustLedger(state.trustLedger, { MERCADOS: -12 }),
      laggedMacroShocks,
      eventLog: [
        `Shock cambiario: el Dolar Oficial salto a $${officialDollarArs}. Cae la brecha pero se dispara el pass-through a alimentos y el costo de CAMMESA (rezago de 3 meses).`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  if (action.type === 'SET_POLICY_RATE') {
    return {
      ...state,
      centralBank: { ...state.centralBank, policyRateAnnualPct: clamp(action.annualRatePct, 8, 180) }
    };
  }
  if (action.type === 'SET_CEPO_STRICTNESS') {
    return {
      ...state,
      centralBank: { ...state.centralBank, cepoStrictnessIndex: clamp(action.strictnessIndex, 0, 100) }
    };
  }
  return null;
}

function applyEnergyAndLaborAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'SET_TARIFF_COVERAGE') {
    return {
      ...state,
      energy: { ...state.energy, userTariffCoveragePct: clamp(action.coveragePct, 15, 100) },
      eventLog: [
        `Secretaria de Energia ajusto cobertura tarifaria de usuarios en CAMMESA al ${action.coveragePct}%.`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  if (action.type === 'SET_YPF_POLICY') {
    return {
      ...state,
      energy: { ...state.energy, ypfPolicy: action.policy }
    };
  }
  if (action.type === 'TOGGLE_INDUSTRIAL_GAS_CUT') {
    return {
      ...state,
      energy: { ...state.energy, industrialGasCutActive: action.cutActive }
    };
  }
  if (action.type === 'TOGGLE_PARITARIA_HOMOLOGATION') {
    const paritarias = state.labor.paritarias.map((p) =>
      p.id === action.paritariaId ? { ...p, homologatedByState: !p.homologatedByState } : p
    );
    return { ...state, labor: { ...state.labor, paritarias } };
  }
  return null;
}

function applyIndecIntervention(state: SimulationState, intervene: boolean): SimulationState {
  const indecCredibilityIndex = intervene ? 32 : 86;
  const msg = intervene
    ? `Intervencion del INDEC: nace la doble contabilidad con el IPC Congreso y se desploman los bonos CER.`
    : `Normalizacion tecnica del INDEC: se auditan las series estadisticas.`;
  return {
    ...state,
    structural: { ...state.structural, indecCredibilityIndex },
    trustLedger: adjustTrustLedger(state.trustLedger, {
      MERCADOS: intervene ? -18 : 8,
      CONGRESO: intervene ? -8 : 4
    }),
    eventLog: [msg, ...state.eventLog.slice(0, 14)]
  };
}

function applyStateReformOrIndecAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'TOGGLE_INSTITUTIONAL_REFORM') {
    return applyInstitutionalReformToggle(state, action.reformId);
  }
  if (action.type === 'EXECUTE_LABOR_REFORM') {
    return {
      ...state,
      labor: { ...state.labor, laborLitigationMultiplier: round2(Math.max(1.0, state.labor.laborLitigationMultiplier - 0.55)) },
      eventLog: [
        `Reforma de Modernizacion Laboral: bajan multas de litigiosidad y se habilita Fondo de Cese Laboral.`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  if (action.type === 'TOGGLE_INDEC_INTERVENTION') {
    return applyIndecIntervention(state, action.intervene);
  }
  return null;
}

function applyFiscalOrFederalAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'EXECUTE_ANSES_INTRA_STATE_SWAP') {
    return {
      ...state,
      treasury: { ...state.treasury, lastRolloverPct: round2(Math.min(130, state.treasury.lastRolloverPct + 22)) },
      bankingSystem: {
        ...state.bankingSystem,
        publicSectorExposurePct: round2(Math.max(18, state.bankingSystem.publicSectorExposurePct - 6))
      },
      eventLog: [
        `Canje Intra-Estado: ANSES (FGS) y Banco Nacion absorbieron vencimientos de corto plazo del Tesoro.`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  if (action.type === 'SEND_ATN_TO_PROVINCE') {
    const provinces = state.provinces.map((prov) =>
      prov.id === action.provinceId
        ? {
            ...prov,
            governorLoyaltyToPresident: clamp(prov.governorLoyaltyToPresident + 16, 0, 100),
            fiscalBalancePct: round2(prov.fiscalBalancePct + 1.2),
            quasiCurrencyIssued: false
          }
        : prov
    );
    return {
      ...state,
      treasury: {
        ...state.treasury,
        discretionaryAtnPctGdp: round2(state.treasury.discretionaryAtnPctGdp + action.amountPctGdp)
      },
      provinces,
      trustLedger: adjustTrustLedger(state.trustLedger, { PROVINCIAS: 4 }),
      eventLog: [`Giro discrecional de ATN enviado a ${action.provinceId} a cambio de votos en el Congreso.`, ...state.eventLog.slice(0, 14)]
    };
  }
  if (action.type === 'INTERVENE_PROVINCE') {
    const provinces = state.provinces.map((prov) => {
      if (prov.id !== action.provinceId) return prov;
      return {
        ...prov,
        intervenida: true,
        interventorNombre: action.interventorName,
        eleccionEnMeses: 6,
        governorLoyaltyToPresident: 95,
        problematicas: ['expresion']
      };
    });
    return {
      ...state,
      provinces,
      trustLedger: adjustTrustLedger(state.trustLedger, { PROVINCIAS: -14, CONGRESO: -6 }),
      eventLog: [
        `Intervención Federal: el Congreso destituyó al gobernador de ${action.provinceId} y designó a ${action.interventorName}. Elecciones en 6 meses.`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  return null;
}

function applyJudicialOrTaxAction(state: SimulationState, action: PolicyAction): SimulationState {
  if (action.type === 'OPERATE_COMODORO_PY_CASE') {
    const activeCases = state.judicial.activeCases.map((c) => {
      if (c.id !== action.caseId) return c;
      return {
        ...c,
        stage: action.operation === 'FREEZE' ? ('FALTA_DE_MERITO' as const) : ('PROCESAMIENTO' as const)
      };
    });
    return {
      ...state,
      judicial: {
        ...state.judicial,
        judicialInterferenceTraceIndex: clamp(state.judicial.judicialInterferenceTraceIndex + 12, 0, 100),
        activeCases
      },
      trustLedger: adjustTrustLedger(state.trustLedger, { CONGRESO: -5, MERCADOS: -4 }),
      eventLog: [
        `Operadores judiciales intervinieron sobre el expediente ${action.caseId} en Comodoro Py (sube rastro de lawfare).`,
        ...state.eventLog.slice(0, 14)
      ]
    };
  }
  if (action.type === 'UPDATE_TAX_RATE') {
    const taxes = state.taxes.map((t) =>
      t.id === action.taxId ? { ...t, currentRatePct: round2(clamp(action.newRatePct, 0, 65)) } : t
    );
    return { ...state, taxes };
  }
  return state;
}

function computeBillApproval(prevApproval: number, delta: number | undefined): number {
  if (!delta) return prevApproval;
  return clamp(round2(prevApproval + delta), 5, 95);
}

interface NormalizedBillMeta {
  title: string;
  gdpGrowthDelta: number;
  countryRiskDelta: number;
  publicApprovalDelta: number;
  inflationDelta: number;
  primaryBalanceDelta: number;
}

function resolveNormalizedBillMeta(billId: string): NormalizedBillMeta {
  const bill = INITIAL_CONGRESS_BILLS.find((b) => b.id === billId);
  const defaults = { gdpGrowthDelta: 0, countryRiskDelta: 0, publicApprovalDelta: 0, inflationDelta: 0, primaryBalanceDelta: 0 };
  const c = Object.assign(defaults, bill?.consequences ?? {});
  return { title: bill ? bill.title : billId, ...c };
}

function resolveEnactMarketTrustDelta(countryRiskDelta: number, primaryBalanceDelta: number): number {
  return countryRiskDelta < 0 || primaryBalanceDelta > 0 ? 5 : 1;
}

function applyEnactBillAction(state: SimulationState, billId: string): SimulationState {
  const enacted = state.enactedBillIds ?? [];
  if (enacted.includes(billId)) return state;
  const meta = resolveNormalizedBillMeta(billId);
  const nextApproval = computeBillApproval(state.publicOpinion.managementApprovalPct, meta.publicApprovalDelta);
  const marketDelta = resolveEnactMarketTrustDelta(meta.countryRiskDelta, meta.primaryBalanceDelta);
  return {
    ...state,
    gdpGrowthAnnualPct: round2(state.gdpGrowthAnnualPct + meta.gdpGrowthDelta),
    countryRiskEmbiPb: Math.max(200, state.countryRiskEmbiPb + meta.countryRiskDelta),
    treasury: { ...state.treasury, primaryResultPctGdp: round2(state.treasury.primaryResultPctGdp + meta.primaryBalanceDelta) },
    inflation: { ...state.inflation, realMonthlyIpcPct: round2(clamp(state.inflation.realMonthlyIpcPct + meta.inflationDelta, 0.2, 45)) },
    publicOpinion: { ...state.publicOpinion, managementApprovalPct: nextApproval },
    enactedBillIds: [...enacted, billId],
    rejectedBillIds: (state.rejectedBillIds ?? []).filter((id) => id !== billId),
    trustLedger: adjustTrustLedger(state.trustLedger, { CONGRESO: 4, MERCADOS: marketDelta }),
    eventLog: [`Congreso Nacional: Se promulgó formalmente "${meta.title}" tras su sanción en el recinto.`, ...state.eventLog.slice(0, 14)]
  };
}

function applyRejectBillAction(state: SimulationState, billId: string): SimulationState {
  const rejected = state.rejectedBillIds ?? [];
  const bill = INITIAL_CONGRESS_BILLS.find((b) => b.id === billId);
  const title = bill ? bill.title : billId;
  return {
    ...state,
    rejectedBillIds: rejected.includes(billId) ? rejected : [...rejected, billId],
    publicOpinion: {
      ...state.publicOpinion,
      managementApprovalPct: clamp(round2(state.publicOpinion.managementApprovalPct - 0.8), 5, 95)
    },
    trustLedger: adjustTrustLedger(state.trustLedger, { CONGRESO: -6, MERCADOS: -4 }),
    eventLog: [`Congreso Nacional: Fracasó en el recinto el proyecto "${title}".`, ...state.eventLog.slice(0, 14)]
  };
}

function applyGovernorConcessionLoyalty(provinces: SimulationState['provinces']): SimulationState['provinces'] {
  return provinces.map((prov, idx) =>
    idx < 6 ? { ...prov, governorLoyaltyToPresident: clamp(prov.governorLoyaltyToPresident + 5, 0, 100) } : prov
  );
}

const CONCESSION_ATN_COST: Record<'ARGENTUMS' | 'GABINETE' | 'SUAVIZAR' | 'GOBERNADORES', number> = {
  GOBERNADORES: 0.06,
  ARGENTUMS: 0.04,
  GABINETE: 0,
  SUAVIZAR: 0
};

function updateCongressBlocRelations(
  blocs: SimulationState['congressBlocs'],
  blocId: string
): SimulationState['congressBlocs'] {
  return (blocs ?? []).map((b) => (b.id === blocId ? { ...b, relation: clamp(b.relation + 8, 0, 100) } : b));
}

function applyBlocConcessionAction(
  state: SimulationState,
  blocId: string,
  concession: 'ARGENTUMS' | 'GABINETE' | 'SUAVIZAR' | 'GOBERNADORES'
): SimulationState {
  const atnCost = CONCESSION_ATN_COST[concession];
  const approvalDelta = concession === 'GABINETE' ? -0.5 : 0;
  const provinces = concession === 'GOBERNADORES' ? applyGovernorConcessionLoyalty(state.provinces) : state.provinces;
  return {
    ...state,
    provinces,
    treasury: { ...state.treasury, discretionaryAtnPctGdp: round2(state.treasury.discretionaryAtnPctGdp + atnCost) },
    publicOpinion: { ...state.publicOpinion, managementApprovalPct: clamp(round2(state.publicOpinion.managementApprovalPct + approvalDelta), 5, 95) },
    congressBlocs: updateCongressBlocRelations(state.congressBlocs, blocId),
    trustLedger: adjustTrustLedger(state.trustLedger, {
      CONGRESO: 3,
      ...(concession === 'GOBERNADORES' ? { PROVINCIAS: 4 } : {})
    }),
    eventLog: [`Rosca Parlamentaria: Concesión "${concession}" otorgada al bloque ${blocId}.`, ...state.eventLog.slice(0, 14)]
  };
}

function applyCongressBillAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'ENACT_CONGRESS_BILL') return applyEnactBillAction(state, action.billId);
  if (action.type === 'REJECT_CONGRESS_BILL') return applyRejectBillAction(state, action.billId);
  if (action.type === 'GRANT_BLOC_CONCESSION') return applyBlocConcessionAction(state, action.blocId, action.concession);
  return null;
}

function computeReformDeltas(target: (typeof INITIAL_FIXED_REFORMS)[number]): { approvalShift: number; riskShift: number } {
  if (!target.active) return { approvalShift: -0.6, riskShift: 0 };
  const approvalShift = (target.publicSupportPct - target.polemicaPct) * 0.03;
  const riskShift = target.majorityType === 'CONSTITUCIONAL' ? -25 : 0;
  return { approvalShift, riskShift };
}

function formatReformLogLine(target: (typeof INITIAL_FIXED_REFORMS)[number], deactivatedMutualId?: string): string {
  const verb = target.active ? 'Promulgada reforma institucional' : 'Derogada reforma institucional';
  const suffix = deactivatedMutualId ? ` (reemplazó a ${deactivatedMutualId})` : '';
  return `${verb}: ${target.name}${suffix}.`;
}

function applyInstitutionalReformToggle(state: SimulationState, reformId: string): SimulationState {
  const activeSet = new Set(state.activeReformIds ?? []);
  const currentList = INITIAL_FIXED_REFORMS.map((r) => ({ ...r, active: activeSet.has(r.id) }));
  const { updatedReforms, deactivatedMutualId } = toggleFixedReformState(currentList, reformId);
  const target = updatedReforms.find((r) => r.id === reformId);
  if (!target) return state;

  const { approvalShift, riskShift } = computeReformDeltas(target);
  return {
    ...state,
    activeReformIds: updatedReforms.filter((r) => r.active).map((r) => r.id),
    countryRiskEmbiPb: Math.max(200, state.countryRiskEmbiPb + riskShift),
    publicOpinion: { ...state.publicOpinion, managementApprovalPct: clamp(round2(state.publicOpinion.managementApprovalPct + approvalShift), 5, 95) },
    eventLog: [formatReformLogLine(target, deactivatedMutualId), ...state.eventLog.slice(0, 14)]
  };
}

function applyCabinetAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  const ministers = state.ministers ?? [];
  if (action.type === 'REINFORCE_MINISTER') {
    return {
      ...state,
      ministers: ministers.map((m) =>
        m.id === action.ministerId
          ? { ...m, performance: Math.min(100, m.performance + 8), loyalty: Math.min(100, m.loyalty + 5) }
          : m
      )
    };
  }
  if (action.type === 'REPLACE_MINISTER') {
    return {
      ...state,
      ministers: ministers.map((m) =>
        m.id === action.ministerId
          ? { ...m, ministerName: `${m.ministerName} (Recambio)`, performance: 62, risk: 12 }
          : m
      )
    };
  }
  if (action.type === 'APPOINT_MINISTER') {
    return {
      ...state,
      ministers: ministers.map((m) => (m.id === action.ministerId ? action.minister : m))
    };
  }
  return null;
}

function isMeasureExcluded(candidate: SectorMeasureCard, target: SectorMeasureCard): boolean {
  return candidate.id === target.mutuallyExclusiveWith || candidate.mutuallyExclusiveWith === target.id;
}

function handleToggleMeasure(state: SimulationState, measureId: string): SimulationState {
  const measures = state.measures ?? [];
  const target = measures.find((m) => m.id === measureId);
  if (!target) return state;
  const activating = !target.active;
  const nextMeasures = measures.map((m) => {
    if (m.id === measureId) return { ...m, active: activating };
    if (activating && isMeasureExcluded(m, target)) return { ...m, active: false };
    return m;
  });
  return { ...state, measures: nextMeasures };
}

function handleToggleRigiSector(state: SimulationState, sectorId: string): SimulationState {
  const sectors = state.rigiSectors ?? [];
  return {
    ...state,
    rigiSectors: sectors.map((r) => (r.id === sectorId ? { ...r, enabledByDecree: !r.enabledByDecree } : r))
  };
}

function applyMeasureAndTaxAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'TOGGLE_MEASURE') return handleToggleMeasure(state, action.measureId);
  if (action.type === 'ADD_CUSTOM_TAX') {
    return { ...state, customTaxes: [action.proposal, ...(state.customTaxes ?? [])] };
  }
  if (action.type === 'TOGGLE_RIGI_SECTOR') return handleToggleRigiSector(state, action.sectorId);
  return null;
}

function handleApproveRigiProject(state: SimulationState, projectId: string): SimulationState {
  const res = approveRigiProject(projectId, state.rigiPending ?? [], state.rigiSectors ?? []);
  const log = res.approvedProject
    ? [`RIGI: Proyecto aprobado "${res.approvedProject.name}" (${res.approvedProject.minProjectMillionUsd} M USD).`, ...state.eventLog.slice(0, 14)]
    : state.eventLog;
  return { ...state, rigiPending: res.nextPending, rigiSectors: res.nextSectors, eventLog: log };
}

function handleRejectRigiProject(state: SimulationState, projectId: string): SimulationState {
  const pending = state.rigiPending ?? [];
  const proj = pending.find((p) => p.id === projectId);
  const log = proj ? [`RIGI: Proyecto "${proj.name}" rechazado.`, ...state.eventLog.slice(0, 14)] : state.eventLog;
  return { ...state, rigiPending: pending.filter((p) => p.id !== projectId), eventLog: log };
}

function handleApproveAllRigi(state: SimulationState): SimulationState {
  const res = approveAllRigiProjects(state.rigiPending ?? [], state.rigiSectors ?? []);
  return {
    ...state,
    rigiPending: res.nextPending,
    rigiSectors: res.nextSectors,
    eventLog: [`RIGI: Aprobados en bloque todos los proyectos pendientes (${res.count} proyectos).`, ...state.eventLog.slice(0, 14)]
  };
}

function applyRigiProjectAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type === 'APPROVE_RIGI_PROJECT') return handleApproveRigiProject(state, action.projectId);
  if (action.type === 'REJECT_RIGI_PROJECT') return handleRejectRigiProject(state, action.projectId);
  if (action.type === 'APPROVE_ALL_RIGI_PROJECTS') return handleApproveAllRigi(state);
  return null;
}

function applyPrimaryPasses(state: SimulationState, action: PolicyAction): SimulationState | null {
  const mon = applyMonetaryAction(state, action);
  if (mon) return mon;
  const eng = applyEnergyAndLaborAction(state, action);
  if (eng) return eng;
  return applyCongressBillAction(state, action);
}

function applySecondaryPasses(state: SimulationState, action: PolicyAction): SimulationState | null {
  const ref = applyStateReformOrIndecAction(state, action);
  if (ref) return ref;
  const fisc = applyFiscalOrFederalAction(state, action);
  if (fisc) return fisc;
  return applyCabinetAction(state, action);
}

export function applyPolicyAction(state: SimulationState, action: PolicyAction): SimulationState {
  const primary = applyPrimaryPasses(state, action);
  if (primary) return primary;
  const secondary = applySecondaryPasses(state, action);
  if (secondary) return secondary;
  const domainExtra = applyMeasureAndTaxAction(state, action) ?? applyRigiProjectAction(state, action);
  if (domainExtra) return domainExtra;
  return applyJudicialOrTaxAction(state, action);
}
