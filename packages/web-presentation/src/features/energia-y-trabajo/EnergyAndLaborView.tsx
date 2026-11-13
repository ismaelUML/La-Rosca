import React, { useState } from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionStripCard } from '@/features/game-shell/ActionStripCard';

// Aca se ven dos agujeros negros clave del pais: los subsidios a la luz/gas (CAMMESA)
// y la rueda de paritarias con los gremios. Todo explicado sin jerga innecesaria.

interface EnergyAndLaborViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

type EnergyLaborTab = 'energy' | 'labor';

function buildEnergyAlert(state: SimulationState): string {
  const { energy } = state;
  if (energy.blackoutRiskPct > 35) {
    return `Riesgo de apagón en el AMBA (${energy.blackoutRiskPct}%): si no entra inversión o baja el consumo, se corta la luz en verano.`;
  }
  if (energy.cammesaMonthlyDeficitMillionUsd > 350) {
    return `Subsidios carísimos (-${energy.cammesaMonthlyDeficitMillionUsd} M USD/mes): el Tesoro está quemando dólares para sostener boletas baratas.`;
  }
  if (energy.industrialGasCutActive) {
    return 'Las fábricas tienen el gas cortado: ahorrás importación de barcos LNG, pero cae la actividad industrial.';
  }
  return 'Sistema energético estable por ahora: vigilá el costo de la luz y el humor de los usuarios en las boletas.';
}

function buildLaborAlert(state: SimulationState): string {
  const { labor } = state;
  if (labor.activeNationalStrike) {
    return 'Paro general de la CGT en marcha: la actividad se frena hasta que destrabes las paritarias o bajes la tensión gremial.';
  }
  const hotUnions = labor.paritarias.filter((p) => p.strikeConflictIndex >= 65).length;
  if (hotUnions > 0) {
    return `Tenés ${hotUnions} gremio(s) al borde del conflicto: pisar paritarias contiene precios pero dispara medidas de fuerza.`;
  }
  return 'Frente gremial sin paros activos: equilibrá el salario real con la competitividad de las empresas.';
}

function EnergyMixHeader({ state }: { state: SimulationState }) {
  const { energy } = state;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-slate-950/90 p-2.5 border border-slate-800 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Térmica (Gas)</span>
          <span className="font-bold text-amber-300 font-mono">{energy.thermalSharePct}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Hidroeléctrica</span>
          <span className="font-bold text-sky-300 font-mono">{energy.hydroSharePct}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Nuclear</span>
          <span className="font-bold text-purple-300 font-mono">{energy.nuclearSharePct}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Renovable</span>
          <span className="font-bold text-emerald-300 font-mono">{energy.renewableSharePct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/70 border border-slate-800/80 px-3 py-2">
          <span className="text-slate-400">Subsidio mensual del Tesoro</span>
          <span className="font-mono font-bold text-rose-400">-{energy.cammesaMonthlyDeficitMillionUsd} M USD/mes</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/70 border border-slate-800/80 px-3 py-2">
          <span className="text-slate-400">Costo generar energía</span>
          <span className="font-mono font-bold text-slate-200">{energy.generationCostUsdPerMwh} USD/MWh</span>
        </div>
      </div>
    </div>
  );
}

function buildTariffCopy(isSubsidized: boolean) {
  if (isSubsidized) {
    return {
      tradeoff: 'Hoy están subsidiadas: cuidan el bolsillo, pero le cuestan caro al Tesoro.',
      label: 'Quitar subsidios',
      sublabel: 'Llevar a 92%',
      variant: 'primary' as const,
      coveragePct: 92
    };
  }
  return {
    tradeoff: 'Tarifas casi plenas: ahorrás déficit fiscal, pero sube la inflación y cae tu imagen.',
    label: 'Congelar (45%)',
    sublabel: 'Aliviar boleta',
    variant: 'pending' as const,
    coveragePct: 45
  };
}

function EnergyTariffStrip({ state, onDispatch }: EnergyAndLaborViewProps) {
  const { energy } = state;
  const copy = buildTariffCopy(energy.userTariffCoveragePct < 70);
  const urgentLabel = energy.cammesaMonthlyDeficitMillionUsd > 350 ? 'Gasto alto' : undefined;

  return (
    <ActionStripCard
      icon="MEM"
      iconTileClass="bg-[#231b10] text-amber-300"
      urgentLabel={urgentLabel}
      urgentClass="bg-rose-700 text-white"
      title={`Tarifas eléctricas y gas · Cobertura ${energy.userTariffCoveragePct}%`}
      subtitle={`Subsidio Tesoro: -${energy.cammesaMonthlyDeficitMillionUsd} M USD/mes · Generación: ${energy.generationCostUsdPerMwh} USD/MWh`}
      tradeoff={copy.tradeoff}
      rightAction={{
        label: copy.label,
        sublabel: copy.sublabel,
        variant: copy.variant,
        onClick: () => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: copy.coveragePct })
      }}
    />
  );
}

function buildYpfCopy(isCriollo: boolean) {
  if (isCriollo) {
    return {
      policyLabel: 'Barril Criollo',
      tradeoff: 'Barril Criollo: nafta más barata para frenar inflación, pero menos inversión en Vaca Muerta.',
      label: 'Liberar surtidor',
      sublabel: 'Export Parity',
      variant: 'pending' as const,
      nextPolicy: 'EXPORT_PARITY' as const
    };
  }
  return {
    policyLabel: 'Precio Internacional',
    tradeoff: 'Export Parity: precio internacional, entran dólares e inversión pero sube el transporte.',
    label: 'Barril Criollo',
    sublabel: 'Tope local',
    variant: 'done' as const,
    nextPolicy: 'BARRIL_CRIOLLO' as const
  };
}

function YpfPolicyStrip({ state, onDispatch }: EnergyAndLaborViewProps) {
  const copy = buildYpfCopy(state.energy.ypfPolicy === 'BARRIL_CRIOLLO');

  return (
    <ActionStripCard
      icon="YPF"
      iconTileClass="bg-[#121c2b] text-sky-300"
      title={`Surtidores YPF · ${copy.policyLabel}`}
      subtitle="Régimen de precios de nafta y gasoil."
      tradeoff={copy.tradeoff}
      rightAction={{
        label: copy.label,
        sublabel: copy.sublabel,
        variant: copy.variant,
        onClick: () => onDispatch({ type: 'SET_YPF_POLICY', policy: copy.nextPolicy })
      }}
    />
  );
}

function buildGasCutCopy(cut: boolean) {
  if (cut) {
    return {
      urgentLabel: 'Corte activo',
      subtitle: 'Corte preventivo activo para ahorrar barcos importados de GNL.',
      label: 'Restituir gas',
      sublabel: 'Volver normal',
      variant: 'done' as const
    };
  }
  return {
    urgentLabel: undefined,
    subtitle: 'Suministro normal para fábricas y estaciones de GNC.',
    label: 'Cortar gas',
    sublabel: 'Ahorrar LNG',
    variant: 'danger' as const
  };
}

function IndustrialGasStrip({ state, onDispatch }: EnergyAndLaborViewProps) {
  const cut = state.energy.industrialGasCutActive;
  const copy = buildGasCutCopy(cut);

  return (
    <ActionStripCard
      icon="GAS"
      iconTileClass="bg-[#2a1318] text-rose-300"
      urgentLabel={copy.urgentLabel}
      urgentClass="bg-amber-600 text-white"
      title="Suministro de gas a industrias y GNC"
      subtitle={copy.subtitle}
      tradeoff="Cortar el gas ahorra dólares rápido, pero frena fábricas y cae el PBI industrial."
      rightAction={{
        label: copy.label,
        sublabel: copy.sublabel,
        variant: copy.variant,
        onClick: () => onDispatch({ type: 'TOGGLE_INDUSTRIAL_GAS_CUT', cutActive: !cut })
      }}
    />
  );
}

function EnergyTabContent({ state, onDispatch }: EnergyAndLaborViewProps) {
  return (
    <div className="space-y-3">
      <EnergyMixHeader state={state} />

      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-1">
        Decisiones de Energía y Tarifas
      </div>

      <EnergyTariffStrip state={state} onDispatch={onDispatch} />
      <YpfPolicyStrip state={state} onDispatch={onDispatch} />
      <IndustrialGasStrip state={state} onDispatch={onDispatch} />

      <div className="rounded-sm border border-[#263142] bg-[#0b1018] px-3.5 py-2.5 text-xs">
        <span className="font-mono font-bold uppercase text-amber-400 mr-1.5">ESTADO:</span>
        <span className="text-slate-300">{buildEnergyAlert(state)}</span>
      </div>
    </div>
  );
}

function LaborStatsStrip({ state }: { state: SimulationState }) {
  const { labor } = state;
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/90 p-2.5 border border-slate-800 text-xs">
      <div>
        <span className="text-slate-400 block text-[11px]">Salario real</span>
        <span className="font-bold text-slate-100 font-mono">{labor.realWageIndex} pts</span>
      </div>
      <div>
        <span className="text-slate-400 block text-[11px]">Desempleo</span>
        <span className="font-bold text-amber-300 font-mono">{labor.unemploymentPct}%</span>
      </div>
      <div>
        <span className="text-slate-400 block text-[11px]">Juicios laborales</span>
        <span className="font-bold text-rose-300 font-mono">{labor.laborLitigationMultiplier}x</span>
      </div>
    </div>
  );
}

function resolveParitariaBadge(strikeConflictIndex: number) {
  if (strikeConflictIndex >= 60) {
    return { icon: 'ALT', iconTileClass: 'bg-[#2a1318] text-rose-300', urgentLabel: 'Tensión alta' };
  }
  return { icon: 'CGT', iconTileClass: 'bg-[#102219] text-emerald-300', urgentLabel: undefined };
}

function resolveParitariaAction(homologatedByState: boolean) {
  if (homologatedByState) {
    return { actionLabel: 'Homologada', actionSublabel: 'Aprobar techo', variant: 'done' as const };
  }
  return { actionLabel: 'Pisada', actionSublabel: 'Liberar', variant: 'danger' as const };
}

function ParitariaStripRow({
  paritaria,
  onToggle
}: {
  paritaria: SimulationState['labor']['paritarias'][number];
  onToggle: (paritariaId: string) => void;
}) {
  const badge = resolveParitariaBadge(paritaria.strikeConflictIndex);
  const action = resolveParitariaAction(paritaria.homologatedByState);

  return (
    <ActionStripCard
      icon={badge.icon}
      iconTileClass={badge.iconTileClass}
      urgentLabel={badge.urgentLabel}
      urgentClass="bg-rose-600 text-white"
      title={`${paritaria.sectorName} · ${paritaria.unionName}`}
      subtitle={`Pauta: +${paritaria.agreedMonthlyIncreasePct}%/mes · Costo USD: ${paritaria.unitLaborCostUsdIndex} · Conflicto: ${paritaria.strikeConflictIndex}%`}
      rightAction={{
        label: action.actionLabel,
        sublabel: action.actionSublabel,
        variant: action.variant,
        onClick: () => onToggle(paritaria.id)
      }}
    />
  );
}

function LaborTabContent({ state, onDispatch }: EnergyAndLaborViewProps) {
  const { labor } = state;
  const handleToggle = (paritariaId: string) =>
    onDispatch({ type: 'TOGGLE_PARITARIA_HOMOLOGATION', paritariaId });

  return (
    <div className="space-y-3">
      <LaborStatsStrip state={state} />

      <ActionStripCard
        icon="LAB"
        iconTileClass="bg-[#181c2b] text-indigo-300"
        title="Modernización Laboral y Fondo de Cese"
        subtitle="Reforma Ley 24.013 para bajar la industria del juicio y facilitar contrataciones."
        tradeoff="Reduce litigiosidad y anima a PyMEs a blanquear empleo, pero genera rechazo sindical."
        rightAction={{
          label: 'Impulsar ley',
          sublabel: 'Al Congreso',
          variant: 'primary',
          onClick: () => onDispatch({ type: 'EXECUTE_LABOR_REFORM' })
        }}
      />

      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-1">
        Paritarias por Gremio (Homologar o Poner Techo)
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {labor.paritarias.map((p) => (
          <ParitariaStripRow key={p.id} paritaria={p} onToggle={handleToggle} />
        ))}
      </div>

      <div className="rounded-sm border border-[#263142] bg-[#0b1018] px-3.5 py-2.5 text-xs">
        <span className="font-mono font-bold uppercase text-amber-400 mr-1.5">ESTADO:</span>
        <span className="text-slate-300">{buildLaborAlert(state)}</span>
      </div>
    </div>
  );
}

function EnergyLaborHeader({
  state,
  activeTab,
  onSelectTab
}: {
  state: SimulationState;
  activeTab: EnergyLaborTab;
  onSelectTab: (tab: EnergyLaborTab) => void;
}) {
  const strikeBadge = state.labor.activeNationalStrike
    ? 'PARO CGT'
    : `Informalidad: ${state.labor.informalityPct}%`;
  const tabClass = (tab: EnergyLaborTab) =>
    activeTab === tab
      ? 'bg-[#1a2b44] text-amber-100 border-b-2 border-amber-400'
      : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent';

  return (
    <CardHeader className="pb-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>Energía, Tarifas y Gremios</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant={state.energy.blackoutRiskPct > 35 ? 'danger' : 'success'}>
            Apagón AMBA: {state.energy.blackoutRiskPct}%
          </Badge>
          <Badge variant={state.labor.activeNationalStrike ? 'danger' : 'default'}>
            {strikeBadge}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-sm bg-[#0b1018] border border-[#283447]">
        <button
          type="button"
          onClick={() => onSelectTab('energy')}
          className={`py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${tabClass('energy')}`}
        >
          Energía y Tarifas
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('labor')}
          className={`py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${tabClass('labor')}`}
        >
          Paritarias y Empleo
        </button>
      </div>
    </CardHeader>
  );
}

export function EnergyAndLaborView({ state, onDispatch }: EnergyAndLaborViewProps) {
  const [activeTab, setActiveTab] = useState<EnergyLaborTab>('energy');

  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <EnergyLaborHeader state={state} activeTab={activeTab} onSelectTab={setActiveTab} />

      <CardContent>
        {activeTab === 'energy' ? (
          <EnergyTabContent state={state} onDispatch={onDispatch} />
        ) : (
          <LaborTabContent state={state} onDispatch={onDispatch} />
        )}
      </CardContent>
    </Card>
  );
}
