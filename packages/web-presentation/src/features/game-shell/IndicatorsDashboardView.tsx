import React, { useState } from 'react';
import type { IndicatorCategory, SimulationState } from '@argentina-sim/domain';
import { buildIndicatorsCatalog } from '@argentina-sim/infrastructure';
import { RefreshCw } from 'lucide-react';
import { IndicatorChartCard } from './IndicatorChartCard.js';
import { playUiSound } from '../../lib/gameFeedback.js';

// Vista principal de Indicadores con respiracion visual entre tarjetas
// y estado humano de guardado (nunca expone errores tecnicos/JSON al usuario).

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
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span>Partida guardada en este dispositivo</span>
    </div>
  );
}

export function IndicatorsDashboardView({
  state,
  saveError,
  onRetrySave
}: IndicatorsDashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'TODOS'>('PRECIOS');
  const allCards = buildIndicatorsCatalog(state);
  const visibleCards = allCards.filter(
    (card) => selectedCategory === 'TODOS' || card.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-sm bg-emerald-400" />
            ECONOMÍA Y SOCIEDAD
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Indicadores</h1>
        </div>
        <SaveStatusBadge saveError={saveError} onRetrySave={onRetrySave} />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playUiSound('tab');
                setSelectedCategory(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                isActive
                  ? 'bg-white text-slate-950 border-white shadow'
                  : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div key={selectedCategory} className="grid grid-cols-1 xl:grid-cols-2 gap-5 rosca-panel-enter">
        {visibleCards.map((card) => (
          <IndicatorChartCard key={card.id} card={card} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Pasá el cursor sobre la línea secundaria para ver el dato exacto de cada mes. Verde indica evolución favorable, dorado equilibrio y rojo/rosa tensión o deterioro.
      </p>

      <div className="rounded-xl bg-[#0e131c] border border-[#232e40] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold text-white">
            Desglose de Inflación (Mes #{state.turnMonth})
          </h3>
          <span className="text-xs font-mono text-amber-300">
            Credibilidad INDEC: {state.structural.indecCredibilityIndex}/100 · Ancla: {state.structural.anchorCredibilityIndex}/100
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#090d14] border border-slate-800">
            <div className="text-slate-400">Inercia REM</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.inertiaComponentPp} pp</div>
          </div>
          <div className="p-3 rounded-lg bg-[#090d14] border border-slate-800">
            <div className="text-slate-400">Pass-through FX</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.passThroughComponentPp} pp</div>
          </div>
          <div className="p-3 rounded-lg bg-[#090d14] border border-slate-800">
            <div className="text-slate-400">Emisión + PUTs</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.monetaryDropComponentPp} pp</div>
          </div>
          <div className="p-3 rounded-lg bg-[#090d14] border border-slate-800">
            <div className="text-slate-400">Tarifazo CAMMESA</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.tarifazoComponentPp} pp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
