import React, { useMemo } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Modal de selección de Vicepresidente (QQG Screenshot 8):
// El vice en Argentina no es un adorno: o te salva las papas en el Senado desempatando
// votaciones calientes, o te arma una interna desde adentro. Tus socios de coalición o los
// barones de tu propio partido te ponen nombres sobre la mesa para equilibrar la fórmula.

interface ViceCandidateOption {
  id: string;
  name: string;
  partySigla: string;
  roleDescription: string;
  relevance: number;
  structure: number;
}

function computePolHash(polId: string, salt: number, mod: number): number {
  let h = 0;
  for (let i = 0; i < polId.length; i++) {
    h = (h * salt + polId.charCodeAt(i)) % 1000;
  }
  return h % mod;
}

function resolveAvailableViceCandidates(state: CampaignSimulationState): ViceCandidateOption[] {
  const allowedParties = [state.partySigla, ...(state.coalitionParties ?? [])];

  return REAL_POLITICIANS_2027.filter((p) => {
    if (p.id === state.candidateId) {
      return false;
    }
    return allowedParties.includes(p.partySigla);
  }).map((p) => ({
    id: p.id,
    name: p.name,
    partySigla: p.partySigla,
    roleDescription: p.roleDescription,
    relevance: 55 + computePolHash(p.id, 31, 20),
    structure: 60 + computePolHash(p.id, 19, 25)
  }));
}

interface ViceCandidateCardProps {
  candidate: ViceCandidateOption;
  isSelected: boolean;
  onSelect: (c: ViceCandidateOption) => void;
}

function ViceCandidateCard({ candidate, isSelected, onSelect }: ViceCandidateCardProps) {
  return (
    <div className="rounded-2xl bg-[#0f131c] border border-slate-800 p-4 flex flex-col justify-between space-y-3 shadow-md hover:border-slate-700 transition">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {candidate.partySigla}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white leading-tight">{candidate.name}</h4>
            <div className="text-[11px] text-slate-400">
              Político de {candidate.partySigla} · relevancia {candidate.relevance}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-1">
          {candidate.roleDescription}
        </p>
        <div className="text-[11px] font-mono text-slate-400 pt-1">
          Relevancia {candidate.relevance} · Estructura {candidate.structure}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(candidate)}
        className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow ${
          isSelected
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-white hover:bg-slate-200 text-slate-950'
        }`}
      >
        {isSelected ? '✓ Seleccionado como vice' : 'Elegir como vicepresidente'}
      </button>
    </div>
  );
}

interface VicePresidentSelectionModalProps {
  isOpen: boolean;
  state: CampaignSimulationState;
  onClose: () => void;
  onConfirmVice: (candidateId: string, candidateName: string) => void;
}

export function VicePresidentSelectionModal({
  isOpen,
  state,
  onClose,
  onConfirmVice
}: VicePresidentSelectionModalProps) {
  const options = useMemo(() => resolveAvailableViceCandidates(state), [state]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (c: ViceCandidateOption) => {
    onConfirmVice(c.id, c.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0e15] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Fórmula Presidencial 2027
            </div>
            <h2 className="text-2xl font-extrabold text-white">Elegí a tu vicepresidente</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Tu socio de coalición o dirigentes de tu espacio te ofrecen estas opciones para
              completar la fórmula presidencial. El vice aporta estructura y relevancia en el interior.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => (
            <ViceCandidateCard
              key={opt.id}
              candidate={opt}
              isSelected={state.runningMateId === opt.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="p-4 bg-[#080a10] border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
