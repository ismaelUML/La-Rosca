import { describe, expect, it } from 'vitest';
import {
  buildIndicatorsCatalog,
  createInitialSimulationState2027,
  INITIAL_CABINET_2027,
  INITIAL_ECONOMIC_LEVERS,
  INITIAL_RIGI_SECTORS,
  INITIAL_SECTOR_MEASURES,
  POLITICAL_PARTIES_2027,
  REAL_POLITICIANS_2027,
  SECTOR_CATEGORIES_SUMMARY
} from '../src/index.js';

describe('Datasets de Partidos, Políticos Reales y Series de Indicadores 2027', () => {
  it('incluye los 6 espacios políticos nacionales y los 18 dirigentes jugables', () => {
    expect(POLITICAL_PARTIES_2027).toHaveLength(6);
    expect(REAL_POLITICIANS_2027.length).toBeGreaterThanOrEqual(18);
    expect(INITIAL_CABINET_2027).toHaveLength(10);
    expect(INITIAL_ECONOMIC_LEVERS).toHaveLength(10);
    expect(INITIAL_RIGI_SECTORS).toHaveLength(4);
    expect(SECTOR_CATEGORIES_SUMMARY).toHaveLength(12);
    expect(INITIAL_SECTOR_MEASURES.length).toBeGreaterThanOrEqual(6);
  });

  it('construye las 24 tarjetas de series históricas con puntos desde dic 26 hasta el mes actual', () => {
    const state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'PBA');
    const catalog = buildIndicatorsCatalog(state);

    expect(catalog).toHaveLength(24);
    const infMensual = catalog.find((c) => c.id === 'INF_MENSUAL');
    expect(infMensual).toBeDefined();
    expect(infMensual?.points.length).toBeGreaterThanOrEqual(7);
    expect(infMensual?.points[0]?.label).toBe('dic 26');
  });
});

