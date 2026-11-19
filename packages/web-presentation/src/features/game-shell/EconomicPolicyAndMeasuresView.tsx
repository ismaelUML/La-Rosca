import React, { useMemo, useState } from 'react';
import type {
  EconomicLeverItem,
  PolicyAction,
  PoliticalCapitalState,
  SectorMeasureCard,
  SimulationState
} from '@argentina-sim/domain';
import { DEFAULT_POLITICAL_CAPITAL, previewNextMonthImpact } from '@argentina-sim/domain';
import { formatArNumber, formatArSigned } from '../../lib/formatters.js';
import { SECTOR_CATEGORIES_SUMMARY } from '@argentina-sim/infrastructure';
import { Check, Play, ScrollText, Search, Sliders } from 'lucide-react';
import { SectionPageHeader } from '@/components/ui/SectionPageHeader';
import { playUiSound } from '@/lib/gameFeedback';
import { ActionStripCard } from './ActionStripCard.js';
import { BcraIntradayMarketModal } from './BcraIntradayMarketModal.js';

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

function buildFineTuningAlert(state: SimulationState): string {
  if (state.centralBank.exchangeBrechaPct > 35) {
    return `Brecha en ${state.centralBank.exchangeBrechaPct.toFixed(0)}%: los exportadores retienen dólares y los precios remarcan al paralelo.`;
  }
  const monthlyRate = state.centralBank.policyRateAnnualPct / 12;
  if (monthlyRate < state.inflation.realMonthlyIpcPct) {
    return `Tasa real negativa (${monthlyRate.toFixed(1)}%/mes vs ${state.inflation.realMonthlyIpcPct.toFixed(1)}% inflación): la gente huye del peso hacia el dólar.`;
  }
  if (state.energy.cammesaMonthlyDeficitMillionUsd > 220) {
    return `Subsidios altos: CAMMESA le cuesta al Tesoro USD ${state.energy.cammesaMonthlyDeficitMillionUsd} M por mes.`;
  }
  return 'Variables monetarias y tarifarias en zona manejable para este mes.';
}

function PegStrip({ state, onDispatch }: { state: SimulationState; onDispatch: (action: PolicyAction) => void }) {
  const peg = state.centralBank.crawlingPegMonthlyPct;
  const isPegFast = peg > 2;
  const urgentLabel = state.centralBank.exchangeBrechaPct > 35 ? 'Brecha alta' : undefined;
  const tradeoff = isPegFast
    ? 'Subirlo rápido suma exportaciones y reservas, pero recalienta precios y baja el salario real.'
    : 'Anclarlo frena la inflación, pero atrasa el dólar y hace caer las reservas si hay brecha.';

  return (
    <ActionStripCard
      icon="FX"
      iconTileClass="bg-[#121c2b] text-sky-300"
      urgentLabel={urgentLabel}
      urgentClass="bg-amber-600 text-white"
      title={`Dólar oficial (${peg}%/mes)`}
      subtitle={`Oficial $${state.centralBank.officialDollarArs.toLocaleString('es-AR')} · Brecha ${state.centralBank.exchangeBrechaPct.toFixed(1)}%`}
      tradeoff={tradeoff}
      rightAction={{
        label: isPegFast ? 'Anclar 1%' : 'Acelerar 3%',
        sublabel: 'Ajuste rápido',
        variant: isPegFast ? 'done' : 'primary',
        onClick: () => onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: isPegFast ? 1 : 3 })
      }}
    >
      <input
        type="range"
        min={0}
        max={15}
        step={0.5}
        value={peg}
        onChange={(e) => onDispatch({ type: 'SET_CRAWLING_PEG', monthlyPct: Number(e.target.value) })}
        className="w-full accent-sky-400"
      />
    </ActionStripCard>
  );
}

function buildTnaCopy(isTnaTight: boolean) {
  if (isTnaTight) {
    return {
      tradeoff: 'Tasa alta seca pesos y calma el dólar paralelo, pero frena el crédito PyME y suma deuda del BCRA.',
      label: 'Bajar a 32%',
      sublabel: 'Reactivar',
      variant: 'pending' as const,
      targetRate: 32
    };
  }
  return {
    tradeoff: 'Tasa baja reactiva crédito y actividad, pero empuja a los ahorristas al dólar blue/MEP.',
    label: 'Subir a 48%',
    sublabel: 'Secar pesos',
    variant: 'primary' as const,
    targetRate: 48
  };
}

function TnaStrip({ state, onDispatch }: { state: SimulationState; onDispatch: (action: PolicyAction) => void }) {
  const tna = state.centralBank.policyRateAnnualPct;
  const copy = buildTnaCopy(tna > 40);
  const urgentLabel = tna / 12 < state.inflation.realMonthlyIpcPct ? 'Tasa negativa' : undefined;

  return (
    <ActionStripCard
      icon="TNA"
      iconTileClass="bg-[#231b10] text-[#f472b6]"
      urgentLabel={urgentLabel}
      urgentClass="bg-rose-700 text-white"
      title={`Tasa de política monetaria (${tna}% anual)`}
      subtitle={`Mensual ${(tna / 12).toFixed(1)}% · IPC ${state.inflation.realMonthlyIpcPct.toFixed(1)}%`}
      tradeoff={copy.tradeoff}
      rightAction={{
        label: copy.label,
        sublabel: copy.sublabel,
        variant: copy.variant,
        onClick: () => onDispatch({ type: 'SET_POLICY_RATE', annualRatePct: copy.targetRate })
      }}
    >
      <input
        type="range"
        min={10}
        max={120}
        step={2}
        value={tna}
        onChange={(e) => onDispatch({ type: 'SET_POLICY_RATE', annualRatePct: Number(e.target.value) })}
        className="w-full accent-amber-400"
      />
    </ActionStripCard>
  );
}

function TariffStrip({ state, onDispatch }: { state: SimulationState; onDispatch: (action: PolicyAction) => void }) {
  const coverage = state.energy.userTariffCoveragePct;
  const isTariffHigh = coverage > 65;
  const tradeoff = isTariffHigh
    ? 'Cobertura alta achica el déficit fiscal y baja riesgo país, pero pega en inflación y aprobación.'
    : 'Mantener subsidios cuida el bolsillo y la imagen, pero agranda el déficit y el riesgo de cortes.';

  return (
    <ActionStripCard
      icon="TAR"
      iconTileClass="bg-[#102219] text-emerald-300"
      title={`Cobertura tarifaria (${coverage}% del costo)`}
      subtitle={`Déficit CAMMESA: -USD ${state.energy.cammesaMonthlyDeficitMillionUsd} M/mes`}
      tradeoff={tradeoff}
      rightAction={{
        label: isTariffHigh ? 'Subsidiar 50%' : 'Sincerar 90%',
        sublabel: isTariffHigh ? 'Aliviar boleta' : 'Cortar déficit',
        variant: isTariffHigh ? 'pending' : 'done',
        onClick: () => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: isTariffHigh ? 50 : 90 })
      }}
    >
      <input
        type="range"
        min={20}
        max={100}
        step={5}
        value={coverage}
        onChange={(e) => onDispatch({ type: 'SET_TARIFF_COVERAGE', coveragePct: Number(e.target.value) })}
        className="w-full accent-emerald-400"
      />
    </ActionStripCard>
  );
}

function FineTuningSection({
  state,
  onDispatch
}: {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}) {
  const [bcraOpen, setBcraOpen] = useState(false);

  return (
    <div className="hoi-panel rounded-sm overflow-hidden">
      <div className="hoi-header-crimson px-5 py-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5EFE6]">
            Mesa de Dinero (BCRA) y Tarifas (Energía)
          </h3>
          <p className="text-[11px] font-mono text-rose-100/75">
            PARÁMETROS DE DEVALUACIÓN, TASA MONETARIA Y SUBSIDIOS
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            setBcraOpen(true);
          }}
          className="hoi-btn-gold px-3 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider"
        >
          Simular Rueda Intradía MULC (10 a 15 hs)
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        <PegStrip state={state} onDispatch={onDispatch} />
        <TnaStrip state={state} onDispatch={onDispatch} />
        <TariffStrip state={state} onDispatch={onDispatch} />

        <div className="rounded-sm bg-[#0e070b] border border-white/15 px-3.5 py-2.5 text-xs text-slate-300">
          <span className="font-mono font-bold uppercase text-[#EB3F7D] mr-1.5">ALERTA:</span>
          {buildFineTuningAlert(state)}
        </div>
      </div>

      <BcraIntradayMarketModal
        open={bcraOpen}
        state={state}
        onDispatch={onDispatch}
        onClose={() => setBcraOpen(false)}
      />
    </div>
  );
}

function MacroPreviewPill({
  label,
  value,
  delta,
  good
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}) {
  const tone = good ? 'text-emerald-300' : 'text-rose-400';
  return (
    <div className="bg-[#0b0508] border border-white/10 px-3 py-2 rounded-sm">
      <div className="text-[10px] font-mono uppercase text-slate-400">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <span className="font-display text-lg text-[#F5EFE6]">{value}</span>
        <span className={`text-[11px] font-mono font-bold ${tone}`}>{delta}</span>
      </div>
    </div>
  );
}

function MacroNextMonthPreviewBar({ state }: { state: SimulationState }) {
  const preview = useMemo(() => previewNextMonthImpact(state), [state]);
  return (
    <div className="hoi-panel rounded-sm p-4 border-l-2 border-l-[#EB3F7D] space-y-2.5">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EB3F7D]">
        PROYECCIÓN EN VIVO SI CERRÁS EL MES ASÍ (SIMULADOR EN MEMORIA)
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MacroPreviewPill
          label="IPC Mensual est."
          value={`${formatArNumber(preview.nextIpcPct, 1)} %`}
          delta={`${formatArSigned(preview.ipcDeltaPp, 1)} pp`}
          good={preview.ipcDeltaPp <= 0}
        />
        <MacroPreviewPill
          label="Reservas Netas est."
          value={`US$ ${formatArNumber(preview.nextNetReservesUsdB, 1)} MM`}
          delta={`${formatArSigned(preview.reservesDeltaUsdB, 1)} MM`}
          good={preview.reservesDeltaUsdB >= 0}
        />
        <MacroPreviewPill
          label="Riesgo País est."
          value={`${preview.nextRiskPb} pb`}
          delta={`${preview.riskDeltaPb >= 0 ? '+' : ''}${preview.riskDeltaPb} pb`}
          good={preview.riskDeltaPb <= 0}
        />
        <MacroPreviewPill
          label="Aprobación est."
          value={`${formatArNumber(preview.nextApprovalPct, 1)} %`}
          delta={`${formatArSigned(preview.approvalDeltaPp, 1)} pp`}
          good={preview.approvalDeltaPp >= 0}
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
      <SectionPageHeader
        eyebrow="ECONOMÍA · ORIENTACIÓN GENERAL"
        title="Política económica"
        description="Las palancas generales orientan la economía de -2 (contractivo / ortodoxo) a +2 (expansivo / heterodoxo) y ajustan las ecuaciones del BCRA, Tesoro y CAMMESA."
        icon={<Sliders className="w-3.5 h-3.5" />}
        rightSlot={
          <button
            type="button"
            onClick={() => {
              playUiSound('turn');
              onAdvanceTurn();
            }}
            className="hoi-btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-sm font-extrabold text-xs uppercase tracking-wider shadow transition active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ejecutar Mes Macroeconómico</span>
          </button>
        }
      />

      <MacroNextMonthPreviewBar state={state} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levers.map((lever) => {
          const labelIdx = lever.level + 2;
          return (
            <div
              key={lever.id}
              className="hoi-panel rounded-sm p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-100">{lever.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lever.description}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#0b0508] border border-[#EB3F7D]/55 text-[#f472b6] shrink-0">
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
                      onClick={() => {
                        playUiSound('select');
                        onChangeLever(lever.id, lv);
                      }}
                      className={`py-1.5 rounded-sm text-xs font-mono font-bold transition border ${
                        isSelected
                          ? 'bg-[#EB3F7D] text-[#090407] border-[#EB3F7D] shadow'
                          : 'bg-[#0b0508] text-slate-400 border-white/15 hover:text-white hover:border-[#EB3F7D]/55'
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
  politicalCapital?: PoliticalCapitalState;
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
    ? 'border-[#EB3F7D] bg-[#1c0e16]'
    : 'border-white/15 bg-[#130a0f] hover:border-[#EB3F7D]/55';

  return (
    <button
      type="button"
      onClick={() => {
        playUiSound('tab');
        onSelect();
      }}
      className={`text-left rounded-sm border p-4 transition relative flex flex-col justify-between ${borderClass}`}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#EB3F7D]">{sec.id}</span>
          {activeCount > 0 ? (
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#0f291e] border border-emerald-700/70 text-emerald-300">
              {activeCount} VIGENTES
            </span>
          ) : null}
        </div>
        <div className="text-sm font-bold text-slate-100">{sec.title}</div>
        <div className="text-xs text-slate-400 mt-1">{sec.subtitle}</div>
      </div>
      <div className="text-[11px] font-mono text-slate-500 mt-3">
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

function resolveActiveTemporalChip(m: SectorMeasureCard): { text: string; tone: string } | null {
  if (!m.active || m.durationType !== 'TEMPORAL') return null;
  const left = m.remainingMonths ?? 6;
  return {
    text: `VENCE EN ${left} M.`,
    tone: 'bg-[#EB3F7D]/20 border-[#EB3F7D]/60 text-[#EFE9DA]'
  };
}

function resolveLifecycleChipData(m: SectorMeasureCard): { text: string; tone: string } | null {
  const activeChip = resolveActiveTemporalChip(m);
  if (activeChip) return activeChip;
  const cd = m.cooldownRemainingMonths ?? 0;
  if (m.active || cd <= 0) return null;
  return {
    text: `ENFRIAMIENTO ${cd} M.`,
    tone: 'bg-rose-950/70 border-rose-700/70 text-rose-300'
  };
}

function MeasureLifecycleChip({ m }: { m: SectorMeasureCard }) {
  const data = resolveLifecycleChipData(m);
  if (!data) return null;
  return (
    <span className={`px-2 py-0.5 rounded-sm border font-mono ${data.tone}`}>
      {data.text}
    </span>
  );
}

function MeasureMetadataTags({ m }: { m: SectorMeasureCard }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      <span>{m.durationType}</span>
      {m.frequencyLabel ? <span>· {m.frequencyLabel}</span> : null}
      {m.ideologyTag ? <span>· {m.ideologyTag}</span> : null}
      <MeasureLifecycleChip m={m} />
    </div>
  );
}

function resolveMeasureButtonLabel(active: boolean, cooldown: number, hasCapital: boolean): string {
  if (active) return 'Medida Vigente (Derogar)';
  if (cooldown > 0) return `En enfriamiento (${cooldown} m.)`;
  if (!hasCapital) return 'Sin capital político este mes';
  return 'Adoptar Medida (1 dec.)';
}

function resolveMeasureButtonStyle(active: boolean, blocked: boolean): string {
  if (active) return 'bg-[#0f291e] border border-emerald-700/70 text-emerald-300 hover:bg-[#153829]';
  if (blocked) return 'bg-[#12090d] border border-white/10 text-slate-500 cursor-not-allowed';
  return 'hoi-btn-gold';
}

function MeasureActionButton({
  active,
  cooldown,
  hasCapital,
  onToggle
}: {
  active: boolean;
  cooldown: number;
  hasCapital: boolean;
  onToggle: () => void;
}) {
  const blocked = !active && (cooldown > 0 || !hasCapital);
  const btnClass = resolveMeasureButtonStyle(active, blocked);

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => {
        playUiSound('select');
        onToggle();
      }}
      className={`w-full py-2 rounded-sm text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition ${btnClass}`}
    >
      {active ? <Check className="w-3.5 h-3.5" /> : null}
      <span>{resolveMeasureButtonLabel(active, cooldown, hasCapital)}</span>
    </button>
  );
}

function MeasureItemCard({
  m,
  hasCapital,
  onToggle
}: {
  m: SectorMeasureCard;
  hasCapital: boolean;
  onToggle: () => void;
}) {
  const accentBorder = m.active ? 'border-l-emerald-500' : 'border-l-[#EB3F7D]';
  const cooldown = m.cooldownRemainingMonths ?? 0;

  return (
    <div
      className={`hoi-panel rounded-sm border-l-4 ${accentBorder} p-4 flex flex-col justify-between gap-3`}
    >
      <div className="space-y-2">
        <div className="text-sm font-bold text-slate-100">{m.title}</div>
        <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

        <div className="text-[11px] text-slate-400 font-semibold pt-1">
          En 4 años (estimado):
        </div>
        <MeasureEffectsList m={m} />

        <MeasureMetadataTags m={m} />
      </div>

      <MeasureActionButton
        active={m.active}
        cooldown={cooldown}
        hasCapital={hasCapital}
        onToggle={onToggle}
      />
    </div>
  );
}

function matchesMeasureQuery(measure: SectorMeasureCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return measure.title.toLowerCase().includes(q) || measure.description.toLowerCase().includes(q);
}

function matchesMeasureFilter(measure: SectorMeasureCard, sector: string, query: string): boolean {
  const sectorOk = sector === 'TODOS' || measure.sectorId === sector;
  return sectorOk && matchesMeasureQuery(measure, query);
}

export function SectorMeasuresView({
  measures,
  politicalCapital,
  onToggleMeasure
}: SectorMeasuresViewProps) {
  const [filterMode, setFilterMode] = useState<'TEMPORAL' | 'PERMANENTE'>('TEMPORAL');
  const [selectedSector, setSelectedSector] = useState<string>('PRECIOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cap = politicalCapital ?? DEFAULT_POLITICAL_CAPITAL;
  const hasCapital = cap.remaining > 0;
  const sectorMeasures = measures.filter((m) => matchesMeasureFilter(m, selectedSector, searchQuery));

  const tempCount = sectorMeasures.filter((m) => m.durationType === 'TEMPORAL').length;
  const permCount = sectorMeasures.filter((m) => m.durationType === 'PERMANENTE').length;

  const visibleMeasures = sectorMeasures.filter((m) => m.durationType === filterMode);

  const handleClearActiveInSector = () => {
    const toDeactivate = visibleMeasures.filter((m) => m.active);
    for (const m of toDeactivate) {
      onToggleMeasure(m.id);
    }
  };

  const activeFiscalSum = measures
    .filter((m) => m.active)
    .reduce((acc, m) => acc + m.fiscalCostPctGdp, 0);
  const activeMeasureCount = measures.filter((m) => m.active).length;

  return (
    <div className="space-y-6">
      <SectionPageHeader
        eyebrow="ECONOMÍA · DECRETOS Y RESOLUCIONES"
        title="Medidas"
        description="Elegí un sector para firmar decretos temporales (vencen a los 6 meses con rebote y enfriamiento) o reformas permanentes. Cada firma consume 1 punto de capital político mensual."
        icon={<ScrollText className="w-3.5 h-3.5" />}
      />

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex p-1 rounded-sm bg-[#0b0508] border border-white/15">
            <button
              type="button"
              onClick={() => setFilterMode('TEMPORAL')}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition ${
                filterMode === 'TEMPORAL' ? 'bg-[#EB3F7D]/20 text-[#EFE9DA] border border-[#EB3F7D]' : 'text-slate-300'
              }`}
            >
              Temporales ({tempCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('PERMANENTE')}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition ${
                filterMode === 'PERMANENTE' ? 'bg-[#EB3F7D]/20 text-[#EFE9DA] border border-[#EB3F7D]' : 'text-slate-300'
              }`}
            >
              Permanentes ({permCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-sm bg-[#160a10] border border-[#EB3F7D]/60 text-xs font-mono font-bold text-[#EFE9DA]">
              Capital: <strong className="text-[#EB3F7D]">{cap.remaining}/{cap.maxPerMonth}</strong> dec.
            </span>
            <label className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar entre ${measures.length} medidas...`}
                className="pl-8 pr-3 py-1.5 w-52 rounded-sm bg-[#0b0508] border border-white/15 focus:border-[#EB3F7D] focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 font-mono"
              />
            </label>
            <span className="text-xs font-mono text-slate-400 mr-1">
              {activeMeasureCount} activas · Costo{' '}
              <strong className={activeFiscalSum > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                {activeFiscalSum.toFixed(2).replace('.', ',')} % PBI
              </strong>
            </span>
            <button
              type="button"
              onClick={handleClearActiveInSector}
              className="px-3 py-1.5 rounded-sm bg-[#0e070b] hover:bg-[#1c0e16] border border-white/15 text-xs font-bold text-slate-300 transition"
            >
              Derogar sector
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleMeasures.map((m) => (
            <MeasureItemCard
              key={m.id}
              m={m}
              hasCapital={hasCapital}
              onToggle={() => onToggleMeasure(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
