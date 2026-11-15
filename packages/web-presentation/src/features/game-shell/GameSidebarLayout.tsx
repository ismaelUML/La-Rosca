import React, { useState } from 'react';
import type { GameSetupConfiguration, SimulationState } from '@argentina-sim/domain';
import {
  BarChart3,
  Globe,
  Landmark,
  LogOut,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RefreshCw,
  Save,
  Scale,
  Volume2,
  VolumeX,
  Wallet
} from 'lucide-react';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import { Argentina3DMapCanvas } from '../map-3d/Argentina3DMapCanvas.js';
import { isSoundEnabled, playUiSound, setSoundEnabled } from '../../lib/gameFeedback.js';
import { resolveRangeTone, SEMANTIC_TEXT_CLASS } from '../../lib/semanticColors.js';

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
  | 'PROVINCIAS_Y_DEFENSA'
  | 'PAIS_POBLACION'
  | 'PAIS_INMIGRACION'
  | 'PAIS_EMIGRACION'
  | 'PAIS_TEJIDO_SOCIAL'
  | 'PAIS_MATRIZ_PRODUCTIVA';

const GROUP_ICONS: Record<string, React.ReactNode> = {
  DESPACHO: <Landmark className="w-3.5 h-3.5" />,
  ECONOMÍA: <BarChart3 className="w-3.5 h-3.5" />,
  PRESUPUESTO: <Wallet className="w-3.5 h-3.5" />,
  'POLÍTICA Y CONGRESO': <Scale className="w-3.5 h-3.5" />,
  PAÍS: <Globe className="w-3.5 h-3.5" />
};

type SidebarGroupSpec = {
  groupTitle: string;
  items: Array<{ id: InGameSidebarSection; label: string }>;
};

const PAIS_SIDEBAR_GROUP: SidebarGroupSpec = {
  groupTitle: 'PAÍS',
  items: [
    { id: 'PAIS_POBLACION', label: 'Población y Demografía' },
    { id: 'PAIS_INMIGRACION', label: 'Inmigración' },
    { id: 'PAIS_EMIGRACION', label: 'Emigración' },
    { id: 'PAIS_TEJIDO_SOCIAL', label: 'Salud, Educación y Sociedad' },
    { id: 'PAIS_MATRIZ_PRODUCTIVA', label: 'Matriz Productiva y Energía' }
  ]
};

const PRESIDENT_SIDEBAR_GROUPS: SidebarGroupSpec[] = [
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
  },
  PAIS_SIDEBAR_GROUP
];

const GOVERNOR_SIDEBAR_GROUPS: SidebarGroupSpec[] = [
  {
    groupTitle: 'DESPACHO',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Gobernación Provincial' },
      { id: 'REGISTRO', label: 'Boletín Oficial' }
    ]
  },
  {
    groupTitle: 'ECONOMÍA',
    items: [
      { id: 'INDICADORES', label: 'Indicadores Macro y Prov.' },
      { id: 'MEDIDAS', label: 'Medidas Sectoriales' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'Tarifas y Gremios' }
    ]
  },
  {
    groupTitle: 'PRESUPUESTO',
    items: [
      { id: 'IMPUESTOS_PROPIOS', label: 'Tributos Provinciales' },
      { id: 'RIGI', label: 'Adhesión RIGI Provincial' }
    ]
  },
  {
    groupTitle: 'POLÍTICA Y CONGRESO',
    items: [
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Liga de Gobernadores y CSJN' },
      { id: 'CAMARAS', label: 'Bancas en el Congreso' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Estructura Territorial' }
    ]
  },
  PAIS_SIDEBAR_GROUP
];

const LEGISLATOR_SIDEBAR_GROUPS: SidebarGroupSpec[] = [
  {
    groupTitle: 'DESPACHO',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho Parlamentario' },
      { id: 'REGISTRO', label: 'Diario de Sesiones' }
    ]
  },
  {
    groupTitle: 'POLÍTICA Y CONGRESO',
    items: [
      { id: 'CAMARAS', label: 'Hemiciclo y Proyectos de Ley' },
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Comodoro Py, CSJN y Provincias' },
      { id: 'APOYOS', label: 'Alianzas y Dirigentes' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Base en las Provincias' }
    ]
  },
  {
    groupTitle: 'PRESUPUESTO',
    items: [
      { id: 'IMPUESTOS_PROPIOS', label: 'Iniciativas Tributarias' },
      { id: 'INDICADORES', label: 'Monitor Macro OPC' }
    ]
  },
  PAIS_SIDEBAR_GROUP
];

const SIDEBAR_GROUPS_BY_ROLE: Record<GameSetupConfiguration['role'], SidebarGroupSpec[]> = {
  PRESIDENTE: PRESIDENT_SIDEBAR_GROUPS,
  GOBERNADOR: GOVERNOR_SIDEBAR_GROUPS,
  DIPUTADO: LEGISLATOR_SIDEBAR_GROUPS,
  SENADOR: LEGISLATOR_SIDEBAR_GROUPS
};

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

function findActiveGroup(groups: SidebarGroupSpec[], activeSection: InGameSidebarSection) {
  const found = groups.find((g) => g.items.some((i) => i.id === activeSection));
  return found ?? groups[0]!;
}

function formatSignedDelta(delta: number, decimals: number, suffix: string): string {
  const arrow = delta > 0 ? '▲' : '▼';
  const sign = delta > 0 ? '+' : '';
  return `${arrow}${sign}${delta.toFixed(decimals)}${suffix}`;
}

function buildDeltaBadge(
  current: number,
  previous: number | undefined,
  decimals: number,
  suffix: string,
  invertGood: boolean
): { text: string; colorClass: string } | null {
  if (previous === undefined) return null;
  const delta = Number((current - previous).toFixed(decimals));
  if (Math.abs(delta) < 0.05) return null;
  const isGood = invertGood ? delta < 0 : delta > 0;
  return {
    text: formatSignedDelta(delta, decimals, suffix),
    colorClass: isGood ? 'text-emerald-400' : 'text-rose-400'
  };
}

function TelemetryBox({
  label,
  value,
  toneClass,
  deltaBadge,
  tooltip
}: {
  label: string;
  value: string;
  toneClass: string;
  deltaBadge?: { text: string; colorClass: string } | null;
  tooltip?: string;
}) {
  return (
    <div
      title={tooltip}
      className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#283447] flex flex-col leading-tight"
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
        {deltaBadge ? (
          <span className={`text-[9px] font-mono font-bold ${deltaBadge.colorClass}`}>
            {deltaBadge.text}
          </span>
        ) : null}
      </div>
      <span className={`text-xs font-mono font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function SoundToggleButton() {
  const [enabled, setEnabled] = useState(() => isSoundEnabled());
  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playUiSound('tab');
  };
  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? 'Silenciar efectos sutiles' : 'Activar efectos sutiles'}
      className="inline-flex items-center justify-center p-1.5 rounded-sm bg-[#0b1018] hover:bg-[#172233] border border-[#334155] text-slate-300"
    >
      {enabled ? <Volume2 className="w-3.5 h-3.5 text-amber-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
    </button>
  );
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
  const brechaTone = resolveRangeTone(state.centralBank.exchangeBrechaPct, 15, 40, true);
  const reservesToneClass = SEMANTIC_TEXT_CLASS[resolveRangeTone(netUsd, 6, 0)];
  const ipcTone = resolveRangeTone(state.inflation.realMonthlyIpcPct, 3, 6, true);
  const riskTone = resolveRangeTone(state.countryRiskEmbiPb, 700, 1200, true);
  const imageTone = resolveRangeTone(state.publicOpinion.presidentialPersonalImagePct, 50, 35);

  const prev = state.previousTurnMetrics;
  const lagNote =
    state.laggedMacroShocks && state.laggedMacroShocks.length > 0
      ? `Rezagos activos: ${state.laggedMacroShocks.map((s) => s.sourceLabel).join(', ')}`
      : `Crawling peg ${state.centralBank.crawlingPegMonthlyPct}%/m · Resultado primario ${state.treasury.primaryResultPctGdp}% PBI`;

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

        <div key={state.turnMonth} className="flex flex-wrap items-center gap-1.5 rosca-turn-flash rounded-sm">
          <TelemetryBox
            label="Dólar CCL"
            value={`$${state.centralBank.cclDollarArs} (${state.centralBank.exchangeBrechaPct.toFixed(0)}%)`}
            toneClass={SEMANTIC_TEXT_CLASS[brechaTone]}
            deltaBadge={buildDeltaBadge(state.centralBank.cclDollarArs, prev?.cclDollarArs, 0, '', true)}
            tooltip={lagNote}
          />
          <TelemetryBox
            label="Res. Netas"
            value={`${netUsd.toFixed(1)}B USD`}
            toneClass={reservesToneClass}
            deltaBadge={buildDeltaBadge(netUsd, prev?.netReservesBillionUsd, 1, 'B', false)}
            tooltip={lagNote}
          />
          <TelemetryBox
            label="Inflación"
            value={`${state.inflation.realMonthlyIpcPct.toFixed(1)}%/m`}
            toneClass={SEMANTIC_TEXT_CLASS[ipcTone]}
            deltaBadge={buildDeltaBadge(state.inflation.realMonthlyIpcPct, prev?.realMonthlyIpcPct, 1, '%', true)}
            tooltip={lagNote}
          />
          <TelemetryBox
            label="Riesgo País"
            value={`${state.countryRiskEmbiPb} pb`}
            toneClass={SEMANTIC_TEXT_CLASS[riskTone]}
            deltaBadge={buildDeltaBadge(state.countryRiskEmbiPb, prev?.countryRiskEmbiPb, 0, '', true)}
            tooltip={lagNote}
          />
          <TelemetryBox
            label="Imagen"
            value={`${state.publicOpinion.presidentialPersonalImagePct.toFixed(0)}%`}
            toneClass={SEMANTIC_TEXT_CLASS[imageTone]}
            deltaBadge={buildDeltaBadge(
              state.publicOpinion.presidentialPersonalImagePct,
              prev?.presidentialImagePct,
              0,
              '%',
              false
            )}
            tooltip={lagNote}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playUiSound('turn');
              onAdvanceTurn();
            }}
            className="hoi-btn-gold inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm font-extrabold text-xs uppercase tracking-wider transition active:scale-[0.97]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Avanzar Mes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playUiSound('tab');
              onExportSaveCode();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#0b1018] hover:bg-[#172233] border border-[#334155] text-xs font-semibold text-slate-200"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
          <SoundToggleButton />
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
  groups,
  activeGroupTitle,
  panelVisible,
  onSelectSection,
  onTogglePanel
}: {
  groups: SidebarGroupSpec[];
  activeGroupTitle: string;
  panelVisible: boolean;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onTogglePanel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-[#1d2738]">
      <div className="flex flex-wrap gap-1">
        {groups.map((group) => {
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

const DESPACHO_LABEL_BY_ROLE: Record<GameSetupConfiguration['role'], string> = {
  PRESIDENTE: 'Despacho Presidencial',
  GOBERNADOR: 'Gobernación Provincial',
  DIPUTADO: 'Banca en Diputados',
  SENADOR: 'Banca en el Senado'
};

function resolveSidebarItemLabel(
  item: { id: InGameSidebarSection; label: string },
  role: GameSetupConfiguration['role']
): string {
  if (item.id === 'DESPACHO_RESUMEN') {
    return DESPACHO_LABEL_BY_ROLE[role];
  }
  return item.label;
}

function CommandDockNav({
  role,
  activeSection,
  panelVisible,
  onSelectSection,
  onOpenPanel,
  onTogglePanel
}: {
  role: GameSetupConfiguration['role'];
  activeSection: InGameSidebarSection;
  panelVisible: boolean;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onOpenPanel: () => void;
  onTogglePanel: () => void;
}) {
  const groups = SIDEBAR_GROUPS_BY_ROLE[role];
  const activeGroup = findActiveGroup(groups, activeSection);

  return (
    <nav className="bg-[#0b1018] border-b border-[#263142] z-20 shrink-0">
      <div className="max-w-7xl mx-auto px-4">
        <DockGroupTabs
          groups={groups}
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
                  {resolveSidebarItemLabel(item, role)}
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
  saveError?: string | null;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onRetrySave?: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  onSendAtn?: (provinceId: string) => void;
  children: React.ReactNode;
}

function SaveStatusBanners({
  portableSaveBanner,
  saveError,
  onRetrySave,
  onCloseSaveBanner
}: {
  portableSaveBanner: string | null;
  saveError?: string | null;
  onRetrySave?: () => void;
  onCloseSaveBanner: () => void;
}) {
  return (
    <>
      {saveError ? (
        <div className="mb-4 p-3 rounded-sm bg-rose-950/70 border border-rose-700/70 flex items-center justify-between gap-3 rosca-toast-pop">
          <div className="text-xs text-rose-200">{saveError}</div>
          {onRetrySave ? (
            <button
              type="button"
              onClick={onRetrySave}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-rose-800 hover:bg-rose-700 text-xs font-bold text-white shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reintentar</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {portableSaveBanner ? (
        <div className="mb-4 p-3 rounded-sm bg-[#0f291e] border border-emerald-700/70 flex items-center justify-between gap-4 rosca-toast-pop">
          <div className="text-xs text-emerald-200 truncate font-mono">
            Código portable listo para copiar: <code className="text-emerald-300">{portableSaveBanner}</code>
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
    </>
  );
}

export function GameSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  saveError,
  onSelectSection,
  onAdvanceTurn,
  onExportSaveCode,
  onRetrySave,
  onCloseSaveBanner,
  onExitToMenu,
  onSendAtn,
  children
}: GameSidebarLayoutProps) {
  const [panelVisible, setPanelVisible] = useState(true);
  const [selectedProvId, setSelectedProvId] = useState<string | null>(state.selectedProvinceId);

  const selectSectionWithFx = (sec: InGameSidebarSection) => {
    playUiSound('tab');
    onSelectSection(sec);
  };

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
        role={setup.role}
        activeSection={activeSection}
        panelVisible={panelVisible}
        onSelectSection={selectSectionWithFx}
        onOpenPanel={() => setPanelVisible(true)}
        onTogglePanel={() => {
          playUiSound('tab');
          setPanelVisible((v) => !v);
        }}
      />

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Argentina3DMapCanvas
            provinces={state.provinces}
            selectedProvinceId={selectedProvId}
            panelOpen={panelVisible}
            onSelectProvince={(id) => setSelectedProvId(id || null)}
            onSendAtn={onSendAtn}
          />
        </div>

        {panelVisible ? (
          <main className="relative z-10 h-full overflow-y-auto pointer-events-none">
            <div
              key={activeSection}
              className="max-w-3xl mx-3 sm:mx-5 my-4 p-4 sm:p-5 rounded-sm bg-[#0c1119]/92 backdrop-blur-md border border-[#263142] pointer-events-auto shadow-2xl rosca-panel-enter"
            >
              <SaveStatusBanners
                portableSaveBanner={portableSaveBanner}
                saveError={saveError}
                onRetrySave={onRetrySave}
                onCloseSaveBanner={onCloseSaveBanner}
              />

              {children}
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
}
