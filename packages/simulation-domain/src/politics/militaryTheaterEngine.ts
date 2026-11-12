// Motor de Teatros Militares y Geopolítica (QQG Fase 4):
// Modela el combate operacional y la soberanía territorial mediante función sigmoide ponderada:
//   sigma(z) = 1 / (1 + exp(-z))
// donde z mide la correlación de fuerzas, logística y desgaste.
// Al superar el 90% de control soberano, se habilita la anexión pacífica o consolidación total.

import type { MilitaryTheater } from '../models/CongressAndGeopoliticsTypes.js';

export interface CombatSigmoidResolution {
  zScore: number;
  winProbabilityPct: number;
  controlDeltaPct: number;
  attritionPct: number;
  annexationReady: boolean;
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function computeCombatZScore(
  readinessPct: number,
  pressurePct: number,
  equipmentBonus: number,
  logisticsBonus: number
): number {
  const readinessDelta = (readinessPct - pressurePct) / 28;
  return Math.max(-5, Math.min(5, readinessDelta + equipmentBonus + logisticsBonus));
}

function resolveEquipmentBonus(alignment: string): number {
  if (alignment === 'OTAN_F16_STRYKER') return 0.45;
  if (alignment === 'CHINA_JF17') return 0.25;
  if (alignment === 'AUTONOMIA_INVAP_FADEA') return 0.35;
  return 0.10;
}

export function resolveTheaterCombatTick(
  theater: MilitaryTheater,
  equipmentAlignment: string,
  fondefBudgetGdp: number
): CombatSigmoidResolution {
  const eqBonus = resolveEquipmentBonus(equipmentAlignment);
  const logBonus = Math.min(0.5, (fondefBudgetGdp - 0.5) * 0.4);
  const z = computeCombatZScore(theater.readinessPct, theater.illegalFishingOrNarcoPressurePct, eqBonus, logBonus);

  const prob = sigmoid(z);
  const winProbabilityPct = Math.round(prob * 1000) / 10;
  const controlDeltaPct = Math.round((prob - 0.48) * 9.5 * 10) / 10;
  const attritionPct = Math.round((1 - prob) * 4.2 * 10) / 10;

  const nextControl = Math.max(0, Math.min(100, theater.controlAndSovereigntyPct + controlDeltaPct));
  const annexationReady = nextControl >= 90;

  return {
    zScore: Math.round(z * 100) / 100,
    winProbabilityPct,
    controlDeltaPct,
    attritionPct,
    annexationReady
  };
}

export function evolveMilitaryTheaters(
  theaters: MilitaryTheater[],
  equipmentAlignment: string,
  fondefBudgetGdp: number
): MilitaryTheater[] {
  return theaters.map((th) => {
    if (th.controlAndSovereigntyPct >= 100) {
      return { ...th, illegalFishingOrNarcoPressurePct: 0 };
    }

    const res = resolveTheaterCombatTick(th, equipmentAlignment, fondefBudgetGdp);
    const updatedControl = Math.max(0, Math.min(100, th.controlAndSovereigntyPct + res.controlDeltaPct));
    const updatedReadiness = Math.max(10, Math.min(100, th.readinessPct - res.attritionPct + 2));
    const pressureDelta = res.winProbabilityPct > 55 ? -2.5 : 1.5;
    const updatedPressure = Math.max(0, Math.min(100, th.illegalFishingOrNarcoPressurePct + pressureDelta));

    return {
      ...th,
      controlAndSovereigntyPct: Math.round(updatedControl * 10) / 10,
      readinessPct: Math.round(updatedReadiness * 10) / 10,
      illegalFishingOrNarcoPressurePct: Math.round(updatedPressure * 10) / 10
    };
  });
}

export function executeTheaterOrder(
  theater: MilitaryTheater,
  orderType: 'PATRULLA' | 'SATURACION' | 'ANEXION_PACIFICA'
): { updatedTheater: MilitaryTheater; resultText: string } {
  if (orderType === 'ANEXION_PACIFICA') {
    if (theater.controlAndSovereigntyPct < 90) {
      return {
        updatedTheater: theater,
        resultText: `Soberanía insuficiente (${theater.controlAndSovereigntyPct}%). Requiere un control mayor al 90% para consumar la soberanía territorial definitiva.`
      };
    }
    return {
      updatedTheater: {
        ...theater,
        controlAndSovereigntyPct: 100,
        illegalFishingOrNarcoPressurePct: 0,
        readinessPct: Math.min(100, theater.readinessPct + 10)
      },
      resultText: `🏛️ ¡Soberanía territorial total consolidada en ${theater.name}! El territorio queda bajo control absoluto e integrado irrevocablemente a la República.`
    };
  }

  if (orderType === 'PATRULLA') {
    const newControl = Math.min(100, theater.controlAndSovereigntyPct + 4.5);
    const newPressure = Math.max(0, theater.illegalFishingOrNarcoPressurePct - 6.0);
    return {
      updatedTheater: {
        ...theater,
        controlAndSovereigntyPct: Math.round(newControl * 10) / 10,
        illegalFishingOrNarcoPressurePct: Math.round(newPressure * 10) / 10
      },
      resultText: `Despliegue aeronaval en ${theater.name}: control +4.5%, presión enemiga -6.0%.`
    };
  }

  const newReadiness = Math.min(100, theater.readinessPct + 8.0);
  const newControl = Math.min(100, theater.controlAndSovereigntyPct + 3.0);
  return {
    updatedTheater: {
      ...theater,
      readinessPct: Math.round(newReadiness * 10) / 10,
      controlAndSovereigntyPct: Math.round(newControl * 10) / 10
    },
    resultText: `Operativo de saturación en ${theater.name}: apresto operacional +8.0%, control +3.0%.`
  };
}

