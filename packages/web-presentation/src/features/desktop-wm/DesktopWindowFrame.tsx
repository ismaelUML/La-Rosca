import React from 'react';
import {
  Maximize2,
  Minimize2,
  Minus,
  PanelLeft,
  PanelRight,
  Pin,
  X
} from 'lucide-react';
import type {
  DesktopWindowInstance,
  DesktopWorkspaceBounds,
  WindowRect,
  WindowSnapSide
} from './windowManagerTypes.js';
import { useWindowDragAndResize, type WindowDragMode } from './useWindowDragAndResize.js';

// Marco de ventana estilo Windows / OS tactico: barra arrastrable, anclaje izq/der,
// minimizar a taskbar, maximizar, fijar para multi-ventana y bordes redimensionables.

interface DesktopWindowFrameProps<TSection extends string> {
  win: DesktopWindowInstance<TSection>;
  bounds: DesktopWorkspaceBounds;
  isFocused: boolean;
  onFocus: () => void;
  onUpdateRect: (next: WindowRect) => void;
  onDraggingChange: (dragging: boolean) => void;
  onTogglePin: () => void;
  onSnap: (side: Exclude<WindowSnapSide, 'NONE'>) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

function WindowPinButton({ pinned, onTogglePin }: { pinned: boolean; onTogglePin: () => void }) {
  const cls = pinned
    ? 'bg-[#EB3F7D]/20 text-[#EB3F7D]'
    : 'text-slate-400 hover:text-[#EFE9DA] hover:bg-white/10';
  const title = pinned
    ? 'Desfijar ventana (las pestañas nuevas volverán a usarla)'
    : 'Fijar ventana para abrir otra al lado';
  return (
    <button
      type="button"
      onClick={onTogglePin}
      title={title}
      className={`p-1 rounded transition ${cls}`}
    >
      <Pin className="w-3.5 h-3.5" />
    </button>
  );
}

function WindowTitleControls({
  pinned,
  maximized,
  onTogglePin,
  onSnap,
  onMinimize,
  onToggleMaximize,
  onClose
}: {
  pinned: boolean;
  maximized: boolean;
  onTogglePin: () => void;
  onSnap: (side: Exclude<WindowSnapSide, 'NONE'>) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}) {
  const stopDragPropagation = (ev: React.PointerEvent) => ev.stopPropagation();

  return (
    <div className="flex items-center gap-1 shrink-0" onPointerDown={stopDragPropagation}>
      <WindowPinButton pinned={pinned} onTogglePin={onTogglePin} />

      <button
        type="button"
        onClick={() => onSnap('LEFT')}
        title="Acoplar a la izquierda"
        className="hidden sm:inline-flex p-1 rounded text-slate-400 hover:text-[#EFE9DA] hover:bg-white/10 transition"
      >
        <PanelLeft className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onSnap('RIGHT')}
        title="Acoplar a la derecha"
        className="hidden sm:inline-flex p-1 rounded text-slate-400 hover:text-[#EFE9DA] hover:bg-white/10 transition"
      >
        <PanelRight className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onMinimize}
        title="Minimizar"
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onToggleMaximize}
        title={maximized ? 'Restaurar tamaño' : 'Maximizar ventana'}
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      <button
        type="button"
        onClick={onClose}
        title="Cerrar ventana"
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-rose-500/80 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function WindowResizeHandles({
  maximized,
  startInteraction
}: {
  maximized: boolean;
  startInteraction: (mode: WindowDragMode) => (ev: React.PointerEvent) => void;
}) {
  if (maximized) return null;
  return (
    <>
      <div
        onPointerDown={startInteraction('left')}
        title="Arrastrá para ajustar ancho izquierdo"
        className="absolute top-2 bottom-2 left-0 w-2 cursor-ew-resize hover:bg-amber-400/25 transition-colors z-20"
      />
      <div
        onPointerDown={startInteraction('right')}
        title="Arrastrá para ajustar ancho derecho"
        className="absolute top-2 bottom-2 right-0 w-2 cursor-ew-resize hover:bg-amber-400/25 transition-colors z-20"
      />
      <div
        onPointerDown={startInteraction('bottom')}
        title="Arrastrá para ajustar alto"
        className="absolute left-2 right-2 bottom-0 h-2 cursor-ns-resize hover:bg-amber-400/25 transition-colors z-20"
      />
      <div
        onPointerDown={startInteraction('bottom-left')}
        className="absolute bottom-0 left-0 w-3.5 h-3.5 cursor-nesw-resize z-30"
      />
      <div
        onPointerDown={startInteraction('bottom-right')}
        title="Ajustar tamaño"
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-30 flex items-end justify-end p-0.5 text-slate-500/35 group-hover:text-[#f472b6]/80 transition-colors"
      >
        <span className="text-[9px] leading-none select-none">◢</span>
      </div>
    </>
  );
}

function resolveWindowBoxStyle(
  win: DesktopWindowInstance,
  bounds: DesktopWorkspaceBounds
): React.CSSProperties {
  const isCompactViewport = bounds.width > 0 && bounds.width < 768;
  if (win.maximized || isCompactViewport) {
    return {
      left: 6,
      top: 6,
      width: 'calc(100% - 12px)',
      height: 'calc(100% - 12px)',
      zIndex: win.zIndex
    };
  }
  return {
    left: win.rect.x,
    top: win.rect.y,
    width: win.rect.width,
    height: win.rect.height,
    zIndex: win.zIndex
  };
}

export function DesktopWindowFrame<TSection extends string>({
  win,
  bounds,
  isFocused,
  onFocus,
  onUpdateRect,
  onDraggingChange,
  onTogglePin,
  onSnap,
  onMinimize,
  onToggleMaximize,
  onClose,
  children
}: DesktopWindowFrameProps<TSection>) {
  const { startInteraction } = useWindowDragAndResize({
    rect: win.rect,
    bounds,
    maximized: win.maximized,
    onFocus,
    onUpdateRect,
    onDraggingChange
  });

  if (win.minimized) return null;

  const focusFrameCls = isFocused
    ? 'bg-[#0e080c]/92 border-[#EB3F7D]/60 shadow-[0_20px_50px_rgba(0,0,0,0.82)]'
    : 'bg-[#0a0608]/84 border-white/10 opacity-90 hover:opacity-100 shadow-[0_10px_28px_rgba(0,0,0,0.6)]';

  return (
    <section
      onPointerDown={onFocus}
      style={resolveWindowBoxStyle(win, bounds)}
      className={`group absolute pointer-events-auto rounded-lg border flex flex-col overflow-hidden transition-[box-shadow,opacity,border-color] duration-150 ${focusFrameCls}`}
    >
      <div
        onPointerDown={startInteraction('move')}
        onDoubleClick={onToggleMaximize}
        className={`px-3 py-1 border-b flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none shrink-0 ${
          isFocused
            ? 'bg-[#170c12] border-[#EB3F7D]/35'
            : 'bg-[#10090d] border-white/10'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isFocused ? 'bg-[#EB3F7D]' : 'bg-slate-500'
            }`}
          />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-200 truncate">
            {win.title}
          </span>
        </div>

        <WindowTitleControls
          pinned={win.pinned}
          maximized={win.maximized}
          onTogglePin={onTogglePin}
          onSnap={onSnap}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
          onClose={onClose}
        />
      </div>

      <div className="rosca-window-body flex-1 overflow-auto p-3 sm:p-3.5">{children}</div>

      <WindowResizeHandles maximized={win.maximized} startInteraction={startInteraction} />
    </section>
  );
}
