import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampWindowRectToBounds,
  computeDefaultWindowRect,
  computeSnapWindowRect,
  loadPersistedWindows,
  savePersistedWindows,
  type DesktopWindowInstance,
  type DesktopWorkspaceBounds,
  type WindowRect,
  type WindowSnapSide
} from './windowManagerTypes.js';

// Hook gestor de escritorio multi-ventana: controla foco/zIndex, apertura paralela,
// acoplado izquierda/derecha, minimizado en barra y persistencia local por modo.

function findMaxZ<T extends string>(windows: DesktopWindowInstance<T>[]): number {
  let maxZ = 10;
  for (const w of windows) {
    if (w.zIndex > maxZ) maxZ = w.zIndex;
  }
  return maxZ;
}

function buildInitialWindowList<T extends string>(
  storageKey: string,
  defaultSection: T,
  resolveTitle: (sec: T) => string
): DesktopWindowInstance<T>[] {
  const saved = loadPersistedWindows<T>(storageKey);
  if (saved && saved.length > 0) return saved;
  return [
    {
      id: `WIN_${defaultSection}`,
      section: defaultSection,
      title: resolveTitle(defaultSection),
      rect: { x: 16, y: 12, width: 760, height: 540 },
      zIndex: 11,
      minimized: false,
      maximized: false,
      pinned: false,
      snap: 'NONE'
    }
  ];
}

function morphUnpinnedOrCreate<T extends string>(
  prev: DesktopWindowInstance<T>[],
  section: T,
  title: string,
  bounds: DesktopWorkspaceBounds,
  forceNew: boolean
): DesktopWindowInstance<T>[] {
  const nextZ = findMaxZ(prev) + 1;
  const unpinnedIdx = forceNew ? -1 : prev.findIndex((w) => !w.pinned);

  if (unpinnedIdx >= 0) {
    return prev.map((w, idx) =>
      idx === unpinnedIdx
        ? { ...w, section, title, minimized: false, zIndex: nextZ }
        : w
    );
  }

  const trimmed = prev.length >= 6 ? prev.slice(1) : prev;
  const created: DesktopWindowInstance<T> = {
    id: `WIN_${section}_${Date.now().toString(36)}`,
    section,
    title,
    rect: computeDefaultWindowRect(bounds, trimmed.length),
    zIndex: nextZ,
    minimized: false,
    maximized: false,
    pinned: forceNew,
    snap: 'NONE'
  };
  return [...trimmed, created];
}

function restoreOrToggleMinimizedList<T extends string>(
  prev: DesktopWindowInstance<T>[]
): DesktopWindowInstance<T>[] {
  const anyVisible = prev.some((w) => !w.minimized);
  return prev.map((w) => ({ ...w, minimized: anyVisible }));
}

function focusExistingSection<T extends string>(
  prev: DesktopWindowInstance<T>[],
  existingId: string
): DesktopWindowInstance<T>[] {
  const nextZ = findMaxZ(prev) + 1;
  return prev.map((w) =>
    w.id === existingId ? { ...w, minimized: false, zIndex: nextZ } : w
  );
}

export function useDesktopWindowManager<TSection extends string>(
  storageKey: string,
  defaultSection: TSection,
  resolveTitle: (sec: TSection) => string,
  onSyncActiveSection: (sec: TSection) => void
) {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState<DesktopWorkspaceBounds>({ width: 1200, height: 640 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  const [windows, setWindows] = useState<DesktopWindowInstance<TSection>[]>(() =>
    buildInitialWindowList(storageKey, defaultSection, resolveTitle)
  );

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return undefined;
    const syncBounds = () => {
      const next = { width: el.clientWidth, height: el.clientHeight };
      setBounds(next);
      setWindows((prev) =>
        prev.map((w) => ({ ...w, rect: clampWindowRectToBounds(w.rect, next) }))
      );
    };
    syncBounds();
    const ro = new ResizeObserver(syncBounds);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    savePersistedWindows(storageKey, windows);
  }, [storageKey, windows]);

  const openSectionWindow = useCallback(
    (section: TSection, forceNew = false) => {
      onSyncActiveSection(section);
      const title = resolveTitle(section);
      setWindows((prev) => {
        const existing = prev.find((w) => w.section === section);
        if (existing) return focusExistingSection(prev, existing.id);
        return morphUnpinnedOrCreate(prev, section, title, bounds, forceNew);
      });
    },
    [bounds, onSyncActiveSection, resolveTitle]
  );

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => focusExistingSection(prev, id));
  }, []);

  const updateWindowRect = useCallback((id: string, nextRect: WindowRect) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, rect: nextRect, snap: 'NONE', pinned: true } : w
      )
    );
  }, []);

  const togglePinWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w))
    );
  }, []);

  const snapWindow = useCallback(
    (id: string, side: Exclude<WindowSnapSide, 'NONE'>) => {
      const targetRect = computeSnapWindowRect(side, bounds);
      setWindows((prev) => {
        const nextZ = findMaxZ(prev) + 1;
        return prev.map((w) =>
          w.id === id
            ? { ...w, rect: targetRect, snap: side, maximized: false, minimized: false, pinned: true, zIndex: nextZ }
            : w
        );
      });
    },
    [bounds]
  );

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const toggleMaximizeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const nextZ = findMaxZ(prev) + 1;
      return prev.map((w) =>
        w.id === id
          ? { ...w, maximized: !w.maximized, minimized: false, pinned: true, zIndex: nextZ }
          : w
      );
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleShowDesktop = useCallback(() => {
    setWindows((prev) => {
      if (prev.length === 0) {
        return morphUnpinnedOrCreate([], defaultSection, resolveTitle(defaultSection), bounds, false);
      }
      return restoreOrToggleMinimizedList(prev);
    });
  }, [bounds, defaultSection, resolveTitle]);

  const resetDesktopLayout = useCallback(() => {
    const fresh: DesktopWindowInstance<TSection> = {
      id: `WIN_${defaultSection}_${Date.now().toString(36)}`,
      section: defaultSection,
      title: resolveTitle(defaultSection),
      rect: computeDefaultWindowRect(bounds, 0),
      zIndex: 11,
      minimized: false,
      maximized: false,
      pinned: false,
      snap: 'NONE'
    };
    onSyncActiveSection(defaultSection);
    setWindows([fresh]);
  }, [bounds, defaultSection, onSyncActiveSection, resolveTitle]);

  const visibleWindows = windows.filter((w) => !w.minimized);
  const focusedWin = [...visibleWindows].sort((a, b) => b.zIndex - a.zIndex)[0] ?? null;

  return {
    workspaceRef,
    bounds,
    windows,
    visibleWindows,
    focusedWindowId: focusedWin?.id ?? null,
    hasVisibleWindows: visibleWindows.length > 0,
    isDraggingWindow,
    setIsDraggingWindow,
    openSectionWindow,
    focusWindow,
    updateWindowRect,
    togglePinWindow,
    snapWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    closeWindow,
    toggleShowDesktop,
    resetDesktopLayout
  };
}
