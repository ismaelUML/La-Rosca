import React, { useEffect, useState } from 'react';
import { Activity, DollarSign, Flame, Play, RotateCcw, ShieldAlert, TrendingUp, X } from 'lucide-react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';

// Simulador en tiempo real de la Rueda Intradia del BCRA / MULC (10:00 hs a 15:00 hs).
// Permite intervenir en caliente durante una corrida cambiaria vendiendo reservas,
// subiendo tasa de politica monetaria o activando liquidacion agroexportadora.

interface IntradayTickPoint {
  step: number;
  timeLabel: string;
  cclArs: number;
  embiPb: number;
  bcraBalanceMusd: number;
}

interface BcraIntradayMarketModalProps {
  open: boolean;
  state: SimulationState;
  onDispatch?: (action: PolicyAction) => void;
  onClose: () => void;
}

const CITY_FLASH_MESSAGES: string[] = [
  '10:00 hs · Apertura del MULC: importadores de energía piden divisas en la primera media hora.',
  '10:50 hs · Mesas de dinero en Microcentro arbitran bonos AL30 contra Dólar MEP y CCL.',
  '11:40 hs · CIARA-CEC reporta ingreso moderado de camiones en terminales de Rosario Norte.',
  '12:30 hs · Fondos de inversión en Wall Street recalibran exposición a soberanos argentinos.',
  '13:20 hs · Bancos comerciales ajustan posición general de cambios (PGC) antes del corte.',
  '14:10 hs · Última hora de operatoria mayorista SIOPEL: definiciones de postura del BCRA.',
  '15:00 hs · Campana de cierre en el MULC: publicación del comunicado diario de reservas.'
];

function formatClockTime(step: number): string {
  const totalMinutes = 10 * 60 + step * 10;
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const mmStr = mm < 10 ? `0${mm}` : `${mm}`;
  return `${hh}:${mmStr} hs`;
}

function buildInitialPoint(state: SimulationState): IntradayTickPoint {
  return {
    step: 0,
    timeLabel: '10:00 hs',
    cclArs: Math.round(state.centralBank.cclDollarArs),
    embiPb: Math.round(state.countryRiskEmbiPb),
    bcraBalanceMusd: 0
  };
}

function computeNextTickPoint(
  prev: IntradayTickPoint,
  state: SimulationState
): IntradayTickPoint {
  const nextStep = prev.step + 1;
  const tension = (state.centralBank.exchangeBrechaPct - 18) * 0.28 + (state.inflation.realMonthlyIpcPct - 2.5) * 2.2;
  const wave = Math.sin(nextStep * 0.85) * 6.5 + Math.cos(nextStep * 1.3) * 4.2;
  const cclDelta = Math.round(tension + wave);
  const nextCcl = Math.max(950, prev.cclArs + cclDelta);
  const nextEmbi = Math.max(350, prev.embiPb + Math.round(cclDelta * 0.9));
  const flowDelta = Math.round(-tension * 1.8 + Math.cos(nextStep * 0.7) * 14);

  return {
    step: nextStep,
    timeLabel: formatClockTime(nextStep),
    cclArs: nextCcl,
    embiPb: nextEmbi,
    bcraBalanceMusd: prev.bcraBalanceMusd + flowDelta
  };
}

function buildPolylinePoints(history: IntradayTickPoint[]): string {
  if (history.length === 0) return '10,70 350,70';
  const vals = history.map((h) => h.cclArs);
  const minV = Math.min(...vals) - 12;
  const maxV = Math.max(...vals) + 12;
  const range = Math.max(1, maxV - minV);

  return history
    .map((pt, idx) => {
      const x = 12 + (idx / 30) * 336;
      const y = 118 - ((pt.cclArs - minV) / range) * 96;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function IntradayCclSvgChart({
  history,
  baseCcl
}: {
  history: IntradayTickPoint[];
  baseCcl: number;
}) {
  const latest = history[history.length - 1]!;
  const isUp = latest.cclArs > baseCcl;
  const strokeColor = isUp ? '#f43f5e' : '#10b981';
  const poly = buildPolylinePoints(history);

  return (
    <div className="hoi-panel rounded-sm p-3.5 bg-[#070a10] border border-[#263142] space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1e293b] pb-1.5">
        <span className="text-amber-200 font-bold uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          Curva Intradía SIOPEL · Dólar CCL ($ ARS)
        </span>
        <span className={isUp ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
          Apertura: ${baseCcl} → Actual: ${latest.cclArs}
        </span>
      </div>

      <svg viewBox="0 0 360 130" className="w-full h-36 bg-[#05080d] rounded-sm border border-[#1e293b]">
        <line x1="12" y1="35" x2="348" y2="35" stroke="#1e293b" strokeDasharray="3 3" />
        <line x1="12" y1="70" x2="348" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
        <line x1="12" y1="105" x2="348" y2="105" stroke="#1e293b" strokeDasharray="3 3" />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.4"
          points={poly}
        />
      </svg>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>10:00 hs (Apertura)</span>
        <span>12:30 hs (Media rueda)</span>
        <span>15:00 hs (Cierre MULC)</span>
      </div>
    </div>
  );
}

function IntradayOrderBookPanel({
  latest,
  officialArs,
  netReservesB
}: {
  latest: IntradayTickPoint;
  officialArs: number;
  netReservesB: number;
}) {
  const brechaPct = ((latest.cclArs - officialArs) / Math.max(1, officialArs)) * 100;
  const balCls = latest.bcraBalanceMusd >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const balSign = latest.bcraBalanceMusd >= 0 ? '+' : '';

  return (
    <div className="hoi-panel rounded-sm p-3.5 bg-[#070a10] border border-[#263142] flex flex-col justify-between space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-1.5 text-[11px] font-mono">
        <span className="text-amber-200 font-bold uppercase">Pizarra Mayorista BCRA / MAE</span>
        <span className="text-sky-300 font-bold">{latest.timeLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="p-2.5 rounded-sm bg-[#0c1119] border border-[#1e293b]">
          <span className="text-[10px] text-slate-400 block">DÓLAR OFICIAL A3500</span>
          <strong className="text-base text-slate-100">${officialArs.toFixed(0)}</strong>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0c1119] border border-[#1e293b]">
          <span className="text-[10px] text-slate-400 block">DÓLAR CONTADO C/LIQ</span>
          <strong className="text-base text-amber-300">${latest.cclArs}</strong>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0c1119] border border-[#1e293b]">
          <span className="text-[10px] text-slate-400 block">BRECHA CAMBIARIA</span>
          <strong className="text-base text-rose-300">{brechaPct.toFixed(1)}%</strong>
        </div>
        <div className="p-2.5 rounded-sm bg-[#0c1119] border border-[#1e293b]">
          <span className="text-[10px] text-slate-400 block">RIESGO PAÍS EMBI+</span>
          <strong className="text-base text-amber-200">{latest.embiPb} pb</strong>
        </div>
      </div>

      <div className="p-2.5 rounded-sm bg-[#090d14] border border-[#263142] flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Saldo BCRA hoy en el MULC:</span>
        <strong className={balCls}>
          {balSign}USD {latest.bcraBalanceMusd}M (Res. Netas: {netReservesB.toFixed(2)}B)
        </strong>
      </div>
    </div>
  );
}

function EmergencyInterventionBar({
  interventionsLog,
  onSellReserves,
  onHikeRate,
  onAgroBlend
}: {
  interventionsLog: string[];
  onSellReserves: () => void;
  onHikeRate: () => void;
  onAgroBlend: () => void;
}) {
  return (
    <div className="hoi-panel rounded-sm p-3.5 bg-[#070a10] border border-[#8a6d33] space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Mesa de Intervención en Caliente (BCRA / Secretaría de Finanzas)
        </span>
        <span className="text-slate-400 text-[10px]">Ejecución inmediata sobre la rueda</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={onSellReserves}
          className="p-2.5 rounded-sm bg-rose-950/40 hover:bg-rose-900/50 border border-rose-700/70 text-left space-y-1 transition"
        >
          <div className="text-xs font-mono font-bold text-rose-200 flex items-center justify-between">
            <span>1. Rifar Divisas MULC</span>
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-[11px] text-slate-300">
            Vende USD 180M en contado para aplastar el CCL (-$45 ARS) y enfriar la corrida.
          </p>
        </button>

        <button
          type="button"
          onClick={onHikeRate}
          className="p-2.5 rounded-sm bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/70 text-left space-y-1 transition"
        >
          <div className="text-xs font-mono font-bold text-amber-200 flex items-center justify-between">
            <span>2. Suba Tasa de Emergencia</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-[11px] text-slate-300">
            Sube +600 pb la tasa de referencia para absorber pesos y bajar el CCL (-$32 ARS).
          </p>
        </button>

        <button
          type="button"
          onClick={onAgroBlend}
          className="p-2.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/70 text-left space-y-1 transition"
        >
          <div className="text-xs font-mono font-bold text-emerald-200 flex items-center justify-between">
            <span>3. Operativo Cerealeras</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-300">
            Activa liquidación agroexportadora de emergencia (+USD 140M al MULC y -35 pb Riesgo).
          </p>
        </button>
      </div>

      {interventionsLog.length > 0 ? (
        <div className="p-2 rounded-sm bg-[#0c1119] border border-[#1e293b] text-[11px] font-mono text-amber-200 space-y-0.5">
          {interventionsLog.slice(0, 3).map((msg, i) => (
            <div key={i}>▸ {msg}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BcraIntradayMarketModal({
  open,
  state,
  onDispatch,
  onClose
}: BcraIntradayMarketModalProps) {
  const [history, setHistory] = useState<IntradayTickPoint[]>(() => [buildInitialPoint(state)]);
  const [running, setRunning] = useState(true);
  const [interventionsLog, setInterventionsLog] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setHistory([buildInitialPoint(state)]);
    setRunning(true);
    setInterventionsLog([]);
  }, [open, state]);

  useEffect(() => {
    if (!open || !running) return undefined;
    const timer = window.setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1]!;
        if (last.step >= 30) {
          setRunning(false);
          return prev;
        }
        playUiSound('ticker');
        return [...prev, computeNextTickPoint(last, state)];
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [open, running, state]);

  if (!open) return null;

  const latest = history[history.length - 1]!;
  const flashIndex = Math.min(CITY_FLASH_MESSAGES.length - 1, Math.floor(latest.step / 5));

  const applyShockToLatest = (cclDelta: number, embiDelta: number, bcraDelta: number, logMsg: string) => {
    playUiSound('stamp');
    setInterventionsLog((prev) => [`${latest.timeLabel}: ${logMsg}`, ...prev]);
    setHistory((prev) => {
      const cur = prev[prev.length - 1]!;
      const updated: IntradayTickPoint = {
        ...cur,
        cclArs: Math.max(950, cur.cclArs + cclDelta),
        embiPb: Math.max(350, cur.embiPb + embiDelta),
        bcraBalanceMusd: cur.bcraBalanceMusd + bcraDelta
      };
      return [...prev.slice(0, -1), updated];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto hoi-panel rounded-sm p-4 sm:p-6 space-y-4 border border-[#8a6d33] shadow-2xl">
        <div className="hoi-header-steel p-3.5 rounded-sm flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
              BANCO CENTRAL DE LA REPÚBLICA ARGENTINA · MESA DE OPERACIONES CAMBIARIAS
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5">
              Rueda Intradía del MULC en Tiempo Real (10:00 a 15:00 hs)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#b89342] text-[10px] font-mono font-bold uppercase text-amber-200 inline-flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              {running ? 'Pausar Rueda' : 'Reanudar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setHistory([buildInitialPoint(state)]);
                setRunning(true);
              }}
              className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#263142] text-[10px] font-mono font-bold uppercase text-slate-300 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-3 py-2 rounded-sm bg-[#090d14] border border-[#263142] text-xs font-mono text-amber-200 flex items-center justify-between">
          <span>TELETIPO CITY PORTEÑA: {CITY_FLASH_MESSAGES[flashIndex]}</span>
          <span className="text-sky-300 shrink-0 ml-2">{latest.timeLabel}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntradayCclSvgChart history={history} baseCcl={history[0]!.cclArs} />
          <IntradayOrderBookPanel
            latest={latest}
            officialArs={state.centralBank.officialDollarArs}
            netReservesB={state.centralBank.netLiquidReservesBillionUsd}
          />
        </div>

        <EmergencyInterventionBar
          interventionsLog={interventionsLog}
          onSellReserves={() => {
            applyShockToLatest(-45, -28, -180, 'BCRA vendió USD 180M en contado para frenar el CCL.');
          }}
          onHikeRate={() => {
            applyShockToLatest(-32, -15, 40, 'BCRA subió +600 pb la tasa de política monetaria.');
            onDispatch?.({
              type: 'SET_POLICY_RATE',
              annualRatePct: Math.min(120, state.centralBank.policyRateAnnualPct + 6)
            });
          }}
          onAgroBlend={() => {
            applyShockToLatest(-26, -35, 140, 'Liquidación especial CIARA-CEC inyectó USD 140M al MULC.');
          }}
        />
      </div>
    </div>
  );
}
