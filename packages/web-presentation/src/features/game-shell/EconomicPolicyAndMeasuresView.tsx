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

interface FineTuningCardProps {
  title: string;
  badgeText: string;
  badgeColorClass: string;
  accentClass: string;
  value: number;
  min: number;
  max: number;
  step: number;
  summary: string;
  positiveBadges: string[];
  negativeBadges: string[];
  onChange: (val: number) => void;
}

function FineTuningCard({
  title,
  badgeText,
  badgeColorClass,
  accentClass,
  value,
  min,
  max,
  step,
  summary,
  positiveBadges,
  negativeBadges,
  onChange
}: FineTuningCardProps) {
  return (
    <div className="p-4 rounded-xl bg-[#0b0e15] border border-slate-800 space-y-3 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-white leading-tight">{title}</span>
          <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 ${badgeColorClass}`}>
            {badgeText}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{summary}</p>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full ${accentClass}`}
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>mín {min}%</span>
          <span>actual: {value}%</span>
          <span>máx {max}%</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Efectos estimados en el país:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {positiveBadges.map((b) => (
            <span
              key={b}
              className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-[#0f241a] border-emerald-800/80 text-emerald-400 shadow-sm"
            >
              {b}
            </span>
          ))}
          {negativeBadges.map((b) => (
            <span
              key={b}
              className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-[#2b1218] border-rose-900/80 text-rose-400 shadow-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function resolvePegEffects(peg: number): { pos: string[]; neg: string[] } {
  if (peg > 2) {
    return {
      pos: ['EXPORTACIONES +1,2', 'RESERVAS BCRA +0,8', 'COMPETITIVIDAD +2'],
      neg: ['INFLACIÓN MENSUAL +0,7', 'SALARIO REAL -1,5', 'APROBACIÓN -1,2']
    };
  }
  return {
    pos: ['INFLACIÓN MENSUAL -0,6', 'APROBACIÓN +0,8', 'PODER ADQUISITIVO +1'],
    neg: ['RESERVAS BCRA -1,5', 'BRECHA CAMBIARIA +2,0', 'SILOBOLSAS +1,5 M TON']
  };
}

function resolveTnaEffects(tna: number): { pos: string[]; neg: string[] } {
  if (tna > 40) {
    return {
      pos: ['DÓLAR PARALELO -1,5', 'INFLACIÓN -0,4', 'DEPÓSITOS EN PESOS +2,0'],
      neg: ['CRÉDITO PyME -2,5', 'ACTIVIDAD INDUSTRIAL -1,0', 'DÉFICIT CUASIFISCAL +1,2']
    };
  }
  return {
    pos: ['CRÉDITO PyME +2,0', 'ACTIVIDAD INDUSTRIAL +1,2', 'INVERSIÓN +1,0'],
    neg: ['DÓLAR PARALELO +2,0', 'BRECHA CAMBIARIA +3,0', 'INFLACIÓN +0,7']
  };
}

function resolveCammesaEffects(coverage: number): { pos: string[]; neg: string[] } {
  if (coverage > 60) {
    return {
      pos: ['GASTO PRIMARIO -0,8', 'RESULTADO FISCAL +0,8 % PIB', 'RIESGO PAÍS -30'],
      neg: ['INFLACIÓN MENSUAL +0,6', 'APROBACIÓN -2,5', 'SALARIO REAL -1,8']
    };
  }
  return {
    pos: ['APROBACIÓN +2,0', 'INFLACIÓN MENSUAL -0,4', 'CONSUMO PRIVADO +1,0'],
    neg: ['GASTO PRIMARIO +1,2', 'DÉFICIT FISCAL -1,2 % PIB', 'RIESGO PAÍS +45']
  };
}

function FineTuningSection({
  state,
  onDispatch
}: {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}) {
  const peg = state.centralBank.crawlingPegMonthlyPct;
  const tna = state.centralBank.policyRateAnnualPct;
  const coverage = state.energy.userTariffCoveragePct;

  const { pos: pegPos, neg: pegNeg } = resolvePegEffects(peg);
  const { pos: tnaPos, neg: tnaNeg } = resolveTnaEffects(tna);
  const { pos: cammesaPos, neg: cammesaNeg } = resolveCammesaEffects(coverage);

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          Calibración Fina de Mesa de Dinero BCRA y Secretaría de Energía
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Ajustá la velocidad de devaluación, la tasa monetaria de los bancos y los subsidios energéticos. Cada perilla tiene costos y beneficios directos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <FineTuningCard
          title="Crawling Peg Oficial Mensual"
          badgeText={`${peg}% mes`}
          badgeColorClass="text-sky-400"
          accentClass="accent-sky-400"
          value={peg}
          min={0}
          max={15}
          step={0.5}
          summary="Ritmo al que el BCRA devalúa el dólar oficial mayorista frente a la inflación."
          positiveBadges={pegPos}
          negativeBadges={pegNeg}
          onChange={(val) => onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: val })}
        />

        <FineTuningCard
          title="Tasa de Política Monetaria (TNA)"
          badgeText={`${tna}% TNA`}
          badgeColorClass="text-amber-400"
          accentClass="accent-amber-400"
          value={tna}
          min={10}
          max={120}
          step={2}
          summary="Tasa que paga el Central a los bancos para aspirar pesos y remunerar los plazos fijos."
          positiveBadges={tnaPos}
          negativeBadges={tnaNeg}
          onChange={(val) => onDispatch({ type: 'SET_POLICY_RATE', annualRatePct: val })}
        />

        <FineTuningCard
          title="Cobertura Tarifaria CAMMESA"
          badgeText={`${coverage}% costo`}
          badgeColorClass="text-emerald-400"
          accentClass="accent-emerald-400"
          value={coverage}
          min={20}
          max={100}
          step={5}
          summary="Porcentaje del costo de generar electricidad y gas que pagan los usuarios en su boleta."
          positiveBadges={cammesaPos}
          negativeBadges={cammesaNeg}
          onChange={(val) => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: val })}
        />
      </div>
    </div>
  );
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

      <FineTuningSection state={state} onDispatch={onDispatch} />
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

function resolveFiscalBadgeClass(cost: number): string {
  return cost <= 0
    ? 'bg-[#0f241a] border-emerald-800/80 text-emerald-400'
    : 'bg-[#2b1218] border-rose-900/80 text-rose-400';
}

function formatFiscalResultText(cost: number): string {
  const sign = cost <= 0 ? '+' : '-';
  return `RESULTADO FISCAL: ${sign}${Math.abs(cost)} % DEL PBI POR AÑO`;
}

function MeasureEffectsList({ m }: { m: SectorMeasureCard }) {
  const fiscalClass = resolveFiscalBadgeClass(m.fiscalCostPctGdp);
  const fiscalText = formatFiscalResultText(m.fiscalCostPctGdp);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex flex-wrap gap-1.5">
        {m.effectsBadges?.map((b) => (
          <span
            key={b.label}
            className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              b.isPositive
                ? 'bg-[#0f241a] border-emerald-800/80 text-emerald-400'
                : 'bg-[#2b1218] border-rose-900/80 text-rose-400'
            }`}
          >
            {b.label} {b.rangeText}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${fiscalClass}`}>
          {fiscalText}
        </span>
        {m.ideologyTag ? (
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-[#0f241a] border-emerald-800/80 text-emerald-400">
            ACORDE A TU ESPACIO
          </span>
        ) : null}
      </div>
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
