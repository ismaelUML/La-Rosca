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

function SectorCategoryItem({
  sec,
  isSelected,
  activeCount,
  onSelect
}: {
  sec: (typeof SECTOR_CATEGORIES_SUMMARY)[number];
  isSelected: boolean;
  activeCount: number;
  onSelect: () => void;
}) {
  const borderClass = isSelected
    ? 'border-white ring-1 ring-white bg-[#151a26]'
    : 'border-slate-800/90 hover:border-slate-700';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl bg-[#10131b] border p-4 transition relative flex flex-col justify-between ${borderClass}`}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-base text-slate-400">{sec.icon}</span>
          {activeCount > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
              {activeCount} VIGENTES
            </span>
          ) : null}
        </div>
        <div className="text-sm font-bold text-white">{sec.title}</div>
        <div className="text-xs text-slate-400 mt-1">{sec.subtitle}</div>
      </div>
      <div className="text-[11px] text-slate-500 mt-3">
        {sec.tempCount} temporales · {sec.permCount} permanentes
      </div>
    </button>
  );
}

function MeasureEffectsList({ m }: { m: SectorMeasureCard }) {
  if (m.effectsBadges && m.effectsBadges.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {m.effectsBadges.map((b) => (
          <span
            key={b.label}
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
              b.isPositive
                ? 'bg-[#10231c] border-emerald-700/60 text-emerald-400'
                : 'bg-[#29131a] border-rose-800/60 text-rose-400'
            }`}
          >
            {b.label} {b.rangeText}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border bg-[#10231c] border-emerald-700/60 text-emerald-400">
        IPC {m.inflationEffectPp} pp
      </span>
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border bg-[#29131a] border-rose-800/60 text-rose-400">
        COSTO {m.fiscalCostPctGdp}% PIB
      </span>
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border bg-[#10231c] border-emerald-700/60 text-emerald-400">
        APROBACIÓN +{m.approvalEffectPp}%
      </span>
    </div>
  );
}

function MeasureMetadataTags({
  durationType,
  frequencyLabel,
  ideologyTag
}: {
  durationType: string;
  frequencyLabel?: string;
  ideologyTag?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      <span>{durationType}</span>
      {frequencyLabel ? <span>· {frequencyLabel}</span> : null}
      {ideologyTag ? <span>· {ideologyTag}</span> : null}
    </div>
  );
}

function MeasureActionButton({
  active,
  onToggle
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const btnClass = active
    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900'
    : 'bg-white hover:bg-slate-200 text-slate-950';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full py-2 rounded-xl text-xs font-bold transition shadow ${btnClass}`}
    >
      {active ? '✓ Medida Vigente (Clic para derogar)' : 'Adoptar'}
    </button>
  );
}

function MeasureItemCard({
  m,
  onToggle
}: {
  m: SectorMeasureCard;
  onToggle: () => void;
}) {
  const accentBorder = m.active ? 'border-l-emerald-500' : 'border-l-rose-500';

  return (
    <div
      className={`rounded-2xl bg-[#10131b] border border-slate-800/90 border-l-4 ${accentBorder} p-4 flex flex-col justify-between gap-3`}
    >
      <div className="space-y-2">
        <div className="text-sm font-bold text-white">{m.title}</div>
        <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

        <div className="text-[11px] text-slate-400 font-semibold pt-1">
          En 4 años (estimado):
        </div>
        <MeasureEffectsList m={m} />

        <MeasureMetadataTags
          durationType={m.durationType}
          frequencyLabel={m.frequencyLabel}
          ideologyTag={m.ideologyTag}
        />
      </div>

      <MeasureActionButton active={m.active} onToggle={onToggle} />
    </div>
  );
}

export function SectorMeasuresView({ measures, onToggleMeasure }: SectorMeasuresViewProps) {
  const [filterMode, setFilterMode] = useState<'TEMPORAL' | 'PERMANENTE'>('TEMPORAL');
  const [selectedSector, setSelectedSector] = useState<string>('PRECIOS');

  const sectorMeasures = measures.filter(
    (m) => selectedSector === 'TODOS' || m.sectorId === selectedSector
  );

  const tempCount = sectorMeasures.filter((m) => m.durationType === 'TEMPORAL').length;
  const permCount = sectorMeasures.filter((m) => m.durationType === 'PERMANENTE').length;

  const visibleMeasures = sectorMeasures.filter((m) => m.durationType === filterMode);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          ECONOMÍA · DECRETOS Y RESOLUCIONES
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Medidas</h1>
        <p className="text-xs text-slate-400 mt-1">
          Elegí un sector para ver e implementar medidas concretas temporales o estructurales con su impacto proyectado en IPC, actividad y aprobación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {SECTOR_CATEGORIES_SUMMARY.map((sec) => {
          const isSelected = selectedSector === sec.id;
          const activeCount = measures.filter((m) => m.sectorId === sec.id && m.active).length;
          return (
            <SectorCategoryItem
              key={sec.id}
              sec={sec}
              isSelected={isSelected}
              activeCount={activeCount}
              onSelect={() => setSelectedSector(isSelected ? 'TODOS' : sec.id)}
            />
          );
        })}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex p-1 rounded-xl bg-[#10131b] border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterMode('TEMPORAL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                filterMode === 'TEMPORAL' ? 'bg-white text-slate-950 shadow' : 'text-slate-300'
              }`}
            >
              Temporales ({tempCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('PERMANENTE')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                filterMode === 'PERMANENTE' ? 'bg-white text-slate-950 shadow' : 'text-slate-300'
              }`}
            >
              Permanentes ({permCount})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Sector actual: <strong className="text-white">{selectedSector}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleMeasures.map((m) => (
            <MeasureItemCard
              key={m.id}
              m={m}
              onToggle={() => onToggleMeasure(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
