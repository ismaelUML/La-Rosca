import type {
  CampaignActionCard,
  CampaignExecutePayload,
  CampaignSimulationState,
  SectorMeasureCard,
  SimulationState
} from '@argentina-sim/domain';
import { canExecuteCampaignAction } from '@argentina-sim/domain';
import { CAMPAIGN_ACTIONS_CATALOG } from '@argentina-sim/infrastructure';
import type { HandCardSpec } from './BottomActionCardHand.js';
import { formatArNumber, formatArSigned } from '../../lib/formatters.js';

// Selecciona 3 cartas tacticas para la mano inferior en Campana (operaciones electorales)
// y en Gobierno (3 decisiones/decretos disponibles para firmar o derogar en el mes).

const PREFERRED_CAMPAIGN_TRIO = [
  'RECORRIDA',
  'PARRILLADA_SINDICAL_CGT',
  'CENA_RECAUDACION_PYME'
] as const;

function resolveCampaignRisk(cost: number): { label: string; level: 1 | 2 | 3 } {
  if (cost >= 8) return { label: 'Riesgo alto', level: 3 };
  if (cost >= 5.5) return { label: 'Riesgo medio', level: 2 };
  return { label: 'Riesgo bajo', level: 1 };
}

function formatPrimaryActionEffect(card: CampaignActionCard): string {
  const first = card.effects[0];
  if (!first) return 'Impacto político directo';
  return `${first.label.toLowerCase()} ${first.rangeText.replace('/', ' a ')}`;
}

function appendUniqueUpTo<T extends { id: string }>(target: T[], candidates: T[], limit: number): void {
  for (const item of candidates) {
    if (target.length >= limit) break;
    if (!target.some((existing) => existing.id === item.id)) {
      target.push(item);
    }
  }
}

function buildCampaignCardItem(
  card: CampaignActionCard,
  state: CampaignSimulationState,
  selectedProvinceId: string,
  recommended: boolean,
  onExecute: (payload: CampaignExecutePayload) => void
): HandCardSpec {
  const check = canExecuteCampaignAction(state, card);
  const risk = resolveCampaignRisk(card.cost);
  return {
    id: card.id,
    tag: card.category ?? 'CAMPAÑA',
    costLabel: `${formatArNumber(card.cost, 1)} M`,
    title: card.title,
    effectText: formatPrimaryActionEffect(card),
    riskLabel: risk.label,
    riskLevel: risk.level,
    recommended,
    ctaLabel: check.allowed ? 'EJECUTAR' : 'BLOQUEADA',
    disabled: !check.allowed,
    onExecute: () =>
      onExecute(
        card.id === 'RECORRIDA'
          ? { actionId: 'RECORRIDA', selectedProvinceId }
          : { actionId: card.id }
      )
  };
}

export function buildCampaignHandCards(
  state: CampaignSimulationState,
  selectedProvinceId: string,
  onExecute: (payload: CampaignExecutePayload) => void
): HandCardSpec[] {
  const preferred = PREFERRED_CAMPAIGN_TRIO
    .map((id) => CAMPAIGN_ACTIONS_CATALOG.find((c) => c.id === id))
    .filter((c): c is CampaignActionCard => Boolean(c));
  const picked = [...preferred];
  appendUniqueUpTo(picked, CAMPAIGN_ACTIONS_CATALOG, 3);
  return picked
    .slice(0, 3)
    .map((card, idx) => buildCampaignCardItem(card, state, selectedProvinceId, idx === 1, onExecute));
}

function resolveMeasureRisk(m: SectorMeasureCard): { label: string; level: 1 | 2 | 3 } {
  const stress = Math.abs(m.fiscalCostPctGdp) + Math.abs(m.inflationEffectPp);
  if (stress >= 0.45) return { label: 'Riesgo alto', level: 3 };
  if (stress >= 0.2) return { label: 'Riesgo medio', level: 2 };
  return { label: 'Riesgo bajo', level: 1 };
}

function formatMeasureEffectSummary(m: SectorMeasureCard): string {
  if (m.approvalEffectPp !== 0) {
    return `Aprobación ${formatArSigned(m.approvalEffectPp, 1)} pp · IPC ${formatArSigned(m.inflationEffectPp, 1)} pp`;
  }
  return `Impacto IPC ${formatArSigned(m.inflationEffectPp, 1)} pp`;
}

function pickOnePerSector(pool: SectorMeasureCard[], limit: number): SectorMeasureCard[] {
  const chosen: SectorMeasureCard[] = [];
  const seen = new Set<string>();
  for (const item of pool) {
    if (chosen.length >= limit) break;
    if (!seen.has(item.sectorId)) {
      seen.add(item.sectorId);
      chosen.push(item);
    }
  }
  return chosen;
}

function isReadyToDecree(m: SectorMeasureCard): boolean {
  return !m.active && (m.cooldownRemainingMonths ?? 0) === 0;
}

function isCurrencyOrReservesFire(state: SimulationState): boolean {
  return state.centralBank.exchangeBrechaPct >= 20 || state.centralBank.netLiquidReservesBillionUsd <= 15;
}

function isLaborStressFire(state: SimulationState): boolean {
  return state.labor.activeNationalStrike || state.labor.unemploymentPct >= 9;
}

const PRIORITY_RULES: Array<{ test: (s: SimulationState) => boolean; sectors: string[] }> = [
  { test: isCurrencyOrReservesFire, sectors: ['FINANZAS', 'COMERCIO_EXTERIOR', 'PRECIOS'] },
  { test: (s) => s.inflation.realMonthlyIpcPct >= 3.5, sectors: ['PRECIOS', 'ENERGIA', 'FINANZAS'] },
  { test: isLaborStressFire, sectors: ['TRABAJO', 'DESARROLLO_SOCIAL', 'INDUSTRIA'] },
  { test: (s) => s.publicOpinion.managementApprovalPct < 46, sectors: ['DESARROLLO_SOCIAL', 'SALUD', 'PRECIOS'] }
];

function resolvePrioritySectorsForState(state?: SimulationState): string[] {
  if (!state) return ['PRECIOS', 'ENERGIA', 'INDUSTRIA'];
  const hit = PRIORITY_RULES.find((r) => r.test(state));
  return hit ? hit.sectors : ['PRECIOS', 'ENERGIA', 'INDUSTRIA'];
}

function rotateArray<T>(list: T[], offset: number): T[] {
  if (list.length <= 1 || offset === 0) return list;
  const shift = ((offset % list.length) + list.length) % list.length;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

function pickRecommendedMeasure(
  pool: SectorMeasureCard[],
  prioritySectors: string[],
  rotationOffset: number
): SectorMeasureCard | undefined {
  const matching = pool.filter((m) => prioritySectors.includes(m.sectorId));
  const rotated = rotateArray(matching.length > 0 ? matching : pool, rotationOffset);
  return rotated[0];
}

function selectDiverseMeasures(
  measures: SectorMeasureCard[],
  state?: SimulationState,
  rotationOffset = 0
): SectorMeasureCard[] {
  const ready = measures.filter(isReadyToDecree);
  const pool = ready.length >= 3 ? ready : measures;
  const prioritySectors = resolvePrioritySectorsForState(state);
  const recommended = pickRecommendedMeasure(pool, prioritySectors, rotationOffset);

  const othersPool = rotateArray(
    pool.filter((m) => m.id !== recommended?.id),
    rotationOffset * 2
  );
  const sideCards = pickOnePerSector(othersPool, 2);
  appendUniqueUpTo(sideCards, othersPool, 2);

  if (!recommended) return sideCards.slice(0, 3);
  const trio: SectorMeasureCard[] = [];
  if (sideCards[0]) trio.push(sideCards[0]);
  trio.push(recommended);
  if (sideCards[1]) trio.push(sideCards[1]);
  appendUniqueUpTo(trio, measures, 3);
  return trio.slice(0, 3);
}

function resolveGovCardCta(m: SectorMeasureCard, capitalRemaining: number): { label: string; disabled: boolean } {
  if (m.active) return { label: 'DEROGAR', disabled: false };
  if ((m.cooldownRemainingMonths ?? 0) > 0) return { label: 'ENFRIAMIENTO', disabled: true };
  if (capitalRemaining <= 0) return { label: 'SIN CAPITAL', disabled: true };
  return { label: 'DECRETAR', disabled: false };
}

export function buildGovernmentHandCards(
  measures: SectorMeasureCard[],
  onToggleMeasure: (id: string) => void,
  capitalRemaining = 3,
  state?: SimulationState,
  rotationOffset = 0
): HandCardSpec[] {
  const chosen = selectDiverseMeasures(measures, state, rotationOffset);
  return chosen.map((m, idx) => {
    const risk = resolveMeasureRisk(m);
    const cta = resolveGovCardCta(m, capitalRemaining);
    const fiscalLabel =
      m.fiscalCostPctGdp === 0 ? '0 % PBI' : `${formatArSigned(m.fiscalCostPctGdp, 2)} %`;
    return {
      id: m.id,
      tag: m.sectorId.replace('_', ' '),
      costLabel: fiscalLabel,
      title: m.title,
      effectText: formatMeasureEffectSummary(m),
      riskLabel: risk.label,
      riskLevel: risk.level,
      recommended: idx === 1,
      ctaLabel: cta.label,
      disabled: cta.disabled,
      onExecute: () => onToggleMeasure(m.id)
    };
  });
}
