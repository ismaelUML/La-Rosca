import React from 'react';
import {
  MANDATE_MONTHS,
  describeMandateGrade,
  getGovernmentRuntime,
  resolvePresidentialLegacy,
  type CampaignPromiseRecord,
  type MandateStatus,
  type MonthlyHistorySnapshot,
  type SimulationState
} from '@argentina-sim/domain';
import { ViewportModalPortal } from '../../components/ui/ViewportModalPortal.js';
import { formatArNumber } from '../../lib/formatters.js';

// Tapa Histórica de Fin de Mandato en estética La Rosca (Obsidiana + Rosado + Crema):
// montada por portal en body con arquetipo presidencial, promesas, curva real y Reelección 2031.

const OUTCOME_HEADLINES: Record<Exclude<MandateStatus, 'EN_CURSO'>, { title: string; isVictory: boolean }> = {
  MANDATO_COMPLETADO: { title: 'Mandato Completado', isVictory: true },
  RENUNCIA: { title: 'Renunciaste a la Presidencia', isVictory: false },
  JUICIO_POLITICO: { title: 'Te destituyó el Congreso', isVictory: false },
  DEFAULT_SOBERANO: { title: 'El país entró en default', isVictory: false },
  HIPERINFLACION: { title: 'Hiperinflación: perdiste el control', isVictory: false }
};

function FinalStatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#12080d] border border-white/15 p-3 rounded-sm">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-display text-xl tracking-wide text-[#F5EFE6] mt-0.5">{value}</div>
    </div>
  );
}

function buildPolylinePoints(values: number[], width: number, height: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values
    .map((v, idx) => {
      const x = (idx / Math.max(1, values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function MiniApprovalCurve({ snapshots }: { snapshots?: MonthlyHistorySnapshot[] }) {
  if (!snapshots || snapshots.length < 2) return null;
  const values = snapshots.map((s) => s.approvalPct);
  const points = buildPolylinePoints(values, 280, 48);
  return (
    <div className="bg-[#12080d] border border-white/15 p-3 rounded-sm flex items-center justify-between gap-4">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#EB3F7D]">
          Curva real de aprobación ({snapshots.length} meses)
        </div>
        <div className="text-xs font-mono text-slate-400 mt-0.5">
          Inicio {formatArNumber(values[0]!, 1)} % → Cierre {formatArNumber(values[values.length - 1]!, 1)} %
        </div>
      </div>
      <svg viewBox="0 0 280 48" className="w-44 h-12 shrink-0 overflow-visible">
        <polyline fill="none" stroke="#EB3F7D" strokeWidth="2.5" points={points} />
      </svg>
    </div>
  );
}

function PromiseOutcomeRow({ promises }: { promises?: CampaignPromiseRecord[] }) {
  if (!promises || promises.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {promises.map((p) => (
        <div key={p.id} className="bg-[#12080d] border border-white/10 p-2.5 rounded-sm">
          <div className="text-[10px] font-mono font-bold uppercase text-[#EB3F7D]">{p.status}</div>
          <div className="text-xs text-[#EFE9DA] font-semibold mt-0.5">{p.title}</div>
        </div>
      ))}
    </div>
  );
}

function MandateEndActions({
  canRunReelection,
  onStartReelection,
  onExitToMenu
}: {
  canRunReelection: boolean;
  onStartReelection?: () => void;
  onExitToMenu: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
      {canRunReelection && onStartReelection ? (
        <button
          type="button"
          onClick={onStartReelection}
          className="flex-1 py-3 bg-[#EB3F7D] hover:bg-[#f2558d] text-[#090407] font-mono font-extrabold text-xs uppercase tracking-widest transition"
        >
          Asumir 2° Mandato (Reelección) →
        </button>
      ) : null}
      <button
        type="button"
        onClick={onExitToMenu}
        className="flex-1 py-3 bg-[#150b10] hover:bg-[#22121a] border border-[#EFE9DA]/30 text-[#EFE9DA] font-mono font-bold text-xs uppercase tracking-widest transition"
      >
        Volver al Menú Principal
      </button>
    </div>
  );
}

export function MandateEndModal({
  state,
  status,
  onStartReelection,
  onExitToMenu
}: {
  state: SimulationState;
  status: Exclude<MandateStatus, 'EN_CURSO'>;
  onStartReelection?: () => void;
  onExitToMenu: () => void;
}) {
  const gov = getGovernmentRuntime(state);
  const outcome = OUTCOME_HEADLINES[status];
  const legacy = resolvePresidentialLegacy(state, status);
  const score = gov.finalScore ?? 0;
  const targetMonths = gov.mandateTargetMonths ?? MANDATE_MONTHS;
  const reasonLine = gov.endReason ?? describeMandateGrade(score);

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] bg-black/88 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
        <div className="my-auto w-full max-w-2xl bg-[#0b0508] border-2 border-[#EB3F7D] shadow-[0_25px_80px_rgba(0,0,0,0.92)] p-6 md:p-8 space-y-5">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EB3F7D] text-[#090407] text-[10px] font-mono font-extrabold uppercase tracking-widest">
              EDICIÓN HISTÓRICA · MES {state.turnMonth - 1} DE {targetMonths}
            </div>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide text-[#F5EFE6] leading-tight">
              {legacy.archetypeTitle}
            </h2>
            <p className="text-xs font-mono uppercase tracking-wider text-[#EB3F7D]">
              {outcome.title} · Puntaje {formatArNumber(score, 1)} / 100
            </p>
            <p className="text-sm text-[#EFE9DA]/85 leading-relaxed">
              {reasonLine} {legacy.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <FinalStatTile label="Aprobación final" value={`${formatArNumber(state.publicOpinion.managementApprovalPct, 1)} %`} />
            <FinalStatTile label="IPC interanual" value={`${formatArNumber(state.inflation.interannualIpcPct, 1)} %`} />
            <FinalStatTile label="Pobreza urbana" value={`${formatArNumber(state.inflation.povertyCbtPct, 1)} %`} />
            <FinalStatTile label="Riesgo país" value={`${Math.round(state.countryRiskEmbiPb)} pb`} />
            <FinalStatTile label="Reservas netas" value={`US$ ${formatArNumber(state.centralBank.netLiquidReservesBillionUsd, 1)} MM`} />
            <FinalStatTile label="Dólar CCL" value={`$ ${formatArNumber(state.centralBank.cclDollarArs, 0)}`} />
          </div>

          <MiniApprovalCurve snapshots={state.historySnapshots} />
          <PromiseOutcomeRow promises={state.campaignPromises} />

          <MandateEndActions
            canRunReelection={legacy.canRunReelection}
            onStartReelection={onStartReelection}
            onExitToMenu={onExitToMenu}
          />
        </div>
      </div>
    </ViewportModalPortal>
  );
}
