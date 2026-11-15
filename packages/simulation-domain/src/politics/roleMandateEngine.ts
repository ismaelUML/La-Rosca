import { clamp, round2 } from '../economy/mathUtils.js';
import { adjustTrustLedger } from '../engine/trustAndLagEngine.js';
import type {
  GovernorMandateState,
  LegislatorMandateState,
  ProvinceSummary,
  RoleActionId,
  SimulationState
} from '../models/SimulationTypes.js';

// Si el jugador eligio Gobernador, Diputado o Senador y de golpe lo sentabamos en el sillon
// de Rivadavia a manejar el BCRA como si fuera Presidente, era una estafa. Aca viven las cajas
// provinciales (IIBB, obras, policia, cuasimonedas) y la rosca de banca legislativa real.

export function getOrInitGovernorMandate(state: SimulationState): GovernorMandateState {
  if (state.governorMandate) {
    return state.governorMandate;
  }
  return {
    provinceId: state.selectedProvinceId || 'CORDOBA',
    provincialApprovalPct: 56,
    provincialTreasuryArsBillion: 420,
    iibbRatePct: 3.5,
    publicWorksExecutionPct: 48,
    securityAndPoliceIndex: 52,
    localLegislatureSupportPct: 54,
    nationalProjectionIndex: 38,
    activeTeacherOrPoliceConflict: false
  };
}

const CHAMBER_DEFAULTS: Record<
  'SENADO' | 'DIPUTADOS',
  Pick<LegislatorMandateState, 'chamber' | 'parliamentaryCloutIndex' | 'activeCommitteeName'>
> = {
  SENADO: {
    chamber: 'SENADO',
    parliamentaryCloutIndex: 50,
    activeCommitteeName: 'Acuerdos y Coparticipación Federal'
  },
  DIPUTADOS: {
    chamber: 'DIPUTADOS',
    parliamentaryCloutIndex: 42,
    activeCommitteeName: 'Presupuesto y Hacienda'
  }
};

export function getOrInitLegislatorMandate(state: SimulationState): LegislatorMandateState {
  if (state.legislatorMandate) {
    return state.legislatorMandate;
  }
  const chamberKey = state.role === 'SENADOR' ? 'SENADO' : 'DIPUTADOS';
  const preset = CHAMBER_DEFAULTS[chamberKey];
  return {
    ...preset,
    provinceId: state.selectedProvinceId || 'CABA',
    floorSpeechImpactIndex: 40,
    committeeControlCount: 1,
    authoredBillsSubmitted: 0,
    authoredBillsApproved: 0,
    territorialBackingPct: 55,
    blocDisciplineAlignmentPct: 72,
    pliegosOrInterpelacionesCount: 0
  };
}

function updateSelectedProvince(
  provinces: ProvinceSummary[],
  provinceId: string,
  updater: (prov: ProvinceSummary) => ProvinceSummary
): ProvinceSummary[] {
  return provinces.map((p) => (p.id === provinceId ? updater(p) : p));
}

function appendLog(state: SimulationState, message: string): string[] {
  return [message, ...state.eventLog.slice(0, 14)];
}

type GovernorActionHandler = (state: SimulationState, gov: GovernorMandateState) => SimulationState;

const GOVERNOR_ACTION_HANDLERS: Partial<Record<RoleActionId, GovernorActionHandler>> = {
  BAJAR_IIBB_PROVINCIAL: (state, gov) => {
    const nextRate = round2(clamp(gov.iibbRatePct - 0.5, 1.0, 6.5));
    const nextGov: GovernorMandateState = {
      ...gov,
      iibbRatePct: nextRate,
      provincialTreasuryArsBillion: round2(Math.max(40, gov.provincialTreasuryArsBillion - 38)),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 2.4, 5, 95)),
      nationalProjectionIndex: round2(clamp(gov.nationalProjectionIndex + 4, 0, 100))
    };
    return {
      ...state,
      gdpGrowthAnnualPct: round2(clamp(state.gdpGrowthAnnualPct + 0.18, -9.5, 8.5)),
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Bajaste Ingresos Brutos al ${nextRate}% para aliviar pymes y campo local.`
      )
    };
  },
  SUBIR_IIBB_PROVINCIAL: (state, gov) => {
    const nextRate = round2(clamp(gov.iibbRatePct + 0.5, 1.0, 6.5));
    const nextGov: GovernorMandateState = {
      ...gov,
      iibbRatePct: nextRate,
      provincialTreasuryArsBillion: round2(gov.provincialTreasuryArsBillion + 65),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct - 2.8, 5, 95))
    };
    return {
      ...state,
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Subiste Ingresos Brutos al ${nextRate}% para blindar la caja provincial (+65B ARS).`
      )
    };
  },
  LICITAR_OBRA_PROVINCIAL: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(Math.max(20, gov.provincialTreasuryArsBillion - 75)),
      publicWorksExecutionPct: round2(clamp(gov.publicWorksExecutionPct + 11, 0, 100)),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 3.2, 5, 95)),
      nationalProjectionIndex: round2(clamp(gov.nationalProjectionIndex + 3, 0, 100))
    };
    const provinces = updateSelectedProvince(state.provinces, gov.provinceId, (p) => ({
      ...p,
      fiscalBalancePct: round2(p.fiscalBalancePct - 0.3)
    }));
    return {
      ...state,
      provinces,
      gdpGrowthAnnualPct: round2(clamp(state.gdpGrowthAnnualPct + 0.15, -9.5, 8.5)),
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Licitaste rutas, hospitales y escuelas con fondos propios (+11% ejecución de obra).`
      )
    };
  },
  BLINDAR_SEGURIDAD_PROVINCIAL: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(Math.max(20, gov.provincialTreasuryArsBillion - 55)),
      securityAndPoliceIndex: round2(clamp(gov.securityAndPoliceIndex + 10, 0, 100)),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 2.5, 5, 95))
    };
    return {
      ...state,
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Desplegaste patrulleros, anillos digitales y comando policial en el distrito.`
      )
    };
  },
  EXIGIR_COPARTICIPACION_Y_ATN: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(gov.provincialTreasuryArsBillion + 110),
      nationalProjectionIndex: round2(clamp(gov.nationalProjectionIndex + 6, 0, 100)),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 1.8, 5, 95))
    };
    const provinces = updateSelectedProvince(state.provinces, gov.provinceId, (p) => ({
      ...p,
      governorLoyaltyToPresident: clamp(p.governorLoyaltyToPresident - 10, 0, 100),
      fiscalBalancePct: round2(p.fiscalBalancePct + 0.6)
    }));
    return {
      ...state,
      provinces,
      treasury: {
        ...state.treasury,
        discretionaryAtnPctGdp: round2(state.treasury.discretionaryAtnPctGdp + 0.06)
      },
      trustLedger: adjustTrustLedger(state.trustLedger, { PROVINCIAS: -4 }),
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Plantaste bandera ante Nación y destrabaste $110B en transferencias y ATN.`
      )
    };
  },
  PACTO_INTENDENTES_Y_LEGISLATURA: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(Math.max(20, gov.provincialTreasuryArsBillion - 45)),
      localLegislatureSupportPct: round2(clamp(gov.localLegislatureSupportPct + 9, 0, 100)),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 1.5, 5, 95))
    };
    return {
      ...state,
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Cerraste acuerdo de obras municipales con intendentes y blindaste la Legislatura local.`
      )
    };
  },
  EMITIR_CUASIMONEDA_PROVINCIAL: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(gov.provincialTreasuryArsBillion + 240),
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct - 3.5, 5, 95)),
      nationalProjectionIndex: round2(clamp(gov.nationalProjectionIndex + 4, 0, 100))
    };
    const provinces = updateSelectedProvince(state.provinces, gov.provinceId, (p) => ({
      ...p,
      quasiCurrencyIssued: true,
      governorLoyaltyToPresident: clamp(p.governorLoyaltyToPresident - 15, 0, 100)
    }));
    return {
      ...state,
      provinces,
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Emitiste Bonos de Cancelación de Deuda (cuasimoneda provincial) por $240B ARS.`
      )
    };
  },
  CERRAR_PARITARIA_DOCENTE_POLICIAL: (state, gov) => {
    const nextGov: GovernorMandateState = {
      ...gov,
      provincialTreasuryArsBillion: round2(Math.max(15, gov.provincialTreasuryArsBillion - 60)),
      activeTeacherOrPoliceConflict: false,
      provincialApprovalPct: round2(clamp(gov.provincialApprovalPct + 3.8, 5, 95))
    };
    return {
      ...state,
      governorMandate: nextGov,
      eventLog: appendLog(
        state,
        `Gobernación (${gov.provinceId}): Homologaste cláusula gatillo para docentes, médicos y policía provincial.`
      )
    };
  }
};

type LegislatorActionHandler = (state: SimulationState, leg: LegislatorMandateState) => SimulationState;

const LEGISLATOR_ACTION_HANDLERS: Partial<Record<RoleActionId, LegislatorActionHandler>> = {
  PRESENTAR_PROYECTO_PROPIO: (state, leg) => {
    const passesCommission = leg.parliamentaryCloutIndex >= 42;
    const nextLeg: LegislatorMandateState = {
      ...leg,
      authoredBillsSubmitted: leg.authoredBillsSubmitted + 1,
      authoredBillsApproved: leg.authoredBillsApproved + (passesCommission ? 1 : 0),
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 5, 0, 100)),
      territorialBackingPct: round2(clamp(leg.territorialBackingPct + 2.5, 5, 95))
    };
    return {
      ...state,
      legislatorMandate: nextLeg,
      trustLedger: adjustTrustLedger(state.trustLedger, { CONGRESO: 3 }),
      eventLog: appendLog(
        state,
        `Banca en ${leg.chamber}: Presentaste proyecto de ley propio (${passesCommission ? 'logró dictamen y media sanción' : 'en giro a comisiones'}).`
      )
    };
  },
  DISCURSO_ENCENDIDO_RECINTO: (state, leg) => {
    const nextLeg: LegislatorMandateState = {
      ...leg,
      floorSpeechImpactIndex: round2(clamp(leg.floorSpeechImpactIndex + 9, 0, 100)),
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 3, 0, 100)),
      territorialBackingPct: round2(clamp(leg.territorialBackingPct + 2.2, 5, 95))
    };
    return {
      ...state,
      legislatorMandate: nextLeg,
      publicOpinion: {
        ...state.publicOpinion,
        presidentialPersonalImagePct: round2(clamp(state.publicOpinion.presidentialPersonalImagePct + 1.5, 5, 95))
      },
      eventLog: appendLog(
        state,
        `Banca en ${leg.chamber}: Tu intervención en cuestión de privilegio marcó agenda en medios y redes (+9 impacto en recinto).`
      )
    };
  },
  ROSCA_EN_COMISION: (state, leg) => {
    const nextLeg: LegislatorMandateState = {
      ...leg,
      committeeControlCount: Math.min(6, leg.committeeControlCount + 1),
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 7, 0, 100)),
      blocDisciplineAlignmentPct: round2(clamp(leg.blocDisciplineAlignmentPct + 4, 0, 100))
    };
    const congressBlocs = (state.congressBlocs ?? []).map((b) => ({
      ...b,
      relation: clamp(b.relation + 4, 0, 100)
    }));
    return {
      ...state,
      congressBlocs,
      legislatorMandate: nextLeg,
      eventLog: appendLog(
        state,
        `Banca en ${leg.chamber}: Destrabaste firmas para el dictamen de mayoría en la comisión de ${leg.activeCommitteeName}.`
      )
    };
  },
  INTERPELAR_MINISTRO_O_PLIEGO: (state, leg) => {
    const isSenate = leg.chamber === 'SENADO';
    const nextLeg: LegislatorMandateState = {
      ...leg,
      pliegosOrInterpelacionesCount: leg.pliegosOrInterpelacionesCount + 1,
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 8, 0, 100)),
      floorSpeechImpactIndex: round2(clamp(leg.floorSpeechImpactIndex + 6, 0, 100))
    };
    const msg = isSenate
      ? `Senado (${leg.provinceId}): Dictaminaste pliegos de conjueces y embajadores en la Comisión de Acuerdos.`
      : `Diputados (${leg.provinceId}): Impulsaste pedido de informes e interpelación al Gabinete (Art. 71 CN).`;
    return {
      ...state,
      legislatorMandate: nextLeg,
      eventLog: appendLog(state, msg)
    };
  },
  DEFENDER_PARTIDAS_PROVINCIALES: (state, leg) => {
    const nextLeg: LegislatorMandateState = {
      ...leg,
      territorialBackingPct: round2(clamp(leg.territorialBackingPct + 5.5, 5, 95)),
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 4, 0, 100))
    };
    const provinces = updateSelectedProvince(state.provinces, leg.provinceId, (p) => ({
      ...p,
      fiscalBalancePct: round2(p.fiscalBalancePct + 0.5),
      governorLoyaltyToPresident: clamp(p.governorLoyaltyToPresident + 5, 0, 100)
    }));
    return {
      ...state,
      provinces,
      legislatorMandate: nextLeg,
      eventLog: appendLog(
        state,
        `Banca en ${leg.chamber}: Condicionaste tu voto en el recinto a incluir obras y partidas para ${leg.provinceId}.`
      )
    };
  },
  ROMPER_O_ALINEAR_BLOQUE: (state, leg) => {
    const rebelMove = leg.blocDisciplineAlignmentPct >= 65;
    const nextDiscipline = rebelMove
      ? clamp(leg.blocDisciplineAlignmentPct - 18, 15, 100)
      : clamp(leg.blocDisciplineAlignmentPct + 16, 15, 100);
    const nextLeg: LegislatorMandateState = {
      ...leg,
      blocDisciplineAlignmentPct: round2(nextDiscipline),
      parliamentaryCloutIndex: round2(clamp(leg.parliamentaryCloutIndex + 6, 0, 100)),
      floorSpeechImpactIndex: round2(clamp(leg.floorSpeechImpactIndex + 5, 0, 100))
    };
    const msg = rebelMove
      ? `Banca en ${leg.chamber}: Desafiaste la bajada de línea del jefe de bloque y armaste sub-bloque propio para negociar directo.`
      : `Banca en ${leg.chamber}: Cerraste filas con la conducción del interbloque a cambio de lugares clave en comisiones.`;
    return {
      ...state,
      legislatorMandate: nextLeg,
      eventLog: appendLog(state, msg)
    };
  }
};

export function executeRolePolicyAction(state: SimulationState, actionId: RoleActionId): SimulationState {
  const govHandler = GOVERNOR_ACTION_HANDLERS[actionId];
  if (govHandler) {
    return govHandler(state, getOrInitGovernorMandate(state));
  }
  const legHandler = LEGISLATOR_ACTION_HANDLERS[actionId];
  if (legHandler) {
    return legHandler(state, getOrInitLegislatorMandate(state));
  }
  return state;
}

function stepMonthlyGovernor(state: SimulationState): GovernorMandateState {
  const current = getOrInitGovernorMandate(state);
  const monthlyCollection = round2(current.iibbRatePct * 14 + state.treasury.coparticipableRevenuePctGdp * 4.5);
  const monthlyUpkeep = round2(36 + current.publicWorksExecutionPct * 0.45 + current.securityAndPoliceIndex * 0.25);
  const conflictTriggered = state.inflation.realMonthlyIpcPct > 5.2 && !current.activeTeacherOrPoliceConflict;
  const conflictPenalty = conflictTriggered ? -2.2 : 0;

  return {
    ...current,
    provincialTreasuryArsBillion: round2(
      clamp(current.provincialTreasuryArsBillion + monthlyCollection - monthlyUpkeep, 10, 2500)
    ),
    provincialApprovalPct: round2(
      clamp(current.provincialApprovalPct + conflictPenalty - (state.inflation.realMonthlyIpcPct - 3.2) * 0.35, 8, 92)
    ),
    activeTeacherOrPoliceConflict: current.activeTeacherOrPoliceConflict || conflictTriggered
  };
}

function stepMonthlyLegislator(state: SimulationState): LegislatorMandateState {
  const current = getOrInitLegislatorMandate(state);
  return {
    ...current,
    floorSpeechImpactIndex: round2(clamp(current.floorSpeechImpactIndex * 0.94 + 2, 10, 100)),
    territorialBackingPct: round2(
      clamp(current.territorialBackingPct - (state.inflation.realMonthlyIpcPct - 3.5) * 0.2, 10, 95)
    )
  };
}

export function stepRoleMandateMonthly(
  state: SimulationState
): Pick<SimulationState, 'governorMandate' | 'legislatorMandate'> {
  if (state.role === 'GOBERNADOR') {
    return { governorMandate: stepMonthlyGovernor(state), legislatorMandate: state.legislatorMandate };
  }
  if (state.role === 'DIPUTADO' || state.role === 'SENADOR') {
    return { governorMandate: state.governorMandate, legislatorMandate: stepMonthlyLegislator(state) };
  }
  return { governorMandate: state.governorMandate, legislatorMandate: state.legislatorMandate };
}
