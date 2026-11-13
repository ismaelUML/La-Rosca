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
  done: 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/70',
  pending: 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700',
  danger: 'bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border-rose-800/80',
  primary: 'bg-sky-950/80 hover:bg-sky-900/80 text-sky-300 border-sky-700/80'
};

function resolveBorderClass(urgentLabel?: string): string {
  return urgentLabel
    ? 'border-sky-500/70 shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
    : 'border-slate-800/90';
}

function RightActionButton({ rightAction }: { rightAction?: StripRightAction }) {
  if (!rightAction) return null;
  const rightCls = RIGHT_VARIANT_CLASSES[rightAction.variant ?? 'pending'];

  return (
    <button
      type="button"
      disabled={rightAction.disabled}
      onClick={rightAction.onClick}
      className={`w-24 sm:w-28 shrink-0 border-l px-2 py-2 flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${rightCls}`}
    >
      <span className="text-xs font-extrabold leading-tight">{rightAction.label}</span>
      {rightAction.sublabel && (
        <span className="text-[10px] opacity-80 leading-tight">{rightAction.sublabel}</span>
      )}
    </button>
  );
}

export function ActionStripCard({
  icon,
  iconTileClass = 'bg-slate-900 border-slate-700 text-slate-200',
  urgentLabel,
  urgentClass = 'bg-sky-600 text-white',
  title,
  subtitle,
  tradeoff,
  rightAction,
  children
}: ActionStripCardProps) {
  return (
    <div
      className={`rounded-2xl bg-[#0e121b] border overflow-hidden flex items-stretch transition ${resolveBorderClass(urgentLabel)}`}
    >
      <div className={`w-14 sm:w-16 shrink-0 flex items-center justify-center border-r border-slate-800/70 text-xl ${iconTileClass}`}>
        <span>{icon}</span>
      </div>

      <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-col justify-center gap-1">
        {urgentLabel && (
          <div>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${urgentClass}`}>
              {urgentLabel}
            </span>
          </div>
        )}
        <div className="text-sm font-bold text-white leading-snug">{title}</div>
        <div className="text-xs text-slate-300">{subtitle}</div>
        {tradeoff && <div className="text-[11px] text-slate-400 leading-snug">{tradeoff}</div>}
        {children && <div className="pt-1.5">{children}</div>}
      </div>

      <RightActionButton rightAction={rightAction} />
    </div>
  );
}
