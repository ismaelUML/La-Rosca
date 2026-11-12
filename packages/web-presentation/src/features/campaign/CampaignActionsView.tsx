import React, { useState } from 'react';
import type {
  CampaignActionCard,
  CampaignExecutePayload,
  CampaignSimulationState
} from '@argentina-sim/domain';
import { canExecuteCampaignAction } from '@argentina-sim/domain';
import { CAMPAIGN_ACTIONS_CATALOG } from '@argentina-sim/infrastructure';

// Vista de SITUACIÓN -> Acciones de campaña (capturas 6 y 7):
// las 9 acciones electorales con pildoras de efectos, requisitos,
// selector territorial de provincia y validacion de presupuesto y acciones restantes.

function formatScaledNumber(num: number): string {
  const rounded = Math.round(num * 10) / 10;
  const fixed = Math.abs(rounded).toFixed(1).replace('.', ',');
  if (rounded > 0.05) return `+${fixed}`;
  if (rounded < -0.05) return `-${fixed}`;
  return '0';
}

function formatScaledBound(val: number, mult: number, isLower: boolean): string {
  const scaled = val * mult;
  if (isLower && mult < 0.25 && scaled < 0.35) return '0';
  return formatScaledNumber(scaled);
}

function scaleRangeText(rangeText: string, mult: number): string {
  if (Math.abs(mult - 1) < 0.02) return rangeText;
  const parts = rangeText.split('/');
  if (parts.length !== 2) return rangeText;
  const n1 = parseFloat(parts[0]!.replace(',', '.'));
  const n2 = parseFloat(parts[1]!.replace(',', '.'));
  if (isNaN(n1) || isNaN(n2)) return rangeText;
  const s1 = formatScaledBound(n1, mult, true);
  const s2 = formatScaledBound(n2, mult, false);
  return `${s1}/${s2}`;
}

function computeRecorridaMultiplier(visits: number, affinityMult: number = 1.0): number {
  if (visits <= 0) return 1.0 * affinityMult;
  if (visits === 1) return 0.65 * affinityMult;
  if (visits === 2) return 0.40 * affinityMult;
  if (visits === 3) return 0.25 * affinityMult;
  return 0.13 * affinityMult;
}

function resolveActionDisplayMultiplier(
  actionId: string,
  state: CampaignSimulationState,
  selectedProvinceId: string
): number {
  if (actionId === 'RECORRIDA') {
    const prov = state.provinces.find((p) => p.provinceId === selectedProvinceId);
    const visits = prov?.visitsCount ?? 0;
    const affinity = prov?.affinityMultiplier ?? 1.0;
    return computeRecorridaMultiplier(visits, affinity);
  }
  const fatigue = state.actionUsageCount?.[actionId] ?? 0;
  return 1 / (1 + 0.40 * fatigue);
}

function checkShouldShowPill(eff: CampaignActionCard['effects'][number], mult: number): boolean {
  if (eff.isWarning) return true;
  if (eff.label === 'APOYO PARTIDARIO' && mult < 0.2) return false;
  return true;
}

interface ActionPillsListProps {
  effects: CampaignActionCard['effects'];
  multiplier: number;
}

function ActionPillsList({ effects, multiplier }: ActionPillsListProps) {
  const visibleEffects = effects.filter((eff) => checkShouldShowPill(eff, multiplier));

  return (
    <div className="flex flex-wrap gap-1.5 my-3">
      {visibleEffects.map((eff) => {
        const scaledRange = eff.isWarning ? eff.rangeText : scaleRangeText(eff.rangeText, multiplier);
        return (
          <span
            key={eff.label}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              eff.isWarning
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
            }`}
          >
            {eff.label} {scaledRange}
          </span>
        );
      })}
    </div>
  );
}

interface ActionProvinceSelectorProps {
  state: CampaignSimulationState;
  selectedProvinceId: string;
  onProvinceChange: (id: string) => void;
}

function ActionProvinceSelector({
  state,
  selectedProvinceId,
  onProvinceChange
}: ActionProvinceSelectorProps) {
  const isGovernor = state.targetRole === 'GOBERNADOR' && Boolean(state.localZones?.length);

  if (isGovernor && state.localZones) {
    return (
      <div className="space-y-1.5 my-2 pt-2 border-t border-slate-800/80">
        <label className="block text-[11px] font-semibold text-slate-300">Zona</label>
        <select
          value={selectedProvinceId}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full bg-[#0b0e15] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
        >
          {state.localZones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} · visitas {z.visitsCount}
            </option>
          ))}
        </select>
        <div className="text-[11px] text-slate-400">
          Jurisdicción provincial: recorrida focalizada en las secciones electorales clave.
        </div>
      </div>
    );
  }

  const selectedProv =
    state.provinces.find((p) => p.provinceId === selectedProvinceId) ?? state.provinces[0]!;

  return (
    <div className="space-y-1.5 my-2 pt-2 border-t border-slate-800/80">
      <label className="block text-[11px] font-semibold text-slate-300">Provincia</label>
      <select
        value={selectedProvinceId}
        onChange={(e) => onProvinceChange(e.target.value)}
        className="w-full bg-[#0b0e15] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
      >
        {state.provinces.map((p) => (
          <option key={p.provinceId} value={p.provinceId}>
            {p.provinceName} · visitas {p.visitsCount}
          </option>
        ))}
      </select>
      <div className="text-[11px] text-sky-200 bg-sky-950/60 border border-sky-800/70 p-2 rounded-xl mt-2 leading-relaxed">
        Afinidad ideológica: <strong className="text-amber-400 font-bold">{selectedProv.ideologicalAffinity}</strong> · el efecto de la recorrida se multiplica ×{selectedProv.affinityMultiplier.toFixed(2).replace('.', ',')}
      </div>
    </div>
  );
}

interface ActionCardItemProps {
  action: CampaignActionCard;
  state: CampaignSimulationState;
  selectedProvinceId: string;
  onProvinceChange: (id: string) => void;
  onExecute: (payload: CampaignExecutePayload) => void;
}

function ActionCardItem({
  action,
  state,
  selectedProvinceId,
  onProvinceChange,
  onExecute
}: ActionCardItemProps) {
  const check = canExecuteCampaignAction(state, action);

  const handleActionClick = () => {
    if (!check.allowed) return;
    const payload: CampaignExecutePayload =
      action.id === 'RECORRIDA'
        ? { actionId: 'RECORRIDA', selectedProvinceId }
        : { actionId: action.id };
    onExecute(payload);
  };

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-bold text-white">{action.title}</div>
          <span className="text-xs font-mono font-bold text-amber-400">
            -{action.cost.toFixed(1)} ¥
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{action.description}</p>

        <ActionPillsList
          effects={action.effects}
          multiplier={resolveActionDisplayMultiplier(action.id, state, selectedProvinceId)}
        />

        {action.requirementText ? (
          <div className="text-[11px] text-slate-500 mb-2">{action.requirementText}</div>
        ) : null}

        {action.needsProvince ? (
          <ActionProvinceSelector
            state={state}
            selectedProvinceId={selectedProvinceId}
            onProvinceChange={onProvinceChange}
          />
        ) : null}
      </div>

      <div className="pt-3 border-t border-slate-800/80">
        <button
          type="button"
          disabled={!check.allowed}
          onClick={handleActionClick}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition ${
            check.allowed
              ? 'bg-white hover:bg-slate-200 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {check.allowed ? `Hacer (Costo: -${action.cost.toFixed(1)})` : check.reason}
        </button>
      </div>
    </div>
  );
}

interface CampaignActionsViewProps {
  state: CampaignSimulationState;
  onExecuteAction: (payload: CampaignExecutePayload) => void;
  onAdvanceMonth: () => void;
}

export function CampaignActionsView({
  state,
  onExecuteAction,
  onAdvanceMonth
}: CampaignActionsViewProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState(state.targetProvinceId || 'PBA');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            SITUACIÓN
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            Acciones de campaña
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">
            Quedan <strong>{state.actionsRemainingThisMonth}</strong> acciones este mes · presupuesto <strong>{state.budgetArgentums.toFixed(1)} ¥</strong>
          </span>
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow transition"
          >
            Avanzar al mes siguiente →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAMPAIGN_ACTIONS_CATALOG.map((action) => (
          <ActionCardItem
            key={action.id}
            action={action}
            state={state}
            selectedProvinceId={selectedProvinceId}
            onProvinceChange={setSelectedProvinceId}
            onExecute={onExecuteAction}
          />
        ))}
      </div>
    </div>
  );
}
