import React from 'react';
import type { CabinetMinister } from '@argentina-sim/domain';

// Vista de Gabinete (DESPACHO -> Gabinete): las 10 carteras ministeriales con
// competencia, lealtad, riesgo de desgaste, barra de desempeno y recambio politico.

interface CabinetViewProps {
  ministers: CabinetMinister[];
  onReinforceMinister: (id: string) => void;
  onReplaceMinister: (id: string) => void;
}

export function CabinetView({
  ministers,
  onReinforceMinister,
  onReplaceMinister
}: CabinetViewProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
          DESPACHO PRESIDENCIAL
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Gabinete</h1>
        <p className="text-xs text-slate-400 mt-1">
          El gabinete gestiona el día a día. La competencia mejora la ejecución real del Estado, la lealtad reduce traiciones y las cuotas de coalición sostienen los votos aliados en el Congreso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministers.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {m.ministryName}
                  </div>
                  <div className="text-lg font-extrabold text-white mt-0.5">{m.ministerName}</div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {m.partySigla} · Afinidad {m.affinityPct}%
                  </span>
                  {m.isCoalitionQuota ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                      Cuota de coalición
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="p-2 rounded-xl bg-[#0b0e15] border border-slate-800">
                  <div className="text-slate-400">Competencia</div>
                  <div className="font-mono font-bold text-white text-sm">{m.competence}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#0b0e15] border border-slate-800">
                  <div className="text-slate-400">Lealtad</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm">{m.loyalty}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#0b0e15] border border-slate-800">
                  <div className="text-slate-400">Riesgo</div>
                  <div className="font-mono font-bold text-amber-400 text-sm">{m.risk}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Desempeño de cartera</span>
                  <span className="font-mono font-bold text-white">{m.performance}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${m.performance}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-sky-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-300 font-medium">
                Efecto mensual: {m.monthlyEffectText}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onReinforceMinister(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                >
                  Respaldar
                </button>
                <button
                  type="button"
                  onClick={() => onReplaceMinister(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 text-xs font-medium text-slate-300"
                >
                  Reemplazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

