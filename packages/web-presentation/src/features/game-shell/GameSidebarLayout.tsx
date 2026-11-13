import React from 'react';
import type { GameSetupConfiguration, SimulationState } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';

// Shell táctico estilo HOI4 / Millennium Dawn:
// barra superior de telemetría macro, dock horizontal de Ministerios arriba
// y sub-pestañas debajo para aprovechar el ancho completo del monitor.

export type InGameSidebarSection =
  | 'DESPACHO_RESUMEN'
  | 'GABINETE'
  | 'REGISTRO'
  | 'INDICADORES'
  | 'POLITICA_ECONOMICA'
  | 'MEDIDAS'
  | 'ENERGIA_Y_PARITARIAS'
  | 'FINANCIAMIENTO'
  | 'IMPUESTOS'
  | 'IMPUESTOS_PROPIOS'
  | 'RIGI'
  | 'CAMARAS'
  | 'APOYOS'
  | 'PARTIDO_PROVINCIAS'
  | 'CONGRESO_Y_JUSTICIA'
  | 'PROVINCIAS_Y_DEFENSA';

const SIDEBAR_GROUPS: Array<{
  groupTitle: string;
  icon: string;
  items: Array<{ id: InGameSidebarSection; label: string }>;
}> = [
  {
    groupTitle: 'DESPACHO',
    icon: '🏛️',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho' },
      { id: 'GABINETE', label: 'Gabinete' },
      { id: 'REGISTRO', label: 'Registro' }
    ]
  },
  {
    groupTitle: 'ECONOMÍA',
    icon: '📊',
    items: [
      { id: 'INDICADORES', label: 'Indicadores' },
      { id: 'POLITICA_ECONOMICA', label: 'Política económica' },
      { id: 'MEDIDAS', label: 'Medidas' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'CAMMESA y Paritarias' }
    ]
  },
  {
    groupTitle: 'PRESUPUESTO',
    icon: '💰',
    items: [
      { id: 'FINANCIAMIENTO', label: 'Financiamiento' },
      { id: 'IMPUESTOS', label: 'Impuestos' },
      { id: 'IMPUESTOS_PROPIOS', label: 'Impuestos propios' },
      { id: 'RIGI', label: 'RIGI' }
    ]
  },
  {
    groupTitle: 'POLÍTICA Y CONGRESO',
    icon: '⚖️',
    items: [
      { id: 'CAMARAS', label: 'Cámaras (Diputados y Senado)' },
      { id: 'APOYOS', label: 'Apoyos y Figuras' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Partido en las provincias' },
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Justicia y 24 Provincias' }
    ]
  }
];

const ROLE_LABELS: Record<GameSetupConfiguration['role'], string> = {
  PRESIDENTE: 'Presidente',
  GOBERNADOR: 'Gobernador',
  DIPUTADO: 'Diputado Nac.',
  SENADOR: 'Senador Nac.'
};

function formatGameDate(turnMonth: number): string {
  const months = ['DIC', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV'];
  const idx = (turnMonth - 1) % 12;
  const year = 2027 + Math.floor(turnMonth / 12);
  return `${months[idx]} ${year} · T${turnMonth}`;
}

function findActiveGroup(activeSection: InGameSidebarSection) {
  const found = SIDEBAR_GROUPS.find((g) => g.items.some((i) => i.id === activeSection));
  return found ?? SIDEBAR_GROUPS[0]!;
}

function TelemetryBox({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#283447] flex flex-col leading-tight">
      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-xs font-mono font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function reservesTone(netUsd: number): string {
  if (netUsd < 0) return 'text-rose-400';
  if (netUsd < 6) return 'text-amber-300';
  return 'text-emerald-400';
}

function TopTelemetryBar({
  setup,
  state,
  onAdvanceTurn,
  onExportSaveCode,
  onExitToMenu
}: {
  setup: GameSetupConfiguration;
  state: SimulationState;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onExitToMenu: () => void;
}) {
  const netUsd = state.centralBank.netLiquidReservesBillionUsd;

  return (
    <header className="hoi-header-steel px-4 py-2 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#c9a24d]/70">
            <PartyEmblemSvg config={setup.party.emblem} size={22} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-serif font-black uppercase tracking-wider text-amber-100">
              LA ROSADA · {setup.party.sigla}
            </div>
            <div className="text-[10px] font-mono text-slate-300">
              {ROLE_LABELS[setup.role]} · {formatGameDate(state.turnMonth)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <TelemetryBox
            label="Dólar CCL"
            value={`$${state.centralBank.cclDollarArs} (${state.centralBank.exchangeBrechaPct.toFixed(0)}%)`}
            toneClass="text-sky-300"
          />
          <TelemetryBox
            label="Res. Netas"
            value={`${netUsd.toFixed(1)}B USD`}
            toneClass={reservesTone(netUsd)}
          />
          <TelemetryBox
            label="Inflación"
            value={`${state.inflation.realMonthlyIpcPct.toFixed(1)}%/m`}
            toneClass="text-rose-300"
          />
          <TelemetryBox
            label="Riesgo País"
            value={`${state.countryRiskEmbiPb} pb`}
            toneClass="text-amber-300"
          />
          <TelemetryBox
            label="Imagen"
            value={`${state.publicOpinion.presidentialPersonalImagePct.toFixed(0)}%`}
            toneClass="text-emerald-300"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onAdvanceTurn}
            className="hoi-btn-gold px-3.5 py-1.5 rounded-sm font-extrabold text-xs uppercase tracking-wider transition"
          >
            ▶ Avanzar Mes
          </button>
          <button
            type="button"
            onClick={onExportSaveCode}
            className="px-2.5 py-1.5 rounded-sm bg-[#0b1018] hover:bg-[#172233] border border-[#334155] text-xs font-semibold text-slate-200"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onExitToMenu}
            className="px-2.5 py-1.5 rounded-sm bg-[#2b1015] hover:bg-[#41171f] border border-rose-800/60 text-xs font-semibold text-rose-200"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function CommandDockNav({
  activeSection,
  onSelectSection
}: {
  activeSection: InGameSidebarSection;
  onSelectSection: (sec: InGameSidebarSection) => void;
}) {
  const activeGroup = findActiveGroup(activeSection);

  return (
    <nav className="bg-[#0b1018] border-b border-[#283447]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-1 pt-2 border-b border-[#1d2738]">
          {SIDEBAR_GROUPS.map((group) => {
            const isGroupActive = group.groupTitle === activeGroup.groupTitle;
            const cls = isGroupActive
              ? 'bg-[#17253b] text-amber-100 border-t-2 border-x border-[#c9a24d] border-x-[#2e415e]'
              : 'bg-[#0e141f] text-slate-400 hover:text-slate-200 border border-[#1f293b]';
            return (
              <button
                key={group.groupTitle}
                type="button"
                onClick={() => {
                  const first = group.items[0];
                  if (first) onSelectSection(first.id);
                }}
                className={`px-3.5 py-1.5 rounded-t-sm text-[11px] font-mono font-bold uppercase tracking-wider transition ${cls}`}
              >
                {group.icon} {group.groupTitle}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 py-2">
          {activeGroup.items.map((item) => {
            const isSelected = activeSection === item.id;
            const itemCls = isSelected
              ? 'bg-[#1d3250] text-amber-200 border-[#c9a24d]'
              : 'bg-[#101622] text-slate-300 hover:bg-[#162032] border-[#283447]';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`px-3 py-1 rounded-sm border text-xs font-semibold transition ${itemCls}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

interface GameSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: SimulationState;
  activeSection: InGameSidebarSection;
  portableSaveBanner: string | null;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  children: React.ReactNode;
}

export function GameSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  onSelectSection,
  onAdvanceTurn,
  onExportSaveCode,
  onCloseSaveBanner,
  onExitToMenu,
  children
}: GameSidebarLayoutProps) {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <TopTelemetryBar
        setup={setup}
        state={state}
        onAdvanceTurn={onAdvanceTurn}
        onExportSaveCode={onExportSaveCode}
        onExitToMenu={onExitToMenu}
      />

      <CommandDockNav activeSection={activeSection} onSelectSection={onSelectSection} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {portableSaveBanner ? (
          <div className="mb-4 p-3 rounded-sm bg-[#0f291e] border border-emerald-700/70 flex items-center justify-between gap-4">
            <div className="text-xs text-emerald-200 truncate font-mono">
              Partida guardada (Zlib): <code className="text-emerald-300">{portableSaveBanner}</code>
            </div>
            <button
              type="button"
              onClick={onCloseSaveBanner}
              className="text-xs font-bold uppercase text-emerald-300 hover:text-white shrink-0"
            >
              Cerrar
            </button>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}
