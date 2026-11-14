import React, { useMemo, useState } from 'react';
import type {
  CampaignSimulationState,
  GameSetupConfiguration,
  ProvinceCampaignInfo,
  ProvinceSummary
} from '@argentina-sim/domain';
import {
  Compass,
  FastForward,
  FileText,
  Flag,
  Globe,
  Landmark,
  LogOut,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Save
} from 'lucide-react';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';
import { Argentina3DMapCanvas } from '../map-3d/Argentina3DMapCanvas.js';

// Shell de campana electoral 2027 sobre el mismo mapa 3D interactivo de Argentina.

export type CampaignNavSection =
  | 'RESUMEN'
  | 'IMAGEN_Y_MAPA'
  | 'ACCIONES_CAMPAÑA'
  | 'APOYOS'
  | 'CANDIDATURA_COALICIONES'
  | 'PARTIDO_PROVINCIAS'
  | 'APOYO_PROVINCIAS'
  | 'GOBERNANTES'
  | 'POBLACION'
  | 'INMIGRACION'
  | 'EMIGRACION'
  | 'REGISTRO_DIARIO';

interface CampaignSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: CampaignSimulationState;
  activeSection: CampaignNavSection;
  portableSaveBanner: string | null;
  onSelectSection: (sec: CampaignNavSection) => void;
  onAdvanceMonth: () => void;
  onSkipToGovernment: () => void;
  onExportSaveCode: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  children: React.ReactNode;
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  SITUACIÓN: <Compass className="w-3.5 h-3.5" />,
  ESTRATEGIA: <Flag className="w-3.5 h-3.5" />,
  POLÍTICO: <Landmark className="w-3.5 h-3.5" />,
  PAÍS: <Globe className="w-3.5 h-3.5" />,
  DIARIO: <FileText className="w-3.5 h-3.5" />
};

const CAMPAIGN_NAV_GROUPS = [
  {
    title: 'SITUACIÓN',
    items: [
      { id: 'RESUMEN' as const, label: 'Resumen' },
      { id: 'IMAGEN_Y_MAPA' as const, label: 'Imagen y mapa' }
    ]
  },
  {
    title: 'ESTRATEGIA',
    items: [
      { id: 'ACCIONES_CAMPAÑA' as const, label: 'Acciones' },
      { id: 'APOYOS' as const, label: 'Apoyos' }
    ]
  },
  {
    title: 'POLÍTICO',
    items: [
      { id: 'CANDIDATURA_COALICIONES' as const, label: 'Candidatura y coaliciones' },
      { id: 'PARTIDO_PROVINCIAS' as const, label: 'Partido en las provincias' },
      { id: 'APOYO_PROVINCIAS' as const, label: 'Apoyo en Provincias' },
      { id: 'GOBERNANTES' as const, label: 'Gobernantes' }
    ]
  },
  {
    title: 'PAÍS',
    items: [
      { id: 'POBLACION' as const, label: 'Población' },
      { id: 'INMIGRACION' as const, label: 'Inmigración' },
      { id: 'EMIGRACION' as const, label: 'Emigración' }
    ]
  },
  {
    title: 'DIARIO',
    items: [{ id: 'REGISTRO_DIARIO' as const, label: 'Registro' }]
  }
];

const AFFINITY_TO_LOYALTY: Record<ProvinceCampaignInfo['ideologicalAffinity'], number> = {
  AFIN: 75,
  NEUTRAL: 50,
  HOSTIL: 25
};

function mapCampaignProvincesTo3D(provinces: ProvinceCampaignInfo[]): ProvinceSummary[] {
  return provinces.map((p) => ({
    id: p.provinceId,
    name: p.provinceName,
    region: 'PAMPEANA',
    nationalDeputiesCount: Math.max(3, Math.round(p.playerVotePct)),
    reelectionAllowed: true,
    coparticipationDependencyPct: Math.min(100, p.visitsCount * 12),
    governorLoyaltyToPresident: AFFINITY_TO_LOYALTY[p.ideologicalAffinity],
    quasiCurrencyIssued: false,
    fiscalBalancePct: Number((p.playerVotePct - 30).toFixed(1)),
    boletaUnicaActive: true,
    apparatusFiscalizacionPct: Math.round(p.affinityMultiplier * 50),
    keyEconomicDriver: p.leadingCandidateName
  }));
}

function findActiveCampaignGroup(activeSection: CampaignNavSection) {
  const found = CAMPAIGN_NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeSection));
  return found ?? CAMPAIGN_NAV_GROUPS[0]!;
}

function CampaignTopBar({
  setup,
  state,
  onAdvanceMonth,
  onSkipToGovernment,
  onExportSaveCode,
  onExitToMenu
}: Omit<
  CampaignSidebarLayoutProps,
  'activeSection' | 'portableSaveBanner' | 'onSelectSection' | 'onCloseSaveBanner' | 'children'
>) {
  return (
    <header className="hoi-header-steel px-4 py-2 z-30 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#c9a24d]/70">
            <PartyEmblemSvg config={setup.party.emblem} size={22} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-serif font-black uppercase tracking-wider text-amber-100">
              LA ROSCA · {setup.party.sigla} · {state.candidateName}
            </div>
            <div className="text-[10px] font-mono text-slate-300">
              {state.stage.formattedDate} · {state.stage.stageLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#283447] text-xs font-mono">
            <span className="text-slate-400 mr-1">CAJA:</span>
            <strong className="text-amber-300">${state.budgetArgentums.toFixed(1)}M</strong>
          </div>
          <button
            type="button"
            onClick={onSkipToGovernment}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#162133] hover:bg-[#1f2e47] border border-[#7d6230]/80 text-[11px] font-mono font-bold text-amber-200"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Ir a Dic 2027</span>
          </button>
          <button
            type="button"
            onClick={onAdvanceMonth}
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

function CampaignDockNav({
  activeSection,
  objectiveTitle,
  panelVisible,
  onSelectSection,
  onTogglePanel
}: {
  activeSection: CampaignNavSection;
  objectiveTitle: string;
  panelVisible: boolean;
  onSelectSection: (sec: CampaignNavSection) => void;
  onTogglePanel: () => void;
}) {
  const activeGroup = findActiveCampaignGroup(activeSection);

  return (
    <nav className="bg-[#0b1018]/95 backdrop-blur-md border-b border-[#283447] z-20 shrink-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-[#1d2738]">
          <div className="flex flex-wrap gap-1">
            {CAMPAIGN_NAV_GROUPS.map((group) => {
              const isGroupActive = group.title === activeGroup.title;
              const cls = isGroupActive
                ? 'bg-[#17253b] text-amber-100 border-t-2 border-x border-[#c9a24d] border-x-[#2e415e]'
                : 'bg-[#0e141f] text-slate-400 hover:text-slate-200 border border-[#1f293b]';
              return (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => {
                    const first = group.items[0];
                    if (first) onSelectSection(first.id);
                    if (!panelVisible) onTogglePanel();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-t-sm text-[11px] font-mono font-bold uppercase tracking-wider transition ${cls}`}
                >
                  {GROUP_ICONS[group.title]}
                  <span>{group.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-1">
            <div className="hidden lg:block text-[11px] font-mono text-amber-300">
              OBJETIVO: <span className="text-slate-100">{objectiveTitle}</span>
            </div>
            <button
              type="button"
              onClick={onTogglePanel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#101826] hover:bg-[#1a273d] border border-[#324663] text-[11px] font-mono font-bold text-sky-200"
            >
              {panelVisible ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeftOpen className="w-3.5 h-3.5" />
              )}
              <MapIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{panelVisible ? 'Ver Mapa 3D' : 'Abrir Panel'}</span>
            </button>
          </div>
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
                onClick={() => {
                  onSelectSection(item.id);
                  if (!panelVisible) onTogglePanel();
                }}
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

function CampaignProvinceCard({
  province,
  onClose
}: {
  province: ProvinceCampaignInfo;
  onClose: () => void;
}) {
  return (
    <aside className="fixed bottom-4 left-4 w-72 rounded-sm bg-[#0c1119]/95 border border-[#c9a24d]/70 p-3.5 shadow-2xl z-30">
      <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-[#253042]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
            Distrito Electoral 2027
          </div>
          <h4 className="text-sm font-serif font-bold text-slate-100">{province.provinceName}</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-mono text-slate-400 hover:text-white"
        >
          Cerrar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
        <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#222c3c]">
          <span className="text-slate-400 block text-[9px]">TU VOTO</span>
          <strong className="text-emerald-300">{province.playerVotePct.toFixed(1)}%</strong>
        </div>
        <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#222c3c]">
          <span className="text-slate-400 block text-[9px]">AFINIDAD</span>
          <strong className="text-amber-300">{province.ideologicalAffinity}</strong>
        </div>
        <div className="col-span-2 p-1.5 rounded-sm bg-[#090d14] border border-[#222c3c]">
          <span className="text-slate-400 block text-[9px]">PUNTERO PROVINCIAL</span>
          <strong className="text-slate-200">{province.leadingCandidateName}</strong>
        </div>
      </div>
    </aside>
  );
}

function PortableSaveBanner({
  code,
  onClose
}: {
  code: string | null;
  onClose: () => void;
}) {
  if (!code) return null;
  return (
    <div className="mb-4 p-3 rounded-sm bg-[#0f291e] border border-emerald-700/70 flex items-center justify-between gap-4">
      <div className="text-xs text-emerald-200 truncate font-mono">
        Código portable de campaña: <code className="text-emerald-300">{code}</code>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-xs font-bold uppercase text-emerald-300 hover:text-white shrink-0"
      >
        Cerrar
      </button>
    </div>
  );
}

export function CampaignSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  onSelectSection,
  onAdvanceMonth,
  onSkipToGovernment,
  onExportSaveCode,
  onCloseSaveBanner,
  onExitToMenu,
  children
}: CampaignSidebarLayoutProps) {
  const [panelVisible, setPanelVisible] = useState(true);
  const [selectedProvId, setSelectedProvId] = useState<string | null>(null);

  const mapProvinces = useMemo(
    () => mapCampaignProvincesTo3D(state.provinces),
    [state.provinces]
  );

  const selectedProvince = selectedProvId
    ? state.provinces.find((p) => p.provinceId === selectedProvId) ?? null
    : null;

  return (
    <div className="h-screen overflow-hidden bg-[#070a10] text-slate-100 flex flex-col">
      <CampaignTopBar
        setup={setup}
        state={state}
        onAdvanceMonth={onAdvanceMonth}
        onSkipToGovernment={onSkipToGovernment}
        onExportSaveCode={onExportSaveCode}
        onExitToMenu={onExitToMenu}
      />

      <CampaignDockNav
        activeSection={activeSection}
        objectiveTitle={state.stage.objectiveTitle}
        panelVisible={panelVisible}
        onSelectSection={onSelectSection}
        onTogglePanel={() => setPanelVisible((prev) => !prev)}
      />

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Argentina3DMapCanvas
            provinces={mapProvinces}
            selectedProvinceId={selectedProvId}
            panelOpen={panelVisible}
            onSelectProvince={(id) => setSelectedProvId(id || null)}
          />
        </div>

        {panelVisible ? (
          <main className="relative z-10 h-full overflow-y-auto pointer-events-none">
            <div className="max-w-3xl mx-3 sm:mx-5 my-4 p-4 sm:p-5 rounded-sm bg-[#0c1119]/92 backdrop-blur-md border border-[#263142] pointer-events-auto shadow-2xl">
              <PortableSaveBanner code={portableSaveBanner} onClose={onCloseSaveBanner} />

              {children}
            </div>
          </main>
        ) : null}

        {selectedProvince ? (
          <CampaignProvinceCard
            province={selectedProvince}
            onClose={() => setSelectedProvId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
