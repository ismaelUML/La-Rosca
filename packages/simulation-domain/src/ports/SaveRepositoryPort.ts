import type { SimulationState } from '../models/SimulationTypes.js';

export interface SaveSlotSummary {
  slotId: string;
  savedAtIso: string;
  turnMonth: number;
  role: SimulationState['role'];
  difficulty: SimulationState['difficulty'];
}

export interface SaveRepositoryPort {
  saveState(slotId: string, state: SimulationState, savedAtIso: string): Promise<void>;
  loadState(slotId: string): Promise<SimulationState | null>;
  listSlots(): Promise<SaveSlotSummary[]>;
  exportPortableCode(state: SimulationState): string;
  importPortableCode(code: string): SimulationState;
}
