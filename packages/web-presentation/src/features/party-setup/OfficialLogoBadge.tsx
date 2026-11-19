import {
  INSTITUTIONAL_LOGOS,
  MEDIA_OUTLET_LOGOS,
  type InstitutionalLogoId,
  type MediaOutletLogoId,
  resolvePartyOfficialLogo,
} from './officialLogosCatalog';

interface OfficialPartyLogoProps {
  partyIdOrSigla: string;
  sizePx?: number;
  className?: string;
  fallbackColor?: string;
}

const BACKDROP_STYLE: Record<'light' | 'dark' | 'transparent', string> = {
  light: 'bg-white/95 border border-slate-300/40 p-0.5',
  dark: 'bg-[#0b0508] border border-slate-700/80 p-0.5',
  transparent: 'bg-transparent p-0',
};

export function OfficialPartyLogo({
  partyIdOrSigla,
  sizePx = 28,
  className = '',
  fallbackColor = '#64748b',
}: OfficialPartyLogoProps) {
  const spec = resolvePartyOfficialLogo(partyIdOrSigla);
  if (!spec) {
    return (
      <span
        style={{ width: sizePx, height: sizePx, backgroundColor: fallbackColor }}
        className={`inline-flex items-center justify-center rounded-sm text-[9px] font-black text-slate-950 shrink-0 ${className}`}
      >
        {partyIdOrSigla.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      title={spec.officialName}
      style={{ width: sizePx, height: sizePx }}
      className={`inline-flex items-center justify-center rounded-sm overflow-hidden shrink-0 ${BACKDROP_STYLE[spec.backdrop]} ${className}`}
    >
      <img
        src={spec.src}
        alt={spec.alt}
        className="w-full h-full object-contain select-none"
        loading="lazy"
      />
    </span>
  );
}

interface OfficialInstitutionLogoProps {
  institution: InstitutionalLogoId;
  heightPx?: number;
  className?: string;
  showLabel?: boolean;
}

interface OfficialMediaLogoProps {
  media: MediaOutletLogoId;
  heightPx?: number;
  className?: string;
  showLabel?: boolean;
}

function OfficialFramedBadge({
  spec,
  heightPx = 32,
  className = '',
  showLabel = false,
}: {
  spec: { src: string; alt: string; officialName: string; backdrop: 'light' | 'dark' | 'transparent' };
  heightPx?: number;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 shrink-0 ${className}`} title={spec.officialName}>
      <span
        style={{ height: heightPx }}
        className={`inline-flex items-center justify-center rounded-sm overflow-hidden px-1.5 ${BACKDROP_STYLE[spec.backdrop]}`}
      >
        <img
          src={spec.src}
          alt={spec.alt}
          style={{ height: Math.max(14, heightPx - 5), width: 'auto', maxWidth: heightPx * 3.8 }}
          className="object-contain select-none"
          loading="lazy"
        />
      </span>
      {showLabel ? (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-tight">
          {spec.officialName}
        </span>
      ) : null}
    </span>
  );
}

export function OfficialInstitutionLogo({
  institution,
  heightPx = 32,
  className = '',
  showLabel = false,
}: OfficialInstitutionLogoProps) {
  return (
    <OfficialFramedBadge
      spec={INSTITUTIONAL_LOGOS[institution]}
      heightPx={heightPx}
      className={className}
      showLabel={showLabel}
    />
  );
}

export function OfficialMediaLogo({
  media,
  heightPx = 22,
  className = '',
  showLabel = false,
}: OfficialMediaLogoProps) {
  return (
    <OfficialFramedBadge
      spec={MEDIA_OUTLET_LOGOS[media]}
      heightPx={heightPx}
      className={className}
      showLabel={showLabel}
    />
  );
}
