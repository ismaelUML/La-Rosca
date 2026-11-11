import React, { useState } from 'react';
import type { IndicatorCategory, SimulationState } from '@argentina-sim/domain';
import { buildIndicatorsCatalog } from '@argentina-sim/infrastructure';
import { IndicatorChartCard } from './IndicatorChartCard.js';

// Vista principal de Indicadores (captura 1): pildoras de filtro por categoria
// (Precios, Empleo, Actividad, Ingresos, Sociedad, Seguridad, Sector externo, Finanzas, Finanzas publicas, Opinion publica, Defensa)
// y grilla de tarjetas con series historicas + desglose transparente de ecuaciones.

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
  { id: 'TODOS', label: 'Ver todos (24)' }
];

interface IndicatorsDashboardViewProps {
  state: SimulationState;
}

export function IndicatorsDashboardView({ state }: IndicatorsDashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | 'TODOS'>('PRECIOS');
  const allCards = buildIndicatorsCatalog(state);
  const visibleCards = allCards.filter(
    (card) => selectedCategory === 'TODOS' || card.category === selectedCategory
  );

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          <span className="w-2 h-2 rounded-sm bg-emerald-400" />
          ECONOMÍA
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Indicadores</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleCards.map((card) => (
          <IndicatorChartCard key={card.id} card={card} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Pasá el dedo o el cursor por el gráfico para ver el valor exacto de cada mes y su variación respecto del anterior. Cerca de las elecciones los indicadores se vuelven más volátiles.
      </p>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold text-white">
            Autopsia Transparente de Ecuaciones (Caja Blanca · Mes #{state.turnMonth})
          </h3>
          <span className="text-xs font-mono text-amber-300">
            Credibilidad INDEC: {state.structural.indecCredibilityIndex}/100 · Ancla global: {state.structural.anchorCredibilityIndex}/100
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400">Inercia REM</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.inertiaComponentPp} pp</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400">Pass-through FX</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.passThroughComponentPp} pp</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400">Emisión + PUTs</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.monetaryDropComponentPp} pp</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400">Tarifazo CAMMESA</div>
            <div className="font-mono font-bold text-white mt-0.5">+{state.inflation.tarifazoComponentPp} pp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
