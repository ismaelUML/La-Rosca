import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Vista de ESTRATEGIA -> Apoyos (captura de referencia del usuario):
// solicitud de avales políticos a figuras de los 6 espacios, con restricciones
// ideológicas, requisitos de interna y botón para cooptar dirigentes al partido propio.

interface CampaignApoyosViewProps {
  state: CampaignSimulationState;
  onAdvanceMonth?: () => void;
}

const PARTY_FILTER_BUTTONS = ['PRO', 'LLA', 'UCR', 'UxP', 'PF', 'FIT'];

function EndorsementSwitch({
  isEndorsed,
  isBlocked,
  onToggle
}: {
  isEndorsed: boolean;
  isBlocked: boolean;
  onToggle: () => void;
}) {
  const switchBg = isEndorsed ? 'bg-emerald-500' : 'bg-slate-700';
  const switchKnob = isEndorsed ? 'translate-x-4' : 'translate-x-0.5';
  const stateClass = isBlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type="button"
      disabled={isBlocked}
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-colors relative ${switchBg} ${stateClass}`}
    >
      <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${switchKnob}`} />
    </button>
  );
}

function InviteToPartyButton({
  hasDefected,
  isOwnParty,
  onInvite
}: {
  hasDefected: boolean;
  isOwnParty: boolean;
  onInvite: () => void;
}) {
  if (hasDefected) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-1.5 rounded-xl text-xs font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300"
      >
        Incorporado a tus filas
      </button>
    );
  }
  if (isOwnParty) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-500 cursor-not-allowed"
      >
        Dirigente de tu partido
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onInvite}
      className="w-full py-1.5 rounded-xl text-xs font-semibold bg-[#181d2c] hover:bg-[#20273a] text-sky-300 border border-slate-700"
    >
      Invitar a tu partido
    </button>
  );
}

function BlockedByInternalPill({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return (
    <div className="text-[11px] text-slate-500 mt-2 bg-[#0d1017] p-2 rounded-lg border border-slate-800">
      Antes de la interna solo podés pedir apoyo a dirigentes de tu partido.
    </div>
  );
}

interface PoliticianEndorsementCardProps {
  pol: (typeof REAL_POLITICIANS_2027)[number];
  isEndorsed: boolean;
  hasDefected: boolean;
  isOwnParty: boolean;
  isBlockedByInternal: boolean;
  onToggleEndorsement: () => void;
  onInviteToParty: () => void;
}

function PoliticianEndorsementCard({
  pol,
  isEndorsed,
  hasDefected,
  isOwnParty,
  isBlockedByInternal,
  onToggleEndorsement,
  onInviteToParty
}: PoliticianEndorsementCardProps) {
  const endorsementLabel = isEndorsed ? 'Apoyo concedido' : 'Pedir apoyo';

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
            {pol.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">{pol.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {pol.partySigla} · {pol.ideology}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
            {pol.styleTrait.toUpperCase()}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/70 border border-purple-800/60 text-purple-300">
            FUNCIONARIO
          </span>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2">{pol.roleDescription}</p>

        <div className="text-[11px] text-slate-400 mt-2 font-mono">
          Relevancia 82 · Influencia 75
        </div>

        <BlockedByInternalPill show={isBlockedByInternal} />
      </div>

      <div className="pt-2 border-t border-slate-800/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">{endorsementLabel}</span>
          <EndorsementSwitch
            isEndorsed={isEndorsed}
            isBlocked={isBlockedByInternal}
            onToggle={onToggleEndorsement}
          />
        </div>

        <InviteToPartyButton
          hasDefected={hasDefected}
          isOwnParty={isOwnParty}
          onInvite={onInviteToParty}
        />
      </div>
    </div>
  );
}

export function CampaignApoyosView({ state }: CampaignApoyosViewProps) {
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('LLA');
  const [endorsedIds, setEndorsedIds] = useState<Set<string>>(new Set());
  const [defectIds, setDefectIds] = useState<Set<string>>(new Set());

  const filteredPoliticians = REAL_POLITICIANS_2027.filter(
    (pol) => pol.partySigla === selectedPartyFilter
  );

  const handleToggleEndorsement = (polId: string, partySigla: string) => {
    if (state.stage.stage === 'INTERNA' && partySigla !== state.partySigla) {
      return;
    }
    const next = new Set(endorsedIds);
    if (next.has(polId)) {
      next.delete(polId);
    } else {
      next.add(polId);
    }
    setEndorsedIds(next);
  };

  const handleInviteToParty = (polId: string) => {
    const next = new Set(defectIds);
    next.add(polId);
    setDefectIds(next);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            ESTRATEGIA
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Apoyos</h1>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Te apoyan: <strong className="text-emerald-400">{endorsedIds.size}</strong> dirigentes
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
        Cada figura es <strong>dialoguista</strong> (puede apoyar a cualquiera) o <strong>dogmática</strong> (solo apoya a ideologías relativamente cercanas). Si el pedido no es posible, el interruptor aparece apagado y se indica el motivo. Quien apoya sube tu imagen y tus votos.
      </p>

      <div className="flex flex-wrap gap-2">
        {PARTY_FILTER_BUTTONS.map((sigla) => (
          <button
            key={sigla}
            type="button"
            onClick={() => setSelectedPartyFilter(sigla)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              selectedPartyFilter === sigla
                ? 'bg-white text-slate-950 border-white shadow'
                : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {sigla}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {filteredPoliticians.map((pol) => (
          <PoliticianEndorsementCard
            key={pol.id}
            pol={pol}
            isEndorsed={endorsedIds.has(pol.id)}
            hasDefected={defectIds.has(pol.id)}
            isOwnParty={pol.partySigla === state.partySigla}
            isBlockedByInternal={state.stage.stage === 'INTERNA' && pol.partySigla !== state.partySigla}
            onToggleEndorsement={() => handleToggleEndorsement(pol.id, pol.partySigla)}
            onInviteToParty={() => handleInviteToParty(pol.id)}
          />
        ))}
      </div>
    </div>
  );
}
