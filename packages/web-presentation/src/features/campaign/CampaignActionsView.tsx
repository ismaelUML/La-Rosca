import React, { useState } from 'react';
import type {
  CampaignActionCard,
  CampaignExecutePayload,
  CampaignSimulationState
} from '@argentina-sim/domain';
import { canExecuteCampaignAction } from '@argentina-sim/domain';
import { CAMPAIGN_ACTIONS_CATALOG } from '@argentina-sim/infrastructure';

// Vista de ESTRATEGIA -> Acciones de campana en estetica tactica acero/bronce:
// catalogo de operaciones electorales con pildoras de impacto, fatiga de uso,
// selector territorial federal y validacion de presupuesto y cupo mensual.

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
            className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold ${
              eff.isWarning
                ? 'bg-amber-950/60 text-amber-300 border border-amber-700/60'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
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
      <div className="space-y-1.5 my-2 pt-2.5 border-t border-[#263142]">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-300">
          Sección / Zona de Recorrida
        </label>
        <select
          value={selectedProvinceId}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full bg-[#090d14] border border-[#263142] rounded-sm px-3 py-1.5 text-xs font-mono text-amber-100"
        >
          {state.localZones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} · visitas {z.visitsCount}
            </option>
          ))}
        </select>
        <div className="text-[11px] font-mono text-slate-400">
          Despliegue territorial focalizado en las secciones clave de la provincia.
        </div>
      </div>
    );
  }

  const selectedProv =
    state.provinces.find((p) => p.provinceId === selectedProvinceId) ?? state.provinces[0]!;

  return (
    <div className="space-y-1.5 my-2 pt-2.5 border-t border-[#263142]">
      <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-300">
        Jurisdicción Destino
      </label>
      <select
        value={selectedProvinceId}
        onChange={(e) => onProvinceChange(e.target.value)}
        className="w-full bg-[#090d14] border border-[#263142] rounded-sm px-3 py-1.5 text-xs font-mono text-amber-100"
      >
        {state.provinces.map((p) => (
          <option key={p.provinceId} value={p.provinceId}>
            {p.provinceName} · visitas {p.visitsCount}
          </option>
        ))}
      </select>
      <div className="text-[11px] font-mono text-sky-200 bg-[#090d14] border border-[#263142] p-2 rounded-sm mt-1.5 leading-relaxed">
        Afinidad: <strong className="text-amber-300">{selectedProv.ideologicalAffinity}</strong> · Multiplicador: <strong className="text-emerald-400">×{selectedProv.affinityMultiplier.toFixed(2).replace('.', ',')}</strong>
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

function buildActionPayload(actionId: CampaignActionCard['id'], selectedProvinceId: string): CampaignExecutePayload {
  if (actionId === 'RECORRIDA') {
    return { actionId: 'RECORRIDA', selectedProvinceId };
  }
  return { actionId };
}

function ActionCardFooter({
  allowed,
  reason,
  cost,
  onClick
}: {
  allowed: boolean;
  reason?: string;
  cost: number;
  onClick: () => void;
}) {
  const btnCls = allowed
    ? 'hoi-btn-gold shadow'
    : 'bg-[#090d14] text-slate-500 border border-[#1e293b] cursor-not-allowed';
  const label = allowed ? `Ejecutar Operación (-$${cost.toFixed(1)}M)` : reason;

  return (
    <div className="pt-3 border-t border-[#263142] mt-2">
      <button
        type="button"
        disabled={!allowed}
        onClick={onClick}
        className={`w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${btnCls}`}
      >
        {label}
      </button>
    </div>
  );
}

function ActionCardHeader({
  title,
  usageCount,
  mult,
  cost
}: {
  title: string;
  usageCount: number;
  mult: number;
  cost: number;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-[#1e293b] pb-2.5">
      <div>
        <div className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
          {title}
        </div>
        {usageCount > 0 ? (
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Ejecutada {usageCount}x · Eficacia actual {Math.round(mult * 100)}%
          </div>
        ) : null}
      </div>
      <span className="px-2 py-0.5 rounded-sm bg-amber-950/30 border border-[#8a6d33]/80 text-xs font-mono font-bold text-amber-300 shrink-0">
        -${cost.toFixed(1)}M
      </span>
    </div>
  );
}

function ActionCardItem({
  action,
  state,
  selectedProvinceId,
  onProvinceChange,
  onExecute
}: ActionCardItemProps) {
  const check = canExecuteCampaignAction(state, action);
  const mult = resolveActionDisplayMultiplier(action.id, state, selectedProvinceId);
  const usageCount = state.actionUsageCount?.[action.id] ?? 0;
  const borderCls = check.allowed ? 'border-[#263142] hover:border-[#8a6d33]' : 'border-[#1d2533] opacity-80';

  const handleActionClick = () => {
    onExecute(buildActionPayload(action.id, selectedProvinceId));
  };

  return (
    <div className={`hoi-panel rounded-sm p-5 flex flex-col justify-between transition ${borderCls}`}>
      <div>
        <ActionCardHeader title={action.title} usageCount={usageCount} mult={mult} cost={action.cost} />
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{action.description}</p>
        <ActionPillsList effects={action.effects} multiplier={mult} />

        {action.requirementText ? (
          <div className="text-[11px] font-mono text-slate-400 bg-[#090d14] border border-[#1e293b] px-2.5 py-1.5 rounded-sm mb-2">
            {action.requirementText}
          </div>
        ) : null}

        {action.needsProvince ? (
          <ActionProvinceSelector
            state={state}
            selectedProvinceId={selectedProvinceId}
            onProvinceChange={onProvinceChange}
          />
        ) : null}
      </div>

      <ActionCardFooter
        allowed={check.allowed}
        reason={check.reason}
        cost={action.cost}
        onClick={handleActionClick}
      />
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
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            ESTRATEGIA · OPERACIONES DE CAMPAÑA
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
            Acciones de campaña
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] text-xs font-mono text-slate-300">
            ACCIONES MES: <strong className="text-sky-400">{state.actionsRemainingThisMonth}/{state.actionsTotalThisMonth}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#8a6d33]/80 text-xs font-mono text-slate-300">
            CAJA: <strong className="text-amber-300">${state.budgetArgentums.toFixed(1)}M</strong>
          </div>
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="hoi-btn-gold px-4 py-1.5 rounded-sm font-mono font-bold uppercase tracking-wider text-xs shadow transition"
          >
            Avanzar mes →
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
