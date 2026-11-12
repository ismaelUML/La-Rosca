import React, { useState } from 'react';
import type { CabinetMinister } from '@argentina-sim/domain';
import { MinisterReplacementModal } from './MinisterReplacementModal.js';

// Vista de Gabinete (DESPACHO -> Gabinete): las 10 carteras ministeriales con
// competencia, lealtad, riesgo de desgaste, barra de desempeno y recambio politico.
// Al asumir la presidencia, el gabinete arranca vacante para que el jugador
// designe a su propio equipo de gobierno cartera por cartera.

interface CabinetViewProps {
  ministers: CabinetMinister[];
  onReinforceMinister: (id: string) => void;
  onReplaceMinister?: (id: string) => void;
  onAppointMinister?: (ministryId: string, newMinister: CabinetMinister) => void;
  playerPartySigla?: string;
  coalitionParties?: string[];
}

function checkIsMinisterVacant(m: CabinetMinister): boolean {
  return m.ministerName.includes('Vacante') || m.competence === 0;
}

function CabinetInaugurationBanner({ assignedCount }: { assignedCount: number }) {
  if (assignedCount >= 10) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#131724] to-sky-950/70 border border-purple-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
          🏛️ Nombramiento inicial del Gabinete Nacional
        </div>
        <p className="text-sm font-semibold text-white">
          ¡Asumiste la Presidencia! Es momento de armar tu equipo de gobierno.
        </p>
        <p className="text-xs text-slate-300">
          Designá los ministros para cada una de las 10 carteras estratégicas según lealtad, idoneidad y cuotas de coalición.
        </p>
      </div>
      <div className="shrink-0 px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-700 text-xs font-mono font-bold text-purple-200 text-center">
        {assignedCount} de 10 carteras cubiertas
      </div>
    </div>
  );
}

function MinisterBadge({ minister, isVacant }: { minister: CabinetMinister; isVacant: boolean }) {
  if (isVacant) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-700/80 uppercase tracking-wide">
        Sin designar
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
        {minister.partySigla} · Afinidad {minister.affinityPct}%
      </span>
      {minister.isCoalitionQuota ? (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
          Cuota de coalición
        </span>
      ) : null}
    </div>
  );
}

function MinisterActionButtons({
  isVacant,
  onReinforce,
  onDesignar
}: {
  isVacant: boolean;
  onReinforce: () => void;
  onDesignar: () => void;
}) {
  if (isVacant) {
    return (
      <button
        type="button"
        onClick={onDesignar}
        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-md transition"
      >
        Designar ministro
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={onReinforce}
        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
      >
        Respaldar
      </button>
      <button
        type="button"
        onClick={onDesignar}
        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 text-xs font-medium text-slate-300"
      >
        Reemplazar
      </button>
    </div>
  );
}

export function CabinetView({
  ministers,
  onReinforceMinister,
  onReplaceMinister,
  onAppointMinister,
  playerPartySigla,
  coalitionParties
}: CabinetViewProps) {
  const [replacingMinistry, setReplacingMinistry] = useState<CabinetMinister | null>(null);

  const handleConfirmReplacement = (newMinister: CabinetMinister) => {
    if (!replacingMinistry) return;
    if (onAppointMinister) {
      onAppointMinister(replacingMinistry.id, newMinister);
    } else {
      onReplaceMinister?.(replacingMinistry.id);
    }
    setReplacingMinistry(null);
  };

  const assignedCount = ministers.filter((m) => !checkIsMinisterVacant(m)).length;

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

      <CabinetInaugurationBanner assignedCount={assignedCount} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministers.map((m) => {
          const isVacant = checkIsMinisterVacant(m);
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                isVacant
                  ? 'bg-[#10141e] border-amber-900/50 shadow-md'
                  : 'bg-[#10131b] border-slate-800/90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {m.ministryName}
                    </div>
                    <div
                      className={`text-lg font-extrabold mt-0.5 ${
                        isVacant ? 'text-amber-300/90 italic' : 'text-white'
                      }`}
                    >
                      {m.ministerName}
                    </div>
                  </div>
                  <MinisterBadge minister={m} isVacant={isVacant} />
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
                <span
                  className={`text-xs font-medium line-clamp-1 ${
                    isVacant ? 'text-amber-400/80' : 'text-emerald-300'
                  }`}
                >
                  {isVacant ? m.monthlyEffectText : `Efecto: ${m.monthlyEffectText}`}
                </span>
                <MinisterActionButtons
                  isVacant={isVacant}
                  onReinforce={() => onReinforceMinister(m.id)}
                  onDesignar={() => setReplacingMinistry(m)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {replacingMinistry ? (
        <MinisterReplacementModal
          ministry={replacingMinistry}
          playerPartySigla={playerPartySigla ?? 'LLA'}
          coalitionParties={coalitionParties ?? []}
          onConfirm={handleConfirmReplacement}
          onClose={() => setReplacingMinistry(null)}
        />
      ) : null}
    </div>
  );
}
