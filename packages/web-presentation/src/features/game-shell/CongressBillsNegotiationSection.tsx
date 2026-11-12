import React, { useMemo, useState } from 'react';
import type {
  BlocStance,
  ChamberVoteDetail,
  ConcessionType,
  CongressBillProject,
  CongressVoteOutcome,
  CongressNegotiationBloc,
  PolicyAction,
  SimulationState
} from '@argentina-sim/domain';
import {
  applyConcessionToBloc,
  executeFullCongressVote,
  INITIAL_CONGRESS_BILLS,
  INITIAL_PARLIAMENTARY_BLOCS
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
    <div className="p-4 rounded-2xl bg-[#10131b] border border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center text-xs">
        <span className="font-extrabold text-white">{title}</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            passes
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/80 text-rose-300 border-rose-800'
          }`}
        >
          {passes ? 'Mayoria asegurada' : 'Faltan votos'}
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-extrabold text-white">{projectedYes}</span>
          <span className="text-xs text-slate-400 font-mono">
            / {totalSeats} (Quórum: {quorumNeeded})
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
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

function BillSelectorTab({
  bills,
  selectedBillId,
  onSelectBill
}: {
  bills: CongressBillProject[];
  selectedBillId: string;
  onSelectBill: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
      {bills.map((b) => {
        const isSelected = b.id === selectedBillId;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBill(b.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              isSelected
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-[#10131b] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>{b.title}</span>
            {b.status === 'APROBADA' && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-extrabold">
                SANCIONADA
              </span>
            )}
            {b.status === 'RECHAZADA' && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-950 border border-rose-700 text-rose-300 font-extrabold">
                RECHAZADA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ConsequencePill({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg bg-[#0b0e15] border border-slate-800 font-mono ${cls}`}>
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
  return <ConsequencePill label="Riesgo país" value={`${delta} pb`} cls="text-purple-400" />;
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
  const label = isSoftened ? '✓ Artículos Suavizados (+15% afinidad)' : 'Suavizar artículos (+15% afinidad)';
  const cls = isSoftened
    ? 'bg-amber-950/80 text-amber-300 border-amber-600'
    : 'bg-[#0b0e15] text-slate-400 border-slate-800 hover:text-white';

  return (
    <button type="button" onClick={onSoftToggle} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${cls}`}>
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
    <div className="p-5 rounded-2xl bg-[#10131b] border border-slate-800 shadow-md space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
            PROYECTO DE LEY · {bill.category}
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
      onClick={onClick}
      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition ${
        hasConcession
          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
          : 'bg-[#10131b] border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
      }`}
    >
      {hasConcession ? activeLabel : label}
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
          activeLabel="✓ Obra asignada"
          onClick={() => onConcession(bloc.id, 'ARGENTUMS')}
        />
        <ConcessionItemButton
          hasConcession={hasGabinete}
          label="Cupo Gabinete"
          activeLabel="✓ Cargo cedido"
          onClick={() => onConcession(bloc.id, 'GABINETE')}
        />
        <ConcessionItemButton
          hasConcession={hasGobernadores}
          label="Pacto Gobernadores"
          activeLabel="✓ Gobernadores"
          onClick={() => onConcession(bloc.id, 'GOBERNADORES')}
        />
      </div>
    </div>
  );
}

function BlocNegotiationCard({ bloc, onConcession }: BlocNegotiationCardProps) {
  const stanceInfo = resolveStanceBadge(bloc.currentStance);

  return (
    <div className="p-4 rounded-2xl bg-[#0b0e15] border border-slate-800 flex flex-col justify-between space-y-3 shadow">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${bloc.badgeBg}`}>
              {bloc.shortLabel}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">{bloc.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${stanceInfo.cls}`}>
            {stanceInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div>
            <span className="text-slate-500">Diputados:</span>{' '}
            <strong className="text-white">{bloc.deputiesSeats}</strong>
          </div>
          <div>
            <span className="text-slate-500">Senado:</span>{' '}
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
    <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-2">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-white">{isDip ? 'Cámara de Diputados' : 'Senado de la Nación'}</span>
        <span className={detail.passed ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
          {detail.yesVotes} afirmativos / {detail.totalSeats} (Quórum: {detail.quorumNeeded})
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
          <div>Afirmativos</div>
          <div className="text-lg font-bold">{detail.yesVotes}</div>
        </div>
        <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
          <div>Negativos</div>
          <div className="text-lg font-bold">{detail.noVotes}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
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
      <div className="w-full max-w-lg rounded-2xl bg-[#10131b] border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
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
            className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1"
          >
            ✕
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
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow transition"
          >
            Entendido · Cerrar recinto
          </button>
        </div>
      </div>
    </div>
  );
}

export function CongressBillsNegotiationSection({
  state,
  onDispatch
}: CongressBillsNegotiationSectionProps) {
  const [bills, setBills] = useState<CongressBillProject[]>(INITIAL_CONGRESS_BILLS);
  const [selectedBillId, setSelectedBillId] = useState<string>(INITIAL_CONGRESS_BILLS[0]!.id);
  const [blocs, setBlocs] = useState<CongressNegotiationBloc[]>(INITIAL_PARLIAMENTARY_BLOCS);
  const [voteOutcome, setVoteOutcome] = useState<CongressVoteOutcome | null>(null);

  const selectedBill = useMemo(
    () => bills.find((b) => b.id === selectedBillId) ?? bills[0]!,
    [bills, selectedBillId]
  );

  const approval = state.publicOpinion?.managementApprovalPct ?? 50;
  const projectedDeputiesYes = useMemo(() => sumProjectedYesVotes(blocs, 'deputies'), [blocs]);
  const projectedSenateYes = useMemo(() => sumProjectedYesVotes(blocs, 'senate'), [blocs]);

  const handleToggleSoftened = () => {
    setBills((prev) =>
      prev.map((b) => (b.id === selectedBillId ? { ...b, isSoftened: !b.isSoftened } : b))
    );
  };

  const handleApplyConcession = (blocId: string, concession: ConcessionType) => {
    setBlocs((prev) =>
      prev.map((b) => {
        if (b.id !== blocId) return b;
        return applyConcessionToBloc(b, concession, approval, selectedBill.isSoftened);
      })
    );
  };

  const handleExecuteRecintoVote = () => {
    const outcome = executeFullCongressVote(selectedBill, blocs, Date.now());
    setVoteOutcome(outcome);

    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBill.id) return b;
        return { ...b, status: outcome.passed ? 'APROBADA' : 'RECHAZADA' };
      })
    );

    if (outcome.passed) {
      onDispatch({ type: 'ENACT_CONGRESS_BILL', billId: selectedBill.id });
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

      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h3 className="text-base font-extrabold text-white">Negociación bloque por bloque</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cede obras, cargos o suaviza articulados con los bloques en duda para llegar al quórum.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExecuteRecintoVote}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-900/30 transition flex items-center gap-2"
        >
          <span>Llevar a votación en el recinto</span>
          <span>➜</span>
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
