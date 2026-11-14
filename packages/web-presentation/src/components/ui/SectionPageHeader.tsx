import React from 'react';

interface SectionPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function SectionPageHeader({
  eyebrow,
  title,
  description,
  icon,
  rightSlot
}: SectionPageHeaderProps) {
  return (
    <div className="border-b border-[#263142] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
          {icon}
          <span>{eyebrow}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-amber-50 mt-0.5">
          {title}
        </h1>
        {description ? (
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{description}</p>
        ) : null}
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}

