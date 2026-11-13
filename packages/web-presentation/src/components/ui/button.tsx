import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm';
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-gradient-to-b from-[#25446b] to-[#172c47] text-amber-100 hover:from-[#2d5280] hover:to-[#1d3759] border border-[#7d6230]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]',
  destructive:
    'bg-gradient-to-b from-[#7a1d26] to-[#4d1117] text-rose-100 hover:from-[#8f232e] hover:to-[#5e151d] border border-rose-600/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
  outline:
    'border border-[#334155] bg-[#0e141e] hover:bg-[#182233] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  secondary:
    'bg-[#192334] text-slate-100 hover:bg-[#223047] border border-[#3a4a63] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 py-2 text-xs';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold tracking-wide transition-colors disabled:opacity-50',
        VARIANT_STYLES[variant],
        sizeClass,
        className
      )}
      {...props}
    />
  );
}
