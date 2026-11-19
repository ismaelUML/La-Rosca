import React, { useState } from 'react';
import { BookOpen, History, Scale, Trophy, X } from 'lucide-react';
import type { SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';
import { ViewportModalPortal } from '@/components/ui/ViewportModalPortal';

// Comparador Historico de Mandatos (1991-2031) y Veredicto del Libro de Historia 2045.
// Contrasta los indicadores actuales de tu gobierno contra 4 etapas reales de la economia argentina.

interface HistoricalEraBenchmark {
  id: string;
  title: string;
  period: string;
  summary: string;
  annualInflationPct: number;
  gdpGrowthPct: number;
  povertyPct: number;
  unemploymentPct: number;
  countryRiskPb: number;
  primaryBalancePctGdp: number;
}

const HISTORICAL_ERAS: HistoricalEraBenchmark[] = [
  {
    id: 'CONVERTIBILIDAD_90S',
    title: 'Convertibilidad y Reformas Estructurales',
    period: '1991 – 1998',
    summary: 'Estabilidad de precios e inversión por privatizaciones, con apreciación cambiaria y suba del desempleo.',
    annualInflationPct: 1.8,
    gdpGrowthPct: 5.4,
    povertyPct: 26.0,
    unemploymentPct: 14.8,
    countryRiskPb: 480,
    primaryBalancePctGdp: 0.6
  },
  {
    id: 'SUPERAVITS_GEMELOS_2003',
    title: 'Rebote Poscrisis y Superávits Gemelos',
    period: '2003 – 2007',
    summary: 'Fuerte rebote industrial y termos de intercambio récord de la soja, con inflación incipiente.',
    annualInflationPct: 9.8,
    gdpGrowthPct: 8.2,
    povertyPct: 31.5,
    unemploymentPct: 9.4,
    countryRiskPb: 390,
    primaryBalancePctGdp: 3.2
  },
  {
    id: 'ESTANFLACION_CEPO_2012',
    title: 'Estanflación, Cepo y Emisión Monetaria',
    period: '2012 – 2023',
    summary: 'Década de estancamiento del PBI per cápita, brecha cambiaria crónica y aceleración inflacionaria.',
    annualInflationPct: 94.0,
    gdpGrowthPct: -0.4,
    povertyPct: 41.8,
    unemploymentPct: 7.8,
    countryRiskPb: 1850,
    primaryBalancePctGdp: -2.8
  },
  {
    id: 'AJUSTE_SHOCK_2024',
    title: 'Ancla Fiscal y Desinflación de Shock',
    period: '2024 – 2026',
    summary: 'Superávit financiero primario, compresión del riesgo país y recomposición selectiva de sectores extractivos.',
    annualInflationPct: 34.0,
    gdpGrowthPct: 2.8,
    povertyPct: 36.5,
    unemploymentPct: 7.6,
    countryRiskPb: 740,
    primaryBalancePctGdp: 1.7
  }
];

function computeLegacyVerdict(state: SimulationState): {
  score: number;
  rankLabel: string;
  chapterTitle: string;
  narrative: string;
} {
  const infScore = Math.max(0, 35 - state.inflation.interannualIpcPct * 0.45);
  const growthScore = Math.max(0, Math.min(25, (state.gdpGrowthAnnualPct + 2) * 3.8));
  const socialScore = Math.max(0, 25 - Math.max(0, state.inflation.povertyCbtPct - 25) * 0.8);
  const fiscalScore = Math.max(0, Math.min(15, (state.treasury.primaryResultPctGdp + 1.5) * 4.5));
  const score = Math.round(Math.min(99, infScore + growthScore + socialScore + fiscalScore));

  if (score >= 72) {
    return {
      score,
      rankLabel: 'ESTADISTA FUNDACIONAL (RANGO S)',
      chapterTitle: '«El Milagro de la Estabilización y el Despegue Productivo (2027-2031)»',
      narrative:
        'Los manuales de historia económica de 2045 estudian tu mandato como el punto de quiebre que enterró la inflación crónica, consolidó el superávit energético y perforó el piso estructural de pobreza.'
    };
  }
  if (score >= 48) {
    return {
      score,
      rankLabel: 'PILOTO DE TORMENTAS (RANGO B)',
      chapterTitle: '«Los Años de la Transición Inconclusa y la Rosca Permanente»',
      narrative:
        'Las crónicas históricas destacan que lograste evitar una hiperinflación y sostener la gobernabilidad en un Congreso fragmentado, aunque las tensiones distributivas quedaron abiertas para la década siguiente.'
    };
  }
  return {
    score,
    rankLabel: 'MANDATO EN CRISIS CRÓNICA (RANGO D)',
    chapterTitle: '«El Laberinto de la Estanflación y la Fragilidad Institucional»',
    narrative:
        'La historiografía recuerda tu gestión marcada por corridas cambiarias recurrentes, desgaste del salario real y bloqueos cruzados entre Casa Rosada, los gobernadores y el Palacio Legislativo.'
  };
}

function MetricComparisonRow({
  label,
  unit,
  playerVal,
  eraVal,
  invertGood
}: {
  label: string;
  unit: string;
  playerVal: number;
  eraVal: number;
  invertGood?: boolean;
}) {
  const diff = Number((playerVal - eraVal).toFixed(1));
  const isBetter = invertGood ? diff <= 0 : diff >= 0;
  const badgeCls = isBetter ? 'text-emerald-400' : 'text-rose-400';
  const sign = diff > 0 ? '+' : '';

  return (
    <div className="p-2.5 rounded-sm bg-[#11080d] border border-white/10 flex items-center justify-between text-xs font-mono">
      <span className="text-slate-300 font-bold">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-[#EFE9DA]">
          Tu Gestión: <strong>{playerVal.toFixed(1)}{unit}</strong>
        </span>
        <span className="text-slate-400">
          Hito: <strong>{eraVal.toFixed(1)}{unit}</strong>
        </span>
        <span className={`font-extrabold w-20 text-right ${badgeCls}`}>
          ({sign}{diff}{unit})
        </span>
      </div>
    </div>
  );
}

export function HistoricalMandateComparatorModal({
  open,
  state,
  onClose
}: {
  open: boolean;
  state: SimulationState;
  onClose: () => void;
}) {
  const [selectedEraId, setSelectedEraId] = useState<string>(HISTORICAL_ERAS[0]!.id);

  if (!open) return null;

  const era = HISTORICAL_ERAS.find((e) => e.id === selectedEraId) ?? HISTORICAL_ERAS[0]!;
  const legacy = computeLegacyVerdict(state);

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto my-auto hoi-panel rounded-lg p-4 sm:p-6 space-y-4 border border-[#EB3F7D]/55 shadow-2xl">
        <div className="hoi-header-steel p-3.5 rounded-sm flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f472b6] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#EB3F7D]" />
              ARCHIVO GENERAL DE LA NACIÓN · COMPARADOR HISTÓRICO DE MANDATOS (1991–2031)
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wide text-[#F5EFE6] mt-0.5">
              Tu Presidencia Frente a la Historia Económica Argentina
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {HISTORICAL_ERAS.map((item) => {
            const active = item.id === era.id;
            const cls = active
              ? 'bg-[#EB3F7D]/20 text-[#F5EFE6] border-[#EB3F7D]'
              : 'bg-[#0b0508] text-slate-400 border-white/15 hover:text-white';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  setSelectedEraId(item.id);
                }}
                className={`px-3 py-1.5 rounded-sm border text-xs font-mono font-bold transition ${cls}`}
              >
                {item.period} · {item.title}
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-sm bg-[#0b0508] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#f472b6]">{era.period}</span>
            <h4 className="text-sm font-serif font-bold text-slate-100">{era.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{era.summary}</p>
          </div>
          <Scale className="w-6 h-6 text-[#EB3F7D] shrink-0 hidden sm:block" />
        </div>

        <div className="space-y-2">
          <MetricComparisonRow
            label="Inflación Interanual (IPC)"
            unit="%"
            playerVal={state.inflation.interannualIpcPct}
            eraVal={era.annualInflationPct}
            invertGood
          />
          <MetricComparisonRow
            label="Crecimiento Anual del PBI"
            unit="%"
            playerVal={state.gdpGrowthAnnualPct}
            eraVal={era.gdpGrowthPct}
          />
          <MetricComparisonRow
            label="Pobreza Urbana (INDEC CBT)"
            unit="%"
            playerVal={state.inflation.povertyCbtPct}
            eraVal={era.povertyPct}
            invertGood
          />
          <MetricComparisonRow
            label="Desempleo Abierto (EPH)"
            unit="%"
            playerVal={state.labor.unemploymentPct}
            eraVal={era.unemploymentPct}
            invertGood
          />
          <MetricComparisonRow
            label="Riesgo País (EMBI+ J.P. Morgan)"
            unit=" pb"
            playerVal={state.countryRiskEmbiPb}
            eraVal={era.countryRiskPb}
            invertGood
          />
          <MetricComparisonRow
            label="Resultado Fiscal Primario"
            unit="% PBI"
            playerVal={state.treasury.primaryResultPctGdp}
            eraVal={era.primaryBalancePctGdp}
          />
        </div>

        <div className="hoi-panel rounded-sm p-4 bg-[#090407] border border-[#EB3F7D]/55 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="text-xs font-serif font-bold uppercase text-[#EFE9DA] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#EB3F7D]" />
              Proyección del Libro de Historia Argentina (Edición 2045)
            </span>
            <span className="px-2.5 py-0.5 rounded-sm bg-[#1c0e16] border border-[#EB3F7D] text-[10px] font-mono font-extrabold text-[#EFE9DA] flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#EB3F7D]" />
              {legacy.rankLabel} · Puntaje {legacy.score}/100
            </span>
          </div>
          <div className="text-sm font-serif font-bold text-slate-100">{legacy.chapterTitle}</div>
          <p className="text-xs text-slate-300 leading-relaxed">{legacy.narrative}</p>
        </div>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
