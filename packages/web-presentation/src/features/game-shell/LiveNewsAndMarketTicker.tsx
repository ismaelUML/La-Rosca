import React, { useEffect, useState } from 'react';
import { Activity, Radio, Tv } from 'lucide-react';
import type { CampaignSimulationState, SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';

// Zocalo Dinamico de Television Argentina ("Placa Roja / Ultimo Momento")
// y Cinta Financiera en Vivo (Bloomberg / Ambito / BCRA) acoplado al pie de pantalla.

function buildGovBreakingHeadlines(state: SimulationState): string[] {
  const list: string[] = [];
  if (state.labor.activeNationalStrike) {
    list.push('ÚLTIMO MOMENTO · PARO NACIONAL DE LA CGT CON CORTES EN ACCESOS A CABA Y TRANSPORTE');
  }
  if (state.inflation.realMonthlyIpcPct >= 5.5) {
    list.push(
      `ALERTA INFLACIONARIA · EL IPC MENSUAL MARCA ${state.inflation.realMonthlyIpcPct}% Y RECALIENTA PARITARIAS`
    );
  }
  if (state.countryRiskEmbiPb >= 1200) {
    list.push(
      `TENSIÓN EN LA CITY · EL RIESGO PAÍS ESCALA A ${state.countryRiskEmbiPb} PUNTOS BÁSICOS Y PRESIONA AL CCL`
    );
  }
  list.push(
    `CASA ROSADA · APROBACIÓN DE GESTIÓN EN ${state.publicOpinion.managementApprovalPct}% · RESERVAS NETAS USD ${state.centralBank.netLiquidReservesBillionUsd}B`,
    `MERCADO CAMBIARIO · DÓLAR OFICIAL $${state.centralBank.officialDollarArs} · CCL $${state.centralBank.cclDollarArs} (BRECHA ${state.centralBank.exchangeBrechaPct.toFixed(0)}%)`,
    `ENERGÍA Y VACA MUERTA · COBERTURA TARIFARIA AL ${state.energy.userTariffCoveragePct}% · RIESGO PAÍS ${state.countryRiskEmbiPb} PB`
  );
  return list;
}

function buildCampaignBreakingHeadlines(campaign: CampaignSimulationState): string[] {
  return [
    `CAMPAÑA 2027 · ${campaign.stage.formattedDate.toUpperCase()} · ${campaign.candidateName.toUpperCase()} MIDE ${campaign.votingIntention.intencionVotoGeneral.toFixed(1)}% EN ENCUESTAS NACIONALES`,
    `INTERNA Y TERRITORIO · PISO ELECTORAL EN ${campaign.votingIntention.piso.toFixed(1)}% Y TECHO EN ${campaign.votingIntention.techo.toFixed(1)}% · CAJA DE CAMPAÑA $${campaign.budgetArgentums.toFixed(1)}M`,
    `IMAGEN PÚBLICA · POSITIVA ${campaign.image.imagenPositiva.toFixed(1)}% VS NEGATIVA ${campaign.image.imagenNegativa.toFixed(1)}% · APOYO PARTIDARIO ${campaign.attributes.apoyoPartidario.toFixed(0)}/100`
  ];
}

function isRedAlertActive(govState?: SimulationState): boolean {
  if (!govState) return false;
  return (
    govState.labor.activeNationalStrike ||
    govState.inflation.realMonthlyIpcPct >= 6.0 ||
    govState.countryRiskEmbiPb >= 1350
  );
}

function MarketQuotesStrip({ govState }: { govState?: SimulationState }) {
  const ofi = govState ? govState.centralBank.officialDollarArs : 1380;
  const ccl = govState ? govState.centralBank.cclDollarArs : 1590;
  const embi = govState ? govState.countryRiskEmbiPb : 695;
  const res = govState ? govState.centralBank.netLiquidReservesBillionUsd : 5.4;

  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
      <span className="text-slate-300">
        OFICIAL A3500: <strong className="text-white">${ofi}</strong>
      </span>
      <span className="text-slate-300">
        DÓLAR CCL: <strong className="text-amber-300">${ccl}</strong>
      </span>
      <span className="text-slate-300">
        EMBI+ JPM: <strong className="text-rose-300">{embi} pb</strong>
      </span>
      <span className="text-slate-300">
        RES. NETAS: <strong className="text-emerald-400">USD {res}B</strong>
      </span>
      <span className="text-slate-300 hidden md:inline">
        SOJA ROSARIO: <strong className="text-emerald-300">USD 418/tn</strong>
      </span>
      <span className="text-slate-300 hidden lg:inline">
        BRENT VACA MUERTA: <strong className="text-sky-300">USD 76,4/bbl</strong>
      </span>
    </div>
  );
}

function resolveTickerBarTheme(redAlert: boolean, mode: 'TV' | 'MARKET') {
  if (mode === 'MARKET') {
    return {
      barCls: 'bg-[#070b12]/95 border-t border-[#263142]',
      badgeCls: 'bg-emerald-900/80 text-emerald-200 border-emerald-600',
      badgeText: 'PIZARRA BCRA / BYMA'
    };
  }
  if (redAlert) {
    return {
      barCls: 'bg-gradient-to-r from-[#6b0505] via-[#8b0000] to-[#4c0505] border-t border-amber-400/70',
      badgeCls: 'bg-white text-rose-900 border-white',
      badgeText: 'PLACA ROJA · URGENTE'
    };
  }
  return {
    barCls: 'bg-[#090e17]/95 border-t border-[#8a6d33]/70',
    badgeCls: 'bg-amber-500/20 text-amber-200 border-[#b89342]',
    badgeText: 'EN VIVO · EL TICKER DE LA ROSCA'
  };
}

function resolveHeadlinesList(
  govState?: SimulationState,
  campaignState?: CampaignSimulationState
): string[] {
  if (govState) return buildGovBreakingHeadlines(govState);
  if (campaignState) return buildCampaignBreakingHeadlines(campaignState);
  return ['TRANSMISIÓN OFICIAL EN VIVO'];
}

export function LiveNewsAndMarketTicker({
  govState,
  campaignState
}: {
  govState?: SimulationState;
  campaignState?: CampaignSimulationState;
}) {
  const [mode, setMode] = useState<'TV' | 'MARKET'>('TV');
  const [idx, setIdx] = useState(0);

  const headlines = resolveHeadlinesList(govState, campaignState);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % Math.max(1, headlines.length));
    }, 5500);
    return () => window.clearInterval(timer);
  }, [headlines.length]);

  const redAlert = isRedAlertActive(govState);
  const theme = resolveTickerBarTheme(redAlert, mode);
  const activeHeadline = headlines[idx % headlines.length] ?? headlines[0]!;
  const isTvMode = mode === 'TV';

  return (
    <footer className={`z-30 shrink-0 px-3 py-1.5 transition-colors ${theme.barCls}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-extrabold uppercase shrink-0 inline-flex items-center gap-1 ${theme.badgeCls}`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            {theme.badgeText}
          </span>

          {isTvMode ? (
            <div className="text-xs font-mono font-bold text-slate-100 truncate tracking-wide">
              {activeHeadline}
            </div>
          ) : (
            <MarketQuotesStrip govState={govState} />
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            setMode(isTvMode ? 'MARKET' : 'TV');
          }}
          className="px-2.5 py-0.5 rounded-sm bg-[#090d14]/90 hover:bg-[#162234] border border-[#334155] text-[10px] font-mono font-bold text-amber-200 shrink-0 inline-flex items-center gap-1"
        >
          <Activity className="w-3 h-3 text-amber-400" />
          <span>{isTvMode ? 'Ver Pizarra Financiera' : 'Ver Zócalo TV'}</span>
        </button>
      </div>
    </footer>
  );
}
