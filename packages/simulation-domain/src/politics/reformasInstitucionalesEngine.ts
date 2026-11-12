// Motor de Reformas Institucionales y Electorales fijas (ea(...) en QQG):
// Catálogo cerrado de reformas del sistema político, electoral, judicial y constitucional,
// con reglas de mayoría (Ordinaria: 129/37 vs Constitucional: dos tercios 172/48) y exclusión mutua.

export type ReformCategory =
  | 'CALENDARIO_ELECTORAL'
  | 'REELECCION_MANDATOS'
  | 'SISTEMA_ELECCION'
  | 'PADRON_SUFRAGIO'
  | 'INSTRUMENTOS_CAMPANA'
  | 'CONGRESO_REPRESENTACION'
  | 'JUSTICIA';

export type ReformMajorityType = 'ORDINARIA' | 'CONSTITUCIONAL';

export interface FixedReformItem {
  id: string;
  name: string;
  category: ReformCategory;
  majorityType: ReformMajorityType;
  description: string;
  active: boolean;
  mutuallyExclusiveWith?: string;
  publicSupportPct: number;
  polemicaPct: number;
}

export const INITIAL_FIXED_REFORMS: FixedReformItem[] = [
  // 1. Calendario electoral
  {
    id: 'con_paso',
    name: 'Establecer las PASO',
    category: 'CALENDARIO_ELECTORAL',
    majorityType: 'ORDINARIA',
    description: 'Elecciones primarias abiertas, simultáneas y obligatorias para dirimir candidaturas.',
    active: true,
    mutuallyExclusiveWith: 'sin_paso',
    publicSupportPct: 52,
    polemicaPct: 40
  },
  {
    id: 'sin_paso',
    name: 'Eliminar las PASO',
    category: 'CALENDARIO_ELECTORAL',
    majorityType: 'ORDINARIA',
    description: 'Supresión definitiva de las primarias: cada partido resuelve sus internas con sus propios afiliados.',
    active: false,
    mutuallyExclusiveWith: 'con_paso',
    publicSupportPct: 62,
    polemicaPct: 45
  },
  {
    id: 'sin_medio_termino',
    name: 'Eliminar elecciones de medio término',
    category: 'CALENDARIO_ELECTORAL',
    majorityType: 'CONSTITUCIONAL',
    description: 'Renovación parlamentaria total cada 4 años, suprimiendo las elecciones legislativas intermedias.',
    active: false,
    publicSupportPct: 58,
    polemicaPct: 65
  },
  {
    id: 'unificacion',
    name: 'Unificación electoral simultánea',
    category: 'CALENDARIO_ELECTORAL',
    majorityType: 'ORDINARIA',
    description: 'Prohíbe a los gobernadores desdoblar elecciones: provincias y Nación votan el mismo día.',
    active: false,
    publicSupportPct: 68,
    polemicaPct: 70
  },

  // 2. Reelección / mandatos
  {
    id: 'sin_reeleccion',
    name: 'Prohibir la reelección inmediata',
    category: 'REELECCION_MANDATOS',
    majorityType: 'CONSTITUCIONAL',
    description: 'Mandato único de 4 años sin posibilidad de reelección consecutiva (sistema pre-1994).',
    active: false,
    mutuallyExclusiveWith: 'reel_indef',
    publicSupportPct: 55,
    polemicaPct: 50
  },
  {
    id: 'mandato_seis',
    name: 'Mandato único de seis años',
    category: 'REELECCION_MANDATOS',
    majorityType: 'CONSTITUCIONAL',
    description: 'Período presidencial de 6 años continuos sin reelección inmediata.',
    active: false,
    mutuallyExclusiveWith: 'reel_indef',
    publicSupportPct: 48,
    polemicaPct: 60
  },
  {
    id: 'reel_indef',
    name: 'Reelección presidencial indefinida',
    category: 'REELECCION_MANDATOS',
    majorityType: 'CONSTITUCIONAL',
    description: 'Habilita mandatos presidenciales sucesivos ilimitados mediante reforma de la Constitución.',
    active: false,
    mutuallyExclusiveWith: 'sin_reeleccion',
    publicSupportPct: 28,
    polemicaPct: 92
  },

  // 3. Sistema de elección
  {
    id: 'sin_balotaje',
    name: 'Eliminar segunda vuelta electoral',
    category: 'SISTEMA_ELECCION',
    majorityType: 'CONSTITUCIONAL',
    description: 'Gana la presidencia en primera vuelta quien obtenga la mayoría simple de votos sin umbrales.',
    active: false,
    mutuallyExclusiveWith: 'balotaje_50',
    publicSupportPct: 35,
    polemicaPct: 80
  },
  {
    id: 'balotaje_50',
    name: 'Balotaje estricto con mayoría absoluta (50%)',
    category: 'SISTEMA_ELECCION',
    majorityType: 'CONSTITUCIONAL',
    description: 'Segunda vuelta obligatoria si la fórmula más votada no supera el 50% de los votos válidos.',
    active: false,
    mutuallyExclusiveWith: 'sin_balotaje',
    publicSupportPct: 64,
    polemicaPct: 45
  },

  // 4. Padrón / sufragio
  {
    id: 'voto_voluntario',
    name: 'Voto voluntario no obligatorio',
    category: 'PADRON_SUFRAGIO',
    majorityType: 'CONSTITUCIONAL',
    description: 'Elimina las multas e inhabilitaciones por abstención: el voto deja de ser obligatorio.',
    active: false,
    publicSupportPct: 44,
    polemicaPct: 65
  },
  {
    id: 'voto_16',
    name: 'Voto optativo joven desde los 16 años',
    category: 'PADRON_SUFRAGIO',
    majorityType: 'ORDINARIA',
    description: 'Habilita el empadronamiento y sufragio de jóvenes de 16 y 17 años de edad.',
    active: true,
    publicSupportPct: 50,
    polemicaPct: 40
  },
  {
    id: 'voto_extranjeros',
    name: 'Voto de extranjeros residentes',
    category: 'PADRON_SUFRAGIO',
    majorityType: 'ORDINARIA',
    description: 'Habilita el voto de extranjeros con residencia definitiva comprobada de 2 años en el país.',
    active: false,
    publicSupportPct: 38,
    polemicaPct: 75
  },

  // 5. Instrumentos de votación y campaña
  {
    id: 'boleta_unica',
    name: 'Boleta única de papel (BUP)',
    category: 'INSTRUMENTOS_CAMPANA',
    majorityType: 'ORDINARIA',
    description: 'Termina con la boleta partidaria tradicional, robos de boletas y costos millonarios de impresión.',
    active: true,
    mutuallyExclusiveWith: 'boleta_electronica',
    publicSupportPct: 78,
    polemicaPct: 25
  },
  {
    id: 'boleta_electronica',
    name: 'Boleta única electrónica (BUE)',
    category: 'INSTRUMENTOS_CAMPANA',
    majorityType: 'ORDINARIA',
    description: 'Votación mediante pantalla táctil y comprobante impreso con chip electrónico verificable.',
    active: false,
    mutuallyExclusiveWith: 'boleta_unica',
    publicSupportPct: 46,
    polemicaPct: 60
  },
  {
    id: 'debates_obligatorios',
    name: 'Debates presidenciales obligatorios con sanciones',
    category: 'INSTRUMENTOS_CAMPANA',
    majorityType: 'ORDINARIA',
    description: 'Pérdida de minutos de publicidad televisiva para el candidato presidencial que falte al debate oficial.',
    active: true,
    publicSupportPct: 82,
    polemicaPct: 15
  },
  {
    id: 'paridad_genero',
    name: 'Paridad de género 50/50 en listas legislativas',
    category: 'INSTRUMENTOS_CAMPANA',
    majorityType: 'ORDINARIA',
    description: 'Alternancia obligatoria secuencial uno a uno de varones y mujeres en boletas para el Congreso.',
    active: true,
    publicSupportPct: 66,
    polemicaPct: 30
  },

  // 6. Congreso / representación
  {
    id: 'reduccion_legisladores',
    name: 'Reducción de bancas legislativas',
    category: 'CONGRESO_REPRESENTACION',
    majorityType: 'CONSTITUCIONAL',
    description: 'Reduce a la mitad la cantidad de diputados (de 257 a 130) y fija 2 senadores por provincia.',
    active: false,
    publicSupportPct: 79,
    polemicaPct: 70
  },
  {
    id: 'senado_proporcional',
    name: 'Senado proporcional a la población',
    category: 'CONGRESO_REPRESENTACION',
    majorityType: 'CONSTITUCIONAL',
    description: 'Elimina la igualdad de 3 senadores por provincia, repartiendo las 72 bancas por población.',
    active: false,
    publicSupportPct: 42,
    polemicaPct: 88
  },

  // 7. Justicia
  {
    id: 'corte_ampliada',
    name: 'Ampliación de los miembros de la Corte Suprema',
    category: 'JUSTICIA',
    majorityType: 'ORDINARIA',
    description: 'Aumenta de 5 a 9 los jueces de la Corte Suprema de Justicia de la Nación.',
    active: false,
    publicSupportPct: 32,
    polemicaPct: 75
  },
  {
    id: 'consejo_magistratura',
    name: 'Reforma del Consejo de la Magistratura',
    category: 'JUSTICIA',
    majorityType: 'ORDINARIA',
    description: 'Modifica el equilibrio estamental entre jueces, abogados, académicos y representantes políticos.',
    active: false,
    publicSupportPct: 54,
    polemicaPct: 55
  },
  {
    id: 'jueces_voto',
    name: 'Elección de jueces por voto popular',
    category: 'JUSTICIA',
    majorityType: 'CONSTITUCIONAL',
    description: 'Jueces y fiscales federales elegidos directamente en comicios por el sufragio popular ciudadano.',
    active: false,
    publicSupportPct: 41,
    polemicaPct: 85
  }
];

function checkShouldDeactivateMutual(
  candidate: FixedReformItem,
  mutualTargetId?: string,
  isTargetActiveNow?: boolean
): boolean {
  if (!isTargetActiveNow) return false;
  if (!mutualTargetId) return false;
  return candidate.id === mutualTargetId && candidate.active;
}

export function toggleFixedReformState(
  reforms: FixedReformItem[],
  reformId: string
): { updatedReforms: FixedReformItem[]; deactivatedMutualId?: string } {
  const target = reforms.find((r) => r.id === reformId);
  if (!target) return { updatedReforms: reforms };

  const willBeActive = !target.active;
  let deactivatedId: string | undefined;

  const nextList = reforms.map((r) => {
    if (r.id === reformId) {
      return { ...r, active: willBeActive };
    }
    if (checkShouldDeactivateMutual(r, target.mutuallyExclusiveWith, willBeActive)) {
      deactivatedId = r.id;
      return { ...r, active: false };
    }
    return r;
  });

  return { updatedReforms: nextList, deactivatedMutualId: deactivatedId };
}
