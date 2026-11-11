import React from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Aca se ven los dos agujeros negros que rompen los planes de estabilizacion:
// el deficit dolarizado de CAMMESA (luz/gas) y la rueda de las 8 paritarias sectoriales.

interface EnergyAndLaborViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

function EnergyAndCammesaCard({ state, onDispatch }: EnergyAndLaborViewProps) {
  const { energy } = state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matriz Eléctrica (MEM), Déficit de CAMMESA, Gasoductos e YPF</CardTitle>
          <Badge variant={energy.blackoutRiskPct > 35 ? 'danger' : 'success'}>
            Riesgo Apagón AMBA: {energy.blackoutRiskPct}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-center">
          <div>
            <span className="text-slate-400 block">Térmica</span>
            <span className="font-bold text-amber-300">{energy.thermalSharePct}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">Hidro</span>
            <span className="font-bold text-sky-300">{energy.hydroSharePct}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">Nuclear</span>
            <span className="font-bold text-purple-300">{energy.nuclearSharePct}%</span>
          </div>
          <div>
            <span className="text-slate-400 block">Renovable</span>
            <span className="font-bold text-emerald-300">{energy.renewableSharePct}%</span>
          </div>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span>Costo Monómico de Generación (MEM):</span>
            <span className="font-mono font-bold">{energy.generationCostUsdPerMwh} USD / MWh</span>
          </div>
          <div className="flex justify-between">
            <span>Cobertura Tarifaria Pagada por Usuarios (N1/N2/N3):</span>
            <span className="font-mono text-sky-300">{energy.userTariffCoveragePct} %</span>
          </div>
          <div className="flex justify-between">
            <span>Subsidio Fiscal Mensual del Tesoro a CAMMESA:</span>
            <span className="font-mono text-rose-400 font-bold">-{energy.cammesaMonthlyDeficitMillionUsd} M USD / mes</span>
          </div>
          <div className="flex justify-between">
            <span>Política de Surtidor YPF (Nafta y Gasoil):</span>
            <span className="font-mono text-amber-300">{energy.ypfPolicy}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <Button size="sm" variant="outline" onClick={() => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: 92 })}>
            Quitar Subsidios (Tarifazo 92%)
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: 45 })}>
            Congelar Boletas de Luz/Gas (45%)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onDispatch({
                type: 'SET_YPF_POLICY',
                policy: energy.ypfPolicy === 'BARRIL_CRIOLLO' ? 'EXPORT_PARITY' : 'BARRIL_CRIOLLO'
              })
            }
          >
            YPF: Cambiar a {energy.ypfPolicy === 'BARRIL_CRIOLLO' ? 'Export Parity' : 'Barril Criollo'}
          </Button>
          <Button
            size="sm"
            variant={energy.industrialGasCutActive ? 'default' : 'destructive'}
            onClick={() => onDispatch({ type: 'TOGGLE_INDUSTRIAL_GAS_CUT', cutActive: !energy.industrialGasCutActive })}
          >
            {energy.industrialGasCutActive ? 'Restituir Gas a Industrias' : 'Cortar Gas a Industrias/GNC (Ahorrar Barcos LNG)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LaborAndParitariasCard({ state, onDispatch }: EnergyAndLaborViewProps) {
  const { labor } = state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Paritarias por Convenio (Ley 14.250), CLU en USD e Industria del Juicio</CardTitle>
          <Badge variant={labor.activeNationalStrike ? 'danger' : 'default'}>
            {labor.activeNationalStrike ? 'PARO GENERAL CGT ACTIVO' : `Informalidad: ${labor.informalityPct}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div>
            <span className="text-slate-400 block">Salario Real (Base 100)</span>
            <span className="font-bold text-slate-100">{labor.realWageIndex} pts</span>
          </div>
          <div>
            <span className="text-slate-400 block">Desempleo Abierto</span>
            <span className="font-bold text-amber-300">{labor.unemploymentPct} %</span>
          </div>
          <div>
            <span className="text-slate-400 block">Mult. Litigiosidad</span>
            <span className="font-bold text-rose-300">{labor.laborLitigationMultiplier}x</span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {labor.paritarias.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/60 px-2.5 py-1.5">
              <div>
                <div className="font-medium text-slate-200">{p.sectorName} · {p.unionName}</div>
                <div className="text-[11px] text-slate-400">
                  Pauta: +{p.agreedMonthlyIncreasePct}%/mes · CLU USD: {p.unitLaborCostUsdIndex} · Tensión: {p.strikeConflictIndex}%
                </div>
              </div>
              <Button
                size="sm"
                variant={p.homologatedByState ? 'secondary' : 'destructive'}
                onClick={() => onDispatch({ type: 'TOGGLE_PARITARIA_HOMOLOGATION', paritariaId: p.id })}
              >
                {p.homologatedByState ? 'Homologada' : 'Pisada (Techo)'}
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-slate-400">Reforma Ley 24.013 + Fondo de Cese Laboral:</span>
          <Button size="sm" onClick={() => onDispatch({ type: 'EXECUTE_LABOR_REFORM' })}>
            Impulsar Modernización Laboral
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnergyAndLaborView({ state, onDispatch }: EnergyAndLaborViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <EnergyAndCammesaCard state={state} onDispatch={onDispatch} />
      <LaborAndParitariasCard state={state} onDispatch={onDispatch} />
    </div>
  );
}
