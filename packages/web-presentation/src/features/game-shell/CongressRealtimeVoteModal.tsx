import React, { useEffect, useMemo, useState } from 'react';
import { Check, FastForward, RotateCcw, X } from 'lucide-react';
import type {
  ChamberVoteDetail,
  CongressNegotiationBloc,
  CongressVoteOutcome
} from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';
import {
  BillChaptersParticularVotePanel,
  Congress3DHemicycleCanvas
} from './Congress3DHemicycleCanvas.js';
import { OfficialInstitutionLogo, OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Tablero Electronico de Votacion Nominal en Tiempo Real (Diputados 257 / Senado 72).
// Simula el encendido banca por banca y bloque por espacio politico como en el recinto real.

type SeatVoteType = 'YES' | 'NO' | 'ABST';

interface SeatDotItem {
  index: number;
  x: number;
  y: number;
  blocId: string;
  blocLabel: string;
  blocName: string;
  blocColor: string;
  vote: SeatVoteType;
}

interface BlocLiveTally {
  bloc: CongressNegotiationBloc;
  totalSeats: number;
  yes: number;
  no: number;
  abst: number;
}

const VOTE_FILL_COLOR: Record<SeatVoteType, string> = {
  YES: '#10b981',
  NO: '#ef4444',
  ABST: '#f59e0b'
};

const VOTE_LABEL_ES: Record<SeatVoteType, string> = {
  YES: 'AFIRMATIVO',
  NO: 'NEGATIVO',
  ABST: 'ABSTENCIÓN'
};

function computeRowRadii(rowsCount: number, rMin: number, rMax: number): number[] {
  const radii: number[] = [];
  for (let i = 0; i < rowsCount; i++) {
    radii.push(rMin + (i * (rMax - rMin)) / Math.max(1, rowsCount - 1));
  }
  return radii;
}

function computeRowSeats(radii: number[], totalSeats: number): number[] {
  const sumRadii = radii.reduce((a, b) => a + b, 0);
  const rowSeats = radii.map((r) => Math.round((r / sumRadii) * totalSeats));
  const diff = totalSeats - rowSeats.reduce((a, b) => a + b, 0);
  const lastIdx = Math.max(0, rowSeats.length - 1);
  rowSeats[lastIdx] = (rowSeats[lastIdx] ?? 0) + diff;
  return rowSeats;
}

function buildRowPoints(radius: number, count: number): Array<{ x: number; y: number; angle: number }> {
  const points: Array<{ x: number; y: number; angle: number }> = [];
  const denom = Math.max(1, count - 1);
  for (let s = 0; s < count; s++) {
    const angle = Math.PI - (s / denom) * Math.PI;
    points.push({
      x: Number((radius * Math.cos(angle)).toFixed(1)),
      y: Number((-radius * Math.sin(angle)).toFixed(1)),
      angle
    });
  }
  return points;
}

function computeHemicycleCoordinates(
  totalSeats: number,
  rowsCount: number,
  rMin: number,
  rMax: number
): Array<{ x: number; y: number; angle: number }> {
  const radii = computeRowRadii(rowsCount, rMin, rMax);
  const rowSeats = computeRowSeats(radii, totalSeats);
  const points: Array<{ x: number; y: number; angle: number }> = [];

  for (let row = 0; row < rowsCount; row++) {
    const r = radii[row] ?? rMin;
    const count = Math.max(1, rowSeats[row] ?? 1);
    points.push(...buildRowPoints(r, count));
  }
  points.sort((a, b) => b.angle - a.angle);
  return points;
}

function buildBlocSeatVotesList(split: { yes: number; no: number; abstention: number }): SeatVoteType[] {
  const list: SeatVoteType[] = [];
  for (let i = 0; i < split.yes; i++) list.push('YES');
  for (let i = 0; i < split.no; i++) list.push('NO');
  for (let i = 0; i < split.abstention; i++) list.push('ABST');
  return list;
}

function getOrderedBlocs(blocs: CongressNegotiationBloc[]): CongressNegotiationBloc[] {
  const orderedIds = ['FIT', 'UXP', 'UCR', 'PF', 'PROVINCIALES', 'PRO', 'LLA'];
  return orderedIds
    .map((id) => blocs.find((b) => b.id === id))
    .filter((b): b is CongressNegotiationBloc => b !== undefined);
}

function appendBlocSeats(
  seats: SeatDotItem[],
  coords: Array<{ x: number; y: number }>,
  bloc: CongressNegotiationBloc,
  votes: SeatVoteType[],
  startCursor: number
): number {
  let cursor = startCursor;
  for (const v of votes) {
    const pt = coords[cursor];
    if (pt) {
      seats.push({
        index: cursor,
        x: pt.x,
        y: pt.y,
        blocId: bloc.id,
        blocLabel: bloc.shortLabel,
        blocName: bloc.name,
        blocColor: bloc.color,
        vote: v
      });
    }
    cursor++;
  }
  return cursor;
}

function buildChamberSeats(
  detail: ChamberVoteDetail,
  blocs: CongressNegotiationBloc[]
): SeatDotItem[] {
  const isDip = detail.chamber === 'DIPUTADOS';
  const coords = computeHemicycleCoordinates(
    detail.totalSeats,
    isDip ? 8 : 4,
    68,
    isDip ? 148 : 138
  );

  const orderedBlocs = getOrderedBlocs(blocs);
  const seats: SeatDotItem[] = [];
  let cursor = 0;

  for (const bloc of orderedBlocs) {
    const split = detail.blocVotes[bloc.id] ?? { yes: 0, no: 0, abstention: 0 };
    const votes = buildBlocSeatVotesList(split);
    cursor = appendBlocSeats(seats, coords, bloc, votes, cursor);
  }
  return seats;
}

function computeLiveCounts(seats: SeatDotItem[], revealedCount: number) {
  const counts = { YES: 0, NO: 0, ABST: 0 };
  const limit = Math.min(seats.length, revealedCount);
  for (let i = 0; i < limit; i++) {
    const v = seats[i]?.vote;
    if (v) counts[v]++;
  }
  return {
    yes: counts.YES,
    no: counts.NO,
    abst: counts.ABST,
    present: counts.YES + counts.NO + counts.ABST
  };
}

function countRevealedForBloc(seats: SeatDotItem[], limit: number, blocId: string) {
  const counts = { YES: 0, NO: 0, ABST: 0 };
  for (let i = 0; i < limit; i++) {
    const s = seats[i];
    if (s && s.blocId === blocId) {
      counts[s.vote]++;
    }
  }
  return { yes: counts.YES, no: counts.NO, abst: counts.ABST };
}

function computeBlocLiveTallies(
  seats: SeatDotItem[],
  revealedCount: number,
  blocs: CongressNegotiationBloc[],
  chamber: 'DIPUTADOS' | 'SENADO'
): BlocLiveTally[] {
  const limit = Math.min(seats.length, revealedCount);
  return blocs.map((b) => {
    const tally = countRevealedForBloc(seats, limit, b.id);
    const totalSeats = chamber === 'DIPUTADOS' ? b.deputiesSeats : b.senateSeats;
    return {
      bloc: b,
      totalSeats,
      yes: tally.yes,
      no: tally.no,
      abst: tally.abst
    };
  });
}

function SeatCircleNode({
  seat,
  isRevealed,
  radius
}: {
  seat: SeatDotItem;
  isRevealed: boolean;
  radius: number;
}) {
  const fill = isRevealed ? VOTE_FILL_COLOR[seat.vote] : '#111827';
  const stroke = isRevealed ? '#070a10' : seat.blocColor;
  const strokeWidth = isRevealed ? 0.9 : 1.1;
  const voteLabel = isRevealed ? VOTE_LABEL_ES[seat.vote] : 'Identificándose';

  return (
    <circle
      cx={180 + seat.x}
      cy={175 + seat.y}
      r={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className="transition-colors duration-150"
    >
      <title>
        {seat.blocName} · Banca #{seat.index + 1}: {voteLabel}
      </title>
    </circle>
  );
}

function LiveHemicycleSvg({
  seats,
  revealedCount,
  detail,
  liveYes,
  liveNo
}: {
  seats: SeatDotItem[];
  revealedCount: number;
  detail: ChamberVoteDetail;
  liveYes: number;
  liveNo: number;
}) {
  const isDip = detail.chamber === 'DIPUTADOS';
  const radius = isDip ? 3.5 : 4.8;

  return (
    <div className="hoi-panel rounded-sm p-4 bg-[#070a10] border border-[#263142] flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between text-[11px] font-mono border-b border-[#1e293b] pb-2">
        <span className="text-amber-200 font-bold uppercase">
          {isDip ? 'Recinto H. Cámara de Diputados' : 'Recinto H. Senado de la Nación'}
        </span>
        <span className="text-slate-400">
          Mayoría: <strong className="text-amber-300">{detail.majorityNeeded} votos</strong>
        </span>
      </div>

      <svg viewBox="0 0 360 198" className="w-full max-w-[360px] overflow-visible my-1">
        <circle cx="180" cy="175" r="54" fill="none" stroke="#1e293b" strokeDasharray="3 3" />
        {seats.map((s) => (
          <SeatCircleNode
            key={s.index}
            seat={s}
            isRevealed={s.index < revealedCount}
            radius={radius}
          />
        ))}

        <text x="180" y="152" textAnchor="middle" className="text-2xl font-mono font-extrabold fill-emerald-400">
          {liveYes}
        </text>
        <text x="180" y="167" textAnchor="middle" className="text-[9px] font-mono uppercase tracking-widest fill-slate-400">
          AFIRMATIVOS ({liveNo} NEG.)
        </text>
        <text x="180" y="182" textAnchor="middle" className="text-[9px] font-mono uppercase fill-amber-300">
          ESCRUTADAS {Math.min(seats.length, revealedCount)} / {detail.totalSeats}
        </text>
      </svg>

      <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-[#1e293b] text-[10px] font-mono">
        <span className="inline-flex items-center gap-1.5 text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          AFIRMATIVO
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
          NEGATIVO
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
          ABSTENCIÓN
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#111827] border border-slate-500 inline-block" />
          EN ESPERA
        </span>
      </div>
    </div>
  );
}

function resolveChamberScoreboardBadge(isDone: boolean, passed: boolean): { text: string; cls: string } {
  if (!isDone) {
    return {
      text: 'VOTACIÓN NOMINAL EN CURSO...',
      cls: 'text-amber-300 border-[#8a6d33] bg-amber-950/30'
    };
  }
  if (passed) {
    return {
      text: '✓ APROBADO EN ESTA CÁMARA',
      cls: 'text-emerald-300 border-emerald-700 bg-emerald-950/40'
    };
  }
  return {
    text: '✕ RECHAZADO EN ESTA CÁMARA',
    cls: 'text-rose-300 border-rose-700 bg-rose-950/40'
  };
}

function LiveDigitalScoreboard({
  detail,
  liveYes,
  liveNo,
  liveAbst,
  livePresent,
  isDone
}: {
  detail: ChamberVoteDetail;
  liveYes: number;
  liveNo: number;
  liveAbst: number;
  livePresent: number;
  isDone: boolean;
}) {
  const denom = Math.max(1, detail.totalSeats);
  const yesPct = Math.min(100, (liveYes / denom) * 100);
  const noPct = Math.min(100, (liveNo / denom) * 100);
  const abstPct = Math.min(100, (liveAbst / denom) * 100);
  const majPct = (detail.majorityNeeded / denom) * 100;
  const badge = resolveChamberScoreboardBadge(isDone, detail.passed);
  const hasQuorum = livePresent >= detail.quorumNeeded;

  return (
    <div className="hoi-panel rounded-sm p-4 bg-[#070a10] border border-[#263142] flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
          Tablero Electrónico del Recinto
        </span>
        <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
        <div className="p-2.5 rounded-sm bg-emerald-950/30 border border-emerald-800/70">
          <div className="text-[10px] text-emerald-300 uppercase">Afirmativos</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{liveYes}</div>
        </div>
        <div className="p-2.5 rounded-sm bg-rose-950/30 border border-rose-800/70">
          <div className="text-[10px] text-rose-300 uppercase">Negativos</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{liveNo}</div>
        </div>
        <div className="p-2.5 rounded-sm bg-amber-950/30 border border-amber-800/70">
          <div className="text-[10px] text-amber-300 uppercase">Abstenciones</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-0.5">{liveAbst}</div>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0c1119] border border-[#263142]">
          <div className="text-[10px] text-slate-400 uppercase">Presentes</div>
          <div className="text-2xl font-extrabold text-white mt-0.5">{livePresent}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Progreso hacia mayoría reglamentaria ({detail.majorityNeeded} bancas)</span>
          <span className="text-amber-200">
            {liveYes} / {detail.majorityNeeded} necesarios
          </span>
        </div>
        <div className="w-full h-4 rounded-sm bg-[#090d14] border border-[#263142] relative overflow-hidden flex">
          <div style={{ width: `${yesPct}%` }} className="h-full bg-emerald-500 transition-all duration-150" />
          <div style={{ width: `${abstPct}%` }} className="h-full bg-amber-500 transition-all duration-150" />
          <div style={{ width: `${noPct}%` }} className="h-full bg-rose-500 transition-all duration-150" />
          <div
            style={{ left: `${majPct}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-amber-300 shadow-[0_0_6px_#fde68a]"
            title={`Mayoría requerida: ${detail.majorityNeeded}`}
          />
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 bg-[#0c1119] border border-[#1e293b] px-3 py-2 rounded-sm flex items-center justify-between">
        <span>Quórum constitucional ({detail.quorumNeeded} bancas):</span>
        <strong className={hasQuorum ? 'text-emerald-400' : 'text-amber-300'}>
          {hasQuorum ? '✓ QUÓRUM HABILITADO' : `Faltan ${detail.quorumNeeded - livePresent} bancas`}
        </strong>
      </div>
    </div>
  );
}

function resolveBlocPostureLabel(yes: number, no: number, abst: number): { text: string; cls: string } {
  if (yes + no + abst === 0) {
    return { text: 'ESPERANDO TURNO', cls: 'text-slate-500' };
  }
  if (no === 0) {
    return { text: 'BLOQUE A FAVOR', cls: 'text-emerald-400' };
  }
  if (yes === 0) {
    return { text: 'BLOQUE EN CONTRA', cls: 'text-rose-400' };
  }
  return { text: 'VOTO DIVIDIDO', cls: 'text-amber-300' };
}

function BlocLiveBreakdownTable({ tallies }: { tallies: BlocLiveTally[] }) {
  const activeTallies = tallies.filter((t) => t.totalSeats > 0);

  return (
    <div className="hoi-panel rounded-sm p-4 bg-[#070a10] border border-[#263142] space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
        <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-100">
          Votación por Espacio Político (Bloques Parlamentarios)
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Desglose nominal en tiempo real
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {activeTallies.map((t) => {
          const denom = Math.max(1, t.totalSeats);
          const yesPct = (t.yes / denom) * 100;
          const abstPct = (t.abst / denom) * 100;
          const noPct = (t.no / denom) * 100;
          const posture = resolveBlocPostureLabel(t.yes, t.no, t.abst);

          return (
            <div
              key={t.bloc.id}
              className="p-2.5 rounded-sm bg-[#0c1119] border border-[#1e293b] space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <OfficialPartyLogo partyIdOrSigla={t.bloc.id} sizePx={22} />
                  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-extrabold ${t.bloc.badgeBg}`}>
                    {t.bloc.shortLabel}
                  </span>
                  <span className="font-bold text-slate-200 truncate text-[11px]">{t.bloc.name}</span>
                </div>
                <span className={`font-mono text-[10px] font-bold shrink-0 ${posture.cls}`}>
                  {posture.text}
                </span>
              </div>

              <div className="w-full h-2 rounded-sm bg-[#070a10] border border-[#263142] overflow-hidden flex">
                <div style={{ width: `${yesPct}%` }} className="h-full bg-emerald-500 transition-all duration-150" />
                <div style={{ width: `${abstPct}%` }} className="h-full bg-amber-500 transition-all duration-150" />
                <div style={{ width: `${noPct}%` }} className="h-full bg-rose-500 transition-all duration-150" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Bancas: <strong className="text-white">{t.totalSeats}</strong></span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">A favor: <strong>{t.yes}</strong></span>
                  <span className="text-rose-400">En contra: <strong>{t.no}</strong></span>
                  {t.abst > 0 ? <span className="text-amber-300">Abst: <strong>{t.abst}</strong></span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CongressRealtimeVoteModalProps {
  outcome: CongressVoteOutcome | null;
  blocs: CongressNegotiationBloc[];
  onClose: () => void;
}

function ChamberTabBtn({
  label,
  isSelected,
  isDone,
  passed,
  onClick
}: {
  label: string;
  isSelected: boolean;
  isDone: boolean;
  passed: boolean;
  onClick: () => void;
}) {
  const cls = isSelected
    ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
    : 'bg-[#090d14] text-slate-400 border-[#263142] hover:text-white';
  const suffix = isDone ? (passed ? ' ✓' : ' ✕') : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-sm text-xs font-mono font-bold border transition ${cls}`}
    >
      {label}{suffix}
    </button>
  );
}

function ModalChamberSelectorBar({
  activeChamber,
  depPassed,
  senPassed,
  isDone,
  onSelectChamber,
  onSkipToEnd,
  onReplay
}: {
  activeChamber: 'DIPUTADOS' | 'SENADO';
  depPassed: boolean;
  senPassed: boolean;
  isDone: boolean;
  onSelectChamber: (c: 'DIPUTADOS' | 'SENADO') => void;
  onSkipToEnd: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <ChamberTabBtn
          label="1. H. Cámara de Diputados (257)"
          isSelected={activeChamber === 'DIPUTADOS'}
          isDone={isDone}
          passed={depPassed}
          onClick={() => onSelectChamber('DIPUTADOS')}
        />
        <ChamberTabBtn
          label="2. H. Senado de la Nación (72)"
          isSelected={activeChamber === 'SENADO'}
          isDone={isDone}
          passed={senPassed}
          onClick={() => onSelectChamber('SENADO')}
        />
      </div>

      <div className="flex items-center gap-2">
        {!isDone ? (
          <button
            type="button"
            onClick={onSkipToEnd}
            className="px-3 py-1.5 rounded-sm bg-[#162233] hover:bg-[#1f2e47] border border-[#8a6d33] text-xs font-mono font-bold text-amber-200 inline-flex items-center gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            Resultado inmediato
          </button>
        ) : (
          <button
            type="button"
            onClick={onReplay}
            className="px-3 py-1.5 rounded-sm bg-[#090d14] hover:bg-[#131d2d] border border-[#263142] text-xs font-mono font-bold text-slate-300 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repetir votación
          </button>
        )}
      </div>
    </div>
  );
}

function FinalSessionFooterBanner({
  outcome,
  onClose
}: {
  outcome: CongressVoteOutcome;
  onClose: () => void;
}) {
  const badgeCls = outcome.passed
    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
    : 'bg-rose-950/80 text-rose-300 border-rose-700';

  return (
    <div className="p-3.5 rounded-sm bg-[#090d14] border border-[#8a6d33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 text-xs">
        <span className={`px-2.5 py-1 rounded-sm font-mono font-extrabold uppercase border ${badgeCls}`}>
          {outcome.passed ? '✓ LEY SANCIONADA' : '✕ PROYECTO RECHAZADO'}
        </span>
        <span className="text-slate-200 font-mono">{outcome.summaryMessage}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="hoi-btn-gold px-5 py-2 rounded-sm font-mono font-bold text-xs uppercase tracking-wider shrink-0 inline-flex items-center justify-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5" />
        Cerrar Acta de Sesión
      </button>
    </div>
  );
}

function resolveActiveChamberDetail(
  outcome: CongressVoteOutcome | null,
  activeChamber: 'DIPUTADOS' | 'SENADO'
): ChamberVoteDetail | null {
  if (!outcome) return null;
  return activeChamber === 'DIPUTADOS' ? outcome.deputies : outcome.senate;
}

function isChamberRollCallComplete(
  detail: ChamberVoteDetail | null,
  bothDone: boolean,
  revealedCount: number
): boolean {
  if (!detail || bothDone) return false;
  return revealedCount >= detail.totalSeats;
}

function shouldTransitionToSenate(
  outcome: CongressVoteOutcome,
  activeChamber: 'DIPUTADOS' | 'SENADO'
): boolean {
  return activeChamber === 'DIPUTADOS' && outcome.deputies.passed;
}

function notifyFinalOutcomeSound(passed: boolean): void {
  playUiSound(passed ? 'turn' : 'error');
}

function useRealtimeRollCall(outcome: CongressVoteOutcome | null) {
  const [activeChamber, setActiveChamber] = useState<'DIPUTADOS' | 'SENADO'>('DIPUTADOS');
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [bothDone, setBothDone] = useState<boolean>(false);

  const detail = resolveActiveChamberDetail(outcome, activeChamber);

  useEffect(() => {
    if (!outcome) return;
    playUiSound('quorum');
    setActiveChamber('DIPUTADOS');
    setRevealedCount(0);
    setBothDone(false);
  }, [outcome]);

  useEffect(() => {
    if (!detail || bothDone) return;
    const step = activeChamber === 'DIPUTADOS' ? 8 : 3;
    const timer = window.setInterval(() => {
      setRevealedCount((prev) => Math.min(detail.totalSeats, prev + step));
    }, 32);
    return () => window.clearInterval(timer);
  }, [detail, activeChamber, bothDone]);

  useEffect(() => {
    if (!outcome || !isChamberRollCallComplete(detail, bothDone, revealedCount)) return;
    if (shouldTransitionToSenate(outcome, activeChamber)) {
      const pause = window.setTimeout(() => {
        playUiSound('tab');
        setActiveChamber('SENADO');
        setRevealedCount(0);
      }, 650);
      return () => window.clearTimeout(pause);
    }
    setBothDone(true);
    notifyFinalOutcomeSound(outcome.passed);
    return undefined;
  }, [outcome, detail, revealedCount, activeChamber, bothDone]);

  return {
    activeChamber,
    detail,
    effectiveRevealed: bothDone && detail ? detail.totalSeats : revealedCount,
    bothDone,
    setActiveChamber,
    setRevealedCount,
    setBothDone
  };
}

function HemicycleVisualizationBox({
  view3D,
  seats,
  revealedCount,
  detail,
  liveYes,
  liveNo
}: {
  view3D: boolean;
  seats: SeatDotItem[];
  revealedCount: number;
  detail: ChamberVoteDetail;
  liveYes: number;
  liveNo: number;
}) {
  if (view3D) {
    const label = detail.chamber === 'DIPUTADOS' ? 'H. Cámara de Diputados' : 'H. Senado de la Nación';
    return (
      <Congress3DHemicycleCanvas
        seats={seats}
        revealedCount={revealedCount}
        chamberLabel={label}
        majorityNeeded={detail.majorityNeeded}
        liveYes={liveYes}
      />
    );
  }
  return (
    <LiveHemicycleSvg
      seats={seats}
      revealedCount={revealedCount}
      detail={detail}
      liveYes={liveYes}
      liveNo={liveNo}
    />
  );
}

function ModalHeaderBar({
  billTitle,
  activeChamber,
  view3D,
  showChapters,
  onToggle3D,
  onToggleChapters,
  onClose
}: {
  billTitle: string;
  activeChamber: 'DIPUTADOS' | 'SENADO';
  view3D: boolean;
  showChapters: boolean;
  onToggle3D: () => void;
  onToggleChapters: () => void;
  onClose: () => void;
}) {
  return (
    <div className="hoi-header-steel p-3.5 rounded-sm flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {activeChamber === 'DIPUTADOS' ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <OfficialInstitutionLogo institution="DIPUTADOS" heightPx={32} />
            <OfficialInstitutionLogo institution="DIPUTADOS_TV" heightPx={26} />
          </div>
        ) : (
          <OfficialInstitutionLogo institution="SENADO" heightPx={32} />
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 truncate">
            SESIÓN ESPECIAL · {activeChamber === 'DIPUTADOS' ? 'H. CÁMARA DE DIPUTADOS' : 'H. SENADO DE LA NACIÓN'}
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5 truncate">
            {billTitle}
          </h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle3D}
          className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#b89342] text-[10px] font-mono font-bold uppercase text-amber-200 hover:bg-[#172233]"
        >
          {view3D ? 'Ver Plano 2D' : 'Ver Recinto 3D'}
        </button>
        <button
          type="button"
          onClick={onToggleChapters}
          className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#2d3c52] text-[10px] font-mono font-bold uppercase text-sky-300 hover:bg-[#172233]"
        >
          {showChapters ? 'Ocultar Capítulos' : 'Votación en Particular (Capítulos)'}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar recinto"
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function OptionalChaptersSection({
  visible,
  billTitle,
  baseYesVotes,
  majorityNeeded
}: {
  visible: boolean;
  billTitle: string;
  baseYesVotes: number;
  majorityNeeded: number;
}) {
  if (!visible) return null;
  return (
    <BillChaptersParticularVotePanel
      billTitle={billTitle}
      baseYesVotes={baseYesVotes}
      majorityNeeded={majorityNeeded}
    />
  );
}

export function CongressRealtimeVoteModal({
  outcome,
  blocs,
  onClose
}: CongressRealtimeVoteModalProps) {
  const roll = useRealtimeRollCall(outcome);
  const [view3D, setView3D] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const seats = useMemo(
    () => (roll.detail ? buildChamberSeats(roll.detail, blocs) : []),
    [roll.detail, blocs]
  );

  if (!outcome || !roll.detail) return null;

  const live = computeLiveCounts(seats, roll.effectiveRevealed);
  const blocTallies = computeBlocLiveTallies(seats, roll.effectiveRevealed, blocs, roll.activeChamber);

  const handleSelectChamber = (chamber: 'DIPUTADOS' | 'SENADO') => {
    roll.setActiveChamber(chamber);
    roll.setBothDone(true);
    roll.setRevealedCount(chamber === 'DIPUTADOS' ? 257 : 72);
  };

  const handleSkipToEnd = () => {
    const endChamber = outcome.deputies.passed ? 'SENADO' : 'DIPUTADOS';
    handleSelectChamber(endChamber);
  };

  const handleReplay = () => {
    roll.setActiveChamber('DIPUTADOS');
    roll.setRevealedCount(0);
    roll.setBothDone(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto hoi-panel rounded-sm p-4 sm:p-6 space-y-4 shadow-2xl border border-[#8a6d33]">
        <ModalHeaderBar
          billTitle={outcome.billTitle}
          activeChamber={roll.activeChamber}
          view3D={view3D}
          showChapters={showChapters}
          onToggle3D={() => {
            playUiSound('tab');
            setView3D((v) => !v);
          }}
          onToggleChapters={() => {
            playUiSound('tab');
            setShowChapters((c) => !c);
          }}
          onClose={onClose}
        />

        <ModalChamberSelectorBar
          activeChamber={roll.activeChamber}
          depPassed={outcome.deputies.passed}
          senPassed={outcome.senate.passed}
          isDone={roll.bothDone}
          onSelectChamber={handleSelectChamber}
          onSkipToEnd={handleSkipToEnd}
          onReplay={handleReplay}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HemicycleVisualizationBox
            view3D={view3D}
            seats={seats}
            revealedCount={roll.effectiveRevealed}
            detail={roll.detail}
            liveYes={live.yes}
            liveNo={live.no}
          />
          <LiveDigitalScoreboard
            detail={roll.detail}
            liveYes={live.yes}
            liveNo={live.no}
            liveAbst={live.abst}
            livePresent={live.present}
            isDone={roll.effectiveRevealed >= roll.detail.totalSeats}
          />
        </div>

        <OptionalChaptersSection
          visible={showChapters || roll.bothDone}
          billTitle={outcome.billTitle}
          baseYesVotes={live.yes}
          majorityNeeded={roll.detail.majorityNeeded}
        />

        <BlocLiveBreakdownTable tallies={blocTallies} />
        {roll.bothDone ? <FinalSessionFooterBanner outcome={outcome} onClose={onClose} /> : null}
      </div>
    </div>
  );
}
