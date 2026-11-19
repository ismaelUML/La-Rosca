import React from 'react';
import {
  CAMPAIGN_PROMISES_CATALOG,
  toggleCampaignPromiseSelection,
  type CampaignSimulationState,
  type SelectableCampaignPromise
} from '@argentina-sim/domain';
import { formatArNumber } from '../../lib/formatters.js';

// Selector de hasta 3 Promesas de Campaña: te suma intención de voto real hoy,
// pero si llegás a Casa Rosada y no las cumplís a tiempo te pasan factura política.

function PromiseOptionTile({
  item,
  selected,
  disabled,
  onToggle
}: {
  item: SelectableCampaignPromise;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const tone = selected
    ? 'border-[#EB3F7D] bg-[#210d17]'
    : disabled
      ? 'border-white/10 bg-[#0c0609] opacity-50 cursor-not-allowed'
      : 'border-white/15 bg-[#12080d] hover:border-[#EB3F7D]/60';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`text-left p-3 rounded-sm border transition space-y-1 ${tone}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#F5EFE6]">{item.title}</span>
        <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 bg-[#EB3F7D]/20 text-[#EB3F7D] shrink-0">
          +{formatArNumber(item.voteBoostPct, 1)} % VOTO
        </span>
      </div>
      <div className="text-[10px] font-mono text-slate-400">{item.targetSummary}</div>
    </button>
  );
}

export function CampaignPromisesPickerCard({
  state,
  onUpdateState
}: {
  state: CampaignSimulationState;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}) {
  if (!onUpdateState) return null;
  const selectedIds = state.selectedPromiseIds ?? [];

  return (
    <section className="rounded-sm bg-[#11080d] border border-white/15 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EB3F7D]">
            PROMESAS DE CAMPAÑA ({selectedIds.length}/3 ELEGIDAS)
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Elegí hasta 3 banderas para sumar intención de voto hoy. Si ganás, te esperan como facturas en el Despacho.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {CAMPAIGN_PROMISES_CATALOG.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isDisabled = !isSelected && selectedIds.length >= 3;
          return (
            <PromiseOptionTile
              key={item.id}
              item={item}
              selected={isSelected}
              disabled={isDisabled}
              onToggle={() => onUpdateState((prev) => toggleCampaignPromiseSelection(prev, item.id))}
            />
          );
        })}
      </div>
    </section>
  );
}
