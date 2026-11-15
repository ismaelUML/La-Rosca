import React, { useState } from 'react';
import type { IndicatorPoint, IndicatorSeriesCard } from '@argentina-sim/domain';
import {
  resolveDeltaTone,
  resolveIndicatorCardTone,
  SEMANTIC_BG_BADGE,
  SEMANTIC_HEX,
  SEMANTIC_TEXT_CLASS
} from '../../lib/semanticColors.js';

// Tarjeta tactica de indicador macroeconomico y social (estilo acero y bronce):
// Numero principal dominante, comparativa contra inicio de serie, variacion mensual y curva SVG.

function buildSvgPolyline(points: IndicatorPoint[], minVal: number, maxVal: number): {
  linePoints: string;
  areaPoints: string;
  coords: Array<{ x: number; y: number; point: IndicatorPoint }>;
} {
  const width = 440;
  const height = 104;
  const padX = 20;
  const padY = 12;
  const span = Math.max(0.5, maxVal - minVal);
  const stepX = (width - padX * 2) / Math.max(1, points.length - 1);

  const coords = points.map((point, index) => {
    const x = Math.round(padX + index * stepX);
    const norm = (point.value - minVal) / span;
    const y = Math.round(height - padY - norm * (height - padY * 2));
    return { x, y, point };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const firstX = coords[0]!.x;
  const lastX = coords[coords.length - 1]!.x;
  const baselineY = height - padY;
  const areaPoints = `${firstX},${baselineY} ${linePoints} ${lastX},${baselineY}`;

  return { linePoints, areaPoints, coords };
}

function formatSignedDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

interface IndicatorCardFooterProps {
  card: IndicatorSeriesCard;
  showDetail: boolean;
  onToggleDetail: () => void;
}

function IndicatorCardFooter({ card, showDetail, onToggleDetail }: IndicatorCardFooterProps) {
  const firstVal = card.points[0]?.value ?? card.currentValue;
  const accumDelta = Number((card.currentValue - firstVal).toFixed(2));

  return (
    <div className="pt-3 border-t border-[#263142] mt-2 space-y-2">
      {card.subtitle ? <p className="text-[11px] text-slate-300 leading-relaxed">{card.subtitle}</p> : null}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">
          Base dic 26: <strong className="text-slate-200">{firstVal} {card.unit}</strong> ({formatSignedDelta(accumDelta)} acum.)
        </span>
        <button
          type="button"
          onClick={onToggleDetail}
          className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 hover:text-amber-100 transition"
        >
          {showDetail ? '▲ Ocultar serie' : '▼ Serie histórica'}
        </button>
      </div>

      {showDetail ? (
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-[11px] font-mono rosca-panel-enter">
          {card.points.map((pt) => (
            <div
              key={pt.label}
              className="px-2 py-1 rounded-sm bg-[#090d14] border border-[#1e293b] flex justify-between"
            >
              <span className="text-slate-400">{pt.label}</span>
              <span className="text-amber-100 font-bold">{pt.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface IndicatorChartCardProps {
  card: IndicatorSeriesCard;
}

export function IndicatorChartCard({ card }: IndicatorChartCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<IndicatorPoint | null>(null);

  const padMin = Math.floor(card.minValue - Math.abs(card.minValue) * 0.08);
  const padMax = Math.ceil(card.maxValue + Math.abs(card.maxValue) * 0.08 + 0.5);
  const { linePoints, areaPoints, coords } = buildSvgPolyline(card.points, padMin, padMax);

  const heroTone = resolveIndicatorCardTone(card);
  const deltaTone = resolveDeltaTone(card.monthlyVariation, card.invertColorLogic);
  const accentHex = SEMANTIC_HEX[heroTone];

  return (
    <div className="hoi-panel rounded-sm p-5 flex flex-col justify-between gap-3 hover:border-[#8a6d33] transition">
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[#1e293b] pb-3">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300/90">
              {card.category.replace('_', ' ')}
            </div>
            <div className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
              {card.title}
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight tabular-nums ${SEMANTIC_TEXT_CLASS[heroTone]}`}>
                {card.currentValue}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">{card.unit}</span>
            </div>
          </div>

          <div className="text-right space-y-1.5 shrink-0">
            <span className={`inline-block px-2 py-0.5 rounded-sm border text-xs font-mono font-bold ${SEMANTIC_BG_BADGE[deltaTone]}`}>
              {formatSignedDelta(card.monthlyVariation)} {card.variationUnit}
            </span>
            <div className="text-[10px] font-mono text-slate-400 bg-[#090d14] border border-[#1e293b] px-2 py-0.5 rounded-sm">
              mín {card.minValue} · máx {card.maxValue}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 relative bg-[#070a10] border border-[#1a2434] rounded-sm px-2 pb-1">
          <svg viewBox="0 0 440 118" className="w-full h-24 overflow-visible">
            <line x1="20" y1="16" x2="420" y2="16" stroke="#1b2333" strokeDasharray="3 3" />
            <line x1="20" y1="54" x2="420" y2="54" stroke="#1b2333" strokeDasharray="3 3" />
            <line x1="20" y1="92" x2="420" y2="92" stroke="#1b2333" />

            <polygon points={areaPoints} fill={accentHex} fillOpacity="0.12" />
            <polyline fill="none" stroke={accentHex} strokeWidth="2.0" points={linePoints} />

            {coords.map((c) => (
              <g key={c.point.label}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={3.2}
                  fill={accentHex}
                  stroke="#070a10"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(c.point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text x={c.x} y={110} textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                  {c.point.label}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPoint ? (
            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#b89342] text-[11px] font-mono text-amber-100 shadow-lg">
              {hoveredPoint.label}:{' '}
              <strong style={{ color: accentHex }}>
                {hoveredPoint.value} {card.unit}
              </strong>
            </div>
          ) : null}
        </div>
      </div>

      <IndicatorCardFooter
        card={card}
        showDetail={showDetail}
        onToggleDetail={() => setShowDetail(!showDetail)}
      />
    </div>
  );
}
