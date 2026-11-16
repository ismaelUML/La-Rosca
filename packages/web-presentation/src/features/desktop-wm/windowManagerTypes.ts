// Tipos, matematica pura de rectangulo y persistencia en localStorage para el
// gestor multi-ventana ("Mini Windows") encima del mapa 3D vivo de Argentina.

export type WindowSnapSide = 'NONE' | 'LEFT' | 'RIGHT';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopWorkspaceBounds {
  width: number;
  height: number;
}

export interface DesktopWindowInstance<TSection extends string = string> {
  id: string;
  section: TSection;
  title: string;
  rect: WindowRect;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  pinned: boolean;
  snap: WindowSnapSide;
}

export const MIN_WINDOW_WIDTH = 340;
export const MIN_WINDOW_HEIGHT = 240;

function clampVal(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeDefaultWindowRect(
  bounds: DesktopWorkspaceBounds,
  cascadeIndex: number
): WindowRect {
  const safeW = Math.max(MIN_WINDOW_WIDTH, bounds.width - 24);
  const safeH = Math.max(MIN_WINDOW_HEIGHT, bounds.height - 24);
  const targetW = clampVal(Math.round(bounds.width * 0.62), MIN_WINDOW_WIDTH, Math.min(820, safeW));
  const targetH = clampVal(Math.round(bounds.height * 0.88), MIN_WINDOW_HEIGHT, safeH);
  const offset = (cascadeIndex % 5) * 28;
  const x = clampVal(16 + offset, 8, Math.max(8, bounds.width - targetW - 8));
  const y = clampVal(12 + offset, 8, Math.max(8, bounds.height - targetH - 8));
  return { x, y, width: targetW, height: targetH };
}

export function computeSnapWindowRect(
  side: Exclude<WindowSnapSide, 'NONE'>,
  bounds: DesktopWorkspaceBounds
): WindowRect {
  const gap = 8;
  const halfW = clampVal(Math.floor(bounds.width * 0.48), MIN_WINDOW_WIDTH, Math.max(MIN_WINDOW_WIDTH, bounds.width - gap * 2));
  const fullH = Math.max(MIN_WINDOW_HEIGHT, bounds.height - gap * 2);
  const x = side === 'LEFT' ? gap : Math.max(gap, bounds.width - halfW - gap);
  return { x, y: gap, width: halfW, height: fullH };
}

export function clampWindowRectToBounds(
  rect: WindowRect,
  bounds: DesktopWorkspaceBounds
): WindowRect {
  if (bounds.width <= 100 || bounds.height <= 100) return rect;
  const maxW = Math.max(MIN_WINDOW_WIDTH, bounds.width - 12);
  const maxH = Math.max(MIN_WINDOW_HEIGHT, bounds.height - 12);
  const width = clampVal(rect.width, MIN_WINDOW_WIDTH, maxW);
  const height = clampVal(rect.height, MIN_WINDOW_HEIGHT, maxH);
  const x = clampVal(rect.x, 6, Math.max(6, bounds.width - width - 6));
  const y = clampVal(rect.y, 6, Math.max(6, bounds.height - height - 6));
  return { x, y, width, height };
}

export function loadPersistedWindows<TSection extends string>(
  storageKey: string
): DesktopWindowInstance<TSection>[] | null {
  try {
    const raw = window.localStorage.getItem(`la-rosca-wm-${storageKey}-v1`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedWindows<TSection extends string>(
  storageKey: string,
  windows: DesktopWindowInstance<TSection>[]
): void {
  try {
    window.localStorage.setItem(`la-rosca-wm-${storageKey}-v1`, JSON.stringify(windows));
  } catch {
    // Si localStorage esta lleno o en privado, no frenamos la UI.
  }
}
