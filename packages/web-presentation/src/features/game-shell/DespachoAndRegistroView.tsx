import React from 'react';
import type { GameSetupConfiguration, SimulationState } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import type { InGameSidebarSection } from './GameSidebarLayout.js';

// Vistas de DESPACHO -> Despacho (resumen ejecutivo del jugador y accesos rapidos)
// y DESPACHO -> Registro (bitacora historica mes a mes).

interface DespachoOverviewProps {
  setup: GameSetupConfiguration;
  state: SimulationState;
  historyLog: string[];
  onNavigate: (section: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
}

export function DespachoOverview({
  setup,
  state,
  historyLog,
  onNavigate,
  onAdvanceTurn
}: DespachoOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <PartyEmblemSvg config={setup.party.emblem} size={72} />
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300">
              {setup.party.sigla} · {setup.party.name} · {setup.party.ideology}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              {setup.characterName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cargo activo: <strong className="text-white">{setup.role}</strong> · Jurisdicción base: <strong className="text-sky-400">{setup.provinceId}</strong> · Mes #{state.turnMonth}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('INDICADORES')}
            className="px-4 py-2.5 rounded-xl bg-[#161b28] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
          >
            Ver Indicadores (24 series)
          </button>
          <button
            type="button"
            onClick={onAdvanceTurn}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 text-xs font-extrabold shadow"
          >
            Cerrar Mes de Gestión →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
          <div className="text-xs text-slate-400">Inflación Mensual (IPC)</div>
          <div className="text-2xl font-mono font-extrabold text-orange-400 mt-1">
            {state.inflation.realMonthlyIpcPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Interanual: {state.inflation.interannualIpcPct}%
          </div>
        </div>

        <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
          <div className="text-xs text-slate-400">Dólar Oficial / CCL</div>
          <div className="text-2xl font-mono font-extrabold text-sky-400 mt-1">
            ${state.centralBank.officialDollarArs}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            CCL ${state.centralBank.cclDollarArs} · Brecha {state.centralBank.exchangeBrechaPct}%
          </div>
        </div>

        <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
          <div className="text-xs text-slate-400">Reservas Netas Líquidas</div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            {state.centralBank.netLiquidReservesBillionUsd} B
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Brutas: {state.centralBank.grossReservesBillionUsd} B USD
          </div>
        </div>

        <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
          <div className="text-xs text-slate-400">Aprobación Presidencial</div>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
            {state.publicOpinion.presidentialPersonalImagePct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Aprobación gestión: {state.publicOpinion.managementApprovalPct}%
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5">
        <h3 className="text-sm font-bold text-white mb-3">Últimos Partes de Inteligencia de Estado</h3>
        <div className="space-y-2 text-xs">
          {historyLog.slice(0, 6).map((entry, idx) => (
            <div key={idx} className="px-3.5 py-2.5 rounded-xl bg-[#0b0e15] border border-slate-800 text-slate-300">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RegistroHistoryViewProps {
  historyLog: string[];
}

export function RegistroHistoryView({ historyLog }: RegistroHistoryViewProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
          DESPACHO · CRÓNICA OFICIAL
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Registro</h1>
        <p className="text-xs text-slate-400 mt-1">
          Bitácora cronológica de decretos, licitaciones del Tesoro, fallos de la Corte Suprema y cierres mensuales.
        </p>
      </div>

      <div className="space-y-2.5">
        {historyLog.map((entry, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#10131b] border border-slate-800 px-4 py-3 text-xs text-slate-200 font-mono"
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
