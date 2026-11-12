import type { PolicyAction, SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

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

export function applyPolicyAction(state: SimulationState, action: PolicyAction): SimulationState {
  const firstPass = applyMonetaryAction(state, action) ?? applyEnergyAndLaborAction(state, action);
  if (firstPass) return firstPass;
  return (
    applyStateReformOrIndecAction(state, action) ??
    applyFiscalOrFederalAction(state, action) ??
    applyJudicialOrTaxAction(state, action)
  );
}
