import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { playUiSound } from '@/lib/gameFeedback';
import type {
  BlocStance,
  ConcessionType,
  CongressBillCategory,
  CongressBillProject,
  CongressVoteOutcome,
  CongressNegotiationBloc,
  PolicyAction,
  SimulationState
} from '@argentina-sim/domain';
import {
  applyConcessionToBloc,
  buildDynamicParliamentaryBlocs,
  computeProvincialLoyaltyCongressDelta,
  executeFullCongressVote,
  INITIAL_CONGRESS_BILLS
} from '@argentina-sim/domain';
import { CongressRealtimeVoteModal } from './CongressRealtimeVoteModal.js';
import { OfficialInstitutionLogo, OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Vista de Rosca y Votacion de Leyes en formato de tarjetitas tacticas (estilo Reformas Institucionales):
// Catalogo de proyectos con filtros, buscador, tarjetas detalladas con impacto macro y proyeccion de bancas,
// mas mesa de concesiones bloque por bloque y votacion nominal en ambas camaras.

interface CongressBillsNegotiationSectionProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

function resolveStanceBadge(stance: BlocStance): { label: string; cls: string } {
  if (stance === 'A_FAVOR') {
    return { label: 'A favor', cls: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80' };
  }
  if (stance === 'EN_DUDA') {
    return { label: 'En duda', cls: 'bg-amber-950/80 text-amber-300 border-amber-700/80' };
  }
  return { label: 'En contra', cls: 'bg-rose-950/80 text-rose-300 border-rose-700/80' };
}

function sumProjectedYesVotes(blocs: CongressNegotiationBloc[], chamber: 'deputies' | 'senate'): number {
  return blocs.reduce((acc, b) => {
    const seats = chamber === 'deputies' ? b.deputiesSeats : b.senateSeats;
    const estFraction = b.probabilityYes / 100;
    return acc + Math.round(seats * estFraction);
  }, 0);
}

const PROJECTION_TONE_SPECS = {
  pass: {
    badgeCls: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    badgeLabel: 'Mayoría asegurada',
    barCls: 'bg-emerald-500'
  },
  short: {
    badgeCls: 'bg-rose-950/80 text-rose-300 border-rose-800',
    badgeLabel: 'Faltan votos',
    barCls: 'bg-amber-500'
  }
};

function resolveChamberProjectionDisplay(title: string, projectedYes: number, quorumNeeded: number) {
  const passes = projectedYes >= quorumNeeded;
  const spec = passes ? PROJECTION_TONE_SPECS.pass : PROJECTION_TONE_SPECS.short;
  const footerText = passes
    ? `Supera el umbral legal por ${projectedYes - quorumNeeded} votos.`
    : `Requiere negociar ${quorumNeeded - projectedYes} bancas en duda.`;
  const institutionId = title.includes('Diputados') ? ('DIPUTADOS' as const) : ('SENADO' as const);
  return { ...spec, institutionId, footerText };
}

function ChamberProjectionCard({
  title,
  projectedYes,
  totalSeats,
  quorumNeeded
}: {
  title: string;
  projectedYes: number;
  totalSeats: number;
  quorumNeeded: number;
}) {
  const pct = Math.min(100, Math.round((projectedYes / totalSeats) * 100));
  const ui = resolveChamberProjectionDisplay(title, projectedYes, quorumNeeded);

  return (
    <div className="hoi-panel p-4 rounded-sm flex flex-col justify-between">
      <div className="flex justify-between items-center text-xs gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <OfficialInstitutionLogo institution={ui.institutionId} heightPx={24} />
          <span className="font-mono font-bold uppercase tracking-wider text-white truncate">{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${ui.badgeCls}`}>
          {ui.badgeLabel}
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-extrabold text-white">{projectedYes}</span>
          <span className="text-xs text-slate-400 font-mono">
            / {totalSeats} (Quórum: {quorumNeeded})
          </span>
        </div>
        <div className="w-full bg-[#090d14] h-2 rounded-sm overflow-hidden border border-[#263142] mt-1.5">
          <div className={`h-full transition-all duration-300 ${ui.barCls}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="text-[11px] text-slate-400">{ui.footerText}</div>
    </div>
  );
}

const BILLS_PER_PAGE = 6;

const BILL_CATEGORY_FILTERS: Array<{ id: 'TODAS' | CongressBillCategory; label: string }> = [
  { id: 'TODAS', label: 'Todas las leyes' },
  { id: 'FISCAL_PRESUPUESTO', label: 'Fiscal y Presupuesto' },
  { id: 'TRIBUTARIA', label: 'Tributaria' },
  { id: 'LABORAL', label: 'Laboral' },
  { id: 'REFORMA_ESTRUCTURAL', label: 'Estructural' },
  { id: 'SEGURIDAD_JUSTICIA', label: 'Seguridad y Justicia' },
  { id: 'ENERGIA_INFRAESTRUCTURA', label: 'Energía e Infra' },
  { id: 'PRODUCCION_SOCIAL', label: 'Producción y Social' },
  { id: 'INSTITUCIONAL', label: 'Institucional' }
];

const CATEGORY_SHORT_LABELS: Record<CongressBillCategory, string> = {
  FISCAL_PRESUPUESTO: 'Fiscal · Mayoría absoluta (129 · 37)',
  TRIBUTARIA: 'Tributaria · Mayoría absoluta (129 · 37)',
  LABORAL: 'Laboral · Mayoría absoluta (129 · 37)',
  REFORMA_ESTRUCTURAL: 'Estructural · Mayoría absoluta (129 · 37)',
  SEGURIDAD_JUSTICIA: 'Seguridad y Justicia · (129 · 37)',
  ENERGIA_INFRAESTRUCTURA: 'Energía e Infraestructura · (129 · 37)',
  PRODUCCION_SOCIAL: 'Producción y Social · (129 · 37)',
  INSTITUCIONAL: 'Institucional · Mayoría calificada'
};

function matchesBillQuery(bill: CongressBillProject, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return bill.title.toLowerCase().includes(q) || bill.shortDescription.toLowerCase().includes(q);
}

function matchesBillFilters(
  bill: CongressBillProject,
  category: 'TODAS' | CongressBillCategory,
  status: string,
  query: string
): boolean {
  const catOk = category === 'TODAS' || bill.category === category;
  const statusOk = status === 'TODAS' || bill.status === status;
  return catOk && statusOk && matchesBillQuery(bill, query);
}

function resolveBillCardBorder(status: CongressBillProject['status'], isSelected: boolean): string {
  if (status === 'APROBADA') return 'bg-[#0e1917] border-emerald-600/70';
  if (isSelected) return 'bg-[#111928] border-[#b89342] shadow-lg';
  if (status === 'RECHAZADA') return 'bg-[#170f14] border-rose-800/60';
  return 'bg-[#0e131c] border-[#263142] hover:border-[#8a6d33]';
}

function resolveBillStatusBadge(
  status: CongressBillProject['status'],
  isSelected: boolean
): { cls: string; text: string } {
  if (status === 'APROBADA') {
    return { cls: 'bg-emerald-950/80 border border-emerald-700 text-emerald-300', text: 'SANCIONADA' };
  }
  if (status === 'RECHAZADA') {
    return { cls: 'bg-rose-950/80 border border-rose-700 text-rose-300', text: 'RECHAZADA' };
  }
  if (isSelected) {
    return { cls: 'bg-amber-950/80 border border-[#b89342] text-amber-200', text: 'EN ROSCA' };
  }
  return { cls: 'bg-[#090d14] border border-[#263142] text-slate-400', text: 'EN COMISIÓN' };
}

function ConsequencePill({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-sm bg-[#090d14] border border-[#263142] font-mono text-[10px] ${cls}`}>
      {label}: {value}
    </span>
  );
}

function GdpPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  return <ConsequencePill label="PBI" value={`+${delta}%`} cls="text-emerald-400" />;
}

function SuperavitPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  return <ConsequencePill label="Superávit" value={`+${delta} pp`} cls="text-sky-400" />;
}

function IpcPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  return <ConsequencePill label="IPC" value={`${delta}%`} cls="text-amber-400" />;
}

function RiesgoPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  return <ConsequencePill label="Riesgo" value={`${delta} pb`} cls="text-amber-300" />;
}

function ApprovalPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  const formatted = delta > 0 ? `+${delta}%` : `${delta}%`;
  return <ConsequencePill label="Aprobación" value={formatted} cls="text-teal-400" />;
}

function BillConsequencePills({ c }: { c: CongressBillProject['consequences'] }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <GdpPill delta={c.gdpGrowthDelta} />
      <SuperavitPill delta={c.primaryBalanceDelta} />
      <IpcPill delta={c.inflationDelta} />
      <RiesgoPill delta={c.countryRiskDelta} />
      <ApprovalPill delta={c.publicApprovalDelta} />
    </div>
  );
}

interface BillProjectCardProps {
  bill: CongressBillProject;
  state: SimulationState;
  isSelected: boolean;
  activeDeputiesYes: number;
  activeSenateYes: number;
  onSelect: () => void;
  onQuickVote: () => void;
}

function resolveCardProjectedVotes(
  bill: CongressBillProject,
  state: SimulationState,
  isSelected: boolean,
  activeDeputiesYes: number,
  activeSenateYes: number
): { depYes: number; senYes: number } {
  if (isSelected) {
    return { depYes: activeDeputiesYes, senYes: activeSenateYes };
  }
  const previewBlocs = buildDynamicParliamentaryBlocs(state, bill.category);
  return {
    depYes: sumProjectedYesVotes(previewBlocs, 'deputies'),
    senYes: sumProjectedYesVotes(previewBlocs, 'senate')
  };
}

function BillCardVoteMetrics({ depYes, senYes }: { depYes: number; senYes: number }) {
  const depColor = depYes >= 129 ? 'text-emerald-400' : 'text-amber-300';
  const senColor = senYes >= 37 ? 'text-emerald-400' : 'text-amber-300';

  return (
    <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs font-mono">
      <div className="p-2 rounded-sm bg-[#090d14] border border-[#263142]">
        <div className="text-[10px] text-slate-400 uppercase">Diputados (129)</div>
        <div className={`font-bold text-sm mt-0.5 ${depColor}`}>{depYes} / 257</div>
      </div>
      <div className="p-2 rounded-sm bg-[#090d14] border border-[#263142]">
        <div className="text-[10px] text-slate-400 uppercase">Senado (37)</div>
        <div className={`font-bold text-sm mt-0.5 ${senColor}`}>{senYes} / 72</div>
      </div>
    </div>
  );
}

function BillCardActionFooter({
  isSelected,
  isApproved,
  onSelect,
  onQuickVote
}: {
  isSelected: boolean;
  isApproved: boolean;
  onSelect: () => void;
  onQuickVote: () => void;
}) {
  const selectCls = isSelected
    ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
    : 'bg-[#090d14] text-slate-300 border-[#263142] hover:border-[#8a6d33] hover:text-amber-100';
  const voteCls = isApproved
    ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 cursor-default'
    : 'hoi-btn-gold';

  return (
    <div className="pt-3 border-t border-[#263142] flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => {
          playUiSound('tab');
          onSelect();
        }}
        className={`px-3 py-2 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wide border transition ${selectCls}`}
      >
        {isSelected ? '✓ En Mesa de Rosca' : 'Negociar proyecto'}
      </button>

      <button
        type="button"
        disabled={isApproved}
        onClick={() => {
          playUiSound('turn');
          onQuickVote();
        }}
        className={`px-3.5 py-2 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wide transition ${voteCls}`}
      >
        {isApproved ? 'Promulgada' : 'Votar ley'}
      </button>
    </div>
  );
}

function BillProjectCard({
  bill,
  state,
  isSelected,
  activeDeputiesYes,
  activeSenateYes,
  onSelect,
  onQuickVote
}: BillProjectCardProps) {
  const borderClass = resolveBillCardBorder(bill.status, isSelected);
  const badge = resolveBillStatusBadge(bill.status, isSelected);
  const { depYes, senYes } = resolveCardProjectedVotes(
    bill,
    state,
    isSelected,
    activeDeputiesYes,
    activeSenateYes
  );

  return (
    <div className={`rounded-sm border p-5 flex flex-col justify-between gap-4 transition ${borderClass}`}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-serif font-bold text-amber-100 leading-tight">{bill.title}</h3>
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold shrink-0 ${badge.cls}`}>
            {badge.text}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#132033] border border-[#334155] text-sky-200 inline-block">
          {CATEGORY_SHORT_LABELS[bill.category]}
        </span>

        <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{bill.shortDescription}</p>

        <BillConsequencePills c={bill.consequences} />

        <BillCardVoteMetrics depYes={depYes} senYes={senYes} />
      </div>

      <BillCardActionFooter
        isSelected={isSelected}
        isApproved={bill.status === 'APROBADA'}
        onSelect={onSelect}
        onQuickVote={onQuickVote}
      />
    </div>
  );
}

function BillPaginationBar({
  page,
  totalPages,
  totalFiltered,
  onPrev,
  onNext
}: {
  page: number;
  totalPages: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-400">
      <span>Mostrando {totalFiltered} proyectos legislativos en catálogo</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 0}
          className="p-1.5 rounded-sm border border-[#263142] bg-[#090d14] text-slate-300 disabled:opacity-35 hover:border-[#b89342]"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2.5 text-amber-200 font-bold">
          Página {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page + 1 >= totalPages}
          className="p-1.5 rounded-sm border border-[#263142] bg-[#090d14] text-slate-300 disabled:opacity-35 hover:border-[#b89342]"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function BillSelectorTab({
  bills,
  state,
  selectedBillId,
  activeDeputiesYes,
  activeSenateYes,
  onSelectBill,
  onQuickVoteBill
}: {
  bills: CongressBillProject[];
  state: SimulationState;
  selectedBillId: string;
  activeDeputiesYes: number;
  activeSenateYes: number;
  onSelectBill: (id: string) => void;
  onQuickVoteBill: (id: string) => void;
}) {
  const [selectedCat, setSelectedCat] = useState<'TODAS' | CongressBillCategory>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  const filteredBills = useMemo(
    () => bills.filter((b) => matchesBillFilters(b, selectedCat, statusFilter, searchQuery)),
    [bills, selectedCat, statusFilter, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / BILLS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageBills = filteredBills.slice(safePage * BILLS_PER_PAGE, (safePage + 1) * BILLS_PER_PAGE);
  const enactedCount = bills.filter((b) => b.status === 'APROBADA').length;

  return (
    <div className="space-y-4 border-b border-[#263142] pb-5">
      <div className="hoi-panel hoi-header-steel p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
            Orden del Día Parlamentario · Sesiones Ordinarias y Extraordinarias
          </div>
          <h2 className="text-lg md:text-xl font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
            Catálogo de Proyectos de Ley y Rosca Parlamentaria
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Seleccioná cualquier proyecto para abrir su mesa de negociación bloque por bloque o llevalo directo a votación nominal en Diputados (129) y Senado (37).
          </p>
        </div>
        <div className="shrink-0 px-3.5 py-2 rounded-sm bg-[#090d14] border border-[#b89342]/60 font-mono text-xs font-extrabold text-amber-200 text-center">
          {enactedCount} de {bills.length} sancionadas
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {BILL_CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playUiSound('tab');
                setSelectedCat(cat.id);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold border transition ${
                selectedCat === cat.id
                  ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
                  : 'bg-[#090d14] text-slate-400 border-[#263142] hover:text-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filtrar proyectos por estado"
            className="px-2.5 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] text-xs text-slate-200 font-mono focus:border-[#b89342] focus:outline-none"
          >
            <option value="TODAS">Todos ({bills.length})</option>
            <option value="PENDIENTE">En comisión</option>
            <option value="APROBADA">Sancionadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>

          <label className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder={`Buscar (${filteredBills.length}/${bills.length})...`}
              className="pl-8 pr-3 py-1.5 w-52 rounded-sm bg-[#090d14] border border-[#263142] focus:border-[#b89342] focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 font-mono"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageBills.map((b) => (
          <BillProjectCard
            key={b.id}
            bill={b}
            state={state}
            isSelected={b.id === selectedBillId}
            activeDeputiesYes={activeDeputiesYes}
            activeSenateYes={activeSenateYes}
            onSelect={() => onSelectBill(b.id)}
            onQuickVote={() => onQuickVoteBill(b.id)}
          />
        ))}
      </div>

      <BillPaginationBar
        page={safePage}
        totalPages={totalPages}
        totalFiltered={filteredBills.length}
        onPrev={() => setPage(Math.max(0, safePage - 1))}
        onNext={() => setPage(Math.min(totalPages - 1, safePage + 1))}
      />
    </div>
  );
}

function BillSoftenedButton({
  isSoftened,
  onSoftToggle
}: {
  isSoftened?: boolean;
  onSoftToggle: () => void;
}) {
  const label = isSoftened ? 'Artículos Suavizados (+15% afinidad)' : 'Suavizar artículos (+15% afinidad)';
  const cls = isSoftened
    ? 'bg-amber-950/80 text-amber-200 border-[#b89342]'
    : 'bg-[#090d14] text-slate-300 border-[#263142] hover:text-white';

  return (
    <button
      type="button"
      onClick={() => {
        playUiSound('select');
        onSoftToggle();
      }}
      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold border transition inline-flex items-center gap-1.5 ${cls}`}
    >
      {isSoftened ? <Check className="w-3.5 h-3.5 text-amber-300" /> : null}
      {label}
    </button>
  );
}

function BillOverviewCard({
  bill,
  onSoftToggle
}: {
  bill: CongressBillProject;
  onSoftToggle: () => void;
}) {
  return (
    <div className="hoi-panel p-5 rounded-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#263142] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
            Mesa de Rosca Activa · {bill.category}
          </span>
          <h2 className="text-xl font-serif font-bold text-amber-100 mt-0.5">{bill.title}</h2>
        </div>
        <BillSoftenedButton isSoftened={bill.isSoftened} onSoftToggle={onSoftToggle} />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{bill.shortDescription}</p>
      <BillConsequencePills c={bill.consequences} />
    </div>
  );
}

function ConcessionItemButton({
  hasConcession,
  label,
  activeLabel,
  onClick
}: {
  hasConcession: boolean;
  label: string;
  activeLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={hasConcession}
      onClick={() => {
        playUiSound('atn');
        onClick();
      }}
      className={`px-2 py-1.5 rounded-sm text-[10px] font-mono font-bold border transition inline-flex items-center justify-center gap-1 ${
        hasConcession
          ? 'bg-[#090d14] border-[#263142] text-emerald-400/70 cursor-not-allowed'
          : 'bg-[#111824] border-[#344661] text-slate-200 hover:text-amber-200 hover:border-[#b89342]'
      }`}
    >
      {hasConcession ? <Check className="w-3 h-3 shrink-0" /> : null}
      <span>{hasConcession ? activeLabel : label}</span>
    </button>
  );
}

interface BlocNegotiationCardProps {
  bloc: CongressNegotiationBloc;
  onConcession: (blocId: string, concession: ConcessionType) => void;
}

function BlocConcessionButtons({
  bloc,
  onConcession
}: {
  bloc: CongressNegotiationBloc;
  onConcession: (blocId: string, concession: ConcessionType) => void;
}) {
  if (bloc.id === 'LLA') return null;

  const hasArgentums = bloc.concessionsReceived.includes('ARGENTUMS');
  const hasGabinete = bloc.concessionsReceived.includes('GABINETE');
  const hasGobernadores = bloc.concessionsReceived.includes('GOBERNADORES');

  return (
    <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Concesiones disponibles
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <ConcessionItemButton
          hasConcession={hasArgentums}
          label="Obra Pública (-30¥)"
          activeLabel="Obra asignada"
          onClick={() => onConcession(bloc.id, 'ARGENTUMS')}
        />
        <ConcessionItemButton
          hasConcession={hasGabinete}
          label="Cupo Gabinete"
          activeLabel="Cargo cedido"
          onClick={() => onConcession(bloc.id, 'GABINETE')}
        />
        <ConcessionItemButton
          hasConcession={hasGobernadores}
          label="Pacto Gobernadores"
          activeLabel="Gobernadores"
          onClick={() => onConcession(bloc.id, 'GOBERNADORES')}
        />
      </div>
    </div>
  );
}

function BlocNegotiationCard({ bloc, onConcession }: BlocNegotiationCardProps) {
  const stanceInfo = resolveStanceBadge(bloc.currentStance);

  return (
    <div className="hoi-panel p-4 rounded-sm flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <OfficialPartyLogo partyIdOrSigla={bloc.id} sizePx={24} fallbackColor={bloc.color} />
            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-extrabold shrink-0 ${bloc.badgeBg}`}>
              {bloc.shortLabel}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[130px]">{bloc.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold shrink-0 ${stanceInfo.cls}`}>
            {stanceInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#263142] text-[11px] font-mono">
          <div>
            <span className="text-slate-400">Diputados:</span>{' '}
            <strong className="text-white">{bloc.deputiesSeats}</strong>
          </div>
          <div>
            <span className="text-slate-400">Senado:</span>{' '}
            <strong className="text-white">{bloc.senateSeats}</strong>
          </div>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between">
          <span className="text-slate-400">Probabilidad de voto afirmativo:</span>
          <strong className="text-emerald-400 font-mono text-sm">{bloc.probabilityYes}%</strong>
        </div>
      </div>

      <BlocConcessionButtons bloc={bloc} onConcession={onConcession} />
    </div>
  );
}

function resolveBillPersistedStatus(
  id: string,
  enactedSet: Set<string>,
  rejectedSet: Set<string>
): CongressBillProject['status'] {
  if (enactedSet.has(id)) return 'APROBADA';
  if (rejectedSet.has(id)) return 'RECHAZADA';
  return 'PENDIENTE';
}

export function CongressBillsNegotiationSection({
  state,
  onDispatch
}: CongressBillsNegotiationSectionProps) {
  const [softenedIds, setSoftenedIds] = useState<string[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>(INITIAL_CONGRESS_BILLS[0]!.id);
  const [blocs, setBlocs] = useState<CongressNegotiationBloc[]>(() =>
    buildDynamicParliamentaryBlocs(state, INITIAL_CONGRESS_BILLS[0]?.category)
  );
  const [voteOutcome, setVoteOutcome] = useState<CongressVoteOutcome | null>(null);

  const bills = useMemo(() => {
    const enacted = new Set(state.enactedBillIds ?? []);
    const rejected = new Set(state.rejectedBillIds ?? []);
    const soft = new Set(softenedIds);
    return INITIAL_CONGRESS_BILLS.map((b) => ({
      ...b,
      isSoftened: soft.has(b.id),
      status: resolveBillPersistedStatus(b.id, enacted, rejected)
    }));
  }, [state.enactedBillIds, state.rejectedBillIds, softenedIds]);

  const selectedBill = useMemo(
    () => bills.find((b) => b.id === selectedBillId) ?? bills[0]!,
    [bills, selectedBillId]
  );

  const approval = state.publicOpinion?.managementApprovalPct ?? 50;
  const provCongressDelta = computeProvincialLoyaltyCongressDelta(state);
  const projectedDeputiesYes = useMemo(() => sumProjectedYesVotes(blocs, 'deputies'), [blocs]);
  const projectedSenateYes = useMemo(() => sumProjectedYesVotes(blocs, 'senate'), [blocs]);

  const handleToggleSoftened = () => {
    setSoftenedIds((prev) =>
      prev.includes(selectedBillId) ? prev.filter((id) => id !== selectedBillId) : [...prev, selectedBillId]
    );
  };

  const handleApplyConcession = (blocId: string, concession: ConcessionType) => {
    const congressTrust = state.trustLedger?.CONGRESO ?? 52;
    setBlocs((prev) =>
      prev.map((b) =>
        b.id === blocId
          ? applyConcessionToBloc(b, concession, approval, selectedBill.isSoftened, selectedBill.category, congressTrust)
          : b
      )
    );
    onDispatch({ type: 'GRANT_BLOC_CONCESSION', blocId, concession });
  };

  const handleSelectBill = (billId: string) => {
    setSelectedBillId(billId);
    const nextBill = bills.find((b) => b.id === billId);
    setBlocs(buildDynamicParliamentaryBlocs(state, nextBill?.category));
    setVoteOutcome(null);
  };

  const executeVoteForBill = (targetBill: CongressBillProject, targetBlocs: CongressNegotiationBloc[]) => {
    const outcome = executeFullCongressVote(targetBill, targetBlocs, Date.now());
    setVoteOutcome(outcome);
    if (outcome.passed) {
      onDispatch({ type: 'ENACT_CONGRESS_BILL', billId: targetBill.id });
    } else {
      onDispatch({ type: 'REJECT_CONGRESS_BILL', billId: targetBill.id });
    }
  };

  const handleQuickVoteBill = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;
    if (billId === selectedBill.id) {
      executeVoteForBill(selectedBill, blocs);
      return;
    }
    const targetBlocs = buildDynamicParliamentaryBlocs(state, targetBill.category);
    setSelectedBillId(billId);
    setBlocs(targetBlocs);
    executeVoteForBill(targetBill, targetBlocs);
  };

  return (
    <div className="space-y-6">
      <BillSelectorTab
        bills={bills}
        state={state}
        selectedBillId={selectedBill.id}
        activeDeputiesYes={projectedDeputiesYes}
        activeSenateYes={projectedSenateYes}
        onSelectBill={handleSelectBill}
        onQuickVoteBill={handleQuickVoteBill}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChamberProjectionCard
          title="Cámara de Diputados"
          projectedYes={projectedDeputiesYes}
          totalSeats={257}
          quorumNeeded={129}
        />
        <ChamberProjectionCard
          title="Senado de la Nación"
          projectedYes={projectedSenateYes}
          totalSeats={72}
          quorumNeeded={37}
        />
      </div>

      <BillOverviewCard bill={selectedBill} onSoftToggle={handleToggleSoftened} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263142] pb-3">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Negociación bloque por bloque</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cede obras, cargos o suaviza articulados con los bloques en duda. Clima provincial PF/PROV:{' '}
            <strong className={provCongressDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
              {provCongressDelta >= 0 ? `+${provCongressDelta}` : provCongressDelta}%
            </strong>
          </p>
        </div>
        <button
          type="button"
          disabled={selectedBill.status === 'APROBADA'}
          onClick={() => {
            playUiSound('turn');
            executeVoteForBill(selectedBill, blocs);
          }}
          className="hoi-btn-gold px-4 py-2 rounded-sm font-mono font-extrabold text-xs uppercase tracking-wide flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <span>{selectedBill.status === 'APROBADA' ? 'Ley ya sancionada' : 'Llevar a votación en el recinto'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocs.map((b) => (
          <BlocNegotiationCard
            key={b.id}
            bloc={b}
            onConcession={handleApplyConcession}
          />
        ))}
      </div>

      <CongressRealtimeVoteModal
        outcome={voteOutcome}
        blocs={blocs}
        onClose={() => setVoteOutcome(null)}
      />
    </div>
  );
}
