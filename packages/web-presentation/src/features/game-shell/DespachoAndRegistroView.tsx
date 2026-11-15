import React from 'react';
import type { GameSetupConfiguration, PolicyAction, SimulationState } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import type { InGameSidebarSection } from './GameSidebarLayout.js';
import { GovernorCommandPanel, LegislatorCommandPanel } from './RoleMandateCommandPanels.js';

// Vistas de DESPACHO -> Despacho (resumen ejecutivo del jugador y accesos rapidos)
// y DESPACHO -> Registro (bitacora historica mes a mes).

interface DespachoOverviewProps {
  setup: GameSetupConfiguration;
  state: SimulationState;
  historyLog: string[];
  onNavigate: (section: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
  onDispatch?: (action: PolicyAction) => void;
}

function RoleSpecificCommandSection({
  setup,
  state,
  onNavigate,
  onDispatch
}: {
  setup: GameSetupConfiguration;
  state: SimulationState;
  onNavigate: (section: InGameSidebarSection) => void;
  onDispatch?: (action: PolicyAction) => void;
}) {
  if (!onDispatch || setup.role === 'PRESIDENTE') {
    return null;
  }
  if (setup.role === 'GOBERNADOR') {
    return <GovernorCommandPanel setup={setup} state={state} onDispatch={onDispatch} />;
  }
  return (
    <LegislatorCommandPanel
      setup={setup}
      state={state}
      onDispatch={onDispatch}
      onNavigate={onNavigate}
    />
  );
}

export function DespachoOverview({
  setup,
  state,
  historyLog,
  onNavigate,
  onAdvanceTurn,
  onDispatch
}: DespachoOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-sm bg-gradient-to-r from-[#111722] via-[#0e141f] to-[#15120d] border border-[#2c384b] border-l-2 border-l-[#c5a059] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <PartyEmblemSvg config={setup.party.emblem} size={72} />
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-[#090d14] border border-[#2c384b] text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4b26a]">
              {setup.party.sigla} · {setup.party.name} · {setup.party.ideology}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mt-1">
              {setup.characterName}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Cargo activo: <strong className="text-white">{setup.role}</strong> · Jurisdicción base: <strong className="text-sky-400">{setup.provinceId}</strong> · Mes #{state.turnMonth}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('INDICADORES')}
            className="px-4 py-2.5 rounded-sm bg-[#121926] hover:bg-[#192233] border border-[#2c384b] text-xs font-mono font-bold uppercase tracking-wider text-slate-200 transition"
          >
            Ver Indicadores (24 series)
          </button>
          <button
            type="button"
            onClick={onAdvanceTurn}
            className="px-5 py-2.5 rounded-sm bg-gradient-to-b from-[#d8b76c] to-[#9b7a38] hover:from-[#e6c87d] hover:to-[#b08c42] text-slate-950 border border-[#f3d893]/40 text-xs font-mono font-extrabold uppercase tracking-wider shadow transition"
          >
            Cerrar Mes de Gestión →
          </button>
        </div>
      </div>

      <RoleSpecificCommandSection
        setup={setup}
        state={state}
        onNavigate={onNavigate}
        onDispatch={onDispatch}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Inflación Mensual (IPC)
          </div>
          <div className="text-2xl font-mono font-extrabold text-orange-400 mt-1">
            {state.inflation.realMonthlyIpcPct}%
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            Interanual: {state.inflation.interannualIpcPct}%
          </div>
        </div>

        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Dólar Oficial / CCL
          </div>
          <div className="text-2xl font-mono font-extrabold text-sky-400 mt-1">
            ${state.centralBank.officialDollarArs}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            CCL ${state.centralBank.cclDollarArs} · Brecha {state.centralBank.exchangeBrechaPct}%
          </div>
        </div>

        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Reservas Netas Líquidas
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            {state.centralBank.netLiquidReservesBillionUsd} B
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            Brutas: {state.centralBank.grossReservesBillionUsd} B USD
          </div>
        </div>

        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Aprobación Presidencial
          </div>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
            {state.publicOpinion.presidentialPersonalImagePct}%
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            Aprobación gestión: {state.publicOpinion.managementApprovalPct}%
          </div>
        </div>
      </div>

      <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#d4b26a] mb-3">
          Últimos Partes de Inteligencia de Estado
        </h3>
        <div className="space-y-2 text-xs font-mono">
          {historyLog.slice(0, 6).map((entry, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2.5 rounded-sm bg-[#080b11] border border-[#1d2636] text-slate-300"
            >
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
      <div className="border-b border-[#263142] pb-4">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#d4b26a]">
          DESPACHO · CRÓNICA OFICIAL
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mt-0.5">Registro</h1>
        <p className="text-xs text-slate-400 mt-1">
          Bitácora cronológica de decretos, licitaciones del Tesoro, fallos de la Corte Suprema y cierres mensuales.
        </p>
      </div>

      <div className="space-y-2">
        {historyLog.map((entry, idx) => (
          <div
            key={idx}
            className="rounded-sm bg-[#0c1119] border border-[#263142] border-l-2 border-l-[#8a6d33] px-4 py-3 text-xs text-slate-200 font-mono"
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
