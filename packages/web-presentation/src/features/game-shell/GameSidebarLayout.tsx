import React, { useState } from 'react';
import type { GameSetupConfiguration, SimulationState } from '@argentina-sim/domain';
import {
  BarChart3,
  Landmark,
  LogOut,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Save,
  Scale,
  Wallet
} from 'lucide-react';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import { Argentina3DMapCanvas } from '../map-3d/Argentina3DMapCanvas.js';

// Shell estilo estrategia sobre mapa 3D vivo:
// barra superior de telemetria macro, dock horizontal de Ministerios con iconos lucide
// y el mapa 3D extruido de las 24 provincias corriendo de fondo en tiempo real.

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

const GROUP_ICONS: Record<string, React.ReactNode> = {
  DESPACHO: <Landmark className="w-3.5 h-3.5" />,
  ECONOMÍA: <BarChart3 className="w-3.5 h-3.5" />,
  PRESUPUESTO: <Wallet className="w-3.5 h-3.5" />,
  'POLÍTICA Y CONGRESO': <Scale className="w-3.5 h-3.5" />
};

const SIDEBAR_GROUPS: Array<{
  groupTitle: string;
  items: Array<{ id: InGameSidebarSection; label: string }>;
}> = [
  {
    groupTitle: 'DESPACHO',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho' },
      { id: 'GABINETE', label: 'Gabinete' },
      { id: 'REGISTRO', label: 'Registro' }
    ]
  },
  {
    groupTitle: 'ECONOMÍA',
    items: [
      { id: 'INDICADORES', label: 'Indicadores' },
      { id: 'POLITICA_ECONOMICA', label: 'Política económica' },
      { id: 'MEDIDAS', label: 'Medidas' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'CAMMESA y Paritarias' }
    ]
  },
  {
    groupTitle: 'PRESUPUESTO',
    items: [
      { id: 'FINANCIAMIENTO', label: 'Financiamiento' },
      { id: 'IMPUESTOS', label: 'Impuestos' },
      { id: 'IMPUESTOS_PROPIOS', label: 'Impuestos propios' },
      { id: 'RIGI', label: 'RIGI' }
    ]
  },
  {
    groupTitle: 'POLÍTICA Y CONGRESO',
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
    <header className="hoi-header-steel px-4 py-2 z-30 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#8a6d33]">
            <PartyEmblemSvg config={setup.party.emblem} size={22} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-serif font-black uppercase tracking-wider text-amber-100">
              LA ROSCA · {setup.party.sigla}
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
            className="hoi-btn-gold inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm font-extrabold text-xs uppercase tracking-wider transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Avanzar Mes</span>
          </button>
          <button
            type="button"
            onClick={onExportSaveCode}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#0b1018] hover:bg-[#172233] border border-[#334155] text-xs font-semibold text-slate-200"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={onExitToMenu}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#2b1015] hover:bg-[#41171f] border border-rose-800/60 text-xs font-semibold text-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function DockGroupTabs({
  activeGroupTitle,
  panelVisible,
  onSelectSection,
  onTogglePanel
}: {
  activeGroupTitle: string;
  panelVisible: boolean;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onTogglePanel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-[#1d2738]">
      <div className="flex flex-wrap gap-1">
        {SIDEBAR_GROUPS.map((group) => {
          const isGroupActive = panelVisible && group.groupTitle === activeGroupTitle;
          const cls = isGroupActive
            ? 'bg-[#17253b] text-amber-100 border-t-2 border-x border-[#b89342] border-x-[#2e415e]'
            : 'bg-[#0e141f] text-slate-400 hover:text-slate-200 border border-[#1f293b]';
          return (
            <button
              key={group.groupTitle}
              type="button"
              onClick={() => {
                const first = group.items[0];
                if (first) onSelectSection(first.id);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-t-sm text-[11px] font-mono font-bold uppercase tracking-wider transition ${cls}`}
            >
              {GROUP_ICONS[group.groupTitle]}
              <span>{group.groupTitle}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onTogglePanel}
        className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#162233] hover:bg-[#1f3047] border border-[#8a6d33] text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200"
      >
        {panelVisible ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        <MapIcon className="w-3.5 h-3.5" />
        <span>{panelVisible ? 'Ver Mapa 3D' : 'Abrir Panel'}</span>
      </button>
    </div>
  );
}

function CommandDockNav({
  activeSection,
  panelVisible,
  onSelectSection,
  onOpenPanel,
  onTogglePanel
}: {
  activeSection: InGameSidebarSection;
  panelVisible: boolean;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onOpenPanel: () => void;
  onTogglePanel: () => void;
}) {
  const activeGroup = findActiveGroup(activeSection);

  return (
    <nav className="bg-[#0b1018] border-b border-[#263142] z-20 shrink-0">
      <div className="max-w-7xl mx-auto px-4">
        <DockGroupTabs
          activeGroupTitle={activeGroup.groupTitle}
          panelVisible={panelVisible}
          onSelectSection={(sec) => {
            onSelectSection(sec);
            onOpenPanel();
          }}
          onTogglePanel={onTogglePanel}
        />

        {panelVisible ? (
          <div className="flex flex-wrap items-center gap-1.5 py-2">
            {activeGroup.items.map((item) => {
              const isSelected = activeSection === item.id;
              const itemCls = isSelected
                ? 'bg-[#1d3250] text-amber-200 border-[#b89342]'
                : 'bg-[#101622] text-slate-300 hover:bg-[#162032] border-[#263142]';
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
        ) : null}
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
  onSendAtn?: (provinceId: string) => void;
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
  onSendAtn,
  children
}: GameSidebarLayoutProps) {
  const [panelVisible, setPanelVisible] = useState(true);
  const [selectedProvId, setSelectedProvId] = useState<string | null>(state.selectedProvinceId);

  return (
    <div className="h-screen overflow-hidden text-slate-100 flex flex-col">
      <TopTelemetryBar
        setup={setup}
        state={state}
        onAdvanceTurn={onAdvanceTurn}
        onExportSaveCode={onExportSaveCode}
        onExitToMenu={onExitToMenu}
      />

      <CommandDockNav
        activeSection={activeSection}
        panelVisible={panelVisible}
        onSelectSection={onSelectSection}
        onOpenPanel={() => setPanelVisible(true)}
        onTogglePanel={() => setPanelVisible((v) => !v)}
      />

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Argentina3DMapCanvas
            provinces={state.provinces}
            selectedProvinceId={selectedProvId}
            onSelectProvince={(id) => setSelectedProvId(id || null)}
            onSendAtn={onSendAtn}
          />
        </div>

        {panelVisible ? (
          <main className="relative z-10 h-full overflow-y-auto pointer-events-none">
            <div className="max-w-4xl mx-3 sm:mx-6 my-4 p-4 sm:p-5 rounded-sm bg-[#0c1119]/92 backdrop-blur-md border border-[#263142] pointer-events-auto shadow-2xl">
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
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
}
