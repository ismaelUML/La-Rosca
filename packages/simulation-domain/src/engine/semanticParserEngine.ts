// Motor semántico determinista para Leyes Propias e Impuestos Propios (QQG Fase 4):
// Analiza texto libre, títulos y alícuotas mediante ponderación léxica de impacto
// macroeconómico, dirección ideológica, riesgo constitucional de amparo y viabilidad legislativa.

export type SemanticIdeologyDirection = 'LIBERAL' | 'ESTATISTA' | 'PRAGMATICO';

export type MacroTargetMetric = 'INFLACION' | 'INVERSION' | 'EMPLEO' | 'RECAUDACION' | 'POBREZA';

export interface SemanticImpactSummary {
  direction: SemanticIdeologyDirection;
  targets: MacroTargetMetric[];
  fiscalDeltaGdpPct: number;
  investmentDeltaPp: number;
  inflationMonthlyDeltaPp: number;
  approvalImpactPct: number;
  constitutionalityRiskPct: number;
  judicialWarning: string | null;
  congressResistancePct: number;
}

const LIBERAL_KEYWORDS = [
  'desregul', 'baja', 'elimina', 'privatiz', 'libertad', 'apertura',
  'libre', 'mercado', 'incentiv', 'rebaja', 'exenci', 'simplific', 'alivio fiscal'
];

const ESTATISTA_KEYWORDS = [
  'retenc', 'extraordinari', 'patrimoni', 'solidari', 'suba de impuesto',
  'estatiz', 'nacionaliz', 'control de precios', 'subsid', 'empresa publica', 'protecc'
];

function countMatches(textLower: string, keywords: string[]): number {
  let count = 0;
  for (const kw of keywords) {
    if (textLower.includes(kw)) {
      count += 1;
    }
  }
  return count;
}

export function classifySemanticDirection(text: string): SemanticIdeologyDirection {
  const lower = text.toLowerCase();
  const libHits = countMatches(lower, LIBERAL_KEYWORDS);
  const estHits = countMatches(lower, ESTATISTA_KEYWORDS);

  if (libHits > estHits) return 'LIBERAL';
  if (estHits > libHits) return 'ESTATISTA';
  return 'PRAGMATICO';
}

const TARGET_PATTERNS: Array<{ metric: MacroTargetMetric; keywords: string[] }> = [
  { metric: 'INFLACION', keywords: ['inflac', 'precios'] },
  { metric: 'INVERSION', keywords: ['invers', 'capital', 'fábric'] },
  { metric: 'EMPLEO', keywords: ['empleo', 'trabaj', 'laboral'] },
  { metric: 'RECAUDACION', keywords: ['recaud', 'fiscal', 'impuest'] },
  { metric: 'POBREZA', keywords: ['pobrez', 'social', 'comedor'] }
];

function checkKeywordPresent(text: string, words: string[]): boolean {
  for (const w of words) {
    if (text.includes(w)) return true;
  }
  return false;
}

export function detectTargetIndicators(text: string): MacroTargetMetric[] {
  const lower = text.toLowerCase();
  const res: MacroTargetMetric[] = [];

  for (const item of TARGET_PATTERNS) {
    if (checkKeywordPresent(lower, item.keywords)) {
      res.push(item.metric);
    }
  }

  if (res.length === 0) {
    return ['RECAUDACION', 'INVERSION'];
  }
  return res;
}

function resolveBaseFiscalImpact(direction: SemanticIdeologyDirection, ratePct: number): number {
  if (direction === 'LIBERAL') {
    return -Math.min(1.2, Math.round((ratePct * 0.05) * 100) / 100);
  }
  if (direction === 'ESTATISTA') {
    return Math.min(2.5, Math.round((ratePct * 0.08) * 100) / 100);
  }
  return Math.round((ratePct * 0.03) * 100) / 100;
}

function resolveInvestmentDelta(direction: SemanticIdeologyDirection): number {
  if (direction === 'LIBERAL') return 0.28;
  if (direction === 'ESTATISTA') return -0.32;
  return 0.05;
}

function resolveInflationDelta(direction: SemanticIdeologyDirection): number {
  if (direction === 'LIBERAL') return -0.15;
  if (direction === 'ESTATISTA') return 0.22;
  return -0.04;
}

function resolveConstitutionalWarning(ratePct: number, textLower: string): { risk: number; warning: string | null } {
  if (ratePct > 35) {
    return {
      risk: 85,
      warning: 'Riesgo judicial crítico: la alícuota supera el 35% y la CSJN lo declarará confiscatorio.'
    };
  }
  if (textLower.includes('retroactiv') || textLower.includes('penal')) {
    return {
      risk: 75,
      warning: 'Fallo adverso casi seguro: vulnera el principio de no retroactividad e irretroactividad tributaria.'
    };
  }
  if (ratePct > 20) {
    return {
      risk: 42,
      warning: 'Alerta de litigiosidad: cámaras empresarias presentarán medidas cautelares colectivas.'
    };
  }
  return { risk: 10, warning: null };
}

export function parseSemanticTaxOrLaw(
  title: string,
  description: string,
  ratePct: number = 0
): SemanticImpactSummary {
  const combined = `${title} ${description}`.toLowerCase();
  const direction = classifySemanticDirection(combined);
  const targets = detectTargetIndicators(combined);

  const fiscalDeltaGdpPct = resolveBaseFiscalImpact(direction, ratePct);
  const investmentDeltaPp = resolveInvestmentDelta(direction);
  const inflationMonthlyDeltaPp = resolveInflationDelta(direction);

  const { risk, warning } = resolveConstitutionalWarning(ratePct, combined);

  const baseResistance = direction === 'ESTATISTA' ? 45 : 30;
  const congressResistancePct = Math.min(95, baseResistance + Math.round(ratePct * 1.2));
  const approvalImpactPct = direction === 'LIBERAL' ? 2.5 : -3.0;

  return {
    direction,
    targets,
    fiscalDeltaGdpPct,
    investmentDeltaPp,
    inflationMonthlyDeltaPp,
    approvalImpactPct,
    constitutionalityRiskPct: risk,
    judicialWarning: warning,
    congressResistancePct
  };
}
