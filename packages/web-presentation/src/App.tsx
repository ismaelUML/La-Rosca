import React, { useMemo, useState } from 'react';
import {
  advanceSimulationMonth,
  applyPolicyAction,
  type CabinetMinister,
  type CustomTaxProposal,
  type EconomicLeverItem,
  type GameSetupConfiguration,
  type PolicyAction,
  type RigisectorItem,
  type SectorMeasureCard,
  type SimulationState
} from '@argentina-sim/domain';
import {
  CompressedSaveRepository,
  createInitialSimulationState2027,
  INITIAL_CABINET_2027,
  INITIAL_ECONOMIC_LEVERS,
  INITIAL_RIGI_SECTORS,
  INITIAL_SECTOR_MEASURES,
  POLITICAL_PARTIES_2027
} from '@argentina-sim/infrastructure';
import { LandingScreen } from './features/party-setup/LandingScreen.js';
import { NewGameSetupScreen } from './features/party-setup/NewGameSetupScreen.js';
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

// Flujo completo del juego:
// 1) LandingScreen (captura 2) -> 2) NewGameSetupScreen (capturas 3, 4, 5 y 6) -> 3) GameSidebarLayout (captura 1).
// Usamos un mapa declarativo de vistas para mantener CC <= 5 en cada funcion.

type ScreenMode = 'LANDING' | 'NEW_GAME_SETUP' | 'IN_GAME';

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

interface ActiveSectionRendererProps {
  section: InGameSidebarSection;
  setup: GameSetupConfiguration;
  state: SimulationState;
  ministers: CabinetMinister[];
  levers: EconomicLeverItem[];
  measures: SectorMeasureCard[];
  rigiSectors: RigisectorItem[];
  customTaxes: CustomTaxProposal[];
  onNavigate: (sec: InGameSidebarSection) => void;
  onDispatch: (action: PolicyAction) => void;
  onAdvanceTurn: () => void;
  onReinforceMinister: (id: string) => void;
  onReplaceMinister: (id: string) => void;
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
      />
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

export function App() {
  const saveRepo = useMemo(() => new CompressedSaveRepository(), []);
  const [screenMode, setScreenMode] = useState<ScreenMode>('LANDING');
  const [setup, setSetup] = useState<GameSetupConfiguration>(DEFAULT_SETUP);
  const [state, setState] = useState<SimulationState>(() =>
    createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA')
  );
  const [activeSection, setActiveSection] = useState<InGameSidebarSection>('INDICADORES');
  const [portableSaveBanner, setPortableSaveBanner] = useState<string | null>(null);

  const [ministers, setMinisters] = useState<CabinetMinister[]>(INITIAL_CABINET_2027);
  const [levers, setLevers] = useState<EconomicLeverItem[]>(INITIAL_ECONOMIC_LEVERS);
  const [measures, setMeasures] = useState<SectorMeasureCard[]>(INITIAL_SECTOR_MEASURES);
  const [rigiSectors, setRigiSectors] = useState<RigisectorItem[]>(INITIAL_RIGI_SECTORS);
  const [customTaxes, setCustomTaxes] = useState<CustomTaxProposal[]>([]);

  const handleDispatch = (action: PolicyAction) => {
    setState((prev) => applyPolicyAction(prev, action));
  };

  const handleStartConfiguredGame = (nextSetup: GameSetupConfiguration) => {
    setSetup(nextSetup);
    setState(
      createInitialSimulationState2027(
        nextSetup.role,
        nextSetup.difficulty,
        nextSetup.provinceId
      )
    );
    setActiveSection('INDICADORES');
    setScreenMode('IN_GAME');
  };

  const handleImportPortableCode = (code: string) => {
    const loaded = saveRepo.importPortableCode(code);
    setState(loaded);
    setScreenMode('IN_GAME');
  };

  if (screenMode === 'LANDING') {
    return (
      <LandingScreen
        hasSavedSession={state.turnMonth > 1}
        onStartNewGame={() => setScreenMode('NEW_GAME_SETUP')}
        onContinueGame={() => setScreenMode('IN_GAME')}
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

  return (
    <GameSidebarLayout
      setup={setup}
      state={state}
      activeSection={activeSection}
      portableSaveBanner={portableSaveBanner}
      onSelectSection={setActiveSection}
      onAdvanceTurn={() => setState((prev) => advanceSimulationMonth(prev))}
      onExportSaveCode={() => setPortableSaveBanner(saveRepo.exportPortableCode(state))}
      onCloseSaveBanner={() => setPortableSaveBanner(null)}
      onExitToMenu={() => setScreenMode('LANDING')}
    >
      <ActiveSectionRenderer
        section={activeSection}
        setup={setup}
        state={state}
        ministers={ministers}
        levers={levers}
        measures={measures}
        rigiSectors={rigiSectors}
        customTaxes={customTaxes}
        onNavigate={setActiveSection}
        onDispatch={handleDispatch}
        onAdvanceTurn={() => setState((prev) => advanceSimulationMonth(prev))}
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
              m.id === id ? { ...m, ministerName: `${m.ministerName} (Recambio Técnico)`, performance: 62, risk: 12 } : m
            )
          )
        }
        onChangeLever={(id, level) => {
          setLevers((prev) => prev.map((lv) => (lv.id === id ? { ...lv, level } : lv)));
          applyLeverToMacroEngine(id, level, handleDispatch);
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
