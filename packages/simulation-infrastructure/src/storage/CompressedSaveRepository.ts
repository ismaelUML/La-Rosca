import type { SaveRepositoryPort, SaveSlotSummary, SimulationState } from '@argentina-sim/domain';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';

// A diferencia de QQG que manda un string crudo a un servidor y explota con
// "500: Unexpected token is not valid JSON", aca comprimimos el binario con zlib
// en el cliente, le pegamos un prefijo versionado y lo validamos antes de tocar el estado.

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8(base64Url: string): Uint8Array {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class CompressedSaveRepository implements SaveRepositoryPort {
  private readonly memoryFallback = new Map<string, { state: SimulationState; savedAtIso: string }>();

  async saveState(slotId: string, state: SimulationState, savedAtIso: string): Promise<void> {
    const cloned = JSON.parse(JSON.stringify(state)) as SimulationState;
    this.memoryFallback.set(slotId, { state: cloned, savedAtIso });
  }

  async loadState(slotId: string): Promise<SimulationState | null> {
    const entry = this.memoryFallback.get(slotId);
    if (!entry) return null;
    return JSON.parse(JSON.stringify(entry.state)) as SimulationState;
  }

  async listSlots(): Promise<SaveSlotSummary[]> {
    const list: SaveSlotSummary[] = [];
    for (const [slotId, entry] of this.memoryFallback.entries()) {
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
    const compressed = zlibSync(strToU8(json), { level: 6 });
    return `ARG2027Z:${uint8ToBase64Url(compressed)}`;
  }

  importPortableCode(code: string): SimulationState {
    const trimmed = code.trim();
    if (!trimmed.startsWith('ARG2027Z:')) {
      throw new Error('Formato de codigo invalido: falta prefijo ARG2027Z:');
    }
    const rawBytes = base64UrlToUint8(trimmed.slice('ARG2027Z:'.length));
    const decompressedJson = strFromU8(unzlibSync(rawBytes));
    const parsed = JSON.parse(decompressedJson) as SimulationState;
    if (typeof parsed.turnMonth !== 'number' || !parsed.centralBank) {
      throw new Error('Payload de partida corrupto o incompleto');
    }
    return parsed;
  }
}

