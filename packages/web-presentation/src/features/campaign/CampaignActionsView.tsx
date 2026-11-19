import React, { useId, useMemo, useState } from 'react';
import type {
  CampaignActionCard,
  CampaignActionCategory,
  CampaignExecutePayload,
  CampaignSimulationState
} from '@argentina-sim/domain';
import { canExecuteCampaignAction } from '@argentina-sim/domain';
import { CAMPAIGN_ACTIONS_CATALOG } from '@argentina-sim/infrastructure';
import type { MediaOutletLogoId } from '../party-setup/officialLogosCatalog.js';
import { OfficialMediaLogo } from '../party-setup/OfficialLogoBadge.js';

// Vista de ESTRATEGIA -> Acciones de campana en estetica tactica acero/bronce:
// catalogo de 52 operaciones electorales con filtros por rubro, buscador,
// pildoras de impacto, fatiga de uso y selector territorial federal.

const ACTION_MEDIA_STRIPS: Partial<Record<string, MediaOutletLogoId[]>> = {
  ENTREVISTA: ['TN', 'LN_MAS', 'C5N', 'A24'],
  PUBLICIDAD: ['CLARIN', 'INFOBAE', 'LA_NACION', 'FORBES'],
  DEBATE: ['TV_PUBLICA', 'TN', 'C5N', 'CNN_ESPANOL'],
  MILITANCIA_DIGITAL: ['EL_DESTAPE', 'REVISTA_BARCELONA', 'INFOBAE'],
  PRIME_TIME_MANO_A_MANO: ['LN_MAS', 'TN', 'A24', 'CRONICA_TV'],
  TAPA_DOMINICAL_PRENSA: ['CLARIN', 'LA_NACION', 'PAGINA_12', 'VOZ_INTERIOR'],
  RADIOS_DEL_INTERIOR: ['VOZ_INTERIOR', 'CANAL_26', 'TV_PUBLICA'],
  DESPLIEGUE_STREAMERS: ['INFOBAE', 'REVISTA_BARCELONA', 'CRONICA_TV'],
  PRESENTACION_LIBRO_PLAN: ['CRONISTA', 'FORBES', 'LA_NACION', 'BLOOMBERG'],
  CONTRASPOT_DEMOLEDOR: ['CRONICA_TV', 'C5N', 'A24', 'EL_DESTAPE'],
  BUNKER_FACT_CHECKING: ['INFOBAE', 'CLARIN', 'CNN_ESPANOL']
};

const ACTION_CATEGORY_FALLBACK: Record<string, CampaignActionCategory> = {
  RECORRIDA: 'TERRITORIO',
  ENTREVISTA: 'MEDIOS',
  PUBLICIDAD: 'MEDIOS',
  ACTO_PARTIDARIO: 'TERRITORIO',
  FORMACION_EQUIPOS: 'ESTRUCTURA',
  DEBATE: 'MEDIOS',
  MILITANCIA_DIGITAL: 'MEDIOS',
  REUNION_AFILIADOS: 'ESTRUCTURA',
  NEGOCIACION_SECTORES: 'ROSCA',
  CARPETAZO_MEDIATICO: 'ROSCA',
  PACTO_CON_INTENDENTES: 'ROSCA',
  ACTO_ESTADIO_PLAZA: 'TERRITORIO',
  CONCILIACION_CIRCULO_ROJO: 'ROSCA',
  GIRA_INTERNACIONAL: 'MEDIOS',
  DESPLIEGUE_STREAMERS: 'MEDIOS'
};

function resolveActionCategory(card: CampaignActionCard): CampaignActionCategory {
  return card.category ?? ACTION_CATEGORY_FALLBACK[card.id] ?? 'MEDIOS';
}

const ACTION_CATEGORY_TABS: Array<{ id: 'TODAS' | CampaignActionCategory; label: string }> = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'MEDIOS', label: 'Medios y Redes' },
  { id: 'TERRITORIO', label: 'Territorio Federal' },
  { id: 'ROSCA', label: 'Rosca y Círculo Rojo' },
  { id: 'ESTRUCTURA', label: 'Estructura y Fiscales' }
];

function ActionMediaStrip({ actionId }: { actionId: string }) {
  const outlets = ACTION_MEDIA_STRIPS[actionId];
  if (!outlets) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 bg-[#0b0508]/80 border border-white/10 px-2 py-1.5 rounded-sm">
      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-0.5">
        Pauta / Medios:
      </span>
      {outlets.map((mediaId) => (
        <OfficialMediaLogo key={mediaId} media={mediaId} heightPx={17} />
      ))}
    </div>
  );
}

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
  const n1 = Number.parseFloat(parts[0]!.replace(',', '.'));
  const n2 = Number.parseFloat(parts[1]!.replace(',', '.'));
  if (Number.isNaN(n1) || Number.isNaN(n2)) return rangeText;
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
                ? 'bg-amber-950/60 text-[#f472b6] border border-amber-700/60'
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
  const controlId = useId();
  const isGovernor = state.targetRole === 'GOBERNADOR' && Boolean(state.localZones?.length);

  if (isGovernor && state.localZones) {
    return (
      <div className="space-y-1.5 my-2 pt-2.5 border-t border-white/15">
        <label htmlFor={controlId} className="block text-[10px] font-mono uppercase tracking-wider text-[#f472b6]">
          Sección / Zona de Recorrida
        </label>
        <select
          id={controlId}
          value={selectedProvinceId}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full bg-[#0b0508] border border-white/15 rounded-sm px-3 py-1.5 text-xs font-mono text-[#F5EFE6]"
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
    <div className="space-y-1.5 my-2 pt-2.5 border-t border-white/15">
      <label htmlFor={controlId} className="block text-[10px] font-mono uppercase tracking-wider text-[#f472b6]">
        Jurisdicción Destino
      </label>
      <select
        id={controlId}
        value={selectedProvinceId}
        onChange={(e) => onProvinceChange(e.target.value)}
        className="w-full bg-[#0b0508] border border-white/15 rounded-sm px-3 py-1.5 text-xs font-mono text-[#F5EFE6]"
      >
        {state.provinces.map((p) => (
          <option key={p.provinceId} value={p.provinceId}>
            {p.provinceName} · visitas {p.visitsCount}
          </option>
        ))}
      </select>
      <div className="text-[11px] font-mono text-sky-200 bg-[#0b0508] border border-white/15 p-2 rounded-sm mt-1.5 leading-relaxed">
        Afinidad: <strong className="text-[#f472b6]">{selectedProv.ideologicalAffinity}</strong> · Multiplicador: <strong className="text-emerald-400">×{selectedProv.affinityMultiplier.toFixed(2).replace('.', ',')}</strong>
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
    : 'bg-[#0b0508] text-slate-500 border border-white/10 cursor-not-allowed';
  const label = allowed ? `Ejecutar Operación (-US$ ${cost.toFixed(1).replace('.', ',')} M)` : reason;

  return (
    <div className="pt-3 border-t border-white/15 mt-2">
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
    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
      <div>
        <div className="text-sm font-serif font-bold uppercase tracking-wide text-[#F5EFE6]">
          {title}
        </div>
        {usageCount > 0 ? (
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Ejecutada {usageCount}x · Eficacia actual {Math.round(mult * 100)}%
          </div>
        ) : null}
      </div>
      <span className="px-2 py-0.5 rounded-sm bg-[#1f0d16] border border-[#EB3F7D]/60 text-xs font-mono font-bold text-[#EB3F7D] shrink-0">
        -US$ {cost.toFixed(1).replace('.', ',')} M
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
  const borderCls = check.allowed ? 'border-white/15 hover:border-[#EB3F7D]/55' : 'border-[#1d2533] opacity-80';

  const handleActionClick = () => {
    onExecute(buildActionPayload(action.id, selectedProvinceId));
  };

  return (
    <div className={`hoi-panel rounded-sm p-5 flex flex-col justify-between transition ${borderCls}`}>
      <div>
        <ActionCardHeader title={action.title} usageCount={usageCount} mult={mult} cost={action.cost} />
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{action.description}</p>
        <ActionMediaStrip actionId={action.id} />
        <ActionPillsList effects={action.effects} multiplier={mult} />

        {action.requirementText ? (
          <div className="text-[11px] font-mono text-slate-400 bg-[#0b0508] border border-white/10 px-2.5 py-1.5 rounded-sm mb-2">
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

function filterCampaignActions(
  categoryFilter: 'TODAS' | CampaignActionCategory,
  searchQuery: string
): CampaignActionCard[] {
  const q = searchQuery.trim().toLowerCase();
  return CAMPAIGN_ACTIONS_CATALOG.filter((card) => {
    const matchesCat = categoryFilter === 'TODAS' || resolveActionCategory(card) === categoryFilter;
    if (!matchesCat) return false;
    if (!q) return true;
    return card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q);
  });
}

function ActionCategoryFilterBar({
  categoryFilter,
  searchQuery,
  totalFiltered,
  onSelectCategory,
  onSearchChange
}: {
  categoryFilter: 'TODAS' | CampaignActionCategory;
  searchQuery: string;
  totalFiltered: number;
  onSelectCategory: (cat: 'TODAS' | CampaignActionCategory) => void;
  onSearchChange: (q: string) => void;
}) {
  return (
    <div className="hoi-panel rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTION_CATEGORY_TABS.map((tab) => {
          const active = categoryFilter === tab.id;
          const cls = active
            ? 'bg-[#EB3F7D] text-[#090407] border-[#EB3F7D]'
            : 'bg-[#0b0508] text-slate-300 border-white/15 hover:border-slate-500';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3 py-1 rounded-sm border text-[11px] font-mono font-bold uppercase tracking-wider transition ${cls}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar operación..."
          className="bg-[#0b0508] border border-white/15 focus:border-[#EB3F7D] rounded-sm px-3 py-1 text-xs font-mono text-slate-200 focus:outline-none w-48"
        />
        <span className="text-[11px] font-mono text-[#f472b6] shrink-0">
          {totalFiltered}/{CAMPAIGN_ACTIONS_CATALOG.length}
        </span>
      </div>
    </div>
  );
}

export function CampaignActionsView({
  state,
  onExecuteAction,
  onAdvanceMonth
}: CampaignActionsViewProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState(state.targetProvinceId || 'PBA');
  const [categoryFilter, setCategoryFilter] = useState<'TODAS' | CampaignActionCategory>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActions = useMemo(
    () => filterCampaignActions(categoryFilter, searchQuery),
    [categoryFilter, searchQuery]
  );

  return (
    <div className="space-y-4">
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
            ESTRATEGIA · {CAMPAIGN_ACTIONS_CATALOG.length} OPERACIONES DE CAMPAÑA
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#F5EFE6] mt-0.5 uppercase tracking-wide">
            Acciones de campaña
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-sm bg-[#0b0508] border border-white/15 text-xs font-mono text-slate-300">
            ACCIONES MES: <strong className="text-sky-400">{state.actionsRemainingThisMonth}/{state.actionsTotalThisMonth}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-sm bg-[#0b0508] border border-[#EB3F7D]/60 text-xs font-mono text-slate-300">
            CAJA: <strong className="text-[#EB3F7D]">US$ {state.budgetArgentums.toFixed(1).replace('.', ',')} M</strong>
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

      <ActionCategoryFilterBar
        categoryFilter={categoryFilter}
        searchQuery={searchQuery}
        totalFiltered={filteredActions.length}
        onSelectCategory={setCategoryFilter}
        onSearchChange={setSearchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
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
