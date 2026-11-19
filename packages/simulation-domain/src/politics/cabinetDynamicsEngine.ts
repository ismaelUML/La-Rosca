import type { CabinetMinister } from '../models/PartyAndSetupTypes.js';
import type { CongressBlocAllocation, SimulationState } from '../models/SimulationTypes.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// El Gabinete deja de ser un buff pasivo: bajo estrés macro sube el riesgo interno,
// los ministros filtran a la prensa o renuncian, y rajar una cuota aliada te cuesta votos en Diputados.

function isAppointedMinister(m: CabinetMinister): boolean {
  const lower = m.ministerName.toLowerCase();
  return !lower.includes('vacante') && !lower.includes('designar');
}

function computeMonthlyStress(state: SimulationState): number {
  let stress = 0;
  if (state.inflation.realMonthlyIpcPct >= 4.0) stress += 3;
  if (state.publicOpinion.managementApprovalPct < 42) stress += 3;
  if (state.activeCrisisArc) stress += 2;
  return stress;
}

function driftSingleMinister(m: CabinetMinister, stress: number): CabinetMinister {
  if (!isAppointedMinister(m)) return m;
  const riskDelta = stress > 0 ? stress : -1;
  const loyaltyDelta = stress >= 5 ? -3 : 1;
  return {
    ...m,
    risk: clamp(m.risk + riskDelta, 5, 99),
    loyalty: clamp(m.loyalty + loyaltyDelta, 5, 100)
  };
}

export interface CabinetStepOutcome {
  nextMinisters: CabinetMinister[];
  approvalDelta: number;
  riskDeltaPb: number;
  logs: string[];
}

function triggerMinisterIncident(m: CabinetMinister): {
  updated: CabinetMinister;
  approvalDelta: number;
  riskDeltaPb: number;
  log: string;
} {
  if (m.loyalty <= 22 || m.risk >= 90) {
    return {
      updated: {
        ...m,
        ministerName: 'Vacante (Renuncia)',
        isCoalitionQuota: false,
        performance: 30,
        risk: 10,
        loyalty: 50
      },
      approvalDelta: -1.8,
      riskDeltaPb: 45,
      log: `Renuncia en Gabinete: ${m.ministerName} dejó ${m.ministryName} en medio de la tensión (-1,8 % imagen).`
    };
  }
  return {
    updated: { ...m, risk: clamp(m.risk - 14, 15, 95) },
    approvalDelta: -1.2,
    riskDeltaPb: 25,
    log: `Filtración desde ${m.ministryName}: el entorno de ${m.ministerName} expuso internas en TV (-1,2 % imagen).`
  };
}

function findCrisisCandidateIndex(ministers: CabinetMinister[]): number {
  return ministers.findIndex(
    (m) => isAppointedMinister(m) && (m.risk >= 82 || m.loyalty <= 22)
  );
}

export function stepCabinetDynamics(state: SimulationState): CabinetStepOutcome {
  const base = state.ministers;
  if (!base || base.length === 0) {
    return { nextMinisters: [], approvalDelta: 0, riskDeltaPb: 0, logs: [] };
  }
  const stress = computeMonthlyStress(state);
  const drifted = base.map((m) => driftSingleMinister(m, stress));
  const hitIdx = findCrisisCandidateIndex(drifted);
  if (hitIdx < 0) {
    return { nextMinisters: drifted, approvalDelta: 0, riskDeltaPb: 0, logs: [] };
  }

  const incident = triggerMinisterIncident(drifted[hitIdx]!);
  const nextMinisters = drifted.map((m, idx) => (idx === hitIdx ? incident.updated : m));
  return {
    nextMinisters,
    approvalDelta: round2(incident.approvalDelta),
    riskDeltaPb: incident.riskDeltaPb,
    logs: [incident.log]
  };
}

function isCoalitionQuotaDisplaced(
  removed: CabinetMinister | undefined,
  replacementPartySigla?: string
): removed is CabinetMinister {
  if (!removed || !removed.isCoalitionQuota || !isAppointedMinister(removed)) return false;
  const sameParty =
    replacementPartySigla !== undefined &&
    replacementPartySigla.toUpperCase() === removed.partySigla.toUpperCase();
  return !sameParty;
}

export function applyCoalitionMinisterOustPenalty(
  blocs: CongressBlocAllocation[] | undefined,
  removed: CabinetMinister | undefined,
  replacementPartySigla?: string
): { nextBlocs: CongressBlocAllocation[] | undefined; log: string | null } {
  if (!blocs || !isCoalitionQuotaDisplaced(removed, replacementPartySigla)) {
    return { nextBlocs: blocs, log: null };
  }
  const removedSigla = removed.partySigla.toUpperCase();
  const hit = blocs.find((b) => b.id === removedSigla && b.relation < 99);
  if (!hit) return { nextBlocs: blocs, log: null };

  const nextBlocs = blocs.map((b) =>
    b.id === removedSigla ? { ...b, relation: clamp(b.relation - 12, 0, 100) } : b
  );
  return {
    nextBlocs,
    log: `Quiebre de cuota aliada: desplazar a ${removed.ministerName} (${removedSigla}) restó -12 de relación en el Congreso.`
  };
}
