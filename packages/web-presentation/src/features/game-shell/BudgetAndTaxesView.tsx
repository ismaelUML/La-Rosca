import React, { useMemo, useState } from 'react';
import {
  parseSemanticTaxOrLaw,
  type CustomTaxProposal,
  type PolicyAction,
  type RigiPendingProject,
  type RigisectorItem,
  type SemanticImpactSummary,
  type SemanticIdeologyDirection,
  type SimulationState
} from '@argentina-sim/domain';
import { RigiSectorsSection } from './RigiSectorsSection.js';
import { TaxesManagementSection } from './TaxesManagementSection.js';

// Vistas de PRESUPUESTO: Financiamiento, Impuestos (con distincion Ley vs Decreto
// y Coparticipable vs Exclusivo Nacion), Impuestos propios y RIGI.

interface FinancingViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

export function FinancingView({ state, onDispatch }: FinancingViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          PRESUPUESTO · TESORO Y DEUDA
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Financiamiento</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cuando el gasto supera la recaudación hay déficit. Podés cubrirlo con emisión, deuda local, canjes intra-Estado con ANSES o reestructuración con CACs.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#10131b] border border-slate-800">
          <div className="text-slate-400">Resultado primario</div>
          <div className="text-lg font-mono font-extrabold text-emerald-400 mt-1">
            {state.treasury.primaryResultPctGdp}% PIB
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#10131b] border border-slate-800">
          <div className="text-slate-400">Rollover Licitación</div>
          <div className="text-lg font-mono font-extrabold text-sky-400 mt-1">
            {state.treasury.lastRolloverPct}%
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#10131b] border border-slate-800">
          <div className="text-slate-400">Riesgo país</div>
          <div className="text-lg font-mono font-extrabold text-amber-400 mt-1">
            {state.countryRiskEmbiPb} pb
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#10131b] border border-slate-800">
          <div className="text-slate-400">Reservas Brutas</div>
          <div className="text-lg font-mono font-extrabold text-white mt-1">
            {state.centralBank.grossReservesBillionUsd} B USD
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#10131b] border border-slate-800">
          <div className="text-slate-400">Reservas Netas</div>
          <div className="text-lg font-mono font-extrabold text-emerald-300 mt-1">
            {state.centralBank.netLiquidReservesBillionUsd} B USD
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Cómo cubrir el déficit y administrar liquidez</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-2">
            <div className="font-bold text-white">Canje Intra-Sector Público (FGS ANSES + Banco Nación)</div>
            <p className="text-slate-400">
              Obliga a ANSES y entes públicos a suscribir bonos del Tesoro en pesos para sostener el rollover sin pedir al mercado externo.
            </p>
            <button
              type="button"
              onClick={() => onDispatch({ type: 'EXECUTE_ANSES_INTRA_STATE_SWAP' })}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs"
            >
              Ejecutar Canje FGS ANSES
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-2">
            <div className="font-bold text-white">Exposición Bancaria y Seguro de Liquidez (PUTs)</div>
            <p className="text-slate-400">
              Stock de PUTs: <strong>{state.bankingSystem.bcraPutsBillionArs} B ARS</strong> · Exposición al Tesoro: <strong>{state.bankingSystem.publicSectorExposurePct}%</strong>.
            </p>
            <div className="text-[11px] text-amber-300">
              Ejecutados este mes: {state.bankingSystem.putsExecutedThisMonthBillionArs} B ARS · Drenaje Argendólares: {state.bankingSystem.argendolarDrainDailyMillionUsd} M USD/día.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">
          Estructura de Deuda Soberana (Ley Local vs Ley Nueva York y Fondos Buitre)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {state.debtPortfolio.map((bond) => (
            <div
              key={bond.id}
              className="p-3.5 rounded-xl bg-[#0b0e15] border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-white">{bond.name}</div>
                <div className="text-slate-400 mt-0.5">
                  Stock: {bond.amountBillionUsdEquivalent} B USD · Paridad {bond.parityUsd}% · {bond.jurisdiction} · Holdouts {bond.vultureHoldoutSharePct}%
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-amber-300">
                {bond.currency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TaxesManagementViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

export function TaxesManagementView({ state, onDispatch }: TaxesManagementViewProps) {
  return <TaxesManagementSection taxes={state.taxes} onDispatch={onDispatch} />;
}

interface CustomTaxesAndRigiViewProps {
  mode: 'CUSTOM_TAXES' | 'RIGI';
  customTaxes: CustomTaxProposal[];
  rigiSectors: RigisectorItem[];
  onAddCustomTax: (tax: CustomTaxProposal) => void;
  onToggleRigi: (id: string) => void;
  pendingProjects?: RigiPendingProject[];
  onApproveProject?: (id: string) => void;
  onRejectProject?: (id: string) => void;
  onApproveAllProjects?: () => void;
}

function resolveDirectionColor(direction: SemanticIdeologyDirection): string {
  if (direction === 'LIBERAL') return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
  if (direction === 'ESTATISTA') return 'text-sky-400 bg-sky-950/60 border-sky-800';
  return 'text-amber-400 bg-amber-950/60 border-amber-800';
}

function SemanticTaxAnalysisPreview({ analysis }: { analysis: SemanticImpactSummary }) {
  const dirColor = resolveDirectionColor(analysis.direction);
  const revSign = analysis.fiscalDeltaGdpPct >= 0 ? '+' : '';

  return (
    <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">
          Dictamen de Impacto Fiscal (Oficina de Presupuesto del Congreso)
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${dirColor}`}>
          {analysis.direction}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">RECAUDACIÓN</div>
          <div className="font-mono font-bold text-emerald-400 mt-0.5">
            {revSign}{analysis.fiscalDeltaGdpPct} % PIB
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">INVERSIÓN</div>
          <div className="font-mono font-bold text-sky-400 mt-0.5">
            {analysis.investmentDeltaPp >= 0 ? `+${analysis.investmentDeltaPp}` : analysis.investmentDeltaPp} pp
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">INFLACIÓN MENSUAL</div>
          <div className="font-mono font-bold text-amber-400 mt-0.5">
            {analysis.inflationMonthlyDeltaPp >= 0 ? `+${analysis.inflationMonthlyDeltaPp}` : analysis.inflationMonthlyDeltaPp} pp
          </div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[10px]">RESISTENCIA CONGRESO</div>
          <div className="font-mono font-bold text-rose-400 mt-0.5">
            {analysis.congressResistancePct}%
          </div>
        </div>
      </div>

      {analysis.judicialWarning ? (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs">
          ALERTA JUDICIAL: {analysis.judicialWarning}
        </div>
      ) : null}
    </div>
  );
}

export function CustomTaxesAndRigiView({
  mode,
  customTaxes,
  rigiSectors,
  onAddCustomTax,
  onToggleRigi,
  pendingProjects,
  onApproveProject,
  onRejectProject,
  onApproveAllProjects
}: CustomTaxesAndRigiViewProps) {
  const [taxName, setTaxName] = useState('');
  const [taxArticles, setTaxArticles] = useState('');
  const [taxRate, setTaxRate] = useState(2.5);

  const semanticAnalysis = useMemo(
    () => parseSemanticTaxOrLaw(taxName, taxArticles, taxRate),
    [taxName, taxArticles, taxRate]
  );

  const handleSubmitTax = () => {
    if (!taxName.trim()) {
      return;
    }
    onAddCustomTax({
      id: `CT_${Date.now()}`,
      name: taxName.trim(),
      articlesText: taxArticles.trim() || 'Gravamen extraordinario sobre rentas financieras y grandes patrimonios.',
      ratePct: taxRate,
      estimatedRevenuePctGdp: Math.max(0.1, semanticAnalysis.fiscalDeltaGdpPct),
      approvedByCongress: semanticAnalysis.congressResistancePct < 65
    });
    setTaxName('');
    setTaxArticles('');
  };

  if (mode === 'RIGI') {
    return (
      <RigiSectorsSection
        rigiSectors={rigiSectors}
        onToggleRigi={onToggleRigi}
        pendingProjects={pendingProjects}
        onApproveProject={onApproveProject}
        onRejectProject={onRejectProject}
        onApproveAllProjects={onApproveAllProjects}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          PRESUPUESTO · INICIATIVA PARLAMENTARIA
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Impuestos propios</h1>
        <p className="text-xs text-slate-400 mt-1">
          Creá un impuesto nuevo redactando su nombre y articulado. La oficina de presupuesto estima su impacto y lo gira al Congreso.
        </p>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-white mb-1">Nombre del impuesto</label>
            <input
              type="text"
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="Ej.: Impuesto a las Grandes Rentas Mineras y Financieras"
              className="w-full bg-[#0b0e15] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              Alícuota propuesta ({taxRate}%)
            </label>
            <input
              type="range"
              min={0.5}
              max={38}
              step={0.5}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full accent-orange-500 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white mb-1">
            Articulado y sujeto alcanzado
          </label>
          <textarea
            rows={3}
            value={taxArticles}
            onChange={(e) => setTaxArticles(e.target.value)}
            placeholder="Art. 1: Establécese en todo el territorio de la Nación un gravamen de emergencia..."
            className="w-full bg-[#0b0e15] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
          />
        </div>

        <SemanticTaxAnalysisPreview analysis={semanticAnalysis} />

        <button
          type="button"
          onClick={handleSubmitTax}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-xs shadow transition"
        >
          Enviar Proyecto Tributario al Congreso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {customTaxes.map((ct) => (
          <div key={ct.id} className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">{ct.name}</span>
              <span className="text-xs font-mono text-emerald-400">+{ct.estimatedRevenuePctGdp}% PIB</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{ct.articlesText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
