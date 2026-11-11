import React, { useMemo, useState } from 'react';
import {
  advanceSimulationMonth,
  applyPolicyAction,
  type DifficultyLevel,
  type PlayableRole,
  type PolicyAction,
  type SimulationState
} from '@argentina-sim/domain';
import {
  CompressedSaveRepository,
  createInitialSimulationState2027
} from '@argentina-sim/infrastructure';
import { TopBarHoi4 } from '@/features/top-bar/TopBarHoi4';
import { MacroAndBankingView } from '@/features/dashboard-economico/MacroAndBankingView';
import { EnergyAndLaborView } from '@/features/energia-y-trabajo/EnergyAndLaborView';
import { JudicialAndProvincesView } from '@/features/justicia-y-provincias/JudicialAndProvincesView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Separamos el despachador de pestañas en un mapa de componentes para no meter
// cuatro ternarios pegados adentro de App y mantener CC <= 5.

type ActiveTab = 'MACRO_BCRA' | 'ENERGIA_TRABAJO' | 'JUSTICIA_PROVINCIAS';

interface TabContentProps {
  activeTab: ActiveTab;
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

function ActiveTabPanel({ activeTab, state, onDispatch }: TabContentProps) {
  if (activeTab === 'ENERGIA_TRABAJO') {
    return <EnergyAndLaborView state={state} onDispatch={onDispatch} />;
  }
  if (activeTab === 'JUSTICIA_PROVINCIAS') {
    return <JudicialAndProvincesView state={state} onDispatch={onDispatch} />;
  }
  return <MacroAndBankingView state={state} onDispatch={onDispatch} />;
}

function PortableCodeBanner({ code }: { code: string }) {
  if (!code) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Código Portable Comprimido (Zlib Base64URL · Cero Error 500 de JSON)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <textarea
          readOnly
          value={code}
          rows={2}
          className="w-full rounded bg-slate-950 p-2 font-mono text-[11px] text-sky-300 border border-slate-800"
        />
      </CardContent>
    </Card>
  );
}

const TAB_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'MACRO_BCRA', label: '1. Macro, BCRA, Bancos Privados y Deuda' },
  { id: 'ENERGIA_TRABAJO', label: '2. Energía (CAMMESA/YPF) y Paritarias' },
  { id: 'JUSTICIA_PROVINCIAS', label: '3. Corte Suprema, Comodoro Py y 24 Provincias' }
];

export function App() {
  const saveRepo = useMemo(() => new CompressedSaveRepository(), []);
  const [state, setState] = useState(() =>
    createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'PBA')
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('MACRO_BCRA');
  const [portableCode, setPortableCode] = useState<string>('');

  function handleDispatch(action: PolicyAction) {
    setState((prev) => applyPolicyAction(prev, action));
  }

  function handleAdvanceMonth() {
    setState((prev) => advanceSimulationMonth(prev));
  }

  function handleResetScenario(role: PlayableRole, difficulty: DifficultyLevel, provinceId: string) {
    setState(createInitialSimulationState2027(role, difficulty, provinceId));
  }

  function handleExportCode() {
    setPortableCode(saveRepo.exportPortableCode(state));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopBarHoi4
        state={state}
        onAdvanceMonth={handleAdvanceMonth}
        onResetScenario={handleResetScenario}
        onExportCode={handleExportCode}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap gap-2">
            {TAB_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <PortableCodeBanner code={portableCode} />
        <ActiveTabPanel activeTab={activeTab} state={state} onDispatch={handleDispatch} />

        <Card>
          <CardHeader>
            <CardTitle>Teletipo de Eventos y Reacciones del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs font-mono text-slate-300">
            {state.eventLog.slice(0, 5).map((entry, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-1">
                • {entry}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
