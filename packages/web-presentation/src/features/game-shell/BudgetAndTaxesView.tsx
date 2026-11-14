import React, { useMemo, useState } from 'react';
import { Landmark, Receipt, Send } from 'lucide-react';
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
import { SectionPageHeader } from '@/components/ui/SectionPageHeader';
import { playUiSound } from '@/lib/gameFeedback';
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
    <div className="space-y-5 rosca-panel-enter">
      <SectionPageHeader
        eyebrow="Presupuesto · Tesoro y Deuda"
        title="Financiamiento"
        description="Cuando el gasto supera la recaudación hay déficit. Podés cubrirlo con emisión, deuda local, canjes intra-Estado con ANSES o reestructuración con CACs."
        icon={<Landmark className="w-4 h-4 text-amber-300" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Resultado primario</div>
          <div className="text-lg font-mono font-extrabold text-emerald-400 mt-1">
            {state.treasury.primaryResultPctGdp}% PIB
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rollover Licitación</div>
          <div className="text-lg font-mono font-extrabold text-sky-400 mt-1">
            {state.treasury.lastRolloverPct}%
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Riesgo país</div>
          <div className="text-lg font-mono font-extrabold text-amber-400 mt-1">
            {state.countryRiskEmbiPb} pb
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reservas Brutas</div>
          <div className="text-lg font-mono font-extrabold text-white mt-1">
            {state.centralBank.grossReservesBillionUsd} B USD
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reservas Netas</div>
          <div className="text-lg font-mono font-extrabold text-emerald-300 mt-1">
            {state.centralBank.netLiquidReservesBillionUsd} B USD
          </div>
        </div>
      </div>

      <div className="hoi-panel rounded-sm p-4 md:p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 border-b border-[#263142] pb-2">
          Cómo cubrir el déficit y administrar liquidez
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] space-y-2.5">
            <div className="font-bold text-slate-100">Canje Intra-Sector Público (FGS ANSES + Banco Nación)</div>
            <p className="text-slate-400 leading-relaxed">
              Obliga a ANSES y entes públicos a suscribir bonos del Tesoro en pesos para sostener el rollover sin pedir al mercado externo.
            </p>
            <button
              type="button"
              onClick={() => {
                playUiSound('atn');
                onDispatch({ type: 'EXECUTE_ANSES_INTRA_STATE_SWAP' });
              }}
              className="hoi-btn-gold px-4 py-2 rounded-sm text-[11px] font-mono font-extrabold uppercase tracking-wide"
            >
              Ejecutar Canje FGS ANSES
            </button>
          </div>

          <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] space-y-2">
            <div className="font-bold text-slate-100">Exposición Bancaria y Seguro de Liquidez (PUTs)</div>
            <p className="text-slate-400 leading-relaxed">
              Stock de PUTs: <strong className="font-mono text-slate-100">{state.bankingSystem.bcraPutsBillionArs} B ARS</strong> · Exposición al Tesoro: <strong className="font-mono text-slate-100">{state.bankingSystem.publicSectorExposurePct}%</strong>.
            </p>
            <div className="text-[11px] font-mono text-amber-300">
              Ejecutados este mes: {state.bankingSystem.putsExecutedThisMonthBillionArs} B ARS · Drenaje Argendólares: {state.bankingSystem.argendolarDrainDailyMillionUsd} M USD/día.
            </div>
          </div>
        </div>
      </div>

      <div className="hoi-panel rounded-sm p-4 md:p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 border-b border-[#263142] pb-2">
          Estructura de Deuda Soberana (Ley Local vs Ley Nueva York y Fondos Buitre)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {state.debtPortfolio.map((bond) => (
            <div
              key={bond.id}
              className="p-3.5 rounded-sm bg-[#090d14] border border-[#263142] flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-slate-100">{bond.name}</div>
                <div className="text-slate-400 mt-0.5">
                  Stock: {bond.amountBillionUsdEquivalent} B USD · Paridad {bond.parityUsd}% · {bond.jurisdiction} · Holdouts {bond.vultureHoldoutSharePct}%
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-sm bg-[#111824] border border-[#344661] font-mono text-amber-300 shrink-0">
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
    <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
          Dictamen de Impacto Fiscal (Oficina de Presupuesto del Congreso)
        </span>
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${dirColor}`}>
          {analysis.direction}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-sm bg-[#111824] border border-[#263142]">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Recaudación</div>
          <div className="font-mono font-bold text-emerald-400 mt-0.5">
            {revSign}{analysis.fiscalDeltaGdpPct} % PIB
          </div>
        </div>
        <div className="p-2.5 rounded-sm bg-[#111824] border border-[#263142]">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Inversión</div>
          <div className="font-mono font-bold text-sky-400 mt-0.5">
            {analysis.investmentDeltaPp >= 0 ? `+${analysis.investmentDeltaPp}` : analysis.investmentDeltaPp} pp
          </div>
        </div>
        <div className="p-2.5 rounded-sm bg-[#111824] border border-[#263142]">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Inflación mensual</div>
          <div className="font-mono font-bold text-amber-400 mt-0.5">
            {analysis.inflationMonthlyDeltaPp >= 0 ? `+${analysis.inflationMonthlyDeltaPp}` : analysis.inflationMonthlyDeltaPp} pp
          </div>
        </div>
        <div className="p-2.5 rounded-sm bg-[#111824] border border-[#263142]">
          <div className="text-slate-400 text-[10px] font-mono uppercase">Resistencia Congreso</div>
          <div className="font-mono font-bold text-rose-400 mt-0.5">
            {analysis.congressResistancePct}%
          </div>
        </div>
      </div>

      {analysis.judicialWarning ? (
        <div className="p-2.5 rounded-sm bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs">
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
    <div className="space-y-5 rosca-panel-enter">
      <SectionPageHeader
        eyebrow="Presupuesto · Iniciativa Parlamentaria"
        title="Impuestos propios"
        description="Creá un impuesto nuevo redactando su nombre y articulado. La oficina de presupuesto estima su impacto y lo gira al Congreso."
        icon={<Receipt className="w-4 h-4 text-amber-300" />}
      />

      <div className="hoi-panel rounded-sm p-4 md:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Nombre del impuesto
            </label>
            <input
              type="text"
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="Ej.: Impuesto a las Grandes Rentas Mineras y Financieras"
              className="w-full bg-[#090d14] border border-[#263142] focus:border-[#b89342] rounded-sm px-3.5 py-2.5 text-sm text-white outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Alícuota propuesta ({taxRate}%)
            </label>
            <input
              type="range"
              min={0.5}
              max={38}
              step={0.5}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full accent-amber-500 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
            Articulado y sujeto alcanzado
          </label>
          <textarea
            rows={3}
            value={taxArticles}
            onChange={(e) => setTaxArticles(e.target.value)}
            placeholder="Art. 1: Establécese en todo el territorio de la Nación un gravamen de emergencia..."
            className="w-full bg-[#090d14] border border-[#263142] focus:border-[#b89342] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition"
          />
        </div>

        <SemanticTaxAnalysisPreview analysis={semanticAnalysis} />

        <button
          type="button"
          onClick={() => {
            playUiSound('select');
            handleSubmitTax();
          }}
          className="hoi-btn-gold px-5 py-2.5 rounded-sm font-mono font-extrabold text-xs uppercase tracking-wide inline-flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar Proyecto Tributario al Congreso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {customTaxes.map((ct) => (
          <div key={ct.id} className="hoi-panel rounded-sm p-4">
            <div className="flex justify-between items-center gap-2">
              <span className="font-bold text-white text-sm">{ct.name}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                +{ct.estimatedRevenuePctGdp}% PIB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ct.articlesText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
