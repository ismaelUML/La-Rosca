import type { SimulationState } from '../models/SimulationTypes.js';
import { GOVERNMENT_EVENTS_EXPANSION_105 } from './governmentEventsExpansionCatalog.js';

// Catálogo de "Situaciones de Gobierno": lo que le pasa a un presidente argentino mientras
// él cree que gobierna. Cada evento tiene un peso situacional (0 = no puede aparecer), así
// que el paro de la CGT aparece cuando las paritarias están calientes y la corrida
// cambiaria cuando la brecha se abre; no caen del cielo sin causa.
// Todas las funciones se mantienen con CC <= 5 (los pesos son tablas, no ramas).

export type GovernmentEventCategory = 'ECONOMIA' | 'SOCIAL' | 'INSTITUCIONAL' | 'ENERGIA' | 'EXTERNO';

export interface GovernmentEventEffects {
  approvalPts: number;
  expectationPts: number;
  countryRiskPb: number;
  grossReservesBillionUsd: number;
  anchorCredibility: number;
  brechaPct: number;
  unemploymentPct: number;
  blackoutRiskPct: number;
  strikeConflictPts: number;
  governorLoyaltyPts: number;
  judicialInterference: number;
}

export const ZERO_EFFECTS: GovernmentEventEffects = {
  approvalPts: 0,
  expectationPts: 0,
  countryRiskPb: 0,
  grossReservesBillionUsd: 0,
  anchorCredibility: 0,
  brechaPct: 0,
  unemploymentPct: 0,
  blackoutRiskPct: 0,
  strikeConflictPts: 0,
  governorLoyaltyPts: 0,
  judicialInterference: 0
};

export interface GovernmentEventOption {
  id: string;
  title: string;
  description: string;
  effects: Partial<GovernmentEventEffects>;
}

export interface GovernmentEventDefinition {
  id: string;
  title: string;
  description: string;
  category: GovernmentEventCategory;
  repeatable: boolean;
  weight: (state: SimulationState) => number;
  options: GovernmentEventOption[];
}

export function govAvgStrikeConflict(state: SimulationState): number {
  const list = state.labor.paritarias;
  return list.reduce((acc, p) => acc + p.strikeConflictIndex, 0) / Math.max(1, list.length);
}

export function govAvgGovernorLoyalty(state: SimulationState): number {
  const list = state.provinces;
  return list.reduce((acc, p) => acc + p.governorLoyaltyToPresident, 0) / Math.max(1, list.length);
}

function isSummer(state: SimulationState): boolean {
  return [12, 1, 2].includes(state.currentMonthOfYear);
}

function opt(
  id: string,
  title: string,
  description: string,
  effects: Partial<GovernmentEventEffects>
): GovernmentEventOption {
  return { id, title, description, effects };
}

const BASE_GOVERNMENT_EVENTS: GovernmentEventDefinition[] = [
  {
    id: 'PARO_GENERAL_CGT',
    title: 'Paro general de la CGT',
    description:
      'La central obrera convoca a un paro nacional de 24 horas: transporte parado, bancos cerrados y la Plaza llena. Quieren una respuesta antes del viernes.',
    category: 'SOCIAL',
    repeatable: true,
    weight: (s) => (govAvgStrikeConflict(s) > 50 || s.labor.realWageIndex < 92 ? 3 : 0),
    options: [
      opt('CONCILIACION', 'Dictar la conciliación obligatoria', 'Ganás tiempo, pero la calle lo vive como un portazo.', { strikeConflictPts: -12, approvalPts: -2, judicialInterference: 4 }),
      opt('PARITARIA_EXTRA', 'Abrir una paritaria extraordinaria', 'Descomprimís el conflicto a costa del ancla antiinflacionaria.', { strikeConflictPts: -20, anchorCredibility: -6, approvalPts: 3, countryRiskPb: 60 }),
      opt('AGUANTAR', 'Aguantar el paro sin ceder', 'El mercado aplaude la firmeza; los gremios se radicalizan.', { strikeConflictPts: 6, anchorCredibility: 4, approvalPts: -3, expectationPts: -2 })
    ]
  },
  {
    id: 'SEQUIA_PAMPEANA',
    title: 'Sequía en la zona núcleo',
    description:
      'Las lluvias no llegan y la cosecha gruesa se achica semana a semana. La Mesa de Enlace pide alivio y el BCRA mira el ingreso de dólares con preocupación.',
    category: 'ECONOMIA',
    repeatable: true,
    weight: (s) => (s.structural.climateRegime === 'LA_NINA' ? 3 : 1),
    options: [
      opt('ASISTENCIA', 'Asistir a los productores', 'Emergencia agropecuaria y créditos blandos.', { approvalPts: 2, countryRiskPb: 40, grossReservesBillionUsd: -0.8 }),
      opt('BAJAR_RETENCIONES', 'Bajar retenciones temporalmente', 'Incentivás la liquidación pero resignás recaudación.', { grossReservesBillionUsd: 0.6, anchorCredibility: -2, approvalPts: 1 }),
      opt('NO_INTERVENIR', 'No intervenir', 'Que el mercado ajuste solo.', { grossReservesBillionUsd: -1.5, unemploymentPct: 0.3, approvalPts: -2 })
    ]
  },
  {
    id: 'CORRIDA_CAMBIARIA',
    title: 'Corrida cambiaria',
    description:
      'El blue se dispara, los exportadores retienen liquidación y en la city circula el rumor de una devaluación inminente. El Ministro te llama a las 6 de la mañana.',
    category: 'ECONOMIA',
    repeatable: true,
    weight: (s) => (s.centralBank.exchangeBrechaPct > 15 || s.centralBank.grossReservesBillionUsd < 30 ? 4 : 0),
    options: [
      opt('VENDER_RESERVAS', 'Vender reservas para contener', 'Cae la brecha, se achica el colchón.', { grossReservesBillionUsd: -2.5, brechaPct: -8, anchorCredibility: 4 }),
      opt('SUBIR_TASA', 'Subir la tasa de política monetaria', 'Más caro el crédito, menos presión sobre el dólar.', { brechaPct: -5, unemploymentPct: 0.4, anchorCredibility: 3, approvalPts: -2 }),
      opt('DEJAR_CORRER', 'Dejar correr el dólar', 'Preservás reservas y le pasás la factura a los precios.', { brechaPct: 10, anchorCredibility: -8, countryRiskPb: 120 })
    ]
  },
  {
    id: 'AUDIOS_EN_LA_ROSADA',
    title: 'Audios filtrados en la Rosada',
    description:
      'Un canal de noticias emite audios de un alto funcionario hablando de retornos en contratos de obra pública. Tu nombre aparece en el tercer minuto.',
    category: 'INSTITUCIONAL',
    repeatable: true,
    weight: () => 1,
    options: [
      opt('ECHAR_YA', 'Echar al funcionario esa misma tarde', 'Cortás la hemorragia, perdés a un hombre de confianza.', { approvalPts: -1, judicialInterference: -2, governorLoyaltyPts: -2 }),
      opt('DEFENDER', 'Defenderlo y hablar de operación', 'Si la Justicia no avanza, zafás; si avanza, te lleva puesto.', { approvalPts: -4, judicialInterference: 6, expectationPts: -2 }),
      opt('COLABORAR', 'Pedir que investiguen y colaborar', 'Costo hoy, credibilidad mañana.', { approvalPts: -2, anchorCredibility: 2, expectationPts: 2 })
    ]
  },
  {
    id: 'BLACKOUT_DE_VERANO',
    title: 'Ola de calor y apagones',
    description:
      'Con 40 grados en el AMBA la demanda pica y el sistema se queda corto. Barrios enteros sin luz y los vecinos cortan avenidas.',
    category: 'ENERGIA',
    repeatable: true,
    weight: (s) => (isSummer(s) && s.energy.blackoutRiskPct > 22 ? 4 : 0),
    options: [
      opt('CORTES_INDUSTRIA', 'Cortar el suministro a la industria', 'Protegés los hogares; las fábricas pagan el costo.', { blackoutRiskPct: -10, unemploymentPct: 0.2, approvalPts: -1 }),
      opt('IMPORTAR', 'Importar GNL y electricidad de urgencia', 'Resolvés la crisis con dólares que no sobran.', { blackoutRiskPct: -12, grossReservesBillionUsd: -1.2, anchorCredibility: -2 }),
      opt('AHORRO', 'Apelar al ahorro voluntario', 'Barato, lento y poco creíble.', { blackoutRiskPct: -3, approvalPts: -3 })
    ]
  },
  {
    id: 'GOBERNADORES_RECLAMAN',
    title: 'Los gobernadores levantan la voz',
    description:
      'Un grupo de gobernadores te exige giros y obras bajo amenaza de votar en contra en el Congreso. "Sin fondos no hay votos", dice el comunicado conjunto.',
    category: 'INSTITUCIONAL',
    repeatable: true,
    weight: (s) => (govAvgGovernorLoyalty(s) < 58 ? 3 : 0),
    options: [
      opt('GIRAR_ATN', 'Girar ATN a los díscolos', 'Compras lealtad con la billetera del Estado.', { governorLoyaltyPts: 10, anchorCredibility: -3, countryRiskPb: 30 }),
      opt('OBRAS', 'Negociar un plan de obras', 'Más lento, más barato y más sostenible.', { governorLoyaltyPts: 5, approvalPts: 1 }),
      opt('PLANTARSE', 'Plantarte: no hay plata', 'El mercado lo festeja; las provincias, no.', { governorLoyaltyPts: -8, anchorCredibility: 3, approvalPts: 1 })
    ]
  },
  {
    id: 'CAUTELAR_CONTRA_DNU',
    title: 'Una cautelar frena tu DNU',
    description:
      'Un juzgado federal suspende uno de tus decretos de necesidad y urgencia. En el Gobierno hablan de "jueces militantes"; en la Corte, de "límites republicanos".',
    category: 'INSTITUCIONAL',
    repeatable: true,
    weight: (s) => (s.judicial.cautelaresBlockingDnuCount >= 1 ? 3 : 0),
    options: [
      opt('ACATAR', 'Acatar y apelar', 'Institucionalidad primero.', { judicialInterference: -3, expectationPts: 2, anchorCredibility: 1 }),
      opt('PRESIONAR', 'Presionar al juez y al Consejo de la Magistratura', 'Funciona, y deja marcas.', { judicialInterference: 8, approvalPts: -2, countryRiskPb: 50 }),
      opt('LEY', 'Convertirlo en proyecto de ley', 'Lo pasás por el Congreso con un costo de negociación.', { governorLoyaltyPts: -3, expectationPts: 1 })
    ]
  },
  {
    id: 'REVISION_FMI',
    title: 'Revisión del programa con el FMI',
    description:
      'Llega la misión técnica del Fondo. Quieren ver metas fiscales y acumulación de reservas antes de liberar el próximo desembolso.',
    category: 'EXTERNO',
    repeatable: true,
    weight: (s) => (s.countryRiskEmbiPb > 800 || s.centralBank.grossReservesBillionUsd < 28 ? 3 : 1),
    options: [
      opt('CUMPLIR', 'Cumplir las metas a rajatabla', 'Ajuste hoy para credibilidad mañana.', { anchorCredibility: 6, countryRiskPb: -90, approvalPts: -2, unemploymentPct: 0.3 }),
      opt('WAIVER', 'Pedir un waiver', 'Un perdón técnico a cambio de compromisos blandos.', { countryRiskPb: 40, anchorCredibility: -2 }),
      opt('PATEAR_MESA', 'Patear la mesa y renegociar', 'Épica política con riesgo de default técnico.', { countryRiskPb: 180, anchorCredibility: -6, approvalPts: 1 })
    ]
  },
  {
    id: 'FED_SUBE_TASAS',
    title: 'La Reserva Federal sube las tasas',
    description:
      'Los bonos de los emergentes se desploman y los capitales vuelven a Nueva York. Argentina es la primera de la lista de la que se sale.',
    category: 'EXTERNO',
    repeatable: true,
    weight: () => 1,
    options: [
      opt('RECORTAR_GASTO', 'Recortar gasto para mostrar solvencia', 'La señal al mercado es clara; la calle la sufre.', { countryRiskPb: -30, anchorCredibility: 3, approvalPts: -3, unemploymentPct: 0.2 }),
      opt('ESPERAR', 'Esperar que pase el temporal', 'Sin movimientos bruscos.', { countryRiskPb: 110, grossReservesBillionUsd: -0.8 }),
      opt('SWAP', 'Activar líneas de swap bilaterales', 'Un colchón de dólares con condicionamientos geopolíticos.', { grossReservesBillionUsd: 2.0, countryRiskPb: 20, judicialInterference: 1 })
    ]
  },
  {
    id: 'RENUNCIA_MINISTRO',
    title: 'Renuncia sonada en el gabinete',
    description:
      'Un ministro clave presenta su renuncia en una carta con indirectas. Los medios hablan de "interna feroz" y los mercados esperan una señal.',
    category: 'INSTITUCIONAL',
    repeatable: true,
    weight: (s) => (s.publicOpinion.managementApprovalPct < 45 ? 3 : 0),
    options: [
      opt('TECNOCRATA', 'Nombrar a un técnico de bajo perfil', 'Calma a los mercados, no entusiasma a nadie.', { anchorCredibility: 5, approvalPts: -1, governorLoyaltyPts: -2 }),
      opt('POLITICO', 'Nombrar a un político de peso', 'Ordena la interna y asusta al mercado.', { governorLoyaltyPts: 6, anchorCredibility: -3, approvalPts: 1 }),
      opt('INTERINATO', 'Dejar un interinato', 'Ahorrás un conflicto y cargás con la incertidumbre.', { expectationPts: -3 })
    ]
  },
  {
    id: 'MARCHA_FEDERAL',
    title: 'Marcha federal universitaria',
    description:
      'Cientos de miles de personas marchan en todo el país por el presupuesto universitario. La foto de Plaza de Mayo llena la tapa de todos los diarios.',
    category: 'SOCIAL',
    repeatable: true,
    weight: (s) => (s.publicOpinion.managementApprovalPct < 55 ? 2 : 0),
    options: [
      opt('RECOMPONER', 'Recomponer el presupuesto', 'Bajás el conflicto, resignás superávit.', { approvalPts: 3, anchorCredibility: -2, countryRiskPb: 25 }),
      opt('AUDITAR', 'Auditar las universidades antes de girar fondos', 'Un compromiso a medias que no conforma a nadie.', { approvalPts: -1, expectationPts: 1 }),
      opt('IGNORAR', 'Ignorar la marcha', 'Mantenés la línea fiscal; pagás en imagen.', { approvalPts: -4, anchorCredibility: 2 })
    ]
  },
  {
    id: 'INVERSION_RECORD',
    title: 'Anuncio de inversión récord',
    description:
      'Un consorcio internacional anuncia una inversión multimillonaria en litio y cobre. Pide seguridad jurídica y velocidad en los permisos.',
    category: 'ECONOMIA',
    repeatable: true,
    weight: (s) => (s.structural.anchorCredibilityIndex > 55 && s.countryRiskEmbiPb < 900 ? 3 : 0),
    options: [
      opt('ACELERAR', 'Acelerar los permisos', 'Llegan los dólares; las provincias mineras reclaman más participación.', { grossReservesBillionUsd: 2.0, anchorCredibility: 2, governorLoyaltyPts: -3 }),
      opt('EMPLEO_LOCAL', 'Condicionar a empleo y proveedores locales', 'Menos monto inicial, más arraigo.', { unemploymentPct: -0.4, grossReservesBillionUsd: 0.8, approvalPts: 2 })
    ]
  }
];

export const GOVERNMENT_EVENTS: GovernmentEventDefinition[] = [
  ...BASE_GOVERNMENT_EVENTS,
  ...GOVERNMENT_EVENTS_EXPANSION_105
];

interface EffectMeta {
  label: string;
  suffix: string;
  goodWhenPositive: boolean;
}

const EFFECT_META: Record<keyof GovernmentEventEffects, EffectMeta> = {
  approvalPts: { label: 'APROBACIÓN', suffix: ' pts', goodWhenPositive: true },
  expectationPts: { label: 'EXPECTATIVAS', suffix: ' pts', goodWhenPositive: true },
  countryRiskPb: { label: 'RIESGO PAÍS', suffix: ' pb', goodWhenPositive: false },
  grossReservesBillionUsd: { label: 'RESERVAS', suffix: ' MM USD', goodWhenPositive: true },
  anchorCredibility: { label: 'CREDIBILIDAD DEL ANCLA', suffix: ' pts', goodWhenPositive: true },
  brechaPct: { label: 'BRECHA CAMBIARIA', suffix: ' pp', goodWhenPositive: false },
  unemploymentPct: { label: 'DESEMPLEO', suffix: ' pp', goodWhenPositive: false },
  blackoutRiskPct: { label: 'RIESGO DE APAGÓN', suffix: ' pp', goodWhenPositive: false },
  strikeConflictPts: { label: 'CONFLICTO GREMIAL', suffix: ' pts', goodWhenPositive: false },
  governorLoyaltyPts: { label: 'LEALTAD DE GOBERNADORES', suffix: ' pts', goodWhenPositive: true },
  judicialInterference: { label: 'INJERENCIA JUDICIAL', suffix: ' pts', goodWhenPositive: false }
};

function formatSignedValue(value: number): string {
  const text = String(Math.round(value * 10) / 10).replace('.', ',');
  return value > 0 ? `+${text}` : text;
}

export function describeEventEffects(
  effects: Partial<GovernmentEventEffects>
): Array<{ label: string; isPositive: boolean }> {
  const keys = Object.keys(effects) as Array<keyof GovernmentEventEffects>;
  return keys
    .filter((key) => Boolean(effects[key]))
    .map((key) => {
      const value = effects[key] as number;
      const meta = EFFECT_META[key];
      return {
        label: `${meta.label} ${formatSignedValue(value)}${meta.suffix}`,
        isPositive: value > 0 === meta.goodWhenPositive
      };
    });
}

export function findGovernmentEvent(eventId: string | null): GovernmentEventDefinition | undefined {
  return GOVERNMENT_EVENTS.find((e) => e.id === eventId);
}
