import React, { useState } from 'react';
import type {
  EconomicLeverItem,
  PolicyAction,
  SectorMeasureCard,
  SimulationState
} from '@argentina-sim/domain';
import { SECTOR_CATEGORIES_SUMMARY } from '@argentina-sim/infrastructure';

// Vistas de ECONOMIA -> Politica economica (palancas -2 a +2 acopladas al motor)
// y ECONOMIA -> Medidas (12 sectores y decretos/programas activables).

const LEVER_LEVELS: Array<-2 | -1 | 0 | 1 | 2> = [-2, -1, 0, 1, 2];

function formatLeverNumber(lv: number): string {
  return lv > 0 ? `+${lv}` : String(lv);
}

interface EconomicPolicyViewProps {
  levers: EconomicLeverItem[];
  state: SimulationState;
  onChangeLever: (id: string, level: -2 | -1 | 0 | 1 | 2) => void;
  onDispatch: (action: PolicyAction) => void;
  onAdvanceTurn: () => void;
}

export function EconomicPolicyView({
  levers,
  state,
  onChangeLever,
  onDispatch,
  onAdvanceTurn
}: EconomicPolicyViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            ECONOMÍA · ORIENTACIÓN GENERAL
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            Política económica
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Las palancas generales orientan la economía de -2 (contractivo / ortodoxo) a +2 (expansivo / heterodoxo) y ajustan las ecuaciones del BCRA, Tesoro y CAMMESA.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvanceTurn}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
        >
          Ejecutar Mes Macroeconómico →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levers.map((lever) => {
          const labelIdx = lever.level + 2;
          return (
            <div
              key={lever.id}
              className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white">{lever.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lever.description}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 border border-slate-700 text-amber-300">
                  {lever.levelLabels[labelIdx]} ({formatLeverNumber(lever.level)})
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-2">
                {LEVER_LEVELS.map((lv) => {
                  const isSelected = lever.level === lv;
                  return (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => onChangeLever(lever.id, lv)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow'
                          : 'bg-[#0b0e15] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {formatLeverNumber(lv)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Calibración Fina de Mesa de Dinero BCRA y Secretaría de Energía
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <label className="block p-3 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Crawling Peg Oficial Mensual</span>
              <span className="font-mono font-bold text-sky-400">
                {state.centralBank.crawlingPegMonthlyPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={state.centralBank.crawlingPegMonthlyPct}
              onChange={(e) =>
                onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: Number(e.target.value) })
              }
              className="w-full accent-sky-400"
            />
          </label>

          <label className="block p-3 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Tasa de Política Monetaria (TNA)</span>
              <span className="font-mono font-bold text-amber-400">
                {state.centralBank.policyRateAnnualPct}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={2}
              value={state.centralBank.policyRateAnnualPct}
              onChange={(e) =>
                onDispatch({ type: 'SET_POLICY_RATE', annualRatePct: Number(e.target.value) })
              }
              className="w-full accent-amber-400"
            />
          </label>

          <label className="block p-3 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Cobertura Tarifaria CAMMESA</span>
              <span className="font-mono font-bold text-emerald-400">
                {state.energy.userTariffCoveragePct}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={state.energy.userTariffCoveragePct}
              onChange={(e) =>
                onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: Number(e.target.value) })
              }
              className="w-full accent-emerald-400"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

interface SectorMeasuresViewProps {
  measures: SectorMeasureCard[];
  onToggleMeasure: (id: string) => void;
}

export function SectorMeasuresView({ measures, onToggleMeasure }: SectorMeasuresViewProps) {
  const [filterMode, setFilterMode] = useState<'TODAS' | 'TEMPORAL' | 'PERMANENTE'>('TODAS');
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');

  const visibleMeasures = measures.filter((m) => {
    const matchesDuration = filterMode === 'TODAS' || m.durationType === filterMode;
    const matchesSector = selectedSector === 'TODOS' || m.sectorId === selectedSector;
    return matchesDuration && matchesSector;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          ECONOMÍA · DECRETOS Y RESOLUCIONES
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Medidas</h1>
        <p className="text-xs text-slate-400 mt-1">
          Elegí un sector para ver e implementar medidas concretas temporales o estructurales.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-[#10131b] border border-slate-800">
          {(['TODAS', 'TEMPORAL', 'PERMANENTE'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === mode ? 'bg-white text-slate-950' : 'text-slate-300'
              }`}
            >
              {mode === 'TODAS' ? 'Todas' : mode === 'TEMPORAL' ? 'Temporales' : 'Permanentes'}
            </button>
          ))}
        </div>

        {selectedSector !== 'TODOS' ? (
          <button
            type="button"
            onClick={() => setSelectedSector('TODOS')}
            className="text-xs text-sky-400 hover:underline"
          >
            Ver los 12 sectores
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {SECTOR_CATEGORIES_SUMMARY.map((sec) => {
          const isSelected = selectedSector === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSector(isSelected ? 'TODOS' : sec.id)}
              className={`text-left rounded-2xl bg-[#10131b] border p-4 transition ${
                isSelected
                  ? 'border-white ring-1 ring-white bg-[#151a26]'
                  : 'border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="text-base text-slate-400 mb-1">{sec.icon}</div>
              <div className="text-sm font-bold text-white">{sec.title}</div>
              <div className="text-xs text-slate-400 mt-1">{sec.subtitle}</div>
              <div className="text-[11px] text-slate-500 mt-3">
                {sec.tempCount} temporales · {sec.permCount} permanentes
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">
          Resoluciones y Programas Listos para Firma ({visibleMeasures.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visibleMeasures.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {m.sectorId} · {m.durationType}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Costo: {m.fiscalCostPctGdp}% PIB · IPC {m.inflationEffectPp} pp
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">{m.title}</div>
                <p className="text-xs text-slate-400 mt-1">{m.description}</p>
              </div>

              <button
                type="button"
                onClick={() => onToggleMeasure(m.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  m.active
                    ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                {m.active ? '✓ Medida Vigente (Clic para derogar)' : 'Firmar e Implementar Medida'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
