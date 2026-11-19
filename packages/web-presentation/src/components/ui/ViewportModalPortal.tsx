import type React from 'react';
import { createPortal } from 'react-dom';

// Monta los modales directo en document.body para que position:fixed cubra todo el viewport
// en lugar de quedar recortado por backdrop-blur o container-type dentro de ventanas flotantes.
export function ViewportModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') {
    return <>{children}</>;
  }
  return createPortal(children, document.body);
}
