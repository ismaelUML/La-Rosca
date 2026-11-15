import React, { useEffect, useMemo, useState } from 'react';
import {
  advanceCampaignMonth,
  advanceGovernmentMonth,
  advanceSimulationMonth,
  applyCampaignBridgeToGovernment,
  applyGovernmentEventChoice,
  applyPolicyAction,
  applySetupConfigurationToState,
  getGovernmentRuntime,
  executeCampaignAction,
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
  INITIAL_VACANT_CABINET_2027,
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
import { GovernmentOverlays } from './features/game-shell/GovernmentOverlays.js';
import {
  ElectionNightModal,
  type ElectionStageType,
  computeEscrutinio
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
import { playUiSound, reportSaveFailure } from './lib/gameFeedback.js';

function tryExportStateWithRepo(
  repo: CompressedSaveRepository,
  payload: PersistedGameSession,
  state: SimulationState
): { code: string | null; error: string | null } {
  try {
    const ok = saveSessionToStorage(payload);
    if (!ok) {
      return { code: null, error: reportSaveFailure('storage', new Error('localStorage unavailable')) };
    }
    return { code: repo.exportPortableCode(state), error: null };
  } catch (err) {
    return { code: null, error: reportSaveFailure('export', err) };
  }
}

function tryImportStateWithRepo(
  repo: CompressedSaveRepository,
  code: string
): { state: SimulationState | null; error: string | null } {
  try {
    return { state: repo.importPortableCode(code), error: null };
  } catch (err) {
    playUiSound('error');
    return { state: null, error: reportSaveFailure('import', err) };
  }
}

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
  difficulty: 'ESTANDAR_2027',
  startMode: 'CAMPAIGN',
  characterArchetype: 'ECONOMISTA_ORTODOXO',
  congressScenario: 'ESTANDAR_2027'
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
    POBLACION: <CampaignDemografiaPaisView key="POBLACION" initialTab="POBLACION" campaignState={state} />,
    INMIGRACION: <CampaignDemografiaPaisView key="INMIGRACION" initialTab="INMIGRACION" campaignState={state} />,
    EMIGRACION: <CampaignDemografiaPaisView key="EMIGRACION" initialTab="EMIGRACION" campaignState={state} />,
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
  saveError?: string | null;
  onRetrySave?: () => void;
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
        onDispatch={props.onDispatch}
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
        playerCandidateId={props.setup.selectedPoliticianId}
        playerCandidateName={props.campaignState.candidateName || props.setup.characterName}
      />
    ),
    REGISTRO: <RegistroHistoryView historyLog={props.state.eventLog} />,
    INDICADORES: (
      <IndicatorsDashboardView
        state={props.state}
        saveError={props.saveError}
        onRetrySave={props.onRetrySave}
      />
    ),
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

function getCabinetAndMeasures(state: SimulationState) {
  return {
    ministers: state.ministers ?? INITIAL_VACANT_CABINET_2027,
    measures: state.measures ?? INITIAL_SECTOR_MEASURES
  };
}

function getDomainCollections(state: SimulationState) {
  return {
    ...getCabinetAndMeasures(state),
    rigiSectors: state.rigiSectors ?? INITIAL_RIGI_SECTORS,
    rigiPending: state.rigiPending ?? [],
    customTaxes: state.customTaxes ?? []
  };
}

function buildSessionPayload(
  screenMode: ScreenMode,
  setup: GameSetupConfiguration,
  campaignState: CampaignSimulationState,
  campaignNavSection: CampaignNavSection,
  governmentState: SimulationState,
  activeSection: InGameSidebarSection,
  levers: EconomicLeverItem[]
): PersistedGameSession {
  const cols = getDomainCollections(governmentState);
  return {
    version: 1,
    savedAtIso: new Date().toISOString(),
    screenMode,
    setup,
    campaignState,
    campaignNavSection,
    governmentState,
    activeSection,
    levers,
    ...cols
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

const STAGE_BY_MONTH: Record<number, ElectionStageType> = {
  4: 'INTERNA',
  8: 'PASO',
  10: 'GENERALES',
  11: 'BALOTAJE'
};

function resolveElectionStageForMonth(monthIndex: number): ElectionStageType | null {
  return STAGE_BY_MONTH[monthIndex] ?? null;
}

function applyInternaVictoryBoost(state: CampaignSimulationState): CampaignSimulationState {
  return {
    ...state,
    isCandidacyConfirmed: true,
    votingIntention: {
      ...state.votingIntention,
      intencionVotoGeneral: Number(
        Math.min(58, state.votingIntention.intencionVotoGeneral + 3.5).toFixed(1)
      )
    },
    attributes: {
      ...state.attributes,
      apoyoPartidario: Math.min(100, state.attributes.apoyoPartidario + 8)
    },
    historyLog: [
      `Mes ${state.stage.currentMonthIndex}: Consagraste tu fórmula en la Interna Partidaria (+3,5% voto general · +8 Apoyo Partidario).`,
      ...state.historyLog
    ]
  };
}

function applyInternaSplitPenalty(state: CampaignSimulationState): CampaignSimulationState {
  return {
    ...state,
    electionDefeated: false,
    isCandidacyConfirmed: true,
    budgetArgentums: Math.max(5, state.budgetArgentums - 15),
    attributes: {
      ...state.attributes,
      apoyoPartidario: Math.max(10, state.attributes.apoyoPartidario - 15)
    },
    historyLog: [
      `Mes ${state.stage.currentMonthIndex}: Rompiste el sello tras caer en la interna y competís con Boleta Corta (-15 Apoyo Partidario · -15 ¥).`,
      ...state.historyLog
    ]
  };
}

function checkElectionTransitionToGovernment(
  stage: ElectionStageType,
  isVictory: boolean,
  isRunoff: boolean
): boolean {
  if (!isVictory) return false;
  if (stage === 'BALOTAJE') return true;
  return stage === 'GENERALES' && !isRunoff;
}

function resolveInitialRigiSectors(saved?: SimulationState['rigiSectors']): NonNullable<SimulationState['rigiSectors']> {
  if (saved && saved.length === 29 && saved.filter((r) => r.enabledByDecree).length < 29) {
    return saved;
  }
  return INITIAL_RIGI_SECTORS;
}

function pickFirstDefined<T>(a: T | undefined, b: T | undefined, fallback: T): T {
  if (a !== undefined) return a;
  if (b !== undefined) return b;
  return fallback;
}

function hydrateInitialGovernmentState(savedSession: PersistedGameSession | null): SimulationState {
  const base =
    savedSession?.governmentState ??
    createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
  return {
    ...base,
    ministers: pickFirstDefined(base.ministers, savedSession?.ministers, INITIAL_VACANT_CABINET_2027),
    measures: pickFirstDefined(base.measures, savedSession?.measures, INITIAL_SECTOR_MEASURES),
    rigiSectors: resolveInitialRigiSectors(pickFirstDefined(base.rigiSectors, savedSession?.rigiSectors, INITIAL_RIGI_SECTORS)),
    rigiPending: pickFirstDefined(base.rigiPending, savedSession?.rigiPending, []),
    customTaxes: pickFirstDefined(base.customTaxes, savedSession?.customTaxes, [])
  };
}

function resolveInitialGovSection(role: GameSetupConfiguration['role']): InGameSidebarSection {
  return role === 'PRESIDENTE' ? 'GABINETE' : 'DESPACHO_RESUMEN';
}

function resolveGovStageEntry(
  currentState: CampaignSimulationState,
  next: CampaignSimulationState
): { shouldAssume: boolean; modalStage: ElectionStageType | null; nextState: CampaignSimulationState } {
  const finalCheck = computeEscrutinio('BALOTAJE', currentState);
  if (!finalCheck.isVictory) {
    return {
      shouldAssume: false,
      modalStage: 'BALOTAJE',
      nextState: { ...currentState, electionDefeated: true }
    };
  }
  return { shouldAssume: true, modalStage: null, nextState: next };
}

function buildSteppedCampaignState(next: CampaignSimulationState): {
  modalStage: ElectionStageType | null;
  nextState: CampaignSimulationState;
} {
  const dilemma = resolveMonthlyDilemma(next.stage.currentMonthIndex, next.resolvedDilemmas);
  const electionStage = resolveElectionStageForMonth(next.stage.currentMonthIndex);
  const isDefeat = electionStage ? computeEscrutinio(electionStage, next).isDefeat : false;
  return {
    modalStage: electionStage,
    nextState: {
      ...next,
      activeMonthlyDilemmaId: dilemma ? dilemma.id : null,
      electionDefeated: isDefeat ? true : next.electionDefeated
    }
  };
}

function evaluateCampaignAdvanceStep(currentState: CampaignSimulationState): {
  shouldAssume: boolean;
  modalStage: ElectionStageType | null;
  nextState: CampaignSimulationState;
} {
  if (currentState.electionDefeated) {
    return { shouldAssume: false, modalStage: 'BALOTAJE', nextState: currentState };
  }
  const next = advanceCampaignMonth(currentState);
  if (next.stage.stage === 'GOBIERNO') {
    return resolveGovStageEntry(currentState, next);
  }
  const stepped = buildSteppedCampaignState(next);
  return { shouldAssume: false, ...stepped };
}

function attachDefaultGovCollections(base: SimulationState): SimulationState {
  return {
    ...base,
    ministers: INITIAL_VACANT_CABINET_2027,
    measures: INITIAL_SECTOR_MEASURES,
    rigiSectors: INITIAL_RIGI_SECTORS,
    rigiPending: [],
    customTaxes: []
  };
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

  const [state, setState] = useState<SimulationState>(() => hydrateInitialGovernmentState(savedSession));
  const [activeSection, setActiveSection] = useState<InGameSidebarSection>(() => {
    return (savedSession?.activeSection as InGameSidebarSection) ?? 'INDICADORES';
  });
  const [portableSaveBanner, setPortableSaveBanner] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [levers, setLevers] = useState<EconomicLeverItem[]>(() => {
    return savedSession?.levers ?? INITIAL_ECONOMIC_LEVERS;
  });

  const { ministers, measures, rigiSectors, customTaxes, rigiPending } = getDomainCollections(state);

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
        levers
      )
    );
  }, [
    screenMode,
    setup,
    campaignState,
    campaignNavSection,
    state,
    activeSection,
    levers,
    savedSession
  ]);

  const startPresidentialGovernment = () => {
    const baseGov = createInitialSimulationState2027(setup.role, setup.difficulty, setup.provinceId);
    const bridged = attachDefaultGovCollections(applyCampaignBridgeToGovernment(baseGov, campaignState));
    setState(applySetupConfigurationToState(bridged, setup));
    setActiveSection(resolveInitialGovSection(setup.role));
    setScreenMode('GOVERNMENT');
  };

  const handleRetryCampaign = () => {
    const candidateObj = resolveCandidateFromSetup(setup);
    setCampaignState(
      createInitialCampaignState(candidateObj, setup.party, setup.role, setup.provinceId)
    );
    setActiveElectionModal(null);
    setCampaignNavSection('RESUMEN');
    setScreenMode('CAMPAIGN');
  };

  const handleStartConfiguredGame = (nextSetup: GameSetupConfiguration) => {
    setSetup(nextSetup);
    const candidateObj = resolveCandidateFromSetup(nextSetup);
    const baseGov = attachDefaultGovCollections(
      createInitialSimulationState2027(nextSetup.role, nextSetup.difficulty, nextSetup.provinceId)
    );
    const configuredGov = applySetupConfigurationToState(baseGov, nextSetup);

    setState(configuredGov);
    setActiveSection(resolveInitialGovSection(nextSetup.role));
    setCampaignState(
      createInitialCampaignState(
        candidateObj,
        nextSetup.party,
        nextSetup.role,
        nextSetup.provinceId
      )
    );
    setCampaignNavSection('RESUMEN');
    setScreenMode(nextSetup.startMode === 'DIRECT_GOVERNMENT' ? 'GOVERNMENT' : 'CAMPAIGN');
  };

  const handleAdvanceCampaign = () => {
    const step = evaluateCampaignAdvanceStep(campaignState);
    if (step.shouldAssume) {
      startPresidentialGovernment();
      return;
    }
    if (step.modalStage) {
      setActiveElectionModal(step.modalStage);
    }
    setCampaignState(step.nextState);
  };

  const handleBreakPartySplit = () => {
    setCampaignState((prev) => applyInternaSplitPenalty(prev));
    setActiveElectionModal(null);
  };

  const handleProceedElection = () => {
    if (!activeElectionModal) {
      return;
    }
    const escrutinio = computeEscrutinio(activeElectionModal, campaignState);
    if (escrutinio.isDefeat) {
      handleRetryCampaign();
      return;
    }
    if (activeElectionModal === 'INTERNA') {
      setCampaignState((prev) => applyInternaVictoryBoost(prev));
      setActiveElectionModal(null);
      return;
    }
    if (checkElectionTransitionToGovernment(activeElectionModal, escrutinio.isVictory, escrutinio.isRunoff)) {
      startPresidentialGovernment();
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
    const payload = buildSessionPayload(
      screenMode,
      setup,
      campaignState,
      campaignNavSection,
      state,
      activeSection,
      levers
    );
    const result = tryExportStateWithRepo(saveRepo, payload, state);
    setSaveError(result.error);
    if (result.code) {
      setPortableSaveBanner(result.code);
    }
  };

  const handleContinueGame = () => {
    const nextMode = resolveContinueScreenMode(
      savedSession,
      state.turnMonth,
      campaignState.stage.stage
    );
    setScreenMode(nextMode);
  };

  const handleImportPortableCode = (code: string): boolean => {
    const result = tryImportStateWithRepo(saveRepo, code);
    setImportError(result.error);
    if (!result.state) {
      return false;
    }
    setState(result.state);
    setScreenMode('GOVERNMENT');
    setActiveSection('INDICADORES');
    return true;
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
        importError={importError}
        onStartNewGame={() => setScreenMode('NEW_GAME_SETUP')}
        onContinueGame={handleContinueGame}
        onImportPortableCode={handleImportPortableCode}
        onClearImportError={() => setImportError(null)}
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
        saveError={saveError}
        onSelectSection={setCampaignNavSection}
        onAdvanceMonth={handleAdvanceCampaign}
        onSkipToGovernment={startPresidentialGovernment}
        onExportSaveCode={handleExportSaveCode}
        onRetrySave={handleExportSaveCode}
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
          onRetryCampaign={handleRetryCampaign}
          onBreakPartySplit={handleBreakPartySplit}
          onNewGameSetup={() => {
            setActiveElectionModal(null);
            setScreenMode('NEW_GAME_SETUP');
          }}
        />
      </CampaignSidebarLayout>
    );
  }

  const dispatchAction = (action: PolicyAction) => {
    setState((prev) => applyPolicyAction(prev, action));
  };

  const handleChooseGovernmentEvent = (optionId: string) => {
    setState((prev) => applyGovernmentEventChoice(prev, optionId));
  };

  const handleAdvanceGovernmentTurn = () => {
    const gov = getGovernmentRuntime(state);
    if (gov.pendingEventId !== null || gov.mandateStatus !== 'EN_CURSO') {
      return;
    }
    setState((prev) => advanceGovernmentMonth(prev));
  };

  return (
    <GameSidebarLayout
      setup={setup}
      state={state}
      activeSection={activeSection}
      portableSaveBanner={portableSaveBanner}
      saveError={saveError}
      onSelectSection={setActiveSection}
      onAdvanceTurn={handleAdvanceGovernmentTurn}
      onExportSaveCode={handleExportSaveCode}
      onRetrySave={handleExportSaveCode}
      onCloseSaveBanner={() => setPortableSaveBanner(null)}
      onExitToMenu={() => setScreenMode('LANDING')}
      onSendAtn={(provinceId) => dispatchAction({ type: 'SEND_ATN_TO_PROVINCE', provinceId, amountPctGdp: 0.08 })}
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
        saveError={saveError}
        onRetrySave={handleExportSaveCode}
        onApproveRigiProject={(projectId) => dispatchAction({ type: 'APPROVE_RIGI_PROJECT', projectId })}
        onRejectRigiProject={(projectId) => dispatchAction({ type: 'REJECT_RIGI_PROJECT', projectId })}
        onApproveAllRigiProjects={() => dispatchAction({ type: 'APPROVE_ALL_RIGI_PROJECTS' })}
        onNavigate={setActiveSection}
        onDispatch={dispatchAction}
        onAdvanceTurn={handleAdvanceGovernmentTurn}
        onReinforceMinister={(ministerId) => dispatchAction({ type: 'REINFORCE_MINISTER', ministerId })}
        onReplaceMinister={(ministerId) => dispatchAction({ type: 'REPLACE_MINISTER', ministerId })}
        onAppointMinister={(ministerId, minister) => dispatchAction({ type: 'APPOINT_MINISTER', ministerId, minister })}
        onChangeLever={(id, level) => {
          setLevers((prev) => prev.map((lv) => (lv.id === id ? { ...lv, level } : lv)));
          applyLeverToMacroEngine(id, level, dispatchAction);
        }}
        onToggleMeasure={(measureId) => dispatchAction({ type: 'TOGGLE_MEASURE', measureId })}
        onAddCustomTax={(proposal) => dispatchAction({ type: 'ADD_CUSTOM_TAX', proposal })}
        onToggleRigi={(sectorId) => dispatchAction({ type: 'TOGGLE_RIGI_SECTOR', sectorId })}
      />
      <GovernmentOverlays
        state={state}
        monthLabel={`Mes ${state.turnMonth}`}
        onChooseEventOption={handleChooseGovernmentEvent}
        onExitToMenu={() => setScreenMode('LANDING')}
      />
    </GameSidebarLayout>
  );
}
