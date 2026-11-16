import { describe, expect, it } from 'vitest';
import {
  clampWindowRectToBounds,
  computeDefaultWindowRect,
  computeSnapWindowRect,
  MIN_WINDOW_WIDTH
} from '../src/features/desktop-wm/windowManagerTypes.js';
import { computeResizedWindowRect } from '../src/features/desktop-wm/useWindowDragAndResize.js';

describe('Desktop Window Manager (Mini Windows sobre Mapa 3D)', () => {
  const bounds = { width: 1280, height: 720 };

  it('ajusta el ancho izquierdo manteniendo anclado el borde derecho', () => {
    const start = { x: 200, y: 20, width: 500, height: 400 };
    const pulledLeft = computeResizedWindowRect('left', start, -80, 0, bounds);
    expect(pulledLeft.x).toBe(120);
    expect(pulledLeft.width).toBe(580);
    expect(pulledLeft.x + pulledLeft.width).toBe(700);

    const crushed = computeResizedWindowRect('left', start, 400, 0, bounds);
    expect(crushed.width).toBe(MIN_WINDOW_WIDTH);
    expect(crushed.x).toBe(700 - MIN_WINDOW_WIDTH);
  });

  it('redimensiona borde derecho, esquina inferior derecha y mueve sin salirse del escritorio', () => {
    const start = { x: 40, y: 30, width: 500, height: 420 };
    const resized = computeResizedWindowRect('bottom-right', start, 150, 90, bounds);
    expect(resized).toEqual({ x: 40, y: 30, width: 650, height: 510 });

    const movedFar = computeResizedWindowRect('move', start, 2000, -500, bounds);
    expect(movedFar.x).toBe(bounds.width - start.width - 6);
    expect(movedFar.y).toBe(6);
  });

  it('acopla ventanas a izquierda y derecha y adapta dimensiones al reducir pantalla', () => {
    const leftSnap = computeSnapWindowRect('LEFT', bounds);
    const rightSnap = computeSnapWindowRect('RIGHT', bounds);
    expect(leftSnap.x).toBe(8);
    expect(rightSnap.x).toBeGreaterThan(leftSnap.width);
    expect(rightSnap.width).toBe(leftSnap.width);

    const defaultRect = computeDefaultWindowRect(bounds, 0);
    const clampedSmall = clampWindowRectToBounds(defaultRect, { width: 600, height: 480 });
    expect(clampedSmall.width).toBeLessThanOrEqual(600 - 12);
    expect(clampedSmall.height).toBeLessThanOrEqual(480 - 12);
  });
});
