import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import type { PolicyAction, TaxCategory, TaxItem } from '@argentina-sim/domain';
import { SectionPageHeader } from '@/components/ui/SectionPageHeader';
import { playUiSound } from '@/lib/gameFeedback';

// Aca esta la botonera tributaria real: 17 impuestos clasificados con precision constitucional.
// Si tocas retenciones o combustibles sos Gardel con una resolucion ministerial;
// si tocas Ganancias o el IVA, preparate para transar con los gobernadores en el Congreso.

export interface TaxesManagementSectionProps {
  taxes: TaxItem[];
  onDispatch: (action: PolicyAction) => void;
}

const TAX_CATEGORIES: Array<{ id: 'TODOS' | TaxCategory; label: string }> = [
  { id: 'TODOS', label: 'Todos (17)' },
  { id: 'COMERCIO_EXTERIOR', label: 'Comercio Exterior (5)' },
  { id: 'CONSUMO', label: 'Consumo (4)' },
  { id: 'RENTA', label: 'Renta (4)' },
  { id: 'TRABAJO', label: 'Trabajo (2)' },
  { id: 'FINANCIERO', label: 'Financiero (1)' },
  { id: 'PATRIMONIO', label: 'Patrimonio (1)' }
];

const TAX_CATEGORY_COLOR_MAP: Record<TaxCategory, string> = {
  COMERCIO_EXTERIOR: 'text-amber-400 bg-amber-950/60 border-amber-700/60',
  CONSUMO: 'text-orange-400 bg-orange-950/60 border-orange-700/60',
  RENTA: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60',
  TRABAJO: 'text-sky-400 bg-sky-950/60 border-sky-700/60',
  FINANCIERO: 'text-cyan-300 bg-cyan-950/60 border-cyan-700/60',
  PATRIMONIO: 'text-slate-200 bg-[#182232] border-[#3b4e6b]'
};

function resolveTaxCategoryColor(cat?: TaxCategory): string {
  if (!cat) return 'text-slate-200 bg-[#182232] border-[#3b4e6b]';
  return TAX_CATEGORY_COLOR_MAP[cat] ?? 'text-slate-200 bg-[#182232] border-[#3b4e6b]';
}

function TaxCardHeader({ tax }: { tax: TaxItem }) {
  const catColor = resolveTaxCategoryColor(tax.category);
  const isDecreto = tax.legalMechanism === 'DECRETO_EJECUTIVO';

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-extrabold text-white leading-tight">{tax.name}</h4>
        <span className="text-xl font-mono font-extrabold text-orange-400 shrink-0">
          {tax.currentRatePct.toFixed(1).replace('.', ',')}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catColor}`}>
          {tax.category ?? 'TRIBUTO'}
        </span>
        <span
          className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${
            isDecreto
              ? 'bg-amber-950/70 border-amber-600/70 text-amber-300'
              : 'bg-[#132033] border-[#334155] text-sky-200'
          }`}
        >
          {isDecreto ? 'Por Decreto' : 'Por Ley'}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
          {tax.isCoparticipable ? 'Coparticipable' : '100% Nación'}
        </span>
      </div>
    </div>
  );
}

function TaxCardMetrics({ tax }: { tax: TaxItem }) {
  const gdpText = `${tax.revenuePctGdp.toFixed(2).replace('.', ',')}% PIB`;
  const usdText = `${tax.revenueMillionUsdMonthly ?? Math.round(tax.revenuePctGdp * 575)} M USD/mes`;

  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-sm bg-[#090d14] border border-[#263142]">
      <span className="text-slate-400">Recaudación proyectada</span>
      <span className="font-mono font-bold text-emerald-400">
        {gdpText} <span className="text-slate-500 font-normal">({usdText})</span>
      </span>
    </div>
  );
}

function TaxSliderControl({
  tax,
  onRateChange
}: {
  tax: TaxItem;
  onRateChange: (rate: number) => void;
}) {
  const maxVal = tax.initialRatePct >= 50 ? 100 : 45;

  return (
    <div className="space-y-1">
      <input
        type="range"
        min={0}
        max={maxVal}
        step={0.5}
        value={tax.currentRatePct}
        onChange={(e) => onRateChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
        <span>0%</span>
        <span>Base inicial: {tax.initialRatePct}%</span>
        <span>{maxVal}%</span>
      </div>
    </div>
  );
}

function TaxCard({
  tax,
  onRateChange
}: {
  tax: TaxItem;
  onRateChange: (rate: number) => void;
}) {
  const isDecreto = tax.legalMechanism === 'DECRETO_EJECUTIVO';

  return (
    <div className="hoi-panel rounded-sm p-4 md:p-5 flex flex-col justify-between gap-3">
      <div className="space-y-3">
        <TaxCardHeader tax={tax} />
        <TaxCardMetrics tax={tax} />
        <TaxSliderControl tax={tax} onRateChange={onRateChange} />
      </div>

      <div className="pt-2 border-t border-[#263142]">
        <span
          className={`inline-block text-[10px] font-mono font-bold px-2 py-1 rounded-sm w-full text-center ${
            isDecreto
              ? 'bg-amber-950/30 border border-amber-800/60 text-amber-300'
              : 'bg-[#132033] border border-[#334155] text-sky-200'
          }`}
        >
          {isDecreto
            ? 'Facultad delegada: aplica de inmediato por decreto'
            : 'Requiere proyecto de ley y mayorías en el Congreso'}
        </span>
      </div>
    </div>
  );
}

export function TaxesManagementSection({ taxes, onDispatch }: TaxesManagementSectionProps) {
  const [selectedCat, setSelectedCat] = useState<'TODOS' | TaxCategory>('TODOS');

  const filtered = taxes.filter(
    (t) => selectedCat === 'TODOS' || t.category === selectedCat
  );

  const totalGdpPct = taxes.reduce((acc, t) => acc + t.revenuePctGdp, 0);
  const totalUsdMonthly = taxes.reduce(
    (acc, t) => acc + (t.revenueMillionUsdMonthly ?? Math.round(t.revenuePctGdp * 575)),
    0
  );
  const decreeCount = taxes.filter((t) => t.legalMechanism === 'DECRETO_EJECUTIVO').length;
  const lawCount = taxes.filter((t) => t.legalMechanism === 'LEY_CONGRESO').length;

  return (
    <div className="space-y-5 rosca-panel-enter">
      <SectionPageHeader
        eyebrow="Presupuesto · Matriz Tributaria Nacional"
        title="Impuestos"
        description={`La recaudación fiscal total es de ${totalGdpPct.toFixed(2).replace('.', ',')} % del PIB (${(totalUsdMonthly / 1000).toFixed(2).replace('.', ',')} mil M USD/mes). ${decreeCount} tributos se fijan por decreto y ${lawCount} por ley del Congreso.`}
        icon={<Scale className="w-4 h-4 text-amber-300" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recaudación total</div>
          <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
            {totalGdpPct.toFixed(2).replace('.', ',')} % PIB
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ingreso mensual</div>
          <div className="text-lg font-mono font-extrabold text-sky-400 mt-0.5">
            {totalUsdMonthly.toLocaleString('es-AR')} M USD
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Por Decreto (Inmediatos)</div>
          <div className="text-lg font-mono font-extrabold text-amber-400 mt-0.5">
            {decreeCount} tributos
          </div>
        </div>
        <div className="hoi-panel p-3.5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Por Ley (Congreso)</div>
          <div className="text-lg font-mono font-extrabold text-sky-300 mt-0.5">
            {lawCount} tributos
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pb-1">
        {TAX_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playUiSound('tab');
              setSelectedCat(cat.id);
            }}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition border ${
              selectedCat === cat.id
                ? 'bg-[#1d3250] border-[#b89342] text-amber-100'
                : 'bg-[#090d14] text-slate-400 border-[#263142] hover:text-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((tax) => (
          <TaxCard
            key={tax.id}
            tax={tax}
            onRateChange={(newRate) =>
              onDispatch({
                type: 'UPDATE_TAX_RATE',
                taxId: tax.id,
                newRatePct: newRate
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
