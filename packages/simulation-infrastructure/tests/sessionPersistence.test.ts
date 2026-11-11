import { describe, expect, it } from 'vitest';
import type { PersistedGameSession } from '@argentina-sim/domain';
import {
  clearSessionFromStorage,
  hasSessionInStorage,
  loadSessionFromStorage,
  saveSessionToStorage,
  type StorageLike
} from '../src/storage/SessionPersistence.js';
import { createInitialSimulationState2027 } from '../src/datasets/initialState2027Factory.js';
import { createInitialCampaignState } from '../src/datasets/campaignPresets2027.js';
import { POLITICAL_PARTIES_2027 } from '../src/datasets/partiesAndPoliticians2027.js';

class MockStorage implements StorageLike {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function createDummySession(): PersistedGameSession {
  const party = POLITICAL_PARTIES_2027[0]!;
  const gov = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
  const camp = createInitialCampaignState({ id: 'TEST', name: 'Tester' }, party, 'PRESIDENTE', 'CABA');

  return {
    version: 1,
    savedAtIso: '2027-12-10T15:00:00Z',
    screenMode: 'CAMPAIGN',
    setup: {
      sessionId: 'test-session',
      characterMode: 'MI_PERSONAJE',
      characterName: 'Tester',
      selectedPoliticianId: 'CUSTOM',
      role: 'PRESIDENTE',
      provinceId: 'CABA',
      partyMode: 'PARTIDO_EXISTENTE',
      party,
      difficulty: 'ESTANDAR_2027'
    },
    campaignState: camp,
    campaignNavSection: 'PARTIDO_PROVINCIAS',
    governmentState: gov,
    activeSection: 'INDICADORES',
    ministers: [],
    levers: [],
    measures: [],
    rigiSectors: [],
    customTaxes: []
  };
}

describe('SessionPersistence (Auto-guardado y persistencia en recarga F5)', () => {
  it('guarda y recupera la sesion completa preservando pantalla y secciones activas', () => {
    const storage = new MockStorage();
    const session = createDummySession();

    expect(hasSessionInStorage(storage)).toBe(false);

    const saved = saveSessionToStorage(session, storage);
    expect(saved).toBe(true);
    expect(hasSessionInStorage(storage)).toBe(true);

    const loaded = loadSessionFromStorage(storage);
    expect(loaded).not.toBeNull();
    expect(loaded?.screenMode).toBe('CAMPAIGN');
    expect(loaded?.campaignNavSection).toBe('PARTIDO_PROVINCIAS');
    expect(loaded?.setup.sessionId).toBe('test-session');
  });

  it('devuelve null y no rompe si el JSON esta corrupto o falta la version 1', () => {
    const storage = new MockStorage();
    storage.setItem('LA_ROSCA_ARGENTINA_SESSION_V1', '{ corrupted json ...');
    expect(loadSessionFromStorage(storage)).toBeNull();

    storage.setItem('LA_ROSCA_ARGENTINA_SESSION_V1', JSON.stringify({ version: 999 }));
    expect(loadSessionFromStorage(storage)).toBeNull();
  });

  it('permite limpiar la sesion guardada', () => {
    const storage = new MockStorage();
    saveSessionToStorage(createDummySession(), storage);
    expect(hasSessionInStorage(storage)).toBe(true);

    clearSessionFromStorage(storage);
    expect(hasSessionInStorage(storage)).toBe(false);
    expect(loadSessionFromStorage(storage)).toBeNull();
  });
});
