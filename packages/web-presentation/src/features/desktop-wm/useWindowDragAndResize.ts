import { useEffect, useRef } from 'react';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  type DesktopWorkspaceBounds,
  type WindowRect
} from './windowManagerTypes.js';

// Hook y helpers puros de arrastre por barra de titulo y redimensionado desde bordes
// izquierdo, derecho, inferior y esquinas sin depender de librerias externas.

export type WindowDragMode =
  | 'move'
  | 'left'
  | 'right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right';

interface ActiveDragSession {
  mode: WindowDragMode;
  startX: number;
  startY: number;
  startRect: WindowRect;
}

function clampBetween(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function resizeRightEdge(start: WindowRect, dx: number, bounds: DesktopWorkspaceBounds): { x: number; width: number } {
  const maxWidth = Math.max(MIN_WINDOW_WIDTH, bounds.width - start.x - 6);
  return {
    x: start.x,
    width: clampBetween(Math.round(start.width + dx), MIN_WINDOW_WIDTH, maxWidth)
  };
}

function resizeLeftEdge(start: WindowRect, dx: number): { x: number; width: number } {
  const rightEdge = start.x + start.width;
  const maxAllowedW = Math.max(MIN_WINDOW_WIDTH, rightEdge - 6);
  const nextWidth = clampBetween(Math.round(start.width - dx), MIN_WINDOW_WIDTH, maxAllowedW);
  return {
    x: Math.round(rightEdge - nextWidth),
    width: nextWidth
  };
}

function resizeBottomEdge(start: WindowRect, dy: number, bounds: DesktopWorkspaceBounds): number {
  const maxH = Math.max(MIN_WINDOW_HEIGHT, bounds.height - start.y - 6);
  return clampBetween(Math.round(start.height + dy), MIN_WINDOW_HEIGHT, maxH);
}

function moveWindowRect(
  start: WindowRect,
  dx: number,
  dy: number,
  bounds: DesktopWorkspaceBounds
): WindowRect {
  const maxX = Math.max(6, bounds.width - start.width - 6);
  const maxY = Math.max(6, bounds.height - 48);
  return {
    ...start,
    x: clampBetween(Math.round(start.x + dx), 6, maxX),
    y: clampBetween(Math.round(start.y + dy), 6, maxY)
  };
}

const LEFT_MODES = new Set<WindowDragMode>(['left', 'bottom-left']);
const RIGHT_MODES = new Set<WindowDragMode>(['right', 'bottom-right']);
const BOTTOM_MODES = new Set<WindowDragMode>(['bottom', 'bottom-left', 'bottom-right']);

function resolveHorizontalBox(
  mode: WindowDragMode,
  start: WindowRect,
  dx: number,
  bounds: DesktopWorkspaceBounds
): { x: number; width: number } {
  if (LEFT_MODES.has(mode)) return resizeLeftEdge(start, dx);
  if (RIGHT_MODES.has(mode)) return resizeRightEdge(start, dx, bounds);
  return { x: start.x, width: start.width };
}

export function computeResizedWindowRect(
  mode: WindowDragMode,
  startRect: WindowRect,
  dx: number,
  dy: number,
  bounds: DesktopWorkspaceBounds
): WindowRect {
  if (mode === 'move') {
    return moveWindowRect(startRect, dx, dy, bounds);
  }
  const hRes = resolveHorizontalBox(mode, startRect, dx, bounds);
  const nextHeight = BOTTOM_MODES.has(mode)
    ? resizeBottomEdge(startRect, dy, bounds)
    : startRect.height;

  return {
    x: hRes.x,
    y: startRect.y,
    width: hRes.width,
    height: nextHeight
  };
}

export function useWindowDragAndResize({
  rect,
  bounds,
  maximized,
  onFocus,
  onUpdateRect,
  onDraggingChange
}: {
  rect: WindowRect;
  bounds: DesktopWorkspaceBounds;
  maximized: boolean;
  onFocus: () => void;
  onUpdateRect: (next: WindowRect) => void;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const sessionRef = useRef<ActiveDragSession | null>(null);
  const callbacksRef = useRef({ onUpdateRect, onDraggingChange, bounds });
  callbacksRef.current = { onUpdateRect, onDraggingChange, bounds };

  useEffect(() => {
    const handleMove = (ev: PointerEvent) => {
      const s = sessionRef.current;
      if (!s) return;
      const next = computeResizedWindowRect(
        s.mode,
        s.startRect,
        ev.clientX - s.startX,
        ev.clientY - s.startY,
        callbacksRef.current.bounds
      );
      callbacksRef.current.onUpdateRect(next);
    };

    const handleUp = () => {
      if (!sessionRef.current) return;
      sessionRef.current = null;
      callbacksRef.current.onDraggingChange(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  const startInteraction = (mode: WindowDragMode) => (ev: React.PointerEvent) => {
    if (ev.button !== 0 || maximized) return;
    ev.preventDefault();
    ev.stopPropagation();
    onFocus();
    sessionRef.current = {
      mode,
      startX: ev.clientX,
      startY: ev.clientY,
      startRect: rect
    };
    onDraggingChange(true);
  };

  return { startInteraction };
}
