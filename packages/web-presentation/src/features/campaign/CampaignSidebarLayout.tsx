import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CampaignExecutePayload,
  CampaignSimulationState,
  GameSetupConfiguration,
  ProvinceCampaignInfo,
  ProvinceSummary
} from '@argentina-sim/domain';
import { CAMPAIGN_ACTIONS_CATALOG } from '@argentina-sim/infrastructure';
import { RefreshCw } from 'lucide-react';
import { playUiSound } from '../../lib/gameFeedback.js';

const Argentina3DMapCanvas = lazy(() =>
  import('../map-3d/Argentina3DMapCanvas.js').then((m) => ({ default: m.Argentina3DMapCanvas }))
);
import { formatArNumber } from '../../lib/formatters.js';
import { DesktopTaskbarStrip } from '../desktop-wm/DesktopTaskbarStrip.js';
import { DesktopWindowsLayer } from '../desktop-wm/DesktopWindowsLayer.js';
import { useDesktopWindowManager } from '../desktop-wm/useDesktopWindowManager.js';
import {
  RoscaNumberedNav,
  RoscaTopBar,
  type HudKpiMetric,
  type NumberedNavGroup
} from '../desktop-wm/RoscaMockupHud.js';
import { BottomActionCardHand } from '../desktop-wm/BottomActionCardHand.js';
import { buildCampaignHandCards } from '../desktop-wm/buildBottomHandCards.js';
import { useGameHotkeys } from '../desktop-wm/useGameHotkeys.js';

// Shell de campaña electoral 2027 en estética La Rosca (Obsidiana + Rosado Casa Rosada + Papel Crema)
// con dock numerado 01..05, mapa 3D protagonista, mano de 3 cartas y gestor multi-ventana.

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
  | 'TEJIDO_SOCIAL'
  | 'MATRIZ_PRODUCTIVA'
  | 'REGISTRO_DIARIO';

interface CampaignSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: CampaignSimulationState;
  activeSection: CampaignNavSection;
  portableSaveBanner: string | null;
  saveError?: string | null;
  onSelectSection: (sec: CampaignNavSection) => void;
  onAdvanceMonth: () => void;
  onSkipToGovernment: () => void;
  onExportSaveCode: () => void;
  onRetrySave?: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  onExecuteAction?: (payload: CampaignExecutePayload) => void;
  renderSection: (section: CampaignNavSection) => React.ReactNode;
  children?: React.ReactNode;
}

const CAMPAIGN_NAV_GROUPS: NumberedNavGroup<CampaignNavSection>[] = [
  {
    title: 'SITUACIÓN',
    subtitle: 'Tablero, imagen y telemetría',
    items: [
      { id: 'RESUMEN', label: 'Resumen' },
      { id: 'IMAGEN_Y_MAPA', label: 'Imagen y mapa' }
    ]
  },
  {
    title: 'ESTRATEGIA',
    subtitle: 'Operaciones, actos y apoyos',
    items: [
      { id: 'ACCIONES_CAMPAÑA', label: 'Acciones de campaña' },
      { id: 'APOYOS', label: 'Apoyos y dirigentes' }
    ]
  },
  {
    title: 'POLÍTICO',
    subtitle: 'Alianzas, fórmula y provincias',
    items: [
      { id: 'CANDIDATURA_COALICIONES', label: 'Candidatura y coaliciones' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Partido en las provincias' },
      { id: 'APOYO_PROVINCIAS', label: 'Apoyo en Provincias' },
      { id: 'GOBERNANTES', label: 'Gobernantes' }
    ]
  },
  {
    title: 'PAÍS',
    subtitle: 'Demografía y matriz productiva',
    items: [
      { id: 'POBLACION', label: 'Sociedad y Demografía' },
      { id: 'MATRIZ_PRODUCTIVA', label: 'Matriz Productiva' }
    ]
  },
  {
    title: 'DIARIO',
    subtitle: 'Zócalo TV, mercados y registro',
    items: [{ id: 'REGISTRO_DIARIO', label: 'Diario y Registro' }]
  }
];

const AFFINITY_TO_LOYALTY: Record<ProvinceCampaignInfo['ideologicalAffinity'], number> = {
  AFIN: 75,
  NEUTRAL: 50,
  HOSTIL: 25
};

function resolveCampaignRegion(provinceId: string): ProvinceSummary['region'] {
  return provinceId === 'CABA' ? 'AMBA' : 'PAMPEANA';
}

function mapCampaignProvincesTo3D(provinces: ProvinceCampaignInfo[]): ProvinceSummary[] {
  return provinces.map((p) => ({
    id: p.provinceId,
    name: p.provinceName,
    region: resolveCampaignRegion(p.provinceId),
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

function resolveCampaignSectionTitle(sec: CampaignNavSection): string {
  for (const grp of CAMPAIGN_NAV_GROUPS) {
    const hit = grp.items.find((i) => i.id === sec);
    if (hit) return `${grp.title} · ${hit.label}`;
  }
  return sec;
}

function findActiveCampaignGroup(activeSection: CampaignNavSection) {
  return (
    CAMPAIGN_NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeSection)) ??
    CAMPAIGN_NAV_GROUPS[0]!
  );
}

function buildCampaignKpis(state: CampaignSimulationState): [HudKpiMetric, HudKpiMetric, HudKpiMetric] {
  return [
    { label: 'IMAGEN', value: `${formatArNumber(state.image.imagenPositiva, 1)} %` },
    { label: 'INTENCIÓN DE VOTO', value: `${formatArNumber(state.votingIntention.intencionVotoGeneral, 1)} %` },
    { label: 'CAJA', value: `US$ ${formatArNumber(state.budgetArgentums, 0)} M` }
  ];
}

function PlaysLeftCounterBox({ count }: { count: number }) {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-3 px-3 py-2 bg-[#0d060a]/92 border border-[#EFE9DA]/65">
      <span className="font-display text-3xl leading-none text-[#EB3F7D]">{count}</span>
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider leading-tight text-[#F5EFE6]">
        <div>JUGADAS</div>
        <div>ESTE MES</div>
      </div>
    </div>
  );
}

function PortableSaveBanner({
  code,
  saveError,
  onRetrySave,
  onClose
}: {
  code: string | null;
  saveError?: string | null;
  onRetrySave?: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {saveError ? (
        <div className="mb-3 p-3 rounded bg-rose-950/80 border border-rose-700/70 flex items-center justify-between gap-3 rosca-toast-pop">
          <div className="text-xs text-rose-200">{saveError}</div>
          {onRetrySave ? (
            <button
              type="button"
              onClick={onRetrySave}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-xs font-bold text-white shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reintentar</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {code ? (
        <div className="mb-3 p-3 rounded bg-[#140c11] border border-[#EB3F7D]/60 flex items-center justify-between gap-4 rosca-toast-pop">
          <div className="text-xs text-[#EFE9DA] truncate font-mono">
            Código portable listo: <code className="text-[#EB3F7D]">{code}</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase text-[#EB3F7D] hover:text-white shrink-0"
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </>
  );
}

export function CampaignSidebarLayout({
  state,
  activeSection,
  portableSaveBanner,
  saveError,
  onSelectSection,
  onAdvanceMonth,
  onSkipToGovernment,
  onExportSaveCode,
  onRetrySave,
  onCloseSaveBanner,
  onExitToMenu,
  onExecuteAction,
  renderSection,
  children
}: CampaignSidebarLayoutProps) {
  const [selectedProvId, setSelectedProvId] = useState<string | null>('CABA');
  const titleResolver = useCallback((sec: CampaignNavSection) => resolveCampaignSectionTitle(sec), []);
  const wm = useDesktopWindowManager('campaign', activeSection, titleResolver, onSelectSection);
  const prevSectionRef = useRef(activeSection);

  const [browsedGroupTitle, setBrowsedGroupTitle] = useState(() => findActiveCampaignGroup(activeSection).title);
  const [subDrawerOpen, setSubDrawerOpen] = useState(false);

  useEffect(() => {
    setBrowsedGroupTitle(findActiveCampaignGroup(activeSection).title);
  }, [activeSection]);

  useEffect(() => {
    if (prevSectionRef.current !== activeSection) {
      prevSectionRef.current = activeSection;
      wm.openSectionWindow(activeSection, false);
    }
  }, [activeSection, wm.openSectionWindow]);

  const mapProvinces = useMemo(() => mapCampaignProvincesTo3D(state.provinces), [state.provinces]);

  const selectSectionWithFx = (sec: CampaignNavSection, openParallel = false) => {
    playUiSound('tab');
    prevSectionRef.current = sec;
    setSubDrawerOpen(false);
    wm.openSectionWindow(sec, openParallel);
  };

  useGameHotkeys({
    disabled: false,
    groupCount: CAMPAIGN_NAV_GROUPS.length,
    onToggleDesktop: wm.toggleShowDesktop,
    onCloseTopWindow: () => {
      if (subDrawerOpen) setSubDrawerOpen(false);
      else if (wm.focusedWindowId) wm.closeWindow(wm.focusedWindowId);
    },
    onOpenGroupIndex: (idx) => {
      const grp = CAMPAIGN_NAV_GROUPS[idx];
      if (!grp) return;
      setBrowsedGroupTitle(grp.title);
      setSubDrawerOpen(true);
    },
    onAdvanceTurn: onAdvanceMonth
  });

  const handCards = useMemo(() => {
    if (!onExecuteAction) return [];
    return buildCampaignHandCards(state, selectedProvId ?? state.targetProvinceId, onExecuteAction);
  }, [state, selectedProvId, onExecuteAction]);

  return (
    <div className="h-screen overflow-hidden bg-[#090407] text-[#F5EFE6] flex flex-col">
      <RoscaTopBar
        dateAndModeLabel={`${state.stage.formattedDate} · ${state.stage.stageLabel}`}
        kpis={buildCampaignKpis(state)}
        objectiveText={state.stage.objectiveTitle}
        advanceLabel="AVANZAR MES →"
        hasVisibleWindows={wm.hasVisibleWindows}
        onAdvanceTurn={onAdvanceMonth}
        onExportSaveCode={onExportSaveCode}
        onToggleDesktop={wm.toggleShowDesktop}
        onResetLayout={wm.resetDesktopLayout}
        onExitToMenu={onExitToMenu}
        onSkipToGovernment={onSkipToGovernment}
      />

      <div ref={wm.workspaceRef} className="relative flex-1 overflow-hidden">
        <div className={wm.isDraggingWindow ? 'absolute inset-0 z-0 pointer-events-none' : 'absolute inset-0 z-0'}>
          <Suspense fallback={<div className="w-full h-full bg-[#090407]" />}>
            <Argentina3DMapCanvas
              provinces={mapProvinces}
              selectedProvinceId={selectedProvId}
              panelOpen={wm.hasVisibleWindows}
              bottomLeftSlot={<PlaysLeftCounterBox count={state.actionsRemainingThisMonth} />}
              onSelectProvince={(id) => setSelectedProvId(id || null)}
            />
          </Suspense>
        </div>

        <RoscaNumberedNav
          groups={CAMPAIGN_NAV_GROUPS}
          browsedGroupTitle={browsedGroupTitle}
          activeSection={activeSection}
          subDrawerOpen={subDrawerOpen}
          onSelectGroup={(title) => {
            setBrowsedGroupTitle(title);
            setSubDrawerOpen(true);
          }}
          onSelectSection={selectSectionWithFx}
          onCloseSubDrawer={() => setSubDrawerOpen(false)}
        />

        <BottomActionCardHand
          cards={handCards}
          totalCatalogCount={CAMPAIGN_ACTIONS_CATALOG.length}
          catalogNoun="cartas"
          onViewAll={() => selectSectionWithFx('ACCIONES_CAMPAÑA', false)}
        />

        <DesktopWindowsLayer
          visibleWindows={wm.visibleWindows}
          focusedWindowId={wm.focusedWindowId}
          bounds={wm.bounds}
          topBanners={
            <PortableSaveBanner
              code={portableSaveBanner}
              saveError={saveError}
              onRetrySave={onRetrySave}
              onClose={onCloseSaveBanner}
            />
          }
          onFocusWindow={wm.focusWindow}
          onUpdateRect={wm.updateWindowRect}
          onDraggingChange={wm.setIsDraggingWindow}
          onTogglePin={wm.togglePinWindow}
          onSnap={wm.snapWindow}
          onMinimize={wm.minimizeWindow}
          onToggleMaximize={wm.toggleMaximizeWindow}
          onClose={wm.closeWindow}
          renderSection={renderSection}
        />

        {children}
      </div>

      <DesktopTaskbarStrip
        windows={wm.windows}
        focusedWindowId={wm.focusedWindowId}
        hasVisibleWindows={wm.hasVisibleWindows}
        onFocusOrRestore={wm.focusWindow}
        onCloseWindow={wm.closeWindow}
        onToggleDesktopView={wm.toggleShowDesktop}
        onResetLayout={wm.resetDesktopLayout}
      />
    </div>
  );
}
