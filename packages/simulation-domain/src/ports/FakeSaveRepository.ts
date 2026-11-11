import type { SimulationState } from '../models/SimulationTypes.js';
import type { SaveRepositoryPort, SaveSlotSummary } from './SaveRepositoryPort.js';

// Fake en memoria que pasa la misma suite de contrato que el adaptador real de IndexedDB/fflate.
// Asi los tests unitarios del caso de uso corren en 2 milisegundos sin mockear promesas a mano.

export class FakeSaveRepository implements SaveRepositoryPort {
  private readonly store = new Map<string, { state: SimulationState; savedAtIso: string }>();

  async saveState(slotId: string, state: SimulationState, savedAtIso: string): Promise<void> {
    const cloned = JSON.parse(JSON.stringify(state)) as SimulationState;
    this.store.set(slotId, { state: cloned, savedAtIso });
  }

  async loadState(slotId: string): Promise<SimulationState | null> {
    const entry = this.store.get(slotId);
    if (!entry) return null;
    return JSON.parse(JSON.stringify(entry.state)) as SimulationState;
  }

  async listSlots(): Promise<SaveSlotSummary[]> {
    const list: SaveSlotSummary[] = [];
    for (const [slotId, entry] of this.store.entries()) {
      list.push({
        slotId,
        savedAtIso: entry.savedAtIso,
        turnMonth: entry.state.turnMonth,
        role: entry.state.role,
        difficulty: entry.state.difficulty
      });
    }
    return list;
  }

  exportPortableCode(state: SimulationState): string {
    const json = JSON.stringify(state);
    return `ARGSIM1:${Buffer.from(json, 'utf8').toString('base64url')}`;
  }

  importPortableCode(code: string): SimulationState {
    if (!code.startsWith('ARGSIM1:')) {
      throw new Error('Prefijo de codigo de partida invalido');
    }
    const payload = code.slice('ARGSIM1:'.length);
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as SimulationState;
    if (typeof parsed.turnMonth !== 'number' || !parsed.centralBank) {
      throw new Error('Estructura de estado corrupta');
    }
    return parsed;
  }
}
