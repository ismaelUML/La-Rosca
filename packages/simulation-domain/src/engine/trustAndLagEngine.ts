import { clamp, round2 } from '../economy/mathUtils.js';
import type { LaggedMacroShock } from '../models/SimulationTypes.js';

// Memoria bilateral de confianza entre el Ejecutivo y los actores que vetan cosas.
// Si intervenis el INDEC o dinamitas puentes en el recinto, no se resetea el mes que viene:
// decae despacio hacia un piso neutro para que cada ruptura cueste credito real.

export const TRUST_BASELINE: Record<string, number> = {
  MERCADOS: 55,
  CONGRESO: 52,
  PROVINCIAS: 55,
  GREMIOS: 42
};

export function readTrustScore(ledger: Record<string, number> | undefined, key: string): number {
  return ledger?.[key] ?? TRUST_BASELINE[key] ?? 50;
}

export function adjustTrustLedger(
  ledger: Record<string, number> | undefined,
  deltas: Record<string, number>
): Record<string, number> {
  const next: Record<string, number> = { ...TRUST_BASELINE, ...(ledger ?? {}) };
  for (const [key, delta] of Object.entries(deltas)) {
    const base = next[key] ?? TRUST_BASELINE[key] ?? 50;
    next[key] = round2(clamp(base + delta, 5, 95));
  }
  return next;
}

export function decayTrustLedger(ledger: Record<string, number> | undefined): Record<string, number> {
  const next: Record<string, number> = { ...TRUST_BASELINE, ...(ledger ?? {}) };
  for (const [key, current] of Object.entries(next)) {
    const target = TRUST_BASELINE[key] ?? 50;
    next[key] = round2(current + (target - current) * 0.08);
  }
  return next;
}

export function enqueueMacroShock(
  existing: LaggedMacroShock[] | undefined,
  shock: LaggedMacroShock
): LaggedMacroShock[] {
  const current = existing ?? [];
  const filtered = current.filter((item) => item.id !== shock.id);
  return [...filtered, shock];
}

export interface MonthlyLagAggregate {
  inflationDeltaPp: number;
  gdpGrowthDeltaPp: number;
  approvalDeltaPp: number;
  nextShocks: LaggedMacroShock[];
}

export function consumeMonthlyMacroLags(shocks: LaggedMacroShock[] | undefined): MonthlyLagAggregate {
  const active = (shocks ?? []).filter((s) => s.monthsRemaining > 0);
  const totals = active.reduce(
    (acc, shock) => ({
      inflation: acc.inflation + shock.inflationDeltaPerMonth,
      gdp: acc.gdp + shock.gdpGrowthDeltaPerMonth,
      approval: acc.approval + shock.approvalDeltaPerMonth
    }),
    { inflation: 0, gdp: 0, approval: 0 }
  );
  const nextShocks = active
    .filter((s) => s.monthsRemaining > 1)
    .map((s) => ({ ...s, monthsRemaining: s.monthsRemaining - 1 }));

  return {
    inflationDeltaPp: round2(totals.inflation),
    gdpGrowthDeltaPp: round2(totals.gdp),
    approvalDeltaPp: round2(totals.approval),
    nextShocks
  };
}
