import React, { useEffect, useState } from 'react';
import type { GovernmentEventCategory } from '@argentina-sim/domain';
import {
  resolveEventImagePaths,
  resolveEventNewspaper,
  type NewspaperMastheadSpec
} from './newspaperMastheads.js';

export interface NewspaperEffectBadge {
  label: string;
  isPositive: boolean;
}

export interface NewspaperDecisionOption {
  id: string;
  title: string;
  description?: string;
  badges: NewspaperEffectBadge[];
}

export interface NewspaperEventModalProps {
  eventId: string;
  category: GovernmentEventCategory | 'CAMPANA';
  dateLabel: string;
  title: string;
  description: string;
  photoCaption?: string;
  footerLeft: string;
  footerRight: string;
  ctaLabel: string;
  options: NewspaperDecisionOption[];
  onChoose: (optionId: string) => void;
}

function computeEditionNumber(eventId: string): number {
  let hash = 1042;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = (hash * 31 + eventId.charCodeAt(i)) % 8900;
  }
  return 1000 + hash;
}

function MastheadHeader({
  spec,
  dateLabel,
  editionNumber
}: {
  spec: NewspaperMastheadSpec;
  dateLabel: string;
  editionNumber: number;
}) {
  return (
    <header className="border-b-2 border-[#232730]">
      <div className="px-5 py-1.5 bg-[#1b2029] text-[#dcd5c3] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
        <span>{spec.sectionTag}</span>
        <span>
          {dateLabel} · {spec.editionPrefix} {editionNumber}
        </span>
      </div>

      <div className="px-6 py-3.5 border-b border-[#8e8676] flex items-center justify-between gap-4 bg-[#f3efe3]">
        <div className={`hidden sm:flex w-10 h-10 border-2 border-[#232730] items-center justify-center shrink-0 ${spec.accentBgClass}`}>
          <span className="font-serif font-black text-base leading-none">{spec.name.slice(0, 2).toUpperCase()}</span>
        </div>

        <div className="flex-1 text-center">
          <div className={`text-2xl sm:text-3xl md:text-4xl text-[#15181f] leading-none ${spec.titleFontClass}`}>
            {spec.name}
          </div>
          <div className="text-[10px] font-serif italic text-[#4d4a41] mt-1">
            {spec.subtitle}
          </div>
        </div>

        <div className="hidden sm:flex w-10 h-10 border border-[#232730] flex-col items-center justify-center shrink-0 bg-[#ebe4d3] text-[#232730]">
          <span className="text-[8px] font-mono uppercase leading-none">ARG</span>
          <span className="text-[11px] font-mono font-bold leading-tight">$1800</span>
        </div>
      </div>
    </header>
  );
}

function NewspaperPhotoPlate({
  eventId,
  category,
  title,
  photoCaption
}: {
  eventId: string;
  category: GovernmentEventCategory | 'CAMPANA';
  title: string;
  photoCaption?: string;
}) {
  const { primarySrc, fallbackSrc } = resolveEventImagePaths(eventId, category);
  const [imgSrc, setImgSrc] = useState(primarySrc);

  useEffect(() => {
    setImgSrc(primarySrc);
  }, [primarySrc]);

  const handleImgError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <figure className="border-2 border-[#232730] bg-[#161920] p-1 shadow-inner">
      <div className="relative w-full aspect-[5/2] overflow-hidden bg-[#1e232c]">
        <img
          src={imgSrc}
          alt={title}
          onError={handleImgError}
          className="w-full h-full object-cover hoi-newspaper-photo"
        />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_26px_rgba(0,0,0,0.45)]" />
      </div>
      <figcaption className="px-2.5 py-1 bg-[#e4decb] border-t border-[#7a7364] flex items-center justify-between gap-2 text-[10px] font-mono text-[#38362e]">
        <span className="truncate">{photoCaption ?? `ARCHIVO PRENSA NACIONAL — ${title}`}</span>
        <span className="uppercase shrink-0">EDICIÓN IMPRESA</span>
      </figcaption>
    </figure>
  );
}

function DecisionCardButton({
  option,
  ctaLabel,
  onChoose
}: {
  option: NewspaperDecisionOption;
  ctaLabel: string;
  onChoose: (id: string) => void;
}) {
  return (
    <div className="rounded-sm bg-[#e6dfd0] border border-[#aba18c] p-3.5 flex flex-col justify-between space-y-3 hover:border-[#7e5e1c] transition">
      <div className="space-y-2">
        <h4 className="text-sm font-serif font-extrabold text-[#14171f] leading-snug">{option.title}</h4>
        {option.description ? (
          <p className="text-xs text-[#343946] leading-relaxed">{option.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {option.badges.map((b) => (
            <span
              key={b.label}
              className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-tight border ${
                b.isPositive
                  ? 'bg-emerald-900/15 text-emerald-900 border-emerald-800/40'
                  : 'bg-rose-900/15 text-rose-900 border-rose-800/40'
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChoose(option.id)}
        className="w-full py-2.5 px-3 rounded-sm bg-[#1b2029] hover:bg-[#27303f] text-[#f3ead5] border border-[#6e5a2f] hover:border-[#b89342] text-xs font-bold tracking-wide transition shadow-sm cursor-pointer"
      >
        {ctaLabel}
      </button>
    </div>
  );
}

export function NewspaperEventModal({
  eventId,
  category,
  dateLabel,
  title,
  description,
  photoCaption,
  footerLeft,
  footerRight,
  ctaLabel,
  options,
  onChoose
}: NewspaperEventModalProps) {
  const masthead = resolveEventNewspaper(eventId, category);
  const editionNumber = computeEditionNumber(eventId);
  const gridColsClass = options.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <article className="hoi-paper-event hoi-newspaper-fold rounded-sm w-full max-w-4xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] my-auto">
        <MastheadHeader spec={masthead} dateLabel={dateLabel} editionNumber={editionNumber} />

        <div className="p-5 sm:p-6 md:p-7 space-y-4">
          <NewspaperPhotoPlate
            eventId={eventId}
            category={category}
            title={title}
            photoCaption={photoCaption}
          />

          <div className="border-b-2 border-[#232730] pb-3.5 text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#12151b] leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-[13px] font-serif text-[#272b34] leading-relaxed max-w-3xl mx-auto text-justify">
              {description}
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-3 ${gridColsClass}`}>
            {options.map((option) => (
              <DecisionCardButton
                key={option.id}
                option={option}
                ctaLabel={ctaLabel}
                onChoose={onChoose}
              />
            ))}
          </div>

          <footer className="pt-2.5 border-t border-[#9c927e] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-[#4b473e]">
            <span>{footerLeft}</span>
            <span>{footerRight}</span>
          </footer>
        </div>
      </article>
    </div>
  );
}

