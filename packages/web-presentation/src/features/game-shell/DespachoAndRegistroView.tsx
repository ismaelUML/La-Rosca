import React, { Suspense, lazy } from 'react';
import type {
  CampaignSimulationState,
  GameSetupConfiguration,
  PolicyAction,
  SimulationState
} from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import { OfficialInstitutionLogo } from '../party-setup/OfficialLogoBadge.js';
import type { InstitutionalLogoId } from '../party-setup/officialLogosCatalog.js';
import type { InGameSidebarSection } from './GameSidebarLayout.js';
import { GovernorCommandPanel, LegislatorCommandPanel } from './RoleMandateCommandPanels.js';
import { DespachoCoyunturaPanel } from './DespachoCoyunturaPanel.js';
import { LiveNewsAndMarketTicker } from './LiveNewsAndMarketTicker.js';
import { formatArNumber } from '../../lib/formatters.js';

const PresidentialDesk3DScene = lazy(() =>
  import('./PresidentialDesk3DScene.js').then((m) => ({ default: m.PresidentialDesk3DScene }))
);

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
  if (setup.role === 'PRESIDENTE') {
    return (
      <Suspense fallback={<div className="h-[340px] rounded-sm bg-[#0f060a] border border-white/10" />}>
        <PresidentialDesk3DScene
          state={state}
          speakerName={setup.characterName}
          onNavigate={onNavigate}
          onDispatch={onDispatch}
        />
      </Suspense>
    );
  }
  if (!onDispatch) {
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

const ROLE_CREST: Record<GameSetupConfiguration['role'], InstitutionalLogoId> = {
  PRESIDENTE: 'PRESIDENCIA',
  GOBERNADOR: 'ESCUDO_NACIONAL',
  DIPUTADO: 'DIPUTADOS',
  SENADOR: 'SENADO'
};

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
      <div className="hoi-panel rounded-lg p-5 flex flex-col gap-4 border-l-2 border-l-[#EB3F7D]">
        <div className="flex items-center gap-4 min-w-0">
          <PartyEmblemSvg config={setup.party.emblem} size={60} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <OfficialInstitutionLogo institution={ROLE_CREST[setup.role]} heightPx={22} />
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#0b0508] border border-white/15 text-[11px] font-mono font-bold uppercase tracking-wider text-[#EB3F7D]">
                {setup.party.sigla} · {setup.party.name} · {setup.party.ideology}
              </div>
            </div>
            <h1 className="font-display text-2xl md:text-3xl tracking-wide uppercase text-[#F5EFE6] mt-1 break-words">
              {setup.characterName}
            </h1>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              Cargo activo: <strong className="text-white">{setup.role}</strong> · Jurisdicción base:{' '}
              <strong className="text-[#EB3F7D]">{setup.provinceId}</strong> · Mes #{state.turnMonth}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('INDICADORES')}
            className="px-4 py-2 rounded bg-[#140d11] hover:bg-[#1f1319] border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-slate-100 transition"
          >
            Ver Indicadores (24 series)
          </button>
          <button
            type="button"
            onClick={onAdvanceTurn}
            className="hoi-btn-gold px-5 py-2 rounded text-xs font-mono font-extrabold uppercase tracking-wider shadow transition"
          >
            Cerrar Mes de Gestión →
          </button>
        </div>
      </div>

      <DespachoCoyunturaPanel state={state} onDispatch={onDispatch} />

      <RoleSpecificCommandSection
        setup={setup}
        state={state}
        onNavigate={onNavigate}
        onDispatch={onDispatch}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="hoi-panel rounded-lg p-4">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Inflación Mensual (IPC)
          </div>
          <div className="text-2xl font-display tracking-wide text-[#F5EFE6] mt-1">
            {formatArNumber(state.inflation.realMonthlyIpcPct, 1)} %
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Interanual: {formatArNumber(state.inflation.interannualIpcPct, 1)} %
          </div>
        </div>

        <div className="hoi-panel rounded-lg p-4">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Dólar Oficial / CCL
          </div>
          <div className="text-2xl font-display tracking-wide text-[#F5EFE6] mt-1">
            $ {formatArNumber(state.centralBank.officialDollarArs, 0)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            CCL $ {formatArNumber(state.centralBank.cclDollarArs, 0)} · Brecha {formatArNumber(state.centralBank.exchangeBrechaPct, 1)} %
          </div>
        </div>

        <div className="hoi-panel rounded-lg p-4">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Reservas Netas Líquidas
          </div>
          <div className="text-2xl font-display tracking-wide text-[#EB3F7D] mt-1">
            US$ {formatArNumber(state.centralBank.netLiquidReservesBillionUsd, 1)} B
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Brutas: US$ {formatArNumber(state.centralBank.grossReservesBillionUsd, 1)} B
          </div>
        </div>

        <div className="hoi-panel rounded-lg p-4">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Imagen Personal
          </div>
          <div className="text-2xl font-display tracking-wide text-[#EFE9DA] mt-1">
            {formatArNumber(state.publicOpinion.presidentialPersonalImagePct, 1)} %
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Aprobación gestión: {formatArNumber(state.publicOpinion.managementApprovalPct, 1)} %
          </div>
        </div>
      </div>

      <div className="rounded-sm bg-[#11080d] border border-white/15 p-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#EB3F7D] mb-3">
          Últimos Partes de Inteligencia de Estado
        </h3>
        <div className="space-y-2 text-xs font-mono">
          {historyLog.slice(0, 6).map((entry, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2.5 rounded-sm bg-[#090407] border border-[#1d2636] text-slate-300"
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
  govState?: SimulationState;
  campaignState?: CampaignSimulationState;
}

export function RegistroHistoryView({
  historyLog,
  govState,
  campaignState
}: RegistroHistoryViewProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-white/15 pb-3.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
            DIARIO NACIONAL Y BOLETÍN OFICIAL
          </div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide uppercase text-[#F5EFE6] mt-0.5">
            Diario y Registro Oficial
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Cables en vivo, pizarra de mercados y bitácora cronológica de decretos, licitaciones, fallos y cierres mensuales.
          </p>
        </div>
        <OfficialInstitutionLogo institution="BOLETIN_OFICIAL" heightPx={36} />
      </div>

      <div className="rounded-lg overflow-hidden border border-[#EB3F7D]/45 shadow-lg">
        <LiveNewsAndMarketTicker govState={govState} campaignState={campaignState} expanded />
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Registro Histórico ({historyLog.length} asientos)
        </div>
        {historyLog.map((entry, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-[#0f090d] border border-white/10 border-l-2 border-l-[#EB3F7D] px-4 py-3 text-xs text-slate-200 font-mono leading-relaxed"
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
