import { describe, expect, it } from 'vitest';
import {
  classifySemanticDirection,
  detectTargetIndicators,
  parseSemanticTaxOrLaw
} from '../src/engine/semanticParserEngine.js';
import {
  computeCombatZScore,
  evolveMilitaryTheaters,
  executeTheaterOrder,
  resolveTheaterCombatTick,
  sigmoid
} from '../src/politics/militaryTheaterEngine.js';
import type { MilitaryTheater } from '../src/models/CongressAndGeopoliticsTypes.js';

describe('Fase 4: Semantic Parser Engine (Leyes e Impuestos Propios)', () => {
  it('clasifica correctamente iniciativas liberales vs estatistas vs pragmáticas', () => {
    const lib = classifySemanticDirection('Desregulación integral y eliminación de aranceles');
    const est = classifySemanticDirection('Aporte solidario extraordinario y retenciones a las exportaciones');
    const prag = classifySemanticDirection('Actualización de tasas administrativas del registro automotor');

    expect(lib).toBe('LIBERAL');
    expect(est).toBe('ESTATISTA');
    expect(prag).toBe('PRAGMATICO');
  });

  it('detecta métricas objetivo según palabras clave en el articulado', () => {
    const targets = detectTargetIndicators('Medida orientada a frenar la inflación y fomentar el empleo formal');
    expect(targets).toContain('INFLACION');
    expect(targets).toContain('EMPLEO');
  });

  it('alerta riesgo constitucional crítico si la alícuota supera el 35% por confiscatoriedad', () => {
    const analysis = parseSemanticTaxOrLaw('Super Impuesto a la Riqueza', 'Gravamen general', 40);
    expect(analysis.constitutionalityRiskPct).toBeGreaterThanOrEqual(75);
    expect(analysis.judicialWarning).toContain('confiscatorio');
  });

  it('proyecta impacto fiscal e inversión coherente con la dirección ideológica', () => {
    const libAnalysis = parseSemanticTaxOrLaw('Baja de aportes patronales', 'Desregulación para pymes', 5);
    expect(libAnalysis.direction).toBe('LIBERAL');
    expect(libAnalysis.investmentDeltaPp).toBeGreaterThan(0);

    const estAnalysis = parseSemanticTaxOrLaw('Retenciones al agro', 'Aporte extraordinario cerealero', 12);
    expect(estAnalysis.direction).toBe('ESTATISTA');
    expect(estAnalysis.fiscalDeltaGdpPct).toBeGreaterThan(0);
  });
});

describe('Fase 4: Military Theater & Weighted Sigmoid Combat', () => {
  const sampleTheater: MilitaryTheater = {
    id: 'ATLANTICO_SUR_MILLA_200',
    name: 'Atlántico Sur (Milla 200 y ZEE)',
    readinessPct: 75,
    controlAndSovereigntyPct: 70,
    illegalFishingOrNarcoPressurePct: 40
  };

  it('calcula la función sigmoide acotada estrictamente entre 0 y 1', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 3);
    expect(sigmoid(10)).toBeGreaterThan(0.99);
    expect(sigmoid(-10)).toBeLessThan(0.01);
  });

  it('calcula z-score de combate operacional favoreciendo mayor apresto', () => {
    const highReadinessZ = computeCombatZScore(90, 30, 0.45, 0.2);
    const lowReadinessZ = computeCombatZScore(30, 90, 0.1, 0.0);
    expect(highReadinessZ).toBeGreaterThan(lowReadinessZ);
  });

  it('resuelve el tick mensual de combate incrementando control territorial si el z-score es favorable', () => {
    const res = resolveTheaterCombatTick(sampleTheater, 'OTAN_F16_STRYKER', 0.8);
    expect(res.winProbabilityPct).toBeGreaterThan(50);
    expect(res.controlDeltaPct).toBeGreaterThan(0);
  });

  it('evoluciona teatros militares actualizando control y apresto operacional', () => {
    const evolved = evolveMilitaryTheaters([sampleTheater], 'OTAN_F16_STRYKER', 0.8);
    expect(evolved).toHaveLength(1);
    expect(evolved[0]!.controlAndSovereigntyPct).toBeGreaterThanOrEqual(70);
  });

  it('bloquea la orden de anexión si el control soberano es inferior al 90%', () => {
    const order = executeTheaterOrder(sampleTheater, 'ANEXION_PACIFICA');
    expect(order.resultText).toContain('Soberanía insuficiente');
    expect(order.updatedTheater.controlAndSovereigntyPct).toBe(70);
  });

  it('ejecuta anexión pacífica y soberanía total al alcanzar el 90% de control', () => {
    const readyTheater: MilitaryTheater = {
      ...sampleTheater,
      controlAndSovereigntyPct: 92
    };
    const order = executeTheaterOrder(readyTheater, 'ANEXION_PACIFICA');
    expect(order.resultText).toContain('Soberanía territorial total consolidada');
    expect(order.updatedTheater.controlAndSovereigntyPct).toBe(100);
    expect(order.updatedTheater.illegalFishingOrNarcoPressurePct).toBe(0);
  });
});

