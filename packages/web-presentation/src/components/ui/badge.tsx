import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-800 text-slate-200 border-slate-700',
  success: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
  warning: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  danger: 'bg-rose-950/80 text-rose-300 border-rose-700/60'
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
