import React, { useMemo, useState } from 'react';
import type { IndicatorCategory, IndicatorSeriesCard, SimulationState } from '@argentina-sim/domain';
import { buildIndicatorsCatalog } from '@argentina-sim/infrastructure';
import { BarChart3, History, RefreshCw, Search } from 'lucide-react';
import { IndicatorChartCard } from './IndicatorChartCard.js';
import { HistoricalMandateComparatorModal } from './HistoricalMandateComparatorModal.js';
import { playUiSound } from '../../lib/gameFeedback.js';

// Tablero Nacional de Indicadores Macroeconomicos, Sociales y Sectoriales (INDEC / BCRA):
// Diseno tactico de acero y bronce con buscador en vivo, 13 secciones tematicas y desglose estructural.

const CATEGORY_TABS: Array<{ id: IndicatorCategory | 'TODOS'; label: string }> = [
  { id: 'PRECIOS', label: 'Precios' },
  { id: 'EMPLEO', label: 'Empleo' },
  { id: 'ACTIVIDAD', label: 'Actividad' },
  { id: 'INGRESOS', label: 'Ingresos' },
  { id: 'SOCIEDAD', label: 'Sociedad' },
  { id: 'SEGURIDAD', label: 'Seguridad' },
  { id: 'SECTOR_EXTERNO', label: 'Sector externo' },
  { id: 'FINANZAS', label: 'Finanzas' },
  { id: 'FINANZAS_PUBLICAS', label: 'Finanzas públicas' },
  { id: 'ENERGIA_Y_MINERIA', label: 'Energía y Minería' },
  { id: 'EDUCACION_Y_SALUD', label: 'Educación y Salud' },
  { id: 'OPINION_PUBLICA', label: 'Opinión pública' },
  { id: 'DEFENSA', label: 'Defensa' },
  { id: 'TODOS', label: 'Ver todos' }
];

interface IndicatorsDashboardViewProps {
  state: SimulationState;
  saveError?: string | null;
  onRetrySave?: () => void;
}

function SaveStatusBadge({
  saveError,
  onRetrySave
}: {
  saveError?: string | null;
  onRetrySave?: () => void;
}) {
  if (saveError) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-rose-950/60 border border-rose-700/60 text-xs text-rose-200 max-w-md">
        <span>{saveError}</span>
        {onRetrySave ? (
          <button
            type="button"
            onClick={onRetrySave}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-rose-800/70 hover:bg-rose-700 text-white font-semibold shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reintentar</span>
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#090d14] border border-emerald-800/60 text-[11px] font-mono text-emerald-300">
      <span className="w-2 h-2 rounded-sm bg-emerald-400" />
      <span>Partida guardada en este dispositivo</span>
    </div>
  );
}

function formatSignedPct(val: number): string {
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

function pickKpiTone(isHealthy: boolean, badCls: string): string {
  return isHealthy ? 'text-emerald-400' : badCls;
}

function ExecutiveKpiStrip({ state }: { state: SimulationState }) {
  const kpis = [
    {
      label: 'IPC MENSUAL',
      value: `${state.inflation.realMonthlyIpcPct.toFixed(1)}%`,
      sub: `Interanual ${state.inflation.interannualIpcPct.toFixed(0)}%`,
      cls: pickKpiTone(state.inflation.realMonthlyIpcPct <= 3.0, 'text-amber-300')
    },
    {
      label: 'PBI ANUAL',
      value: formatSignedPct(state.gdpGrowthAnnualPct),
      sub: `${state.gdpNominalBillionUsd} mil M USD`,
      cls: pickKpiTone(state.gdpGrowthAnnualPct >= 2.0, 'text-amber-300')
    },
    {
      label: 'POBREZA (CBT)',
      value: `${state.inflation.povertyCbtPct.toFixed(1)}%`,
      sub: `Indigencia ${state.inflation.indigenceCbaPct.toFixed(1)}%`,
      cls: pickKpiTone(state.inflation.povertyCbtPct <= 35, 'text-rose-400')
    },
    {
      label: 'RESERVAS NETAS',
      value: `${state.centralBank.netLiquidReservesBillionUsd.toFixed(1)}B`,
      sub: `Brutas ${state.centralBank.grossReservesBillionUsd.toFixed(1)}B USD`,
      cls: pickKpiTone(state.centralBank.netLiquidReservesBillionUsd >= 5, 'text-rose-400')
    },
    {
      label: 'RIESGO PAÍS',
      value: `${state.countryRiskEmbiPb} pb`,
      sub: `Brecha CCL ${state.centralBank.exchangeBrechaPct.toFixed(0)}%`,
      cls: pickKpiTone(state.countryRiskEmbiPb <= 750, 'text-amber-300')
    },
    {
      label: 'RESULTADO PRIMARIO',
      value: formatSignedPct(state.treasury.primaryResultPctGdp),
      sub: 'en % del PBI',
      cls: pickKpiTone(state.treasury.primaryResultPctGdp >= 0, 'text-rose-400')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {kpis.map((k) => (
        <div key={k.label} className="hoi-panel rounded-sm p-3 bg-[#090d14]">
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {k.label}
          </div>
          <div className={`text-lg font-mono font-extrabold mt-0.5 ${k.cls}`}>{k.value}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function InflationBreakdownPanel({ state }: { state: SimulationState }) {
  return (
    <div className="hoi-panel rounded-sm p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263142] pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
            DESCOMPOSICIÓN ECONOMÉTRICA DEL IPC
          </span>
          <h3 className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
            Desglose de Inflación (Mes #{state.turnMonth})
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#8a6d33]/80 text-xs font-mono text-amber-200">
          Credibilidad INDEC: {state.structural.indecCredibilityIndex}/100 · Ancla: {state.structural.anchorCredibilityIndex}/100
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-[10px] text-slate-400 uppercase">Inercia REM</div>
          <div className="font-bold text-amber-200 text-sm mt-1">+{state.inflation.inertiaComponentPp} pp</div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-[10px] text-slate-400 uppercase">Pass-through FX</div>
          <div className="font-bold text-sky-300 text-sm mt-1">+{state.inflation.passThroughComponentPp} pp</div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-[10px] text-slate-400 uppercase">Emisión + PUTs</div>
          <div className="font-bold text-rose-300 text-sm mt-1">+{state.inflation.monetaryDropComponentPp} pp</div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-[10px] text-slate-400 uppercase">Tarifazo CAMMESA</div>
          <div className="font-bold text-emerald-300 text-sm mt-1">+{state.inflation.tarifazoComponentPp} pp</div>
        </div>
      </div>
    </div>
  );
}

function matchesIndicatorSearch(card: IndicatorSeriesCard, q: string): boolean {
  if (!q) return true;
  const haystack = `${card.title} ${card.subtitle ?? ''}`.toLowerCase();
  return haystack.includes(q);
}

function matchesIndicatorCategory(
  card: IndicatorSeriesCard,
  category: IndicatorCategory | 'TODOS'
): boolean {
  return category === 'TODOS' || card.category === category;
}

function filterCardsBySearchAndCategory(
  cards: IndicatorSeriesCard[],
  category: IndicatorCategory | 'TODOS',
  query: string
): IndicatorSeriesCard[] {
  const q = query.trim().toLowerCase();
  return cards.filter(
    (card) => matchesIndicatorCategory(card, category) && matchesIndicatorSearch(card, q)
  );
}

export function IndicatorsDashboardView({
  state,
  saveError,
  onRetrySave
}: IndicatorsDashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'TODOS'>('PRECIOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comparatorOpen, setComparatorOpen] = useState<boolean>(false);

  const allCards = useMemo(() => buildIndicatorsCatalog(state), [state]);
  const visibleCards = useMemo(
    () => filterCardsBySearchAndCategory(allCards, selectedCategory, searchQuery),
    [allCards, selectedCategory, searchQuery]
  );

  return (
    <div className="space-y-5 rosca-panel-enter">
      <div className="hoi-panel hoi-header-steel rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#090d14] border border-[#8a6d33] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
              SISTEMA ESTADÍSTICO NACIONAL · INDEC / BCRA / MECON
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5">
              Indicadores del País ({allCards.length} series activas)
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playUiSound('tab');
              setComparatorOpen(true);
            }}
            className="hoi-btn-gold px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Comparador Histórico (1991–2031)</span>
          </button>
          <SaveStatusBadge saveError={saveError} onRetrySave={onRetrySave} />
        </div>
      </div>

      <HistoricalMandateComparatorModal
        open={comparatorOpen}
        state={state}
        onClose={() => setComparatorOpen(false)}
      />

      <ExecutiveKpiStrip state={state} />

      <div className="hoi-panel rounded-sm p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-200">
            Secciones Estadísticas ({visibleCards.length} indicadores en vista)
          </span>
          <label className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar indicador (ej: Vaca Muerta, Pobreza, CCL)..."
              className="pl-8 pr-3 py-1.5 w-64 rounded-sm bg-[#090d14] border border-[#263142] focus:border-[#b89342] focus:outline-none text-xs font-mono text-amber-100 placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            const count =
              tab.id === 'TODOS'
                ? allCards.length
                : allCards.filter((c) => c.category === tab.id).length;
            const cls = isActive
              ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
              : 'bg-[#090d14] text-slate-300 border-[#263142] hover:border-[#8a6d33]';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  setSelectedCategory(tab.id);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition border ${cls}`}
              >
                {tab.label} <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={selectedCategory} className="grid grid-cols-1 xl:grid-cols-2 gap-4 rosca-panel-enter">
        {visibleCards.map((card) => (
          <IndicatorChartCard key={card.id} card={card} />
        ))}
      </div>

      <InflationBreakdownPanel state={state} />
    </div>
  );
}
