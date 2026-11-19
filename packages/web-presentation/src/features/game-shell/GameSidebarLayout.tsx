import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getPoliticalCapital,
  resolveFireOfTheMonth,
  type GameSetupConfiguration,
  type SectorMeasureCard,
  type SimulationState
} from '@argentina-sim/domain';
import { RefreshCw } from 'lucide-react';
import { playUiSound } from '../../lib/gameFeedback.js';

const Argentina3DMapCanvas = lazy(() =>
  import('../map-3d/Argentina3DMapCanvas.js').then((m) => ({ default: m.Argentina3DMapCanvas }))
);
import { formatArNumber, formatArSigned } from '../../lib/formatters.js';
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
import { buildGovernmentHandCards } from '../desktop-wm/buildBottomHandCards.js';
import { ActionFeedbackToast, type FeedbackToastMessage } from '../desktop-wm/ActionFeedbackToast.js';
import { useGameHotkeys } from '../desktop-wm/useGameHotkeys.js';

// Shell de Gobierno en estética La Rosca (Obsidiana + Rosado Casa Rosada + Papel Crema):
// topbar con KPIs macro, dock lateral 01..05, mapa 3D, mano de 3 decisiones/decretos y multi-ventana.

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

const PAIS_SIDEBAR_GROUP: NumberedNavGroup<InGameSidebarSection> = {
  title: 'PAÍS',
  subtitle: 'Demografía y matriz productiva',
  items: [
    { id: 'PAIS_POBLACION', label: 'Sociedad y Demografía' },
    { id: 'PAIS_MATRIZ_PRODUCTIVA', label: 'Matriz Productiva y Energía' }
  ]
};

const PRESIDENT_SIDEBAR_GROUPS: NumberedNavGroup<InGameSidebarSection>[] = [
  {
    title: 'DESPACHO',
    subtitle: 'Decretos, gabinete y diario',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho' },
      { id: 'GABINETE', label: 'Gabinete' },
      { id: 'REGISTRO', label: 'Diario y Registro' }
    ]
  },
  {
    title: 'ECONOMÍA',
    subtitle: 'Dólar, inflación y reservas',
    items: [
      { id: 'INDICADORES', label: 'Indicadores' },
      { id: 'POLITICA_ECONOMICA', label: 'Política económica' },
      { id: 'MEDIDAS', label: 'Medidas y Decretos' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'CAMMESA y Paritarias' }
    ]
  },
  {
    title: 'PRESUPUESTO',
    subtitle: 'Gastos, ATN y deuda',
    items: [
      { id: 'FINANCIAMIENTO', label: 'Financiamiento' },
      { id: 'IMPUESTOS', label: 'Impuestos' },
      { id: 'IMPUESTOS_PROPIOS', label: 'Impuestos propios' },
      { id: 'RIGI', label: 'RIGI' }
    ]
  },
  {
    title: 'POLÍTICA Y CONGRESO',
    subtitle: 'Leyes, bloques y votaciones',
    items: [
      { id: 'CAMARAS', label: 'Cámaras (Diputados y Senado)' },
      { id: 'APOYOS', label: 'Apoyos y Figuras' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Partido en las provincias' },
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Justicia y 24 Provincias' }
    ]
  },
  PAIS_SIDEBAR_GROUP
];

const GOVERNOR_SIDEBAR_GROUPS: NumberedNavGroup<InGameSidebarSection>[] = [
  {
    title: 'DESPACHO',
    subtitle: 'Gobernación y Boletín Oficial',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Gobernación Provincial' },
      { id: 'REGISTRO', label: 'Diario y Boletín Oficial' }
    ]
  },
  {
    title: 'ECONOMÍA',
    subtitle: 'Indicadores y medidas sectoriales',
    items: [
      { id: 'INDICADORES', label: 'Indicadores Macro y Prov.' },
      { id: 'MEDIDAS', label: 'Medidas Sectoriales' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'Tarifas y Gremios' }
    ]
  },
  {
    title: 'PRESUPUESTO',
    subtitle: 'Finanzas y tributos propios',
    items: [
      { id: 'FINANCIAMIENTO', label: 'Coparticipación y Cuentas' },
      { id: 'IMPUESTOS_PROPIOS', label: 'Tributos Provinciales' },
      { id: 'RIGI', label: 'Adhesión RIGI Provincial' }
    ]
  },
  {
    title: 'POLÍTICA Y CONGRESO',
    subtitle: 'Liga de gobernadores y cámaras',
    items: [
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Liga de Gobernadores y CSJN' },
      { id: 'CAMARAS', label: 'Bancas en el Congreso' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Estructura Territorial' }
    ]
  },
  PAIS_SIDEBAR_GROUP
];

const LEGISLATOR_SIDEBAR_GROUPS: NumberedNavGroup<InGameSidebarSection>[] = [
  {
    title: 'DESPACHO',
    subtitle: 'Banca y Diario de Sesiones',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho Parlamentario' },
      { id: 'REGISTRO', label: 'Diario y Sesiones' }
    ]
  },
  {
    title: 'POLÍTICA Y CONGRESO',
    subtitle: 'Leyes, bloques y alianzas',
    items: [
      { id: 'CAMARAS', label: 'Hemiciclo y Proyectos de Ley' },
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Comodoro Py, CSJN y Provincias' },
      { id: 'APOYOS', label: 'Alianzas y Dirigentes' },
      { id: 'PARTIDO_PROVINCIAS', label: 'Base en las Provincias' }
    ]
  },
  {
    title: 'PRESUPUESTO',
    subtitle: 'Iniciativas y monitor OPC',
    items: [
      { id: 'IMPUESTOS_PROPIOS', label: 'Iniciativas Tributarias' },
      { id: 'INDICADORES', label: 'Monitor Macro OPC' }
    ]
  },
  PAIS_SIDEBAR_GROUP
];

const SIDEBAR_GROUPS_BY_ROLE: Record<
  GameSetupConfiguration['role'],
  NumberedNavGroup<InGameSidebarSection>[]
> = {
  PRESIDENTE: PRESIDENT_SIDEBAR_GROUPS,
  GOBERNADOR: GOVERNOR_SIDEBAR_GROUPS,
  DIPUTADO: LEGISLATOR_SIDEBAR_GROUPS,
  SENADOR: LEGISLATOR_SIDEBAR_GROUPS
};

const ROLE_LABELS: Record<GameSetupConfiguration['role'], string> = {
  PRESIDENTE: 'GOBIERNO NACIONAL',
  GOBERNADOR: 'GOBERNACIÓN',
  DIPUTADO: 'DIPUTADOS',
  SENADOR: 'SENADO'
};

function formatGameDate(turnMonth: number): string {
  const months = ['DIC', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV'];
  const idx = (turnMonth - 1) % 12;
  const year = 2027 + Math.floor(turnMonth / 12);
  return `${months[idx]} ${year} · T${turnMonth}`;
}

function findActiveGroup(
  groups: NumberedNavGroup<InGameSidebarSection>[],
  activeSection: InGameSidebarSection
) {
  return groups.find((g) => g.items.some((i) => i.id === activeSection)) ?? groups[0]!;
}

const DESPACHO_LABEL_BY_ROLE: Record<GameSetupConfiguration['role'], string> = {
  PRESIDENTE: 'Despacho Presidencial',
  GOBERNADOR: 'Gobernación Provincial',
  DIPUTADO: 'Banca en Diputados',
  SENADOR: 'Banca en el Senado'
};

function resolveGovSectionTitle(role: GameSetupConfiguration['role'], sec: InGameSidebarSection): string {
  const groups = SIDEBAR_GROUPS_BY_ROLE[role];
  for (const grp of groups) {
    const hit = grp.items.find((i) => i.id === sec);
    if (hit) {
      const label = hit.id === 'DESPACHO_RESUMEN' ? DESPACHO_LABEL_BY_ROLE[role] : hit.label;
      return `${grp.title} · ${label}`;
    }
  }
  return sec;
}

function buildDeltaMeta(
  delta: number | undefined,
  suffix: string,
  invertGood = false
): Pick<HudKpiMetric, 'deltaText' | 'deltaTone'> {
  if (delta === undefined || Math.abs(delta) < 0.05) return {};
  const isGood = invertGood ? delta < 0 : delta > 0;
  return {
    deltaText: `${formatArSigned(delta, 1)}${suffix}`,
    deltaTone: isGood ? 'positive' : 'negative'
  };
}

function buildGovernmentKpis(state: SimulationState): [HudKpiMetric, HudKpiMetric, HudKpiMetric] {
  const prev = state.previousTurnMetrics;
  const appDelta = prev ? state.publicOpinion.presidentialPersonalImagePct - prev.presidentialImagePct : undefined;
  const ipcDelta = prev ? state.inflation.realMonthlyIpcPct - prev.realMonthlyIpcPct : undefined;
  const resDelta = prev
    ? state.centralBank.netLiquidReservesBillionUsd - prev.netReservesBillionUsd
    : undefined;

  return [
    {
      label: 'APROBACIÓN GESTIÓN',
      value: `${formatArNumber(state.publicOpinion.managementApprovalPct, 1)} %`,
      ...buildDeltaMeta(appDelta, ' pp')
    },
    {
      label: 'INFLACIÓN MENSUAL',
      value: `${formatArNumber(state.inflation.realMonthlyIpcPct, 1)} %`,
      ...buildDeltaMeta(ipcDelta, ' pp', true)
    },
    {
      label: 'RESERVAS NETAS',
      value: `US$ ${formatArNumber(state.centralBank.netLiquidReservesBillionUsd, 1)} B`,
      ...buildDeltaMeta(resDelta, ' B')
    }
  ];
}

function PoliticalCapitalBox({ remaining, activeCount }: { remaining: number; activeCount: number }) {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-3 px-3 py-2 bg-[#0d060a]/92 border border-[#EFE9DA]/65">
      <span className="font-display text-3xl leading-none text-[#EB3F7D]">{remaining}</span>
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider leading-tight text-[#F5EFE6]">
        <div>DECISIONES</div>
        <div className="text-slate-400">{activeCount} VIGENTES</div>
      </div>
    </div>
  );
}

interface GameSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: SimulationState;
  activeSection: InGameSidebarSection;
  portableSaveBanner: string | null;
  saveError?: string | null;
  measures?: SectorMeasureCard[];
  onSelectSection: (sec: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onRetrySave?: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  onSendAtn?: (provinceId: string) => void;
  onPromiseWorks?: (provinceId: string) => void;
  onCallGovernor?: (provinceId: string) => void;
  onToggleMeasure?: (measureId: string) => void;
  renderSection: (section: InGameSidebarSection) => React.ReactNode;
  children?: React.ReactNode;
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

      {portableSaveBanner ? (
        <div className="mb-3 p-3 rounded bg-[#140c11] border border-[#EB3F7D]/60 flex items-center justify-between gap-4 rosca-toast-pop">
          <div className="text-xs text-[#EFE9DA] truncate font-mono">
            Código portable listo: <code className="text-[#EB3F7D]">{portableSaveBanner}</code>
          </div>
          <button
            type="button"
            onClick={onCloseSaveBanner}
            className="text-xs font-bold uppercase text-[#EB3F7D] hover:text-white shrink-0"
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </>
  );
}

function wrapProvinceToastAction(
  handler: ((provinceId: string) => void) | undefined,
  pushToast: (tag: string, text: string) => void,
  tag: string,
  formatText: (provId: string) => string
): ((provinceId: string) => void) | undefined {
  if (!handler) return undefined;
  return (provId: string) => {
    handler(provId);
    pushToast(tag, formatText(provId));
  };
}

function hasBlockingGovOverlay(state: SimulationState): boolean {
  const midtermPending = Boolean(state.midterm2029Result && !state.midterm2029Result.dismissed);
  return Boolean(
    midtermPending ||
      state.pendingDebtMilestone ||
      state.pendingOppositionBill ||
      state.government?.pendingEventId
  );
}

export function GameSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  saveError,
  measures = [],
  onSelectSection,
  onAdvanceTurn,
  onExportSaveCode,
  onRetrySave,
  onCloseSaveBanner,
  onExitToMenu,
  onSendAtn,
  onPromiseWorks,
  onCallGovernor,
  onToggleMeasure,
  renderSection,
  children
}: GameSidebarLayoutProps) {
  const [selectedProvId, setSelectedProvId] = useState<string | null>(state.selectedProvinceId || 'CABA');
  const [handRotation, setHandRotation] = useState(0);
  const [toast, setToast] = useState<FeedbackToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const pushToast = useCallback((tag: string, text: string) => {
    setToast({ id: Date.now(), tag, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const titleResolver = useCallback(
    (sec: InGameSidebarSection) => resolveGovSectionTitle(setup.role, sec),
    [setup.role]
  );
  const wm = useDesktopWindowManager('government', activeSection, titleResolver, onSelectSection);
  const prevSectionRef = useRef(activeSection);

  const groups = SIDEBAR_GROUPS_BY_ROLE[setup.role];
  const [browsedGroupTitle, setBrowsedGroupTitle] = useState(() => findActiveGroup(groups, activeSection).title);
  const [subDrawerOpen, setSubDrawerOpen] = useState(false);

  useEffect(() => {
    setBrowsedGroupTitle(findActiveGroup(groups, activeSection).title);
  }, [groups, activeSection]);

  useEffect(() => {
    if (prevSectionRef.current !== activeSection) {
      prevSectionRef.current = activeSection;
      wm.openSectionWindow(activeSection, false);
    }
  }, [activeSection, wm.openSectionWindow]);

  const selectSectionWithFx = (sec: InGameSidebarSection, openParallel = false) => {
    playUiSound('tab');
    prevSectionRef.current = sec;
    setSubDrawerOpen(false);
    wm.openSectionWindow(sec, openParallel);
  };

  useGameHotkeys({
    disabled: hasBlockingGovOverlay(state),
    groupCount: groups.length,
    onToggleDesktop: wm.toggleShowDesktop,
    onCloseTopWindow: () => {
      if (subDrawerOpen) setSubDrawerOpen(false);
      else if (wm.focusedWindowId) wm.closeWindow(wm.focusedWindowId);
    },
    onOpenGroupIndex: (idx) => {
      const grp = groups[idx];
      if (!grp) return;
      setBrowsedGroupTitle(grp.title);
      setSubDrawerOpen(true);
    },
    onAdvanceTurn
  });

  const politicalCapital = getPoliticalCapital(state);

  const handleDecreeFromHand = useCallback(
    (id: string) => {
      if (!onToggleMeasure) return;
      const target = measures.find((m) => m.id === id);
      onToggleMeasure(id);
      if (target) {
        pushToast('BOLETÍN OFICIAL', target.active ? `Derogada: ${target.title}` : `Decreto firmado: ${target.title}`);
      }
    },
    [measures, onToggleMeasure, pushToast]
  );

  const handCards = useMemo(() => {
    if (!onToggleMeasure || measures.length === 0) return [];
    return buildGovernmentHandCards(measures, handleDecreeFromHand, politicalCapital.remaining, state, handRotation);
  }, [measures, onToggleMeasure, handleDecreeFromHand, politicalCapital.remaining, state, handRotation]);

  const activeDecreesCount = measures.filter((m) => m.active).length;

  const handleAtnWithToast = wrapProvinceToastAction(
    onSendAtn,
    pushToast,
    'TESORO NACIONAL',
    (provId) => `ATN girado a ${provId} (+lealtad provincial)`
  );
  const handleWorksWithToast = wrapProvinceToastAction(
    onPromiseWorks,
    pushToast,
    'OBRA FEDERAL',
    (provId) => `Obra comprometida en ${provId} (+5 lealtad · impacto 2 m.)`
  );
  const handleCallWithToast = wrapProvinceToastAction(
    onCallGovernor,
    pushToast,
    'TELÉFONO ROJO',
    (provId) => `Llamado a ${provId}: +6 relación bloques federales (-1 dec.)`
  );

  return (
    <div className="h-screen overflow-hidden bg-[#090407] text-[#F5EFE6] flex flex-col">
      <RoscaTopBar
        dateAndModeLabel={`${formatGameDate(state.turnMonth)} · ${ROLE_LABELS[setup.role]}`}
        kpis={buildGovernmentKpis(state)}
        objectiveText={resolveFireOfTheMonth(state)}
        advanceLabel="AVANZAR MES →"
        hasVisibleWindows={wm.hasVisibleWindows}
        onAdvanceTurn={onAdvanceTurn}
        onExportSaveCode={onExportSaveCode}
        onToggleDesktop={wm.toggleShowDesktop}
        onResetLayout={wm.resetDesktopLayout}
        onExitToMenu={onExitToMenu}
      />

      <div ref={wm.workspaceRef} className="relative flex-1 overflow-hidden">
        <div className={wm.isDraggingWindow ? 'absolute inset-0 z-0 pointer-events-none' : 'absolute inset-0 z-0'}>
          <Suspense fallback={<div className="w-full h-full bg-[#090407]" />}>
            <Argentina3DMapCanvas
              provinces={state.provinces}
              selectedProvinceId={selectedProvId}
              panelOpen={wm.hasVisibleWindows}
              capitalRemaining={politicalCapital.remaining}
              bottomLeftSlot={
                <PoliticalCapitalBox
                  remaining={politicalCapital.remaining}
                  activeCount={activeDecreesCount}
                />
              }
              onSelectProvince={(id) => setSelectedProvId(id || null)}
              onSendAtn={handleAtnWithToast}
              onPromiseWorks={handleWorksWithToast}
              onCallGovernor={handleCallWithToast}
            />
          </Suspense>
        </div>

        <RoscaNumberedNav
          groups={groups}
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
          totalCatalogCount={measures.length}
          catalogNoun="decretos"
          onRotateHand={() => setHandRotation((r) => r + 1)}
          onViewAll={() => selectSectionWithFx('MEDIDAS', false)}
        />

        <ActionFeedbackToast toast={toast} />

        <DesktopWindowsLayer
          visibleWindows={wm.visibleWindows}
          focusedWindowId={wm.focusedWindowId}
          bounds={wm.bounds}
          topBanners={
            <SaveStatusBanners
              portableSaveBanner={portableSaveBanner}
              saveError={saveError}
              onRetrySave={onRetrySave}
              onCloseSaveBanner={onCloseSaveBanner}
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
