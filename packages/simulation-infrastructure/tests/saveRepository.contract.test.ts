import { describe, expect, it } from 'vitest';
import { FakeSaveRepository, type SaveRepositoryPort } from '@argentina-sim/domain';
import {
  BoundedSimulationQueue,
  CompressedSaveRepository,
  createInitialSimulationState2027
} from '@argentina-sim/infrastructure';

// Suite de contrato Liskov: corre exactamente las mismas pruebas contra el Fake en memoria
// y contra el adaptador real comprimido con zlib (fflate). Si uno miente, salta aca.

function runSaveRepositoryContractSuite(name: string, factory: () => SaveRepositoryPort) {
  describe(`Suite de Contrato SaveRepositoryPort: ${name}`, () => {
    it('guarda, lista y recupera una partida intacta por slotId', async () => {
      const repo = factory();
      const state = createInitialSimulationState2027('SENADOR', 'ESTANDAR_2027', 'CORDOBA');

      await repo.saveState('slot-1', state, '2027-12-10T12:00:00Z');
      const loaded = await repo.loadState('slot-1');
      const missing = await repo.loadState('inexistente');
      const slots = await repo.listSlots();

      expect(loaded).not.toBeNull();
      expect(loaded?.role).toBe('SENADOR');
      expect(loaded?.selectedProvinceId).toBe('CORDOBA');
      expect(missing).toBeNull();
      expect(slots.length).toBe(1);
      expect(slots[0]?.slotId).toBe('slot-1');
    });

    it('exporta e importa codigo portable comprimido sin corromper el JSON (sin error 500 de QQG)', () => {
      const repo = factory();
      const state = createInitialSimulationState2027('DIPUTADO', 'TORMENTA_PERFECTA', 'SANTA_FE');

      const portableCode = repo.exportPortableCode(state);
      const restored = repo.importPortableCode(portableCode);

      expect(restored.role).toBe('DIPUTADO');
      expect(restored.difficulty).toBe('TORMENTA_PERFECTA');
      expect(restored.centralBank.officialDollarArs).toBe(state.centralBank.officialDollarArs);
      expect(() => repo.importPortableCode('CODIGO_BASURA_ROTO')).toThrow();
    });
  });
}

runSaveRepositoryContractSuite('FakeSaveRepository (In-Memory)', () => new FakeSaveRepository());
runSaveRepositoryContractSuite('CompressedSaveRepository (Zlib fflate)', () => new CompressedSaveRepository());

describe('BoundedSimulationQueue (Backpressure Worker Queue)', () => {
  it('aplica contrapresion rechazando elementos cuando supera MaxQueueSize y drena en orden', () => {
    const queue = new BoundedSimulationQueue(2);
    const state = createInitialSimulationState2027('PRESIDENTE', 'VIENTO_DE_COLA', 'PBA');

    expect(queue.enqueue({ kind: 'ADVANCE_MONTH' })).toBe(true);
    expect(queue.enqueue({ kind: 'APPLY_ACTION', action: { type: 'SET_POLICY_RATE', annualRatePct: 28 } })).toBe(true);
    expect(queue.enqueue({ kind: 'ADVANCE_MONTH' })).toBe(false);
    expect(queue.pendingCount()).toBe(2);

    const nextState = queue.drainOnState(state);
    expect(queue.pendingCount()).toBe(0);
    expect(nextState.turnMonth).toBe(2);
    expect(nextState.centralBank.policyRateAnnualPct).toBe(28);
  });
});

