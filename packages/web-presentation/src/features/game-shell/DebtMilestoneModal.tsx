import React from 'react';
import type { DebtMilestoneOption, PendingDebtMilestone } from '@argentina-sim/domain';
import { ViewportModalPortal } from '../../components/ui/ViewportModalPortal.js';
import { formatArNumber } from '../../lib/formatters.js';

// Modal de Megavencimiento de Deuda / FMI: obliga a definir cómo enfrentar el pago fuerte
// en vez de rollear silenciosamente sin que el jugador se entere.

interface DebtChoiceSpec {
  option: DebtMilestoneOption;
  title: string;
  effectText: string;
  accentClass: string;
}

function buildDebtChoices(amountBillionUsd: number, netReserves: number): DebtChoiceSpec[] {
  const cashDrain = formatArNumber(amountBillionUsd * 0.45, 1);
  const canPayCash = netReserves >= 6;
  return [
    {
      option: 'PAGAR_RESERVAS',
      title: canPayCash ? `Honrar cash con Reservas (-US$ ${cashDrain} MM)` : 'Sin reservas suficientes (pasa a Canje)',
      effectText: '-75 pb Riesgo País · +4,5 Credibilidad · Señal dura a Wall Street',
      accentClass: 'border-[#EB3F7D] bg-[#1a0a12] hover:bg-[#270e1b]'
    },
    {
      option: 'CANJE_MERCADO',
      title: 'Canje voluntario a tasa de mercado (Rollover caro)',
      effectText: 'Preserva reservas · +0,22 % PBI en intereses anuales · +40 pb Riesgo País',
      accentClass: 'border-white/20 bg-[#12080d] hover:bg-[#1c0d15]'
    },
    {
      option: 'REESTRUCTURAR',
      title: 'Reperfilamiento compulsivo de vencimientos',
      effectText: 'Ahorra caja (-0,18 % intereses) · +260 pb Riesgo País · -14 Credibilidad · -2,4 % Imagen',
      accentClass: 'border-rose-700/60 bg-[#1e0a0f] hover:bg-[#2a0f16]'
    }
  ];
}

export function DebtMilestoneModal({
  milestone,
  netReservesUsdB,
  countryRiskPb,
  onChoose
}: {
  milestone: PendingDebtMilestone;
  netReservesUsdB: number;
  countryRiskPb: number;
  onChoose: (option: DebtMilestoneOption) => void;
}) {
  const choices = buildDebtChoices(milestone.amountBillionUsd, netReservesUsdB);

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
        <div className="my-auto w-full max-w-xl bg-[#0b0508] border-2 border-[#EB3F7D] shadow-[0_25px_70px_rgba(0,0,0,0.92)] p-6 space-y-5">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EB3F7D] text-[#090407] text-[10px] font-mono font-extrabold uppercase tracking-widest">
              VENCIMIENTO SOBERANO · MES {milestone.turnMonth}
            </div>
            <h2 className="font-display text-3xl uppercase tracking-wide text-[#F5EFE6]">
              {milestone.title}
            </h2>
            <p className="text-xs text-[#EFE9DA]/85 leading-relaxed">{milestone.summary}</p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-mono text-slate-300">
              <span>Monto: <strong className="text-[#EB3F7D]">US$ {formatArNumber(milestone.amountBillionUsd, 1)} MM</strong></span>
              <span>Reservas netas: <strong className="text-[#EFE9DA]">US$ {formatArNumber(netReservesUsdB, 1)} MM</strong></span>
              <span>Riesgo país: <strong className="text-[#EFE9DA]">{Math.round(countryRiskPb)} pb</strong></span>
            </div>
          </div>

          <div className="space-y-2.5">
            {choices.map((c) => (
              <button
                key={c.option}
                type="button"
                onClick={() => onChoose(c.option)}
                className={`w-full text-left p-3.5 rounded-sm border transition ${c.accentClass}`}
              >
                <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#F5EFE6]">
                  {c.title}
                </div>
                <div className="text-[11px] font-mono text-slate-300 mt-1">{c.effectText}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
