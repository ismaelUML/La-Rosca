import React from 'react';
import {
  VETO_BLOCKING_THIRD_DEPUTIES,
  type OppositionBillResolution,
  type PendingOppositionBill
} from '@argentina-sim/domain';
import { ViewportModalPortal } from '../../components/ui/ViewportModalPortal.js';
import { formatArNumber } from '../../lib/formatters.js';

// Ofensiva Legislativa Opositora en estética Boletín Legislativo (papel crema + tinta obsidiana + acento rosado):
// muestra tus diputados aliados reales frente al tercio de 86 necesario para blindar un veto presidencial.

function resolveVetoButtonCopy(alliedDeputies: number): { title: string; subtitle: string } {
  const shielded = alliedDeputies >= VETO_BLOCKING_THIRD_DEPUTIES;
  if (shielded) {
    return {
      title: `Vetar Ley (Tercio Blindado: ${alliedDeputies}/86 dip.)`,
      subtitle: 'Frenás el gasto fiscal · +3 credibilidad · -1,4 % aprobación · -4 relación bloques'
    };
  }
  return {
    title: `Vetar Ley (Riesgo de Rechazo: ${alliedDeputies}/86 dip.)`,
    subtitle: 'Sin 86 aliados la oposición insiste con 2/3: pasa la ley igual y perdés -2,6 % imagen'
  };
}

export function OppositionBillModal({
  bill,
  alliedDeputies,
  onResolve
}: {
  bill: PendingOppositionBill;
  alliedDeputies: number;
  onResolve: (resolution: OppositionBillResolution) => void;
}) {
  const veto = resolveVetoButtonCopy(alliedDeputies);
  const costText =
    bill.fiscalCostPctGdp > 0
      ? `+${formatArNumber(bill.fiscalCostPctGdp, 2)} % PBI de gasto`
      : 'Recorta capital político a 2 decisiones/mes';
  const shieldTone =
    alliedDeputies >= VETO_BLOCKING_THIRD_DEPUTIES ? 'text-emerald-700' : 'text-rose-700';

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
        <div className="my-auto w-full max-w-xl bg-[#EFE9DA] text-[#090407] border-4 border-[#090407] shadow-[0_25px_80px_rgba(0,0,0,0.9)] p-6 space-y-5">
          <div className="border-b-2 border-[#090407] pb-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2 py-0.5 bg-[#EB3F7D] text-[#090407] text-[10px] font-mono font-extrabold uppercase tracking-widest">
                SANCIÓN DEL CONGRESO · OFENSIVA OPOSITORA
              </span>
              <span className="text-[11px] font-mono font-bold uppercase text-[#090407]/75">
                Impulsa: {bill.sponsorBloc}
              </span>
            </div>
            <h2 className="font-display text-3xl uppercase tracking-wide leading-tight">
              {bill.title}
            </h2>
            <p className="text-sm font-medium leading-relaxed text-[#090407]/85">{bill.summary}</p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono font-bold">
              <span>Impacto: {costText}</span>
              <span className={shieldTone}>
                Tercio de veto: {alliedDeputies} / {VETO_BLOCKING_THIRD_DEPUTIES} diputados
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onResolve('VETAR')}
              className="w-full text-left p-3.5 bg-[#090407] hover:bg-[#1e1018] text-[#EFE9DA] border-2 border-[#090407] transition"
            >
              <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#EB3F7D]">
                {veto.title}
              </div>
              <div className="text-[11px] font-mono text-[#EFE9DA]/80 mt-0.5">{veto.subtitle}</div>
            </button>

            <button
              type="button"
              onClick={() => onResolve('NEGOCIAR')}
              className="w-full text-left p-3.5 bg-[#EB3F7D] hover:bg-[#f2558d] text-[#090407] border-2 border-[#090407] transition"
            >
              <div className="text-xs font-mono font-extrabold uppercase tracking-wider">
                Negociar Versión Intermedia con Bloques Dialoguistas
              </div>
              <div className="text-[11px] font-mono text-[#090407]/85 mt-0.5">
                Reduce impacto a la mitad · +0,06 % ATN · +4 relación bloques · +0,4 % imagen
              </div>
            </button>

            <button
              type="button"
              onClick={() => onResolve('PROMULGAR')}
              className="w-full text-left p-3.5 bg-white/75 hover:bg-white text-[#090407] border-2 border-[#090407]/40 transition"
            >
              <div className="text-xs font-mono font-extrabold uppercase tracking-wider">
                Promulgar la Ley sin Vetar
              </div>
              <div className="text-[11px] font-mono text-[#090407]/75 mt-0.5">
                Asumís {costText} · +1,8 % imagen popular · +5 relación con la oposición
              </div>
            </button>
          </div>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
