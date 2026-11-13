import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[#17202e] text-slate-200 border-[#334155]',
  success: 'bg-[#0f291e] text-emerald-300 border-emerald-700/70',
  warning: 'bg-[#2d210b] text-amber-300 border-amber-600/70',
  danger: 'bg-[#361116] text-rose-300 border-rose-700/80'
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider',
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
