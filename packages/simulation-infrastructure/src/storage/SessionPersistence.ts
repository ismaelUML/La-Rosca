import type { PersistedGameSession } from '@argentina-sim/domain';

// Si el usuario le clava F5 a la pestana del navegador a mitad de una corrida o despues
// de ajustar el crawling peg y los votos de las provincias, no podemos dejar que se le borre
// toda la presidencia y lo tire de prepo a la pantalla de inicio como si no hubiera pasado nada.
// Este adaptador persiste la sesion viva en localStorage con validacion de version para no
// romper el parser si manana cambiamos el schema.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DEFAULT_SESSION_STORAGE_KEY = 'LA_ROSCA_ARGENTINA_SESSION_V1';

function resolveStorage(customStorage?: StorageLike): StorageLike | null {
  if (customStorage) {
    return customStorage;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage ?? null;
}

function isObjectPayload(data: unknown): data is Record<string, unknown> {
  return Boolean(data) && typeof data === 'object';
}

function isValidSessionPayload(data: unknown): data is PersistedGameSession {
  if (!isObjectPayload(data)) {
    return false;
  }
  const candidate = data as Partial<PersistedGameSession>;
  return candidate.version === 1 && Boolean(candidate.setup) && Boolean(candidate.governmentState);
}

function parseSessionJson(raw: string): PersistedGameSession | null {
  try {
    const parsed = JSON.parse(raw);
    return isValidSessionPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadSessionFromStorage(
  customStorage?: StorageLike,
  key = DEFAULT_SESSION_STORAGE_KEY
): PersistedGameSession | null {
  const storage = resolveStorage(customStorage);
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }
  return parseSessionJson(raw);
}

export function saveSessionToStorage(
  session: PersistedGameSession,
  customStorage?: StorageLike,
  key = DEFAULT_SESSION_STORAGE_KEY
): boolean {
  const storage = resolveStorage(customStorage);
  if (!storage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(session);
    storage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function clearSessionFromStorage(
  customStorage?: StorageLike,
  key = DEFAULT_SESSION_STORAGE_KEY
): void {
  const storage = resolveStorage(customStorage);
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch {
    // Si el storage esta bloqueado por politicas de privacidad, evitamos tirar un crash.
  }
}

export function hasSessionInStorage(
  customStorage?: StorageLike,
  key = DEFAULT_SESSION_STORAGE_KEY
): boolean {
  return loadSessionFromStorage(customStorage, key) !== null;
}
