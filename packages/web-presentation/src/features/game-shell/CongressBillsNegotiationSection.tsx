import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { playUiSound } from '@/lib/gameFeedback';
import type {
  BlocStance,
  ChamberVoteDetail,
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
  const passes = projectedYes >= quorumNeeded;
  const pct = Math.min(100, Math.round((projectedYes / totalSeats) * 100));

  return (
    <div className="hoi-panel p-4 rounded-sm flex flex-col justify-between">
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono font-bold uppercase tracking-wider text-white">{title}</span>
        <span
          className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${
            passes
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/80 text-rose-300 border-rose-800'
          }`}
        >
          {passes ? 'Mayoría asegurada' : 'Faltan votos'}
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
          <div
            className={`h-full transition-all duration-300 ${
              passes ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="text-[11px] text-slate-400">
        {passes
          ? `Supera el umbral legal por ${projectedYes - quorumNeeded} votos.`
          : `Requiere negociar ${quorumNeeded - projectedYes} bancas en duda.`}
      </div>
    </div>
  );
}

const BILLS_PER_PAGE = 9;

const BILL_CATEGORY_FILTERS: Array<{ id: 'TODAS' | CongressBillCategory; label: string }> = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'FISCAL_PRESUPUESTO', label: 'Fiscal' },
  { id: 'TRIBUTARIA', label: 'Tributaria' },
  { id: 'LABORAL', label: 'Laboral' },
  { id: 'REFORMA_ESTRUCTURAL', label: 'Estructural' },
  { id: 'SEGURIDAD_JUSTICIA', label: 'Seguridad' },
  { id: 'ENERGIA_INFRAESTRUCTURA', label: 'Energía e Infra' },
  { id: 'PRODUCCION_SOCIAL', label: 'Producción' },
  { id: 'INSTITUCIONAL', label: 'Institucional' }
];

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

function BillStatusBadge({ status }: { status: CongressBillProject['status'] }) {
  if (status === 'APROBADA') {
    return (
      <span className="px-1.5 py-0.2 rounded-sm text-[9px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-extrabold shrink-0">
        SANCIONADA
      </span>
    );
  }
  if (status === 'RECHAZADA') {
    return (
      <span className="px-1.5 py-0.2 rounded-sm text-[9px] bg-rose-950 border border-rose-700 text-rose-300 font-extrabold shrink-0">
        RECHAZADA
      </span>
    );
  }
  return null;
}

function BillOptionButton({
  bill,
  isSelected,
  onSelect
}: {
  bill: CongressBillProject;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playUiSound('tab');
        onSelect();
      }}
      className={`px-3 py-2 rounded-sm text-xs font-mono font-bold transition flex items-center justify-between gap-2 border text-left ${
        isSelected
          ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
          : 'bg-[#090d14] text-slate-400 border-[#263142] hover:text-slate-100 hover:border-slate-500'
      }`}
    >
      <span className="truncate">{bill.title}</span>
      <BillStatusBadge status={bill.status} />
    </button>
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
      <span>{totalFiltered} proyectos coincidentes</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 0}
          className="p-1 rounded-sm border border-[#263142] bg-[#090d14] text-slate-300 disabled:opacity-35 hover:border-[#b89342]"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 text-slate-300">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page + 1 >= totalPages}
          className="p-1 rounded-sm border border-[#263142] bg-[#090d14] text-slate-300 disabled:opacity-35 hover:border-[#b89342]"
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
  selectedBillId,
  onSelectBill
}: {
  bills: CongressBillProject[];
  selectedBillId: string;
  onSelectBill: (id: string) => void;
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

  return (
    <div className="space-y-3 border-b border-[#263142] pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {BILL_CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCat(cat.id);
                setPage(0);
              }}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold border transition ${
                selectedCat === cat.id
                  ? 'bg-[#1d3250] text-amber-200 border-[#b89342]'
                  : 'bg-[#090d14] text-slate-400 border-[#263142] hover:text-slate-200'
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
            <option value="PENDIENTE">Pendientes</option>
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
              placeholder="Buscar proyecto de ley..."
              className="pl-8 pr-3 py-1.5 w-52 rounded-sm bg-[#090d14] border border-[#263142] focus:border-[#b89342] focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 font-mono"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {pageBills.map((b) => (
          <BillOptionButton
            key={b.id}
            bill={b}
            isSelected={b.id === selectedBillId}
            onSelect={() => onSelectBill(b.id)}
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

function ConsequencePill({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#263142] font-mono ${cls}`}>
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
  return <ConsequencePill label="Riesgo país" value={`${delta} pb`} cls="text-amber-300" />;
}

function ApprovalPill({ delta }: { delta?: number }) {
  if (!delta) return null;
  const formatted = delta > 0 ? `+${delta}%` : `${delta}%`;
  return <ConsequencePill label="Aprobación" value={formatted} cls="text-teal-400" />;
}

function BillConsequencePills({ c }: { c: CongressBillProject['consequences'] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1 text-xs">
      <GdpPill delta={c.gdpGrowthDelta} />
      <SuperavitPill delta={c.primaryBalanceDelta} />
      <IpcPill delta={c.inflationDelta} />
      <RiesgoPill delta={c.countryRiskDelta} />
      <ApprovalPill delta={c.publicApprovalDelta} />
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
            Proyecto de Ley · {bill.category}
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">{bill.title}</h2>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-extrabold ${bloc.badgeBg}`}>
              {bloc.shortLabel}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">{bloc.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold ${stanceInfo.cls}`}>
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

function ChamberVoteBreakdownTable({ detail }: { detail: ChamberVoteDetail }) {
  const isDip = detail.chamber === 'DIPUTADOS';
  return (
    <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] space-y-2">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-white">{isDip ? 'Cámara de Diputados' : 'Senado de la Nación'}</span>
        <span className={detail.passed ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
          {detail.yesVotes} afirmativos / {detail.totalSeats} (Quórum: {detail.quorumNeeded})
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
        <div className="p-2 rounded-sm bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
          <div>Afirmativos</div>
          <div className="text-lg font-bold">{detail.yesVotes}</div>
        </div>
        <div className="p-2 rounded-sm bg-rose-950/40 border border-rose-800/60 text-rose-300">
          <div>Negativos</div>
          <div className="text-lg font-bold">{detail.noVotes}</div>
        </div>
        <div className="p-2 rounded-sm bg-[#111824] border border-[#263142] text-slate-400">
          <div>Abstenciones</div>
          <div className="text-lg font-bold">{detail.abstentions}</div>
        </div>
      </div>
    </div>
  );
}

function VoteResultModal({
  outcome,
  onClose
}: {
  outcome: CongressVoteOutcome | null;
  onClose: () => void;
}) {
  if (!outcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg hoi-panel rounded-sm p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start border-b border-[#263142] pb-3">
          <div>
            <span
              className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border uppercase ${
                outcome.passed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border-rose-700'
              }`}
            >
              {outcome.passed ? 'PROYECTO SANCIONADO' : 'PROYECTO RECHAZADO'}
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">{outcome.billTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar recinto"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{outcome.summaryMessage}</p>

        <div className="space-y-3">
          <ChamberVoteBreakdownTable detail={outcome.deputies} />
          <ChamberVoteBreakdownTable detail={outcome.senate} />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="hoi-btn-gold w-full py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wide"
          >
            Entendido · Cerrar recinto
          </button>
        </div>
      </div>
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
  const [blocs, setBlocs] = useState<CongressNegotiationBloc[]>(() => buildDynamicParliamentaryBlocs(state));
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
    setBlocs((prev) =>
      prev.map((b) => (b.id === blocId ? applyConcessionToBloc(b, concession, approval, selectedBill.isSoftened) : b))
    );
    onDispatch({ type: 'GRANT_BLOC_CONCESSION', blocId, concession });
  };

  const handleExecuteRecintoVote = () => {
    const outcome = executeFullCongressVote(selectedBill, blocs, Date.now());
    setVoteOutcome(outcome);
    if (outcome.passed) {
      onDispatch({ type: 'ENACT_CONGRESS_BILL', billId: selectedBill.id });
    } else {
      onDispatch({ type: 'REJECT_CONGRESS_BILL', billId: selectedBill.id });
    }
  };

  return (
    <div className="space-y-6">
      <BillSelectorTab
        bills={bills}
        selectedBillId={selectedBill.id}
        onSelectBill={setSelectedBillId}
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
            handleExecuteRecintoVote();
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

      <VoteResultModal outcome={voteOutcome} onClose={() => setVoteOutcome(null)} />
    </div>
  );
}
