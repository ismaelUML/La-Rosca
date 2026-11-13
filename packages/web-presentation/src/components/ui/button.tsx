import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm';
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-[#1c314d] text-[#f0e6d2] hover:bg-[#243d5e] border border-[#8a6d33]',
  destructive: 'bg-[#5c1921] text-rose-100 hover:bg-[#70202a] border border-rose-800/70',
  outline: 'border border-[#2b374a] bg-[#0e131b] hover:bg-[#17202d] text-slate-200',
  secondary: 'bg-[#18212f] text-slate-100 hover:bg-[#202c3e] border border-[#303e54]'
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
