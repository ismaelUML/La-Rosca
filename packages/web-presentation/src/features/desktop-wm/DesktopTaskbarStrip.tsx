import React from 'react';
import { AppWindow, Map as MapIcon, RotateCcw, X } from 'lucide-react';
import type { DesktopWindowInstance } from './windowManagerTypes.js';

// Barra de tareas inferior tipo mini Windows arriba del zocalo TV:
// lista todas las ventanas abiertas o minimizadas para restaurarlas al frente o ver el mapa 3D.

interface DesktopTaskbarStripProps<TSection extends string> {
  windows: DesktopWindowInstance<TSection>[];
  focusedWindowId: string | null;
  hasVisibleWindows: boolean;
  onFocusOrRestore: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onToggleDesktopView: () => void;
  onResetLayout: () => void;
}

function resolveTaskPillStyle(isActive: boolean, minimized: boolean): string {
  if (isActive && !minimized) {
    return 'bg-[#1a2940]/90 text-amber-200 border-amber-400/60 shadow-[0_0_12px_rgba(201,162,77,0.12)]';
  }
  if (minimized) {
    return 'bg-[#080b11]/80 text-slate-400 border-white/10 italic hover:text-slate-200';
  }
  return 'bg-[#0e1522]/85 text-slate-200 border-[#2b384d]/80 hover:border-slate-400';
}

export function DesktopTaskbarStrip<TSection extends string>({
  windows,
  focusedWindowId,
  hasVisibleWindows,
  onFocusOrRestore,
  onCloseWindow,
  onToggleDesktopView,
  onResetLayout
}: DesktopTaskbarStripProps<TSection>) {
  return (
    <div className="bg-[#070b11]/95 border-t border-[#202a3b] px-3 py-1 z-30 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 shrink-0">
            <AppWindow className="w-3 h-3 text-amber-400/80" />
            Escritorio
          </span>

          {windows.length === 0 ? (
            <span className="text-[10px] font-mono text-slate-500">
              Mapa 3D despejado · Elegí una pestaña arriba o apretá el botón + para abrir ventanas en paralelo
            </span>
          ) : (
            windows.map((win) => {
              const isActive = win.id === focusedWindowId;
              const pillCls = resolveTaskPillStyle(isActive, win.minimized);
              return (
                <div
                  key={win.id}
                  className={`inline-flex items-center rounded-md border text-[10px] font-mono transition shrink-0 ${pillCls}`}
                >
                  <button
                    type="button"
                    onClick={() => onFocusOrRestore(win.id)}
                    className="px-2 py-0.5 max-w-[160px] truncate text-left"
                  >
                    {win.minimized ? `▾ ${win.title}` : win.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCloseWindow(win.id)}
                    title={`Cerrar ${win.title}`}
                    className="pr-1.5 pl-0.5 py-0.5 text-slate-400 hover:text-rose-300"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onResetLayout}
            title="Restaurar posición y tamaño inicial de ventanas"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0c1119] hover:bg-[#172233] border border-[#263142] text-[10px] font-mono text-slate-300 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reordenar</span>
          </button>

          <button
            type="button"
            onClick={onToggleDesktopView}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#121d2d] hover:bg-[#1c2b42] border border-[#3a4f70] text-[10px] font-mono font-bold text-sky-200 transition"
          >
            <MapIcon className="w-3 h-3 text-amber-300" />
            <span>{hasVisibleWindows ? 'Minimizar Todo' : 'Mostrar Ventanas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
