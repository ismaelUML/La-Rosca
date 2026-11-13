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
  done: 'bg-[#10261c] hover:bg-[#153326] text-emerald-300 border-[#22523c]',
  pending: 'bg-[#141b26] hover:bg-[#1b2533] text-slate-200 border-[#2a3648]',
  danger: 'bg-[#361318] hover:bg-[#471920] text-rose-200 border-[#6e242d]',
  primary: 'bg-[#1a2d47] hover:bg-[#223a5c] text-amber-100 border-[#8a6d33]'
};

function resolveBorderClass(urgentLabel?: string): string {
  return urgentLabel ? 'border-[#b89342]' : 'border-[#263142]';
}

function RightActionButton({ rightAction }: { rightAction?: StripRightAction }) {
  if (!rightAction) return null;
  const rightCls = RIGHT_VARIANT_CLASSES[rightAction.variant ?? 'pending'];

  return (
    <button
      type="button"
      disabled={rightAction.disabled}
      onClick={rightAction.onClick}
      className={`w-24 sm:w-28 shrink-0 border-l px-2 py-2 flex flex-col items-center justify-center gap-0.5 text-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${rightCls}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wide leading-tight">{rightAction.label}</span>
      {rightAction.sublabel && (
        <span className="text-[10px] font-mono opacity-75 leading-tight">{rightAction.sublabel}</span>
      )}
    </button>
  );
}

export function ActionStripCard({
  icon,
  iconTileClass = 'bg-[#0e131b] text-slate-300',
  urgentLabel,
  urgentClass = 'bg-[#b89342] text-[#100e09]',
  title,
  subtitle,
  tradeoff,
  rightAction,
  children
}: ActionStripCardProps) {
  return (
    <div
      className={`rounded-sm bg-[#0f141d] border overflow-hidden flex items-stretch transition-colors ${resolveBorderClass(urgentLabel)}`}
    >
      <div className={`w-14 sm:w-16 shrink-0 flex items-center justify-center border-r border-[#263142] font-mono text-[11px] font-bold tracking-wider uppercase ${iconTileClass}`}>
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
