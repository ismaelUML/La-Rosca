import React from 'react';
import type {
  CampaignMonthlyDilemma,
  CampaignDilemmaOption
} from '@argentina-sim/infrastructure';

// Modal de Dilemas Emergentes de Campaña ("Situación del Mes", QQG Captura 7):
// Reproduce fielmente el diseño de QQG con las tarjetas de elección, los badges
// pill con valores de impacto (PRESUPUESTO, VULNERABILIDAD, INTELIGENCIA PERCIBIDA)
// y el pie "Esta situación no vuelve a aparecer en la partida."

interface DilemmaOptionCardProps {
  option: CampaignDilemmaOption;
  onChoose: (option: CampaignDilemmaOption) => void;
}

function DilemmaOptionCard({ option, onChoose }: DilemmaOptionCardProps) {
  return (
    <div className="rounded-2xl bg-[#0f131c] border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
      <div className="space-y-3">
        <h4 className="text-base font-extrabold text-white leading-snug">{option.title}</h4>

        <div className="flex flex-wrap gap-1.5">
          {option.badges.map((b) => (
            <span
              key={b.label}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-tight border ${
                b.isPositive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChoose(option)}
        className="w-full py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 transition shadow"
      >
        Elegir esta opción
      </button>
    </div>
  );
}

interface CampaignMonthlyDilemmaModalProps {
  dilemma: CampaignMonthlyDilemma | null;
  onSelectOption: (option: CampaignDilemmaOption) => void;
}

export function CampaignMonthlyDilemmaModal({
  dilemma,
  onSelectOption
}: CampaignMonthlyDilemmaModalProps) {
  if (!dilemma) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e15] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" />
            SITUACIÓN DEL MES · {dilemma.formattedDate}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            {dilemma.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
            {dilemma.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DilemmaOptionCard option={dilemma.options[0]} onChoose={onSelectOption} />
          <DilemmaOptionCard option={dilemma.options[1]} onChoose={onSelectOption} />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Esta situación no vuelve a aparecer en la partida.</span>
          <span className="font-mono text-slate-600">ID: {dilemma.id}</span>
        </div>
      </div>
    </div>
  );
}

