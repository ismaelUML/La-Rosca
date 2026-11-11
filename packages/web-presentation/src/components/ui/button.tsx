import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm';
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-sky-600 text-white hover:bg-sky-500 border border-sky-500/40',
  destructive: 'bg-rose-600 text-white hover:bg-rose-500 border border-rose-500/40',
  outline: 'border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
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
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50',
        VARIANT_STYLES[variant],
        sizeClass,
        className
      )}
      {...props}
    />
  );
}

