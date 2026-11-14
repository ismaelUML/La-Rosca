import type {
  CharacterArchetypeId,
  CongressStartScenario,
  GameSetupConfiguration,
  PoliticalPartyPreset
} from '../models/PartyAndSetupTypes.js';
import type {
  CongressBlocAllocation,
  DifficultyLevel,
  SimulationState
} from '../models/SimulationTypes.js';
import { PARTY_IDEOLOGY_AXIS } from '../campaign/politicalAffinityEngine.js';
import { clamp, round2 } from '../economy/mathUtils.js';

// Single source of truth for setup modifiers: UI displays these numbers verbatim
// so the player never picks a "cosmetic" trait that secretly does nothing in the engine.

export interface CharacterArchetypeSpec {
  id: CharacterArchetypeId;
  label: string;
  tagline: string;
  credibilityDelta: number;
  countryRiskDelta: number;
  approvalDelta: number;
  governorLoyaltyDelta: number;
  laborConflictDelta: number;
  congressRelationDelta: number;
  tradeoffSummary: string;
}

export const CHARACTER_ARCHETYPE_CATALOG: CharacterArchetypeSpec[] = [
  {
    id: 'ECONOMISTA_ORTODOXO',
    label: 'Economista Ortodoxo',
    tagline: 'Credibilidad en Wall Street y ancla monetaria dura, pero rosca seca en la calle.',
    credibilityDelta: 10,
    countryRiskDelta: -110,
    approvalDelta: -3,
    governorLoyaltyDelta: -4,
    laborConflictDelta: 6,
    congressRelationDelta: -4,
    tradeoffSummary: '+10 Credibilidad, -110 pb Riesgo | -3% Aprobación, -4 Lealtad Prov.'
  },
  {
    id: 'CAUDILLO_TERRITORIAL',
    label: 'Caudillo Territorial',
    tagline: 'Domina gobernadores y punteros del interior; el mercado sospecha del gasto.',
    credibilityDelta: -7,
    countryRiskDelta: 90,
    approvalDelta: 2,
    governorLoyaltyDelta: 12,
    laborConflictDelta: -4,
    congressRelationDelta: 8,
    tradeoffSummary: '+12 Lealtad Prov., +8 Congreso | +90 pb Riesgo, -7 Credibilidad'
  },
  {
    id: 'OUTSIDER_MEDIATICO',
    label: 'Outsider Mediático',
    tagline: 'Llega con épica popular y rechazo a la casta, pero bloqueado en Cámaras.',
    credibilityDelta: 2,
    countryRiskDelta: 40,
    approvalDelta: 7,
    governorLoyaltyDelta: -8,
    laborConflictDelta: 8,
    congressRelationDelta: -12,
    tradeoffSummary: '+7% Aprobación inicial | -12 Relación Congreso, -8 Lealtad Prov.'
  },
  {
    id: 'GESTOR_TECNICO',
    label: 'Gestor Técnico',
    tagline: 'Perfil equilibrado de gestión estatal sin épica ni pánico financiero.',
    credibilityDelta: 4,
    countryRiskDelta: -40,
    approvalDelta: 1,
    governorLoyaltyDelta: 2,
    laborConflictDelta: -2,
    congressRelationDelta: 3,
    tradeoffSummary: '+4 Credibilidad, -40 pb Riesgo, +3 Congreso (Sin penalidades)'
  },
  {
    id: 'SINDICAL_POPULAR',
    label: 'Armador Sindical-Popular',
    tagline: 'Paz social garantizada con CGT y movimientos; el mercado pide garantías.',
    credibilityDelta: -9,
    countryRiskDelta: 140,
    approvalDelta: 4,
    governorLoyaltyDelta: 5,
    laborConflictDelta: -14,
    congressRelationDelta: 4,
    tradeoffSummary: '-14 Conflictividad Gremial, +4% Aprobación | +140 pb Riesgo'
  }
];

export interface CongressScenarioSpec {
  id: CongressStartScenario;
  label: string;
  description: string;
  officialDep: number;
  officialSen: number;
  relationShift: number;
  seatTag: string;
}

export const CONGRESS_SCENARIO_CATALOG: CongressScenarioSpec[] = [
  {
    id: 'ESTANDAR_2027',
    label: 'Congreso Fragmentado (2027)',
    description: 'Sin mayoría propia: necesitás negociar con PRO, UCR y bloques provinciales cada ley.',
    officialDep: 38,
    officialSen: 7,
    relationShift: 0,
    seatTag: '38 Dip · 7 Sen propios'
  },
  {
    id: 'MINORIA_EXTREMA',
    label: 'Minoría Extrema',
    description: 'Bloque chico y oposición abroquelada. Solo gobernás con DNU, ATN y vetos.',
    officialDep: 22,
    officialSen: 4,
    relationShift: -14,
    seatTag: '22 Dip · 4 Sen propios'
  },
  {
    id: 'COALICION_DIALOGUISTA',
    label: 'Frente Dialoguista Amplio',
    description: 'Acuerdo programático previo con aliados de centro y gobernadores moderados.',
    officialDep: 62,
    officialSen: 16,
    relationShift: 14,
    seatTag: '62 Dip · 16 Sen + aliados'
  },
  {
    id: 'MAYORIA_PROPIA',
    label: 'Hegemonía y Quórum Propio',
    description: 'Arrasaste en las urnas: tenés mayoría en Diputados y el Senado te responde.',
    officialDep: 132,
    officialSen: 38,
    relationShift: 10,
    seatTag: '132 Dip · 38 Sen (Quórum)'
  }
];

export interface DifficultyScenarioSpec {
  id: DifficultyLevel;
  label: string;
  reservesLabel: string;
  riskLabel: string;
  inflationLabel: string;
  climateLabel: string;
  note: string;
}

export const DIFFICULTY_CATALOG: DifficultyScenarioSpec[] = [
  {
    id: 'VIENTO_DE_COLA',
    label: 'Viento de Cola',
    reservesLabel: 'USD 55.0B',
    riskLabel: '380 pb',
    inflationLabel: '1.4% mens.',
    climateLabel: 'El Niño',
    note: 'Soja récord, dólar calmo y margen holgado para reformas graduales.'
  },
  {
    id: 'ESTANDAR_2027',
    label: 'Estándar 2027',
    reservesLabel: 'USD 50.0B',
    riskLabel: '620 pb',
    inflationLabel: '1.9% mens.',
    climateLabel: 'Neutro',
    note: 'Escenario base: macro ordenada pero con vencimientos y tensión social latente.'
  },
  {
    id: 'HERENCIA_MALDITA',
    label: 'Herencia Maldita',
    reservesLabel: 'USD 25.0B',
    riskLabel: '1180 pb',
    inflationLabel: '5.8% mens.',
    climateLabel: 'Neutro',
    note: 'Pocos dólares líquidos y precios reprimidos; cualquier error dispara la brecha.'
  },
  {
    id: 'TORMENTA_PERFECTA',
    label: 'Tormenta Perfecta',
    reservesLabel: 'USD 22.5B',
    riskLabel: '1450 pb',
    inflationLabel: '7.4% mens.',
    climateLabel: 'La Niña',
    note: 'Sequía en la Pampa Húmeda, fuga de divisas y conflictividad en ascenso.'
  },
  {
    id: 'DICIEMBRE_2001',
    label: 'Modo Diciembre 2001',
    reservesLabel: 'USD 19.5B',
    riskLabel: '2150 pb',
    inflationLabel: '12.5% mens.',
    climateLabel: 'La Niña',
    note: 'Borde de hiperinflación, corridas bancarias y gobernadores emitiendo cuasimonedas.'
  }
];

const BLOC_BASELINES: Array<{ id: string; dep: number; sen: number; rel: number }> = [
  { id: 'LLA', dep: 38, sen: 7, rel: 100 },
  { id: 'PRO', dep: 37, sen: 6, rel: 78 },
  { id: 'UCR', dep: 34, sen: 13, rel: 42 },
  { id: 'PF', dep: 16, sen: 6, rel: 55 },
  { id: 'PROVINCIALES', dep: 28, sen: 7, rel: 50 },
  { id: 'UXP', dep: 99, sen: 33, rel: 6 },
  { id: 'FIT', dep: 5, sen: 0, rel: 5 }
];

function normalizeToBlocId(sigla: string): string {
  const upper = sigla.trim().toUpperCase();
  if (upper === 'UXP') return 'UXP';
  if (BLOC_BASELINES.some((b) => b.id === upper)) return upper;
  return 'LLA';
}

export function deriveIdeologicalAllies(party: PoliticalPartyPreset): string[] {
  const partyEco = party.economicPosition;
  const partyCul = party.culturalPosition;
  const matches: Array<{ blocId: string; dist: number }> = [];

  for (const [sigla, axis] of Object.entries(PARTY_IDEOLOGY_AXIS)) {
    const blocId = normalizeToBlocId(sigla);
    if (blocId === normalizeToBlocId(party.sigla)) continue;
    const dist = Math.hypot(partyEco - axis.economic, (partyCul - axis.cultural) * 0.7);
    if (dist <= 34) {
      matches.push({ blocId, dist });
    }
  }

  return matches
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((m) => m.blocId);
}

function rebalanceChamberSeats(
  rows: CongressBlocAllocation[],
  field: 'deputiesSeats' | 'senateSeats',
  targetTotal: number,
  absorbBlocId: string
): CongressBlocAllocation[] {
  const sum = rows.reduce((acc, r) => acc + r[field], 0);
  const diff = targetTotal - sum;
  if (diff === 0) return rows;
  return rows.map((row) =>
    row.id === absorbBlocId ? { ...row, [field]: Math.max(0, row[field] + diff) } : row
  );
}

export function buildCongressBlocsForScenario(
  scenario: CongressStartScenario,
  partySigla: string,
  allies: string[],
  relationOffset: number = 0
): CongressBlocAllocation[] {
  const spec = CONGRESS_SCENARIO_CATALOG.find((c) => c.id === scenario) ?? CONGRESS_SCENARIO_CATALOG[0]!;
  const officialId = normalizeToBlocId(partySigla);
  const allySet = new Set(allies.map(normalizeToBlocId));

  const othersBaseDep = BLOC_BASELINES.filter((b) => b.id !== officialId).reduce((a, b) => a + b.dep, 0);
  const othersBaseSen = BLOC_BASELINES.filter((b) => b.id !== officialId).reduce((a, b) => a + b.sen, 0);
  const remDep = 257 - spec.officialDep;
  const remSen = 72 - spec.officialSen;

  const raw: CongressBlocAllocation[] = BLOC_BASELINES.map((b) => {
    if (b.id === officialId) {
      return { id: b.id, deputiesSeats: spec.officialDep, senateSeats: spec.officialSen, relation: 100 };
    }
    const isAlly = allySet.has(b.id);
    const allyWeight = isAlly && scenario === 'COALICION_DIALOGUISTA' ? 1.15 : 1;
    const dep = Math.max(0, Math.round((b.dep / othersBaseDep) * remDep * allyWeight));
    const sen = Math.max(0, Math.round((b.sen / othersBaseSen) * remSen * allyWeight));
    const rel = clamp(b.rel + spec.relationShift + relationOffset + (isAlly ? 16 : 0), 2, 96);
    return { id: b.id, deputiesSeats: dep, senateSeats: sen, relation: rel };
  });

  const absorbId = officialId === 'UXP' ? 'PRO' : 'UXP';
  const withDep = rebalanceChamberSeats(raw, 'deputiesSeats', 257, absorbId);
  return rebalanceChamberSeats(withDep, 'senateSeats', 72, absorbId);
}

function resolveArchetypeSpec(id?: CharacterArchetypeId): CharacterArchetypeSpec {
  return (
    CHARACTER_ARCHETYPE_CATALOG.find((a) => a.id === id) ??
    CHARACTER_ARCHETYPE_CATALOG.find((a) => a.id === 'GESTOR_TECNICO')!
  );
}

function resolveSetupAllies(baseState: SimulationState, setup: GameSetupConfiguration): string[] {
  const existing = baseState.coalitionParties;
  return existing && existing.length > 0 ? existing : deriveIdeologicalAllies(setup.party);
}

function resolveSetupBlocs(
  baseState: SimulationState,
  setup: GameSetupConfiguration,
  allies: string[],
  relationDelta: number
): CongressBlocAllocation[] {
  const current = baseState.congressBlocs;
  if (current && current.length > 0) {
    return current.map((b) => ({
      ...b,
      relation: clamp(b.relation + relationDelta, 2, 100)
    }));
  }
  const scenario = setup.congressScenario ?? 'ESTANDAR_2027';
  return buildCongressBlocsForScenario(scenario, setup.party.sigla, allies, relationDelta);
}

function resolveSetupLeaderLabel(setup: GameSetupConfiguration): string {
  const trimmed = setup.characterName.trim();
  return setup.characterMode === 'MI_PERSONAJE' && trimmed.length > 0 ? trimmed : setup.characterName;
}

export function applySetupConfigurationToState(
  baseState: SimulationState,
  setup: GameSetupConfiguration
): SimulationState {
  const archetype = resolveArchetypeSpec(setup.characterArchetype);
  const allies = resolveSetupAllies(baseState, setup);
  const nextBlocs = resolveSetupBlocs(baseState, setup, allies, archetype.congressRelationDelta);

  const nextProvinces = baseState.provinces.map((p) => ({
    ...p,
    governorLoyaltyToPresident: round2(
      clamp(
        p.governorLoyaltyToPresident + archetype.governorLoyaltyDelta + (p.id === setup.provinceId ? 8 : 0),
        10,
        98
      )
    )
  }));

  const nextParitarias = baseState.labor.paritarias.map((par) => ({
    ...par,
    strikeConflictIndex: round2(clamp(par.strikeConflictIndex + archetype.laborConflictDelta, 5, 95))
  }));

  const leaderLabel = resolveSetupLeaderLabel(setup);

  return {
    ...baseState,
    coalitionParties: allies,
    congressBlocs: nextBlocs,
    provinces: nextProvinces,
    countryRiskEmbiPb: Math.max(150, Math.round(baseState.countryRiskEmbiPb + archetype.countryRiskDelta)),
    publicOpinion: {
      ...baseState.publicOpinion,
      managementApprovalPct: round2(clamp(baseState.publicOpinion.managementApprovalPct + archetype.approvalDelta, 15, 85)),
      presidentialPersonalImagePct: round2(
        clamp(baseState.publicOpinion.presidentialPersonalImagePct + archetype.approvalDelta, 15, 85)
      )
    },
    labor: {
      ...baseState.labor,
      paritarias: nextParitarias
    },
    structural: {
      ...baseState.structural,
      anchorCredibilityIndex: round2(clamp(baseState.structural.anchorCredibilityIndex + archetype.credibilityDelta, 10, 95))
    },
    eventLog: [
      `Configuración de Mandato: ${leaderLabel} (${setup.party.sigla}) · Perfil ${archetype.label} · Base ${setup.provinceId}.`,
      ...baseState.eventLog.slice(0, 14)
    ]
  };
}
