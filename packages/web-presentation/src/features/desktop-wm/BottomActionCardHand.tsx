import React from 'react';
import { playUiSound } from '../../lib/gameFeedback.js';

// Mano inferior de 3 cartas inclinadas estilo afiche Casa Rosada (2 crema papel + 1 rosada destacada)
// compartida entre Campaña (operaciones electorales) y Gobierno (decisiones/decretos del mes).

export interface HandCardSpec {
  id: string;
  tag: string;
  costLabel: string;
  title: string;
  effectText: string;
  riskLabel: string;
  riskLevel: 1 | 2 | 3;
  recommended?: boolean;
  ctaLabel: string;
  disabled?: boolean;
  onExecute: () => void;
}

const TILT_CLASSES = [
  'sm:-rotate-3 sm:translate-y-1.5 hover:rotate-0 hover:-translate-y-1.5',
  'z-10 sm:-translate-y-0.5 hover:-translate-y-2.5',
  'sm:rotate-3 sm:translate-y-1.5 hover:rotate-0 hover:-translate-y-1.5'
] as const;

function RiskSquaresMeter({ level, isPink }: { level: 1 | 2 | 3; isPink: boolean }) {
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {[1, 2, 3].map((step) => {
        const filled = step <= level;
        const fillCls = filled
          ? 'bg-[#090407] border-[#090407]'
          : isPink
            ? 'bg-transparent border-[#090407]/45'
            : 'bg-transparent border-[#090407]/35';
        return <span key={step} className={`w-2 h-2 border ${fillCls}`} />;
      })}
    </div>
  );
}

function HandCardTile({ card, index }: { card: HandCardSpec; index: number }) {
  const isPink = Boolean(card.recommended);
  const tiltCls = TILT_CLASSES[index] ?? '';
  const surfaceCls = isPink
    ? 'bg-[#EB3F7D] text-[#090407] border-[#f472b6] shadow-[0_14px_30px_rgba(235,63,125,0.24)]'
    : 'bg-[#EFE9DA] text-[#110D10] border-[#d6cebc] shadow-[0_12px_28px_rgba(0,0,0,0.6)]';

  return (
    <div className={`relative w-44 lg:w-48 transition-transform duration-200 pointer-events-auto ${tiltCls}`}>
      {isPink ? (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#090407] border border-[#EB3F7D] text-[#F5EFE6] text-[8px] font-mono font-bold uppercase tracking-widest whitespace-nowrap z-20">
          ★ RECOMENDADA
        </div>
      ) : null}

      <div className={`border p-2.5 flex flex-col justify-between min-h-[146px] ${surfaceCls}`}>
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="px-1.5 py-0.5 border border-[#090407]/55 text-[8px] font-mono font-extrabold uppercase tracking-wider truncate">
              {card.tag}
            </span>
            <span className="font-display text-sm lg:text-base leading-none shrink-0">{card.costLabel}</span>
          </div>

          <h4 className="font-display text-base lg:text-lg leading-[1.03] uppercase tracking-wide mt-1.5 line-clamp-2">
            {card.title}
          </h4>

          <p className="text-[10px] font-bold leading-snug mt-1 line-clamp-2">
            ▲ {card.effectText}
          </p>
        </div>

        <div className="pt-1.5 mt-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold opacity-85">{card.riskLabel}</span>
            <RiskSquaresMeter level={card.riskLevel} isPink={isPink} />
          </div>

          <button
            type="button"
            disabled={card.disabled}
            onClick={() => {
              playUiSound('select');
              card.onExecute();
            }}
            className="mt-2 w-full py-1.5 bg-[#090407] hover:bg-[#1e1218] disabled:opacity-50 text-[#F5EFE6] font-mono text-[10px] font-extrabold uppercase tracking-widest transition"
          >
            {card.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BottomActionCardHand({
  cards,
  totalCatalogCount,
  catalogNoun,
  onViewAll,
  onRotateHand
}: {
  cards: HandCardSpec[];
  totalCatalogCount: number;
  catalogNoun: string;
  onViewAll: () => void;
  onRotateHand?: () => void;
}) {
  if (cards.length === 0) return null;

  return (
    <>
      <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-end gap-3.5">
        {cards.slice(0, 3).map((card, index) => (
          <HandCardTile key={card.id} card={card} index={index} />
        ))}
      </div>

      <div className="pointer-events-auto absolute bottom-4 right-5 z-20 text-right space-y-1">
        <div className="text-[11px] font-mono text-slate-300">
          {Math.min(3, cards.length)} de {totalCatalogCount} {catalogNoun}
        </div>
        <div className="flex items-center justify-end gap-3">
          {onRotateHand ? (
            <button
              type="button"
              onClick={() => {
                playUiSound('tab');
                onRotateHand();
              }}
              className="text-[11px] font-mono font-bold text-[#EFE9DA] hover:text-[#EB3F7D] uppercase tracking-wide transition"
            >
              ↻ Rotar mano
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              playUiSound('tab');
              onViewAll();
            }}
            className="text-xs font-bold text-[#EB3F7D] hover:underline uppercase tracking-wide"
          >
            Ver todas
          </button>
        </div>
      </div>
    </>
  );
}
