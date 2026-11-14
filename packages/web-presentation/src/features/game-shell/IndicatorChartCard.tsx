import React, { useState } from 'react';
import type { IndicatorPoint, IndicatorSeriesCard } from '@argentina-sim/domain';
import {
  resolveDeltaTone,
  resolveIndicatorCardTone,
  SEMANTIC_BG_BADGE,
  SEMANTIC_HEX,
  SEMANTIC_TEXT_CLASS
} from '../../lib/semanticColors.js';

// Tarjeta de indicador con jerarquia clara: numero principal dominante,
// variacion semantica consistente (verde/dorado/rojo-rosa) y sparkline secundario.

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
  return (
    <div className="pt-3 border-t border-slate-800/60 mt-2">
      {card.subtitle ? <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{card.subtitle}</p> : null}
      <button
        type="button"
        onClick={onToggleDetail}
        className="text-xs font-semibold text-slate-200 hover:text-amber-300 transition"
      >
        {showDetail ? 'Ocultar detalle mensual' : 'Ver detalle mensual'}
      </button>

      {showDetail ? (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2 text-[11px] rosca-panel-enter">
          {card.points.map((pt) => (
            <div
              key={pt.label}
              className="px-2.5 py-1.5 rounded bg-[#090d14] border border-slate-800 flex justify-between"
            >
              <span className="text-slate-400">{pt.label}</span>
              <span className="font-mono text-slate-200">{pt.value}</span>
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
    <div className="rounded-xl bg-[#0e131c] border border-[#232e40] p-6 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums ${SEMANTIC_TEXT_CLASS[heroTone]}`}>
                {card.currentValue}
              </span>
              <span className="text-sm text-slate-400 font-semibold">{card.unit}</span>
            </div>
          </div>

          <div className="text-right space-y-1 shrink-0">
            <span className={`inline-block px-2 py-0.5 rounded-sm border text-xs font-mono font-bold ${SEMANTIC_BG_BADGE[deltaTone]}`}>
              {formatSignedDelta(card.monthlyVariation)} {card.variationUnit}
            </span>
            <div className="text-[11px] font-mono text-slate-500">
              mín {card.minValue} · máx {card.maxValue}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/50 relative opacity-80 hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 440 118" className="w-full h-24 overflow-visible">
            <line x1="20" y1="16" x2="420" y2="16" stroke="#1b2333" strokeDasharray="3 3" />
            <line x1="20" y1="54" x2="420" y2="54" stroke="#1b2333" strokeDasharray="3 3" />
            <line x1="20" y1="92" x2="420" y2="92" stroke="#1b2333" />

            <polygon points={areaPoints} fill={accentHex} fillOpacity="0.08" />
            <polyline fill="none" stroke={accentHex} strokeWidth="1.7" points={linePoints} />

            {coords.map((c) => (
              <g key={c.point.label}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={3}
                  fill={accentHex}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(c.point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text x={c.x} y={110} textAnchor="middle" className="fill-slate-500 text-[9px]">
                  {c.point.label}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPoint ? (
            <div className="absolute top-2 right-1 px-2.5 py-1 rounded bg-slate-950/95 border border-slate-700 text-[11px] text-slate-200 shadow">
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
