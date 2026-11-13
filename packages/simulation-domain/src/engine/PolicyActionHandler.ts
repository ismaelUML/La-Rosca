import type { PolicyAction, SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';
import { INITIAL_CONGRESS_BILLS } from '../politics/congressEngine.js';
import { approveAllRigiProjects, approveRigiProject } from './rigiEngine.js';

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
    const factor = 1 + clamp(action.devaluationPct, 5, 120) / 100;
    const officialDollarArs = round2(state.centralBank.officialDollarArs * factor);
    // Devaluar de golpe te rompe la credibilidad del ancla en el acto (-28 puntos, ley de histeresis)
    const anchorCredibilityIndex = clamp(state.structural.anchorCredibilityIndex - 28, 5, 100);
    return {
      ...state,
      centralBank: {
        ...state.centralBank,
        officialDollarArs,
        exchangeBrechaPct: round2(Math.max(2, state.centralBank.exchangeBrechaPct - action.devaluationPct * 0.65))
      },
      structural: { ...state.structural, anchorCredibilityIndex, expectedDevaluation3mPct: 12 },
      eventLog: [
        `Shock cambiario: el Dolar Oficial salto a $${officialDollarArs}. Cae la brecha pero se dispara el pass-through a alimentos y el costo de CAMMESA.`,
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

function applyStateReformOrIndecAction(state: SimulationState, action: PolicyAction): SimulationState | null {
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
    const indecCredibilityIndex = action.intervene ? 32 : 86;
    const msg = action.intervene
      ? `Intervencion del INDEC: nace la doble contabilidad con el IPC Congreso y se desploman los bonos CER.`
      : `Normalizacion tecnica del INDEC: se auditan las series estadisticas.`;
    return {
      ...state,
      structural: { ...state.structural, indecCredibilityIndex },
      eventLog: [msg, ...state.eventLog.slice(0, 14)]
    };
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

function applyCongressBillAction(state: SimulationState, action: PolicyAction): SimulationState | null {
  if (action.type !== 'ENACT_CONGRESS_BILL') return null;
  const bill = INITIAL_CONGRESS_BILLS.find((b) => b.id === action.billId);
  const title = bill ? bill.title : action.billId;
  const c = bill?.consequences;

  const nextGdp = round2(state.gdpGrowthAnnualPct + (c?.gdpGrowthDelta ?? 0));
  const nextRisk = Math.max(200, state.countryRiskEmbiPb + (c?.countryRiskDelta ?? 0));
  const nextApproval = computeBillApproval(state.publicOpinion.managementApprovalPct, c?.publicApprovalDelta);

  return {
    ...state,
    gdpGrowthAnnualPct: nextGdp,
    countryRiskEmbiPb: nextRisk,
    publicOpinion: { ...state.publicOpinion, managementApprovalPct: nextApproval },
    eventLog: [
      `Congreso Nacional: Se promulgó formalmente "${title}" tras su sanción en el recinto.`,
      ...state.eventLog.slice(0, 14)
    ]
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

function handleToggleMeasure(state: SimulationState, measureId: string): SimulationState {
  const measures = state.measures ?? [];
  return {
    ...state,
    measures: measures.map((m) => (m.id === measureId ? { ...m, active: !m.active } : m))
  };
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
