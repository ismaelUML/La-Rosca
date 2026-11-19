import React from 'react';
import type { DesktopWindowInstance, DesktopWorkspaceBounds, WindowRect, WindowSnapSide } from './windowManagerTypes.js';
import { DesktopWindowFrame } from './DesktopWindowFrame.js';

// Capa compartida que renderiza todas las ventanas activas por encima del mapa 3D
// dejando el resto del lienzo transparente a los clics del mapa salvo mientras se arrastra.

interface DesktopWindowsLayerProps<TSection extends string> {
  visibleWindows: DesktopWindowInstance<TSection>[];
  focusedWindowId: string | null;
  bounds: DesktopWorkspaceBounds;
  topBanners?: React.ReactNode;
  onFocusWindow: (id: string) => void;
  onUpdateRect: (id: string, rect: WindowRect) => void;
  onDraggingChange: (dragging: boolean) => void;
  onTogglePin: (id: string) => void;
  onSnap: (id: string, side: Exclude<WindowSnapSide, 'NONE'>) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onClose: (id: string) => void;
  renderSection: (section: TSection) => React.ReactNode;
}

export function DesktopWindowsLayer<TSection extends string>({
  visibleWindows,
  focusedWindowId,
  bounds,
  topBanners,
  onFocusWindow,
  onUpdateRect,
  onDraggingChange,
  onTogglePin,
  onSnap,
  onMinimize,
  onToggleMaximize,
  onClose,
  renderSection
}: DesktopWindowsLayerProps<TSection>) {
  if (visibleWindows.length === 0) return null;

  return (
    <main className="relative z-30 h-full w-full pointer-events-none overflow-hidden">
      {visibleWindows.map((win) => (
        <DesktopWindowFrame
          key={win.id}
          win={win}
          bounds={bounds}
          isFocused={win.id === focusedWindowId}
          onFocus={() => onFocusWindow(win.id)}
          onUpdateRect={(next) => onUpdateRect(win.id, next)}
          onDraggingChange={onDraggingChange}
          onTogglePin={() => onTogglePin(win.id)}
          onSnap={(side) => onSnap(win.id, side)}
          onMinimize={() => onMinimize(win.id)}
          onToggleMaximize={() => onToggleMaximize(win.id)}
          onClose={() => onClose(win.id)}
        >
          {win.id === focusedWindowId ? topBanners : null}
          {renderSection(win.section)}
        </DesktopWindowFrame>
      ))}
    </main>
  );
}
