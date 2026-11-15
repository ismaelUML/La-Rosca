import React, { useMemo } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Modal de seleccion de Vicepresidente en estetica tactica acero/bronce:
// El vice equilibra el binomio presidencial y desempata votaciones en el Senado.

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

  const matched = REAL_POLITICIANS_2027.filter((p) => {
    if (p.id === state.candidateId) {
      return false;
    }
    return allowedParties.includes(p.partySigla);
  });

  const pool =
    matched.length > 0
      ? matched
      : REAL_POLITICIANS_2027.filter((p) => p.id !== state.candidateId).slice(0, 8);

  return pool.map((p) => ({
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
    <div
      className={`rounded-sm bg-[#090d14] border p-4 flex flex-col justify-between space-y-3 transition ${
        isSelected ? 'border-emerald-500/70 bg-[#0d1917]' : 'border-[#263142] hover:border-[#8a6d33]'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 border-b border-[#1e293b] pb-2">
          <div className="w-8 h-8 rounded-sm bg-[#0c1119] border border-[#8a6d33]/80 flex items-center justify-center font-mono font-bold text-xs text-amber-200 shrink-0">
            {candidate.partySigla}
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-amber-100 uppercase tracking-wide leading-tight">
              {candidate.name}
            </h4>
            <div className="text-[11px] font-mono text-slate-400">
              Referente de {candidate.partySigla} · Relevancia {candidate.relevance}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {candidate.roleDescription}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-1.5 rounded-sm bg-[#0c1119] border border-[#1e293b] text-slate-300">
            Relevancia: <strong className="text-amber-300">{candidate.relevance}</strong>
          </div>
          <div className="p-1.5 rounded-sm bg-[#0c1119] border border-[#1e293b] text-slate-300">
            Estructura: <strong className="text-emerald-400">{candidate.structure}</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(candidate)}
        className={`w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition shadow ${
          isSelected
            ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 cursor-default'
            : 'hoi-btn-gold'
        }`}
      >
        {isSelected ? '✓ Seleccionado en la Fórmula' : 'Proclamar Vicepresidente'}
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="hoi-panel rounded-sm border-2 border-[#8a6d33] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="hoi-header-steel p-5 border-b border-[#263142] flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              FÓRMULA PRESIDENCIAL 2027 · PRESIDENCIA DEL SENADO
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-100 uppercase tracking-wide">
              Elegí a tu vicepresidente
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Tus socios de coalición y referentes partidarios proponen estos nombres para completar el binomio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-amber-200 px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#263142] font-mono text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0c1119]">
          {options.map((opt) => (
            <ViceCandidateCard
              key={opt.id}
              candidate={opt}
              isSelected={state.runningMateId === opt.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="p-4 bg-[#090d14] border-t border-[#263142] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-amber-200 bg-[#0c1119] border border-[#263142]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
