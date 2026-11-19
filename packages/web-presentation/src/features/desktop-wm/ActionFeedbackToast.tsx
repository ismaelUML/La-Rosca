import React from 'react';

// Toast táctil estilo cable de agencia (abajo a la derecha): le da peso físico
// a cada decreto, giro de ATN, obra federal o llamado a gobernadores.

export interface FeedbackToastMessage {
  id: number;
  tag: string;
  text: string;
}

export function ActionFeedbackToast({ toast }: { toast: FeedbackToastMessage | null }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      className="pointer-events-none fixed bottom-12 right-5 z-[70] max-w-sm bg-[#EFE9DA] text-[#090407] border-2 border-[#EB3F7D] shadow-[0_14px_38px_rgba(0,0,0,0.75)] px-3.5 py-2.5 rosca-toast-pop"
    >
      <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#EB3F7D]">
        ▸ {toast.tag}
      </div>
      <div className="text-xs font-bold leading-snug mt-0.5">{toast.text}</div>
    </div>
  );
}
