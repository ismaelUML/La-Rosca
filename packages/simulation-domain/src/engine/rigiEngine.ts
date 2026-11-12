import type { RigisectorItem, RigiPendingProject } from '../models/PartyAndSetupTypes.js';

export interface RigiProjectTemplate {
  id: string;
  name: string;
  sectorId: string;
  sectorName: string;
  minProjectMillionUsd: number;
}

export const STRATEGIC_RIGI_PROJECTS_POOL: RigiProjectTemplate[] = [
  { id: 'PRJ_LITIO_HOM', name: 'Mina de Litio Salar del Hombre Muerto', sectorId: 'MIN_LITIO', sectorName: 'Minería: Litio', minProjectMillionUsd: 450 },
  { id: 'PRJ_COBRE_JOS', name: 'Yacimiento Cobre Josemaría', sectorId: 'MIN_COBRE', sectorName: 'Minería: Cobre', minProjectMillionUsd: 3200 },
  { id: 'PRJ_LITIO_CEN', name: 'Planta Litio Centenario-Ratones', sectorId: 'MIN_LITIO', sectorName: 'Minería: Litio', minProjectMillionUsd: 650 },
  { id: 'PRJ_VM_SUR', name: 'Oleoducto Vaca Muerta Sur', sectorId: 'ENG_FOSIL_VM', sectorName: 'Energía: Petróleo y Gas Vaca Muerta', minProjectMillionUsd: 2500 },
  { id: 'PRJ_GNL_BB', name: 'Planta Licuefacción GNL Bahía Blanca', sectorId: 'ENG_GNL_EXPORT', sectorName: 'Energía: GNL Exportación', minProjectMillionUsd: 2800 },
  { id: 'PRJ_GAS_PM', name: 'Gasoducto Perito Moreno Etapa II', sectorId: 'ENG_FOSIL_VM', sectorName: 'Energía: Petróleo y Gas Vaca Muerta', minProjectMillionUsd: 1400 },
  { id: 'PRJ_SOL_CAU', name: 'Parque Solar Cauchari II y III', sectorId: 'ENG_REN_SOLAR', sectorName: 'Energías Renovables: Solar', minProjectMillionUsd: 320 },
  { id: 'PRJ_EOL_PAT', name: 'Parque Eólico Vientos de la Patagonia', sectorId: 'ENG_REN_EOLICA', sectorName: 'Energías Renovables: Eólica', minProjectMillionUsd: 480 },
  { id: 'PRJ_HID_RN', name: 'Planta Piloto Hidrógeno Verde', sectorId: 'ENG_REN_HIDROGENO', sectorName: 'Energías Renovables: Hidrógeno Verde', minProjectMillionUsd: 1200 },
  { id: 'PRJ_HIDROVIA', name: 'Dragado y Balizamiento Hidrovía Paraná', sectorId: 'INFRA_PUERTOS', sectorName: 'Infraestructura: Puertos y Vías Navegables', minProjectMillionUsd: 850 },
  { id: 'PRJ_PTO_TIMB', name: 'Terminal Portuaria Agroexportadora Timbúes', sectorId: 'INFRA_PUERTOS', sectorName: 'Infraestructura: Puertos y Vías Navegables', minProjectMillionUsd: 380 },
  { id: 'PRJ_DATACENTER', name: 'Centro de Cómputos IA Vaca Muerta', sectorId: 'TECH_DATACENTER', sectorName: 'Tecnología: Data Centers e IA', minProjectMillionUsd: 500 },
  { id: 'PRJ_BIOETANOL', name: 'Planta Industrial Bioetanol Córdoba', sectorId: 'AGRO_BIOFUELS', sectorName: 'Agroindustria: Biocombustibles', minProjectMillionUsd: 220 },
  { id: 'PRJ_ACERO_VC', name: 'Laminadora de Acero Verde Villa Constitución', sectorId: 'IND_SIDERURGIA', sectorName: 'Industria: Siderurgia Pesada', minProjectMillionUsd: 410 },
  { id: 'PRJ_HOTEL_IGU', name: 'Resort Ecoturístico Parque Nacional Iguazú', sectorId: 'TURISMO_ALTA_GAMA', sectorName: 'Turismo: Hotelería de Alta Gama', minProjectMillionUsd: 210 }
];

function isSectorMatching(templateSectorId: string, sectorId: string): boolean {
  return templateSectorId === sectorId || sectorId.includes(templateSectorId.slice(0, 4));
}

function findSpawneableProject(
  enabledSectors: RigisectorItem[],
  existingIds: Set<string>
): RigiProjectTemplate | undefined {
  for (const s of enabledSectors) {
    if (!s.enabledByDecree) continue;
    const match = STRATEGIC_RIGI_PROJECTS_POOL.find(
      (p) => !existingIds.has(p.id) && isSectorMatching(p.sectorId, s.id)
    );
    if (match) return match;
  }
  return undefined;
}

export function advanceRigiMonthlyQueue(
  pending: RigiPendingProject[],
  enabledSectors: RigisectorItem[]
): { nextPending: RigiPendingProject[]; desistedProjects: string[] } {
  const desistedProjects: string[] = [];
  const kept: RigiPendingProject[] = [];

  for (const p of pending) {
    const nextWait = p.monthsWaiting + 1;
    if (nextWait >= p.expiresInMonths) {
      desistedProjects.push(p.name);
    } else {
      kept.push({ ...p, monthsWaiting: nextWait });
    }
  }

  const existingIds = new Set(kept.map((p) => p.id));
  const newCandidate = findSpawneableProject(enabledSectors, existingIds);

  if (newCandidate) {
    kept.push({
      id: newCandidate.id,
      name: newCandidate.name,
      sectorId: newCandidate.sectorId,
      sectorName: newCandidate.sectorName,
      minProjectMillionUsd: newCandidate.minProjectMillionUsd,
      monthsWaiting: 0,
      expiresInMonths: 4
    });
  }

  return { nextPending: kept, desistedProjects };
}

export function approveRigiProject(
  projectId: string,
  pending: RigiPendingProject[],
  sectors: RigisectorItem[]
): { nextPending: RigiPendingProject[]; nextSectors: RigisectorItem[]; approvedProject?: RigiPendingProject } {
  const target = pending.find((p) => p.id === projectId);
  const nextPending = pending.filter((p) => p.id !== projectId);
  if (!target) {
    return { nextPending, nextSectors: sectors };
  }

  const nextSectors = sectors.map((sec) => {
    if (!isSectorMatching(target.sectorId, sec.id)) return sec;
    return {
      ...sec,
      activeProjectsCount: (sec.activeProjectsCount ?? 0) + 1,
      accumulatedInvestmentMillionUsd: (sec.accumulatedInvestmentMillionUsd ?? 0) + target.minProjectMillionUsd,
      maturityPct: Math.min(100, (sec.maturityPct ?? 0) + 12)
    };
  });

  return { nextPending, nextSectors, approvedProject: target };
}

export function approveAllRigiProjects(
  pending: RigiPendingProject[],
  sectors: RigisectorItem[]
): { nextPending: RigiPendingProject[]; nextSectors: RigisectorItem[]; count: number } {
  let currentSectors = [...sectors];
  for (const p of pending) {
    const res = approveRigiProject(p.id, [p], currentSectors);
    currentSectors = res.nextSectors;
  }
  return { nextPending: [], nextSectors: currentSectors, count: pending.length };
}
