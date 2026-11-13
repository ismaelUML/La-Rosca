import React from 'react';

export type StripActionVariant = 'done' | 'pending' | 'danger' | 'primary';

export interface StripRightAction {
  label: string;
  sublabel?: string;
  variant?: StripActionVariant;
  disabled?: boolean;
  onClick: () => void;
}

export interface ActionStripCardProps {
  icon: string;
  iconTileClass?: string;
  urgentLabel?: string;
  urgentClass?: string;
  title: string;
  subtitle: string;
  tradeoff?: string;
  rightAction?: StripRightAction;
  children?: React.ReactNode;
}

const RIGHT_VARIANT_CLASSES: Record<StripActionVariant, string> = {
  done: 'bg-[#0f261c] hover:bg-[#143526] text-emerald-300 border-[#21593f]',
  pending: 'bg-[#141c28] hover:bg-[#1c2839] text-slate-200 border-[#2e3c52]',
  danger: 'bg-[#361116] hover:bg-[#49171e] text-rose-200 border-[#7d2530]',
  primary: 'bg-[#1b3252] hover:bg-[#24426b] text-amber-100 border-[#7d6230]'
};

function resolveBorderClass(urgentLabel?: string): string {
  return urgentLabel
    ? 'border-[#c9a24d]/80 shadow-[inset_0_1px_0_rgba(234,185,85,0.2)]'
    : 'border-[#283447] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]';
}

function RightActionButton({ rightAction }: { rightAction?: StripRightAction }) {
  if (!rightAction) return null;
  const rightCls = RIGHT_VARIANT_CLASSES[rightAction.variant ?? 'pending'];

  return (
    <button
      type="button"
      disabled={rightAction.disabled}
      onClick={rightAction.onClick}
      className={`w-24 sm:w-28 shrink-0 border-l px-2 py-2 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${rightCls}`}
    >
      <span className="text-xs font-extrabold uppercase tracking-wide leading-tight">{rightAction.label}</span>
      {rightAction.sublabel && (
        <span className="text-[10px] font-mono opacity-80 leading-tight">{rightAction.sublabel}</span>
      )}
    </button>
  );
}

export function ActionStripCard({
  icon,
  iconTileClass = 'bg-[#121a26] text-slate-200',
  urgentLabel,
  urgentClass = 'bg-[#c9a24d] text-[#14110a]',
  title,
  subtitle,
  tradeoff,
  rightAction,
  children
}: ActionStripCardProps) {
  return (
    <div
      className={`rounded-sm bg-[#0f1520] border overflow-hidden flex items-stretch transition ${resolveBorderClass(urgentLabel)}`}
    >
      <div className={`w-14 sm:w-16 shrink-0 flex items-center justify-center border-r border-[#283447] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${iconTileClass}`}>
        <span>{icon}</span>
      </div>

      <div className="flex-1 min-w-0 px-3.5 py-2.5 flex flex-col justify-center gap-1">
        {urgentLabel && (
          <div>
            <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${urgentClass}`}>
              {urgentLabel}
            </span>
          </div>
        )}
        <div className="text-sm font-bold text-slate-100 leading-snug">{title}</div>
        <div className="text-xs text-slate-300 font-mono">{subtitle}</div>
        {tradeoff && <div className="text-[11px] text-slate-400 leading-snug">{tradeoff}</div>}
        {children && <div className="pt-1.5">{children}</div>}
      </div>

      <RightActionButton rightAction={rightAction} />
    </div>
  );
}
