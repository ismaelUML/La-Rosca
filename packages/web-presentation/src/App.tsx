import React, { useEffect, useMemo, useState } from 'react';
import {
  advanceCampaignMonth,
  advanceSimulationMonth,
  applyPolicyAction,
  executeCampaignAction,
  advanceRigiMonthlyQueue,
  approveRigiProject,
  approveAllRigiProjects,
  type CabinetMinister,
  type CampaignExecutePayload,
  type CampaignSimulationState,
  type CustomTaxProposal,
  type EconomicLeverItem,
  type GameSetupConfiguration,
  type PersistedGameSession,
  type PolicyAction,
  type RigiPendingProject,
  type RigisectorItem,
  type SectorMeasureCard,
  type SimulationState
} from '@argentina-sim/domain';
import {
  CAMPAIGN_ACTIONS_CATALOG,
  CompressedSaveRepository,
  createInitialCampaignState,
  createInitialSimulationState2027,
  INITIAL_CABINET_2027,
  INITIAL_ECONOMIC_LEVERS,
  INITIAL_RIGI_SECTORS,
  INITIAL_SECTOR_MEASURES,
  loadSessionFromStorage,
  POLITICAL_PARTIES_2027,
  REAL_POLITICIANS_2027,
  resolveMonthlyDilemma,
  type CampaignDilemmaOption,
  saveSessionToStorage
} from '@argentina-sim/infrastructure';
import { LandingScreen } from './features/party-setup/LandingScreen.js';
import { NewGameSetupScreen } from './features/party-setup/NewGameSetupScreen.js';
import {
  CampaignSidebarLayout,
  type CampaignNavSection
} from './features/campaign/CampaignSidebarLayout.js';
import { CampaignResumenView } from './features/campaign/CampaignResumenView.js';
import { CampaignImageAndMapView } from './features/campaign/CampaignImageAndMapView.js';
import { CampaignActionsView } from './features/campaign/CampaignActionsView.js';
import { CampaignApoyosView } from './features/campaign/CampaignApoyosView.js';
import { CampaignCoalicionesView } from './features/campaign/CampaignCoalicionesView.js';
import { CampaignPartidoProvinciasView } from './features/campaign/CampaignPartidoProvinciasView.js';
import { CampaignApoyoProvinciasView } from './features/campaign/CampaignApoyoProvinciasView.js';
import { CampaignGobernantesView } from './features/campaign/CampaignGobernantesView.js';
import { CampaignDemografiaPaisView } from './features/campaign/CampaignDemografiaPaisView.js';
import { CampaignMonthlyDilemmaModal } from './features/campaign/CampaignMonthlyDilemmaModal.js';
import {
  ElectionNightModal,
  type ElectionStageType
} from './features/campaign/ElectionNightModal.js';
import {
  GameSidebarLayout,
  type InGameSidebarSection
} from './features/game-shell/GameSidebarLayout.js';
import { IndicatorsDashboardView } from './features/game-shell/IndicatorsDashboardView.js';
import { CabinetView } from './features/game-shell/CabinetView.js';
import {
  EconomicPolicyView,
  SectorMeasuresView
} from './features/game-shell/EconomicPolicyAndMeasuresView.js';
import {
  CustomTaxesAndRigiView,
  FinancingView,
  TaxesManagementView
} from './features/game-shell/BudgetAndTaxesView.js';
import {
  DespachoOverview,
  RegistroHistoryView
} from './features/game-shell/DespachoAndRegistroView.js';
import { EnergyAndLaborView } from './features/energia-y-trabajo/EnergyAndLaborView.js';
import { JudicialAndProvincesView } from './features/justicia-y-provincias/JudicialAndProvincesView.js';
import { CamarasLegislativasView } from './features/game-shell/CamarasLegislativasView.js';

// Flujo electoral y gubernamental completo:
// 1) LandingScreen -> 2) NewGameSetupScreen -> 3) Campaña Electoral 2027 -> 4) Asunción y Gobierno.

type ScreenMode = 'LANDING' | 'NEW_GAME_SETUP' | 'CAMPAIGN' | 'GOVERNMENT';

const DEFAULT_SETUP: GameSetupConfiguration = {
  sessionId: '9762057179063',
  characterMode: 'UN_POLITICO_REAL',
  characterName: 'Javier Milei',
  selectedPoliticianId: 'JAVIER_MILEI',
  role: 'PRESIDENTE',
  provinceId: 'CABA',
  partyMode: 'PARTIDO_EXISTENTE',
  party: POLITICAL_PARTIES_2027[0]!,
  difficulty: 'ESTANDAR_2027'
};

interface CampaignActivePanelProps {
  section: CampaignNavSection;
  state: CampaignSimulationState;
  onAdvanceMonth: () => void;
  onNavigateActions: () => void;
  onExecuteAction: (payload: CampaignExecutePayload) => void;
  onUpdateCampaignState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

function CampaignActivePanel({
  section,
  state,
  onAdvanceMonth,
  onNavigateActions,
  onExecuteAction,
  onUpdateCampaignState
}: CampaignActivePanelProps) {
  const viewMap: Record<CampaignNavSection, React.ReactNode> = {
    RESUMEN: (
      <CampaignResumenView
        state={state}
        onAdvanceMonth={onAdvanceMonth}
        onNavigateActions={onNavigateActions}
      />
    ),
    IMAGEN_Y_MAPA: <CampaignImageAndMapView state={state} />,
    ACCIONES_CAMPAÑA: (
      <CampaignActionsView
        state={state}
        onExecuteAction={onExecuteAction}
        onAdvanceMonth={onAdvanceMonth}
      />
    ),
    APOYOS: (
      <CampaignApoyosView
        state={state}
        onAdvanceMonth={onAdvanceMonth}
        onUpdateState={onUpdateCampaignState}
      />
    ),
    CANDIDATURA_COALICIONES: (
      <CampaignCoalicionesView
        state={state}
        onUpdateState={onUpdateCampaignState}
      />
    ),
    PARTIDO_PROVINCIAS: <CampaignPartidoProvinciasView state={state} />,
    APOYO_PROVINCIAS: (
      <CampaignApoyoProvinciasView
        state={state}
        onUpdateState={onUpdateCampaignState}
      />
    ),
    GOBERNANTES: <CampaignGobernantesView state={state} />,
    POBLACION: <CampaignDemografiaPaisView key="POBLACION" initialTab="POBLACION" />,
    INMIGRACION: <CampaignDemografiaPaisView key="INMIGRACION" initialTab="INMIGRACION" />,
    EMIGRACION: <CampaignDemografiaPaisView key="EMIGRACION" initialTab="EMIGRACION" />,
    REGISTRO_DIARIO: <RegistroHistoryView historyLog={state.historyLog} />
  };

  return <>{viewMap[section] ?? viewMap.RESUMEN}</>;
}

interface ActiveSectionRendererProps {
  section: InGameSidebarSection;
  setup: GameSetupConfiguration;
  state: SimulationState;
  campaignState: CampaignSimulationState;
  ministers: CabinetMinister[];
  levers: EconomicLeverItem[];
  measures: SectorMeasureCard[];
  rigiSectors: RigisectorItem[];
  customTaxes: CustomTaxProposal[];
  rigiPending?: RigiPendingProject[];
  onApproveRigiProject?: (id: string) => void;
  onRejectRigiProject?: (id: string) => void;
  onApproveAllRigiProjects?: () => void;
  onNavigate: (sec: InGameSidebarSection) => void;
  onDispatch: (action: PolicyAction) => void;
  onAdvanceTurn: () => void;
  onReinforceMinister: (id: string) => void;
  onReplaceMinister: (id: string) => void;
  onAppointMinister?: (id: string, newMinister: CabinetMinister) => void;
  onChangeLever: (id: string, lv: -2 | -1 | 0 | 1 | 2) => void;
  onToggleMeasure: (id: string) => void;
  onAddCustomTax: (tax: CustomTaxProposal) => void;
  onToggleRigi: (id: string) => void;
}

function ActiveSectionRenderer(props: ActiveSectionRendererProps) {
  const viewMap: Record<InGameSidebarSection, React.ReactNode> = {
    DESPACHO_RESUMEN: (
      <DespachoOverview
        setup={props.setup}
        state={props.state}
        historyLog={props.state.eventLog}
        onNavigate={props.onNavigate}
        onAdvanceTurn={props.onAdvanceTurn}
      />
    ),
    GABINETE: (
      <CabinetView
        ministers={props.ministers}
        onReinforceMinister={props.onReinforceMinister}
        onReplaceMinister={props.onReplaceMinister}
        onAppointMinister={props.onAppointMinister}
        playerPartySigla={props.setup.party.sigla}
        coalitionParties={props.campaignState.coalitionParties}
      />
    ),
    REGISTRO: <RegistroHistoryView historyLog={props.state.eventLog} />,
    INDICADORES: <IndicatorsDashboardView state={props.state} />,
    POLITICA_ECONOMICA: (
      <EconomicPolicyView
        levers={props.levers}
        state={props.state}
        onChangeLever={props.onChangeLever}
        onDispatch={props.onDispatch}
        onAdvanceTurn={props.onAdvanceTurn}
      />
    ),
    MEDIDAS: (
      <SectorMeasuresView
        measures={props.measures}
        onToggleMeasure={props.onToggleMeasure}
      />
    ),
    ENERGIA_Y_PARITARIAS: (
      <EnergyAndLaborView state={props.state} onDispatch={props.onDispatch} />
    ),
    FINANCIAMIENTO: (
      <FinancingView state={props.state} onDispatch={props.onDispatch} />
    ),
    IMPUESTOS: (
      <TaxesManagementView state={props.state} onDispatch={props.onDispatch} />
    ),
    IMPUESTOS_PROPIOS: (
      <CustomTaxesAndRigiView
        mode="CUSTOM_TAXES"
        customTaxes={props.customTaxes}
        rigiSectors={props.rigiSectors}
        onAddCustomTax={props.onAddCustomTax}
        onToggleRigi={props.onToggleRigi}
      />
    ),
    RIGI: (
      <CustomTaxesAndRigiView
        mode="RIGI"
        customTaxes={props.customTaxes}
        rigiSectors={props.rigiSectors}
        onAddCustomTax={props.onAddCustomTax}
        onToggleRigi={props.onToggleRigi}
        pendingProjects={props.rigiPending}
        onApproveProject={props.onApproveRigiProject}
        onRejectProject={props.onRejectRigiProject}
        onApproveAllProjects={props.onApproveAllRigiProjects}
      />
    ),
    CAMARAS: (
      <CamarasLegislativasView state={props.state} onDispatch={props.onDispatch} />
    ),
    APOYOS: (
      <CampaignApoyosView state={props.campaignState} />
    ),
    PARTIDO_PROVINCIAS: (
      <CampaignPartidoProvinciasView state={props.campaignState} />
    ),
    CONGRESO_Y_JUSTICIA: (
      <JudicialAndProvincesView state={props.state} onDispatch={props.onDispatch} />
    ),
    PROVINCIAS_Y_DEFENSA: (
      <JudicialAndProvincesView state={props.state} onDispatch={props.onDispatch} />
    )
  };

  return <>{viewMap[props.section]}</>;
}

function applyLeverToMacroEngine(
  id: string,
  level: -2 | -1 | 0 | 1 | 2,
  dispatch: (action: PolicyAction) => void
) {
  const actionsByLever: Record<string, () => void> = {
    TIPO_CAMBIO: () => dispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: Math.max(0, 2 + level * 1.5) }),
    CONTROL_CAMBIOS: () => dispatch({ type: 'SET_CEPO_STRICTNESS', strictnessIndex: Math.max(0, 45 + level * 20) }),
    TASA_INTERES: () => dispatch({ type: 'SET_POLICY_RATE', annualRatePct: Math.max(12, 38 + level * 12) }),
    SUBSIDIOS_TARIFAS: () => dispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: Math.max(25, 72 - level * 14) })
  };
  actionsByLever[id]?.();
}

function buildSessionPayload(
  screenMode: ScreenMode,
  setup: GameSetupConfiguration,
  campaignState: CampaignSimulationState,
  campaignNavSection: CampaignNavSection,
  governmentState: SimulationState,
  activeSection: InGameSidebarSection,
  ministers: CabinetMinister[],
  levers: EconomicLeverItem[],
  measures: SectorMeasureCard[],
  rigiSectors: RigisectorItem[],
  customTaxes: CustomTaxProposal[],
  rigiPending?: RigiPendingProject[]
): PersistedGameSession {
  return {
    version: 1,
    savedAtIso: new Date().toISOString(),
    screenMode,
    setup,
    campaignState,
    campaignNavSection,
    governmentState,
    activeSection,
    ministers,
    levers,
    measures,
    rigiSectors,
    rigiPending,
    customTaxes
  };
}

function shouldSkipAutoSave(
  screenMode: ScreenMode,
  turnMonth: number,
  campaignMonth: number,
  hasInitialSave: boolean
): boolean {
  if (hasInitialSave) {
    return false;
  }
  if (screenMode !== 'LANDING') {
    return false;
  }
  return turnMonth === 1 && campaignMonth === 1;
}

function resolveContinueScreenMode(
  savedSession: PersistedGameSession | null,
  govTurn: number,
  campaignStage: string
): ScreenMode {
  if (govTurn > 1 || campaignStage === 'GOBIERNO') {
    return 'GOVERNMENT';
  }
  if (savedSession?.screenMode && savedSession.screenMode !== 'LANDING') {
    return savedSession.screenMode;
  }
  return 'CAMPAIGN';
}

function computeHasActiveSave(
  savedSession: PersistedGameSession | null,
  turnMonth: number,
  campaignMonth: number
): boolean {
  if (savedSession) {
    return true;
  }
  return turnMonth > 1 || campaignMonth > 1;
}

function resolveCustomCandidateName(characterName: string | undefined): string {
  const trimmed = characterName ? characterName.trim() : '';
  return trimmed.length > 0 ? trimmed : 'Mi Personaje';
}

// Resuelve la identidad del candidato sin pisar la eleccion de "Mi Personaje".
// El bug historico agarraba a Macri por default porque selectedPoliticianId quedaba
// seteado de la pantalla previa aunque el usuario hubiera tippeado su propio nombre.
function resolveCandidateFromSetup(nextSetup: GameSetupConfiguration): { id: string; name: string } {
  if (nextSetup.characterMode === 'MI_PERSONAJE') {
    const name = resolveCustomCandidateName(nextSetup.characterName);
    return {
      id: `CUSTOM_${name.replace(/\s+/g, '_').toUpperCase()}`,
      name
    };
  }
  const real = REAL_POLITICIANS_2027.find((p) => p.id === nextSetup.selectedPoliticianId);
  if (real) {
    return real;
  }
  return { id: 'CUSTOM_CANDIDATO', name: 'Candidato' };
}

function resolveElectionStageForMonth(monthIndex: number): ElectionStageType | null {
  if (monthIndex === 8) {
    return 'PASO';
  }
  if (monthIndex === 10) {
    return 'GENERALES';
  }
  if (monthIndex === 11) {
    return 'BALOTAJE';
  }
  return null;
}

export function App() {
  const saveRepo = useMemo(() => new CompressedSaveRepository(), []);
  const savedSession = useMemo(() => loadSessionFromStorage(), []);

  const [screenMode, setScreenMode] = useState<ScreenMode>(() => {
    return savedSession?.screenMode ?? 'LANDING';
  });
  const [setup, setSetup] = useState<GameSetupConfiguration>(() => {
    return savedSession?.setup ?? DEFAULT_SETUP;
  });
  const [campaignState, setCampaignState] = useState<CampaignSimulationState>(() => {
    return (
      savedSession?.campaignState ??
      createInitialCampaignState(
        { id: 'JAVIER_MILEI', name: 'Javier Milei' },
        POLITICAL_PARTIES_2027[0]!,
        'PRESIDENTE',
        'CABA'
      )
    );
  });
  const [campaignNavSection, setCampaignNavSection] = useState<CampaignNavSection>(() => {
    return (savedSession?.campaignNavSection as CampaignNavSection) ?? 'RESUMEN';
  });
  const [activeElectionModal, setActiveElectionModal] = useState<ElectionStageType | null>(null);

  const [state, setState] = useState<SimulationState>(() => {
    return (
      savedSession?.governmentState ??
      createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA')
    );
  });
  const [activeSection, setActiveSection] = useState<InGameSidebarSection>(() => {
    return (savedSession?.activeSection as InGameSidebarSection) ?? 'INDICADORES';
  });
  const [portableSaveBanner, setPortableSaveBanner] = useState<string | null>(null);

  const [ministers, setMinisters] = useState<CabinetMinister[]>(() => {
    return savedSession?.ministers ?? INITIAL_CABINET_2027;
  });
  const [levers, setLevers] = useState<EconomicLeverItem[]>(() => {
    return savedSession?.levers ?? INITIAL_ECONOMIC_LEVERS;
  });
  const [measures, setMeasures] = useState<SectorMeasureCard[]>(() => {
    return savedSession?.measures ?? INITIAL_SECTOR_MEASURES;
  });
  const [rigiSectors, setRigiSectors] = useState<RigisectorItem[]>(() => {
    return savedSession?.rigiSectors ?? INITIAL_RIGI_SECTORS;
  });
  const [customTaxes, setCustomTaxes] = useState<CustomTaxProposal[]>(() => {
    return savedSession?.customTaxes ?? [];
  });
  const [rigiPending, setRigiPending] = useState<RigiPendingProject[]>(() => {
    return savedSession?.rigiPending ?? [];
  });

  useEffect(() => {
    if (
      shouldSkipAutoSave(
        screenMode,
        state.turnMonth,
        campaignState.stage.currentMonthIndex,
        Boolean(savedSession)
      )
    ) {
      return;
    }

    saveSessionToStorage(
      buildSessionPayload(
        screenMode,
        setup,
        campaignState,
        campaignNavSection,
        state,
        activeSection,
        ministers,
        levers,
        measures,
        rigiSectors,
        customTaxes,
        rigiPending
      )
    );
  }, [
    screenMode,
    setup,
    campaignState,
    campaignNavSection,
    state,
    activeSection,
    ministers,
    levers,
    measures,
    rigiSectors,
    customTaxes,
    rigiPending,
    savedSession
  ]);

  const handleStartConfiguredGame = (nextSetup: GameSetupConfiguration) => {
    setSetup(nextSetup);
    const candidateObj = resolveCandidateFromSetup(nextSetup);

    setCampaignState(
      createInitialCampaignState(
        candidateObj,
        nextSetup.party,
        nextSetup.role,
        nextSetup.provinceId
      )
    );
    setCampaignNavSection('RESUMEN');
    setScreenMode('CAMPAIGN');
  };

  const handleAdvanceCampaign = () => {
    const next = advanceCampaignMonth(campaignState);
    if (next.stage.stage === 'GOBIERNO') {
      setState(createInitialSimulationState2027(setup.role, setup.difficulty, setup.provinceId));
      setScreenMode('GOVERNMENT');
      return;
    }
    const dilemma = resolveMonthlyDilemma(next.stage.currentMonthIndex, next.resolvedDilemmas);
    const nextDilemmaId = dilemma ? dilemma.id : null;
    const electionStage = resolveElectionStageForMonth(next.stage.currentMonthIndex);
    if (electionStage) {
      setActiveElectionModal(electionStage);
    }
    setCampaignState({
      ...next,
      activeMonthlyDilemmaId: nextDilemmaId
    });
  };

  const handleProceedElection = () => {
    if (activeElectionModal === 'BALOTAJE') {
      setState(createInitialSimulationState2027(setup.role, setup.difficulty, setup.provinceId));
      setScreenMode('GOVERNMENT');
    }
    setActiveElectionModal(null);
  };

  const activeDilemma = useMemo(() => {
    if (!campaignState.activeMonthlyDilemmaId) {
      return null;
    }
    return resolveMonthlyDilemma(
      campaignState.stage.currentMonthIndex,
      campaignState.resolvedDilemmas
    );
  }, [
    campaignState.activeMonthlyDilemmaId,
    campaignState.stage.currentMonthIndex,
    campaignState.resolvedDilemmas
  ]);

  const handleResolveDilemma = (option: CampaignDilemmaOption) => {
    if (!activeDilemma) {
      return;
    }
    const applied = option.apply(campaignState);
    const dilemmaId = activeDilemma.id;
    setCampaignState({
      ...applied,
      activeMonthlyDilemmaId: null,
      resolvedDilemmas: [...(applied.resolvedDilemmas ?? []), dilemmaId]
    });
  };

  const handleExecuteCampaignAction = (payload: CampaignExecutePayload) => {
    const card = CAMPAIGN_ACTIONS_CATALOG.find((c) => c.id === payload.actionId);
    if (!card) {
      return;
    }
    setCampaignState((prev) => executeCampaignAction(prev, card, payload));
  };

  const handleExportSaveCode = () => {
    saveSessionToStorage(
      buildSessionPayload(
        screenMode,
        setup,
        campaignState,
        campaignNavSection,
        state,
        activeSection,
        ministers,
        levers,
        measures,
        rigiSectors,
        customTaxes,
        rigiPending
      )
    );
    setPortableSaveBanner(saveRepo.exportPortableCode(state));
  };

  const handleContinueGame = () => {
    const nextMode = resolveContinueScreenMode(
      savedSession,
      state.turnMonth,
      campaignState.stage.stage
    );
    setScreenMode(nextMode);
  };

  const handleImportPortableCode = (code: string) => {
    const imported = saveRepo.importPortableCode(code);
    setState(imported);
    setScreenMode('GOVERNMENT');
    setActiveSection('INDICADORES');
  };

  const hasActiveSave = computeHasActiveSave(
    savedSession,
    state.turnMonth,
    campaignState.stage.currentMonthIndex
  );

  if (screenMode === 'LANDING') {
    return (
      <LandingScreen
        hasSavedSession={hasActiveSave}
        onStartNewGame={() => setScreenMode('NEW_GAME_SETUP')}
        onContinueGame={handleContinueGame}
        onImportPortableCode={handleImportPortableCode}
      />
    );
  }

  if (screenMode === 'NEW_GAME_SETUP') {
    return (
      <NewGameSetupScreen
        provinces={state.provinces}
        onBackToLanding={() => setScreenMode('LANDING')}
        onStartConfiguredGame={handleStartConfiguredGame}
      />
    );
  }

  if (screenMode === 'CAMPAIGN') {
    return (
      <CampaignSidebarLayout
        setup={setup}
        state={campaignState}
        activeSection={campaignNavSection}
        portableSaveBanner={portableSaveBanner}
        onSelectSection={setCampaignNavSection}
        onAdvanceMonth={handleAdvanceCampaign}
        onSkipToGovernment={() => {
          setState(createInitialSimulationState2027(setup.role, setup.difficulty, setup.provinceId));
          setScreenMode('GOVERNMENT');
        }}
        onExportSaveCode={handleExportSaveCode}
        onCloseSaveBanner={() => setPortableSaveBanner(null)}
        onExitToMenu={() => setScreenMode('LANDING')}
      >
        <CampaignActivePanel
          section={campaignNavSection}
          state={campaignState}
          onAdvanceMonth={handleAdvanceCampaign}
          onNavigateActions={() => setCampaignNavSection('ACCIONES_CAMPAÑA')}
          onExecuteAction={handleExecuteCampaignAction}
          onUpdateCampaignState={setCampaignState}
        />
        <CampaignMonthlyDilemmaModal
          dilemma={activeDilemma}
          onSelectOption={handleResolveDilemma}
        />
        <ElectionNightModal
          isOpen={Boolean(activeElectionModal)}
          stageType={activeElectionModal ?? 'PASO'}
          state={campaignState}
          onProceed={handleProceedElection}
        />
      </CampaignSidebarLayout>
    );
  }

  const handleApproveRigiProject = (projectId: string) => {
    const res = approveRigiProject(projectId, rigiPending, rigiSectors);
    setRigiPending(res.nextPending);
    setRigiSectors(res.nextSectors);
    if (res.approvedProject) {
      setState((prev) => ({
        ...prev,
        eventLog: [
          `RIGI: Proyecto aprobado "${res.approvedProject?.name}" (${res.approvedProject?.minProjectMillionUsd} M USD).`,
          ...prev.eventLog.slice(0, 14)
        ]
      }));
    }
  };

  const handleRejectRigiProject = (projectId: string) => {
    const proj = rigiPending.find((p) => p.id === projectId);
    setRigiPending((prev) => prev.filter((p) => p.id !== projectId));
    if (proj) {
      setState((prev) => ({
        ...prev,
        eventLog: [`RIGI: Proyecto "${proj.name}" rechazado.`, ...prev.eventLog.slice(0, 14)]
      }));
    }
  };

  const handleApproveAllRigiProjects = () => {
    const res = approveAllRigiProjects(rigiPending, rigiSectors);
    setRigiPending(res.nextPending);
    setRigiSectors(res.nextSectors);
    setState((prev) => ({
      ...prev,
      eventLog: [
        `RIGI: Aprobados en bloque todos los proyectos pendientes (${res.count} proyectos).`,
        ...prev.eventLog.slice(0, 14)
      ]
    }));
  };

  const handleAdvanceGovernmentTurn = () => {
    setState((prev) => advanceSimulationMonth(prev));
    const rigiQueue = advanceRigiMonthlyQueue(rigiPending, rigiSectors);
    setRigiPending(rigiQueue.nextPending);
    if (rigiQueue.desistedProjects.length > 0) {
      setState((prev) => ({
        ...prev,
        eventLog: [
          `RIGI: Proyectos desistidos por falta de respuesta: ${rigiQueue.desistedProjects.join(', ')}.`,
          ...prev.eventLog.slice(0, 14)
        ]
      }));
    }
  };

  return (
    <GameSidebarLayout
      setup={setup}
      state={state}
      activeSection={activeSection}
      portableSaveBanner={portableSaveBanner}
      onSelectSection={setActiveSection}
      onAdvanceTurn={handleAdvanceGovernmentTurn}
      onExportSaveCode={handleExportSaveCode}
      onCloseSaveBanner={() => setPortableSaveBanner(null)}
      onExitToMenu={() => setScreenMode('LANDING')}
    >
      <ActiveSectionRenderer
        section={activeSection}
        setup={setup}
        state={state}
        campaignState={campaignState}
        ministers={ministers}
        levers={levers}
        measures={measures}
        rigiSectors={rigiSectors}
        customTaxes={customTaxes}
        rigiPending={rigiPending}
        onApproveRigiProject={handleApproveRigiProject}
        onRejectRigiProject={handleRejectRigiProject}
        onApproveAllRigiProjects={handleApproveAllRigiProjects}
        onNavigate={setActiveSection}
        onDispatch={(action) => setState((prev) => applyPolicyAction(prev, action))}
        onAdvanceTurn={handleAdvanceGovernmentTurn}
        onReinforceMinister={(id) =>
          setMinisters((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, performance: Math.min(100, m.performance + 8), loyalty: Math.min(100, m.loyalty + 5) } : m
            )
          )
        }
        onReplaceMinister={(id) =>
          setMinisters((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, ministerName: `${m.ministerName} (Recambio)`, performance: 62, risk: 12 } : m
            )
          )
        }
        onAppointMinister={(id, newMinister) =>
          setMinisters((prev) =>
            prev.map((m) => (m.id === id ? newMinister : m))
          )
        }
        onChangeLever={(id, level) => {
          setLevers((prev) => prev.map((lv) => (lv.id === id ? { ...lv, level } : lv)));
          applyLeverToMacroEngine(id, level, (action) => setState((prev) => applyPolicyAction(prev, action)));
        }}
        onToggleMeasure={(id) =>
          setMeasures((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))
        }
        onAddCustomTax={(tax) => setCustomTaxes((prev) => [tax, ...prev])}
        onToggleRigi={(id) =>
          setRigiSectors((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabledByDecree: !r.enabledByDecree } : r))
          )
        }
      />
    </GameSidebarLayout>
  );
}
