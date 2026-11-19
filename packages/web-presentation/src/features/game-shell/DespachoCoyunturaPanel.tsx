import React from 'react';
import type {
  ActiveCrisisArcState,
  CampaignPromiseRecord,
  PolicyAction,
  SimulationState
} from '@argentina-sim/domain';
import {
  buildInitialCampaignPromises,
  getPoliticalCapital,
  getUpcomingDebtMilestone
} from '@argentina-sim/domain';
import { formatArNumber } from '../../lib/formatters.js';

// Panel de Coyuntura en el Despacho: muestra el Balance causal del mes anterior,
// las 3 Promesas de Campaña ("facturas") y cualquier Trama de Crisis activa de 3 turnos.

const PROMISE_BADGE_STYLE: Record<CampaignPromiseRecord['status'], string> = {
  PENDIENTE: 'bg-[#170c12] border-white/20 text-[#EFE9DA]',
  CUMPLIDA: 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300',
  ROTA: 'bg-rose-950/75 border-rose-600/75 text-rose-300'
};

function CrisisArcBanner({
  arc,
  onDispatch
}: {
  arc: ActiveCrisisArcState;
  onDispatch?: (action: PolicyAction) => void;
}) {
  return (
    <div className="bg-[#1b0912] border-2 border-[#EB3F7D] rounded-sm p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="px-2 py-0.5 bg-[#EB3F7D] text-[#090407] text-[10px] font-mono font-extrabold uppercase tracking-wider">
          TRAMA ACTIVA · FASE {arc.stage}/3
        </span>
        <span className="text-[11px] font-mono text-rose-300 uppercase">
          Presión mensual en escalada si no se resuelve
        </span>
      </div>

      <div>
        <h3 className="font-display text-xl uppercase tracking-wide text-[#F5EFE6]">{arc.title}</h3>
        <p className="text-xs text-[#EFE9DA]/85 mt-1 leading-relaxed">{arc.detail}</p>
      </div>

      {onDispatch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onDispatch({ type: 'RESOLVE_CRISIS_ARC', strategy: 'NEGOCIAR' })}
            className="px-3.5 py-2 rounded-sm bg-[#EB3F7D] hover:bg-[#f2558d] text-[#090407] text-xs font-mono font-extrabold uppercase tracking-wider transition text-left"
          >
            Negociar: {arc.negotiateLabel}
          </button>
          <button
            type="button"
            onClick={() => onDispatch({ type: 'RESOLVE_CRISIS_ARC', strategy: 'CONFRONTAR' })}
            className="px-3.5 py-2 rounded-sm bg-[#12080d] hover:bg-[#22101a] border border-[#EFE9DA]/35 text-[#EFE9DA] text-xs font-mono font-bold uppercase tracking-wider transition text-left"
          >
            Confrontar: {arc.confrontLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MonthlyBalanceCard({ bullets }: { bullets: string[] }) {
  return (
    <div className="hoi-panel rounded-sm p-4 space-y-2.5 border-l-2 border-l-[#EB3F7D]">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EB3F7D]">
        Balance del último mes
      </div>
      <ul className="space-y-1.5 text-xs text-[#EFE9DA]/90 leading-relaxed">
        {bullets.map((line, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-[#EB3F7D] font-bold">▸</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromisesCard({ promises }: { promises: CampaignPromiseRecord[] }) {
  return (
    <div className="hoi-panel rounded-sm p-4 space-y-2.5">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
        Promesas de Campaña (Facturas del Mandato)
      </div>
      <div className="space-y-2">
        {promises.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 bg-[#0b0508] border border-white/10 px-3 py-2 rounded-sm"
          >
            <div>
              <div className="text-xs font-bold text-[#F5EFE6]">{p.title}</div>
              <div className="text-[10px] font-mono text-slate-400">{p.targetSummary}</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-extrabold uppercase tracking-wider ${PROMISE_BADGE_STYLE[p.status]}`}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function resolveBalanceBullets(state: SimulationState): string[] {
  const existing = state.monthlyBalanceSummary;
  if (existing && existing.length > 0) return existing;
  const cap = getPoliticalCapital(state);
  return [
    `Capital político disponible: ${cap.remaining} de ${cap.maxPerMonth} decretos o medidas este mes.`,
    'Al cerrar tu primer mes de gestión vas a ver acá qué movió inflación, reservas e imagen.'
  ];
}

function resolveStatePromises(state: SimulationState): CampaignPromiseRecord[] {
  if (state.campaignPromises) return state.campaignPromises;
  return buildInitialCampaignPromises(state.coalitionParties?.[0] ?? 'LLA');
}

function UpcomingDebtAlertStrip({ state }: { state: SimulationState }) {
  const notice = getUpcomingDebtMilestone(state);
  if (!notice) return null;
  const unit = notice.monthsLeft === 1 ? 'mes' : 'meses';
  return (
    <div className="bg-[#180a11] border border-[#EB3F7D]/70 rounded-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
      <span className="text-[#EFE9DA]">
        <strong className="text-[#EB3F7D]">CALENDARIO FMI / DEUDA:</strong> {notice.milestone.title} (US${' '}
        {formatArNumber(notice.milestone.amountBillionUsd, 1)} MM)
      </span>
      <span className="px-2 py-0.5 bg-[#EB3F7D]/20 text-[#EB3F7D] font-bold uppercase">
        EN {notice.monthsLeft} {unit}
      </span>
    </div>
  );
}

export function DespachoCoyunturaPanel({
  state,
  onDispatch
}: {
  state: SimulationState;
  onDispatch?: (action: PolicyAction) => void;
}) {
  const promises = resolveStatePromises(state);
  const balanceBullets = resolveBalanceBullets(state);

  return (
    <div className="space-y-3.5">
      <UpcomingDebtAlertStrip state={state} />
      {state.activeCrisisArc ? (
        <CrisisArcBanner arc={state.activeCrisisArc} onDispatch={onDispatch} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <MonthlyBalanceCard bullets={balanceBullets} />
        <PromisesCard promises={promises} />
      </div>
    </div>
  );
}
