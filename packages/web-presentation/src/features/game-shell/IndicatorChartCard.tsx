import React, { useState } from 'react';
import type { IndicatorPoint, IndicatorSeriesCard } from '@argentina-sim/domain';

// Tarjeta de indicador con grafico SVG de linea + area sombreada (naranja/verde)
// calcada de la captura 1, dividida en subcomponentes chicos para mantener CC <= 4.

function buildSvgPolyline(points: IndicatorPoint[], minVal: number, maxVal: number): {
  linePoints: string;
  areaPoints: string;
  coords: Array<{ x: number; y: number; point: IndicatorPoint }>;
} {
  const width = 440;
  const height = 120;
  const padX = 24;
  const padY = 14;
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

function resolveVariationColorClass(delta: number, invertColorLogic?: boolean): string {
  const isFavorable = invertColorLogic ? delta <= 0 : delta >= 0;
  return isFavorable ? 'text-emerald-400' : 'text-rose-400';
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
    <div className="pt-2 border-t border-slate-800/60 mt-1">
      {card.subtitle ? <p className="text-[11px] text-slate-400 mb-2">{card.subtitle}</p> : null}
      <button
        type="button"
        onClick={onToggleDetail}
        className="text-xs font-semibold text-white hover:text-orange-400 transition"
      >
        {showDetail ? 'Ocultar detalle mensual' : 'Ver detalle mensual'}
      </button>

      {showDetail ? (
        <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-[11px]">
          {card.points.map((pt) => (
            <div
              key={pt.label}
              className="px-2 py-1 rounded bg-[#0b0e15] border border-slate-800 flex justify-between"
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
  const deltaColor = resolveVariationColorClass(card.monthlyVariation, card.invertColorLogic);

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-300">{card.title}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#f97316] tracking-tight">
                {card.currentValue}
              </span>
              <span className="text-sm text-slate-400 font-medium">{card.unit}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400">Variación mensual</div>
            <div className={`text-sm font-bold mt-0.5 ${deltaColor}`}>
              {formatSignedDelta(card.monthlyVariation)} {card.variationUnit}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              mín {card.minValue} · máx {card.maxValue}
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <svg viewBox="0 0 440 135" className="w-full h-36 overflow-visible">
            <line x1="24" y1="20" x2="416" y2="20" stroke="#1e2433" strokeDasharray="3 3" />
            <line x1="24" y1="62" x2="416" y2="62" stroke="#1e2433" strokeDasharray="3 3" />
            <line x1="24" y1="106" x2="416" y2="106" stroke="#1e2433" />

            <polygon points={areaPoints} fill="#f97316" fillOpacity="0.13" />
            <polyline fill="none" stroke="#f97316" strokeWidth="2.2" points={linePoints} />

            {coords.map((c) => (
              <g key={c.point.label}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={3.2}
                  fill="#f97316"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(c.point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text x={c.x} y={126} textAnchor="middle" className="fill-slate-500 text-[9px]">
                  {c.point.label}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPoint ? (
            <div className="absolute top-1 right-2 px-2.5 py-1 rounded-lg bg-slate-950/95 border border-slate-700 text-[11px] text-slate-200 shadow">
              {hoveredPoint.label}:{' '}
              <strong className="text-orange-400">
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
