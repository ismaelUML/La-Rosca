import React from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// En vez de monedas abstractas y cajas negras simplistas, aca mostramos las
// 3 hojas de balance conectadas (Tesoro, BCRA y Bancos Privados) y la autopsia exacta del IPC.

interface MacroAndBankingViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

function InflationAutopsyCard({ state, onDispatch }: MacroAndBankingViewProps) {
  const { inflation, structural } = state;
  const indecIntervened = structural.indecCredibilityIndex < 60;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Autopsia de Inflación (4 Motores Reales) y Canastas EPH</CardTitle>
          <Badge variant={indecIntervened ? 'danger' : 'success'}>
            Credibilidad INDEC: {structural.indecCredibilityIndex}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div>
            <div className="text-slate-400">IPC Mensual Real (Calle / Congreso)</div>
            <div className="text-lg font-bold text-amber-400">{inflation.realMonthlyIpcPct} %</div>
          </div>
          <div>
            <div className="text-slate-400">IPC Oficial Publicado (INDEC)</div>
            <div className="text-lg font-bold text-sky-400">{inflation.officialIndecIpcPct} %</div>
          </div>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span>1. Inercia Indexada y Paritarias Pasadas:</span>
            <span className="font-mono text-amber-300">+{inflation.inertiaComponentPp} pp</span>
          </div>
          <div className="flex justify-between">
            <span>2. Pass-Through Cambiario + Derrame Brecha CCL:</span>
            <span className="font-mono text-amber-300">+{inflation.passThroughComponentPp} pp</span>
          </div>
          <div className="flex justify-between">
            <span>3. Tarifazos Regulados (CAMMESA / Combustibles):</span>
            <span className="font-mono text-amber-300">+{inflation.tarifazoComponentPp} pp</span>
          </div>
          <div className="flex justify-between">
            <span>4. Desequilibrio Monetario y Caída Demanda de Pesos:</span>
            <span className="font-mono text-amber-300">+{inflation.monetaryDropComponentPp} pp</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          <div>
            <span className="text-slate-400 block">Pobreza (CBT)</span>
            <span className="font-bold text-rose-400">{inflation.povertyCbtPct} %</span>
          </div>
          <div>
            <span className="text-slate-400 block">Indigencia (CBA)</span>
            <span className="font-bold text-rose-300">{inflation.indigenceCbaPct} %</span>
          </div>
          <div>
            <span className="text-slate-400 block">Ancla Macro</span>
            <span className="font-bold text-emerald-400">{structural.anchorCredibilityIndex}/100</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant={indecIntervened ? 'secondary' : 'destructive'}
            onClick={() => onDispatch({ type: 'TOGGLE_INDEC_INTERVENTION', intervene: !indecIntervened })}
          >
            {indecIntervened ? 'Restituir Técnicos del INDEC' : 'Intervenir Índice del INDEC (Dibujar CER)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CentralBankAndSilobolsaCard({ state, onDispatch }: MacroAndBankingViewProps) {
  const { centralBank, structural } = state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Balance del BCRA, Mercado Cambiario y Stock en Silobolsas</CardTitle>
          <Badge variant="warning">Clima Agro: {structural.climateRegime}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div>
            <span className="text-slate-400 block">Reservas Brutas</span>
            <span className="text-sm font-bold text-slate-100">{centralBank.grossReservesBillionUsd} mil M USD</span>
          </div>
          <div>
            <span className="text-slate-400 block">Encajes Argendólar + Swap</span>
            <span className="text-sm font-bold text-slate-300">
              {centralBank.argendolarEncajesBillionUsd + centralBank.chinaSwapActivatedBillionUsd} mil M USD
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Reservas Netas Líquidas</span>
            <span className="text-sm font-bold text-rose-400">{centralBank.netLiquidReservesBillionUsd} mil M USD</span>
          </div>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span>Base Monetaria / Pasivos Remunerados (LEFI/Pases):</span>
            <span className="font-mono">
              ${centralBank.monetaryBaseBillionArs}B / ${centralBank.remuneratedLiabilitiesBillionArs}B ARS
            </span>
          </div>
          <div className="flex justify-between">
            <span>Stock Físico Retenido en Silobolsas (Soja/Maíz):</span>
            <span className="font-mono text-emerald-300">{structural.silobolsaStockMillionTons} M Toneladas</span>
          </div>
          <div className="flex justify-between">
            <span>Expectativa Devaluación a 90 días (Mercado Futuro Rofex):</span>
            <span className="font-mono text-amber-300">+{structural.expectedDevaluation3mPct} %</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <Button size="sm" variant="outline" onClick={() => onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: 1.0 })}>
            Crawling Peg 1%/mes (Ancla)
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: 4.5 })}>
            Acelerar Crawling 4,5%/mes
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDispatch({ type: 'DISCRETE_DEVALUATION', devaluationPct: 35 })}>
            Devaluación Shock (+35%)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDispatch({ type: 'SET_POLICY_RATE', annualRatePct: centralBank.policyRateAnnualPct + 10 })}
          >
            Subir Tasa BCRA ({centralBank.policyRateAnnualPct}% → {centralBank.policyRateAnnualPct + 10}%)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onDispatch({
                type: 'SET_CEPO_STRICTNESS',
                strictnessIndex: centralBank.cepoStrictnessIndex > 20 ? 10 : 75
              })
            }
          >
            {centralBank.cepoStrictnessIndex > 20 ? 'Levantar Cepo (Flotación)' : 'Reinstalar Cepo Duro'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PrivateBanksAndDebtCard({ state, onDispatch }: MacroAndBankingViewProps) {
  const { bankingSystem, treasury, debtPortfolio } = state;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Balance del Sistema Bancario Privado (ADEBA / ABA), PUTs y Cartera de Deuda Soberana</CardTitle>
          <Badge variant="default">Roll-Over Última Licitación Quincenal: {treasury.lastRolloverPct}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2 rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div className="font-semibold text-sky-400">Liquidez Bancaria, Crowding-Out y Argendólares</div>
          <div className="flex justify-between">
            <span>Exposición de Bancos al Sector Público (Tesoro + BCRA):</span>
            <span className="font-mono font-bold">{bankingSystem.publicSectorExposurePct}% del Activo</span>
          </div>
          <div className="flex justify-between">
            <span>Stock de PUTs del BCRA en poder de Bancos (Ejecutados hoy):</span>
            <span className="font-mono text-amber-300">
              ${bankingSystem.bcraPutsBillionArs}B (${bankingSystem.putsExecutedThisMonthBillionArs}B ejecutados)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Depósitos Privados en USD (Argendólares) / Drenaje Diario:</span>
            <span className="font-mono text-rose-300">
              {bankingSystem.argendolarPrivateDepositsUsdBillion}B USD (-{bankingSystem.argendolarDrainDailyMillionUsd}M/día)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Crédito al Sector Privado (PyMEs + Hipotecario UVA) / Mora:</span>
            <span className="font-mono text-emerald-300">
              {bankingSystem.privateCreditPctGdp}% PBI (Mora {bankingSystem.nonPerformingLoansPct}%)
            </span>
          </div>
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={() => onDispatch({ type: 'EXECUTE_ANSES_INTRA_STATE_SWAP' })}>
              Ejecutar Canje Intra-Estado con ANSES (FGS) y Banco Nación
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 rounded-lg bg-slate-950 p-3 border border-slate-800">
          <div className="font-semibold text-sky-400">6 Familias de Deuda Soberana y Riesgo Fondos Buitre (CACs)</div>
          {debtPortfolio.map((slice) => (
            <div key={slice.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1">
              <div>
                <span className="font-medium text-slate-200">{slice.name}</span>
                <span className="text-[11px] text-slate-400 block">
                  Stock: {slice.amountBillionUsdEquivalent}B USD eq · Ley {slice.jurisdiction}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-emerald-300 block">Paridad ${slice.parityUsd}</span>
                <span className="text-[11px] text-rose-400">Buitres: {slice.vultureHoldoutSharePct}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MacroAndBankingView({ state, onDispatch }: MacroAndBankingViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <InflationAutopsyCard state={state} onDispatch={onDispatch} />
      <CentralBankAndSilobolsaCard state={state} onDispatch={onDispatch} />
      <PrivateBanksAndDebtCard state={state} onDispatch={onDispatch} />
    </div>
  );
}

