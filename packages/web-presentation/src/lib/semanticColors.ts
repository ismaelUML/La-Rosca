import type { IndicatorSeriesCard } from '@argentina-sim/domain';

// Regla semantica unificada en toda la UI:
// bueno = verde (#10b981), neutro = amarillo/dorado (#eab308), malo = rojo/rosa (#f43f5e).

export type SemanticTone = 'good' | 'neutral' | 'bad';

export const SEMANTIC_HEX: Record<SemanticTone, string> = {
  good: '#10b981',
  neutral: '#eab308',
  bad: '#f43f5e'
};

export const SEMANTIC_TEXT_CLASS: Record<SemanticTone, string> = {
  good: 'text-emerald-400',
  neutral: 'text-amber-300',
  bad: 'text-rose-400'
};

export const SEMANTIC_BG_BADGE: Record<SemanticTone, string> = {
  good: 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300',
  neutral: 'bg-amber-950/50 border-amber-700/50 text-amber-300',
  bad: 'bg-rose-950/60 border-rose-700/50 text-rose-300'
};

export function resolveDeltaTone(delta: number, invertColorLogic?: boolean): SemanticTone {
  if (Math.abs(delta) < 0.05) return 'neutral';
  const isFavorable = invertColorLogic ? delta < 0 : delta > 0;
  return isFavorable ? 'good' : 'bad';
}

export function resolveIndicatorCardTone(card: IndicatorSeriesCard): SemanticTone {
  if (card.invertColorLogic && card.currentValue >= 30) {
    return 'bad';
  }
  return resolveDeltaTone(card.monthlyVariation, card.invertColorLogic);
}

function resolveDescendingTone(value: number, goodMax: number, neutralMax: number): SemanticTone {
  if (value <= goodMax) return 'good';
  return value <= neutralMax ? 'neutral' : 'bad';
}

function resolveAscendingTone(value: number, goodMin: number, neutralMin: number): SemanticTone {
  if (value >= goodMin) return 'good';
  return value >= neutralMin ? 'neutral' : 'bad';
}

export function resolveRangeTone(
  value: number,
  goodThreshold: number,
  neutralThreshold: number,
  invert?: boolean
): SemanticTone {
  return invert
    ? resolveDescendingTone(value, goodThreshold, neutralThreshold)
    : resolveAscendingTone(value, goodThreshold, neutralThreshold);
}
