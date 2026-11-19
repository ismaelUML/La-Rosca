import React from 'react';

// Isotipo firma de La Rosca: anillo abierto en Rosado Casa Rosada que evoca
// una rosca estilizada y la "C" institucional del juego.
export function RoscaLogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-label="Logo La Rosca"
      className="shrink-0"
    >
      <path
        d="M27.6 11.4A11.5 11.5 0 1 0 28.4 23.6"
        stroke="#EB3F7D"
        strokeWidth="6.2"
        strokeLinecap="butt"
      />
      <circle cx="18" cy="18" r="2.6" fill="#EB3F7D" />
    </svg>
  );
}
