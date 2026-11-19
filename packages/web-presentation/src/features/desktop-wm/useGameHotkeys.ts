import { useEffect } from 'react';

// Atajos de teclado tácticos para evitar fatiga en 48 turnos:
// M (alternar mapa/ventanas), Esc (cerrar ventana activa), 1..5 (grupos del dock), Espacio (avanzar mes).

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function isInteractiveButton(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A');
}

interface UseGameHotkeysOptions {
  disabled: boolean;
  groupCount: number;
  onToggleDesktop: () => void;
  onCloseTopWindow: () => void;
  onOpenGroupIndex: (index: number) => void;
  onAdvanceTurn: () => void;
}

function handleDigitGroupKey(ev: KeyboardEvent, opts: UseGameHotkeysOptions): boolean {
  const num = Number(ev.key);
  if (num < 1 || num > opts.groupCount) return false;
  ev.preventDefault();
  opts.onOpenGroupIndex(num - 1);
  return true;
}

function handleSingleKey(ev: KeyboardEvent, opts: UseGameHotkeysOptions): void {
  const lower = ev.key.toLowerCase();
  if (lower === 'm') {
    ev.preventDefault();
    opts.onToggleDesktop();
    return;
  }
  if (ev.key === 'Escape') {
    opts.onCloseTopWindow();
    return;
  }
  if (ev.key === ' ' && !isInteractiveButton(ev.target)) {
    ev.preventDefault();
    opts.onAdvanceTurn();
    return;
  }
  handleDigitGroupKey(ev, opts);
}

export function useGameHotkeys(options: UseGameHotkeysOptions): void {
  useEffect(() => {
    if (options.disabled) return undefined;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey || isEditableElement(ev.target)) return;
      handleSingleKey(ev, options);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options]);
}
