import React, { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import {
  INITIAL_FIXED_REFORMS,
  toggleFixedReformState,
  type FixedReformItem,
  type ReformCategory
} from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';

// Vista de Reformas Institucionales y Electorales fijas (ea(...) en QQG):
// Catálogo constitucional y electoral de 20 reformas estructurales con reglas
// de mayoría ordinaria (129 Dip / 37 Sen) y constitucional de dos tercios (172 / 48).

interface ReformFilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function ReformFilterButton({ label, isSelected, onClick }: ReformFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        playUiSound('tab');
        onClick();
      }}
      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition border ${
        isSelected
          ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
          : 'bg-[#090d14] border-[#263142] text-slate-400 hover:text-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function ReformMajorityBadge({ majority }: { majority: 'ORDINARIA' | 'CONSTITUCIONAL' }) {
  if (majority === 'CONSTITUCIONAL') {
    return (
      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-amber-950/70 border border-amber-700/70 text-amber-300 inline-block">
        Constitucional (2/3: 172 Dip · 48 Sen)
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#132033] border border-[#334155] text-sky-200 inline-block">
      Ordinaria (Mayoría absoluta: 129 · 37)
    </span>
  );
}

function resolveCardBorder(active: boolean): string {
  if (active) return 'bg-[#111928] border-[#b89342]/70';
  return 'bg-[#0e131c] border-[#263142]';
}

function resolveCardBadge(active: boolean): { className: string; text: string } {
  if (active) {
    return {
      className: 'bg-emerald-950/80 border border-emerald-700 text-emerald-300',
      text: 'VIGENTE'
    };
  }
  return {
    className: 'bg-[#090d14] border border-[#263142] text-slate-400',
    text: 'INACTIVA'
  };
}

function resolveCardButton(active: boolean): { className: string; text: string } {
  if (active) {
    return {
      className: 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200',
      text: 'Derogar reforma'
    };
  }
  return {
    className: 'hoi-btn-gold',
    text: 'Promulgar reforma'
  };
}

interface ReformCardProps {
  reform: FixedReformItem;
  onToggle: (id: string) => void;
}

function ReformCard({ reform, onToggle }: ReformCardProps) {
  const borderClass = resolveCardBorder(reform.active);
  const badgeInfo = resolveCardBadge(reform.active);
  const buttonInfo = resolveCardButton(reform.active);
  const exclusiveLabel = reform.mutuallyExclusiveWith
    ? `Excluye: ${reform.mutuallyExclusiveWith}`
    : 'Sin incompatibilidad';

  return (
    <div className={`rounded-sm border p-5 flex flex-col justify-between gap-4 transition ${borderClass}`}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold text-white leading-tight">{reform.name}</h3>
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold shrink-0 ${badgeInfo.className}`}>
            {badgeInfo.text}
          </span>
        </div>

        <ReformMajorityBadge majority={reform.majorityType} />

        <p className="text-xs text-slate-300 leading-relaxed pt-1">{reform.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#263142]">
            <div className="text-[10px] text-slate-400 uppercase">Apoyo social</div>
            <div className="font-bold text-white text-sm mt-0.5">{reform.publicSupportPct} %</div>
          </div>
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#263142]">
            <div className="text-[10px] text-slate-400 uppercase">Polémica</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{reform.polemicaPct} %</div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#263142] flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 truncate max-w-[160px]" title={exclusiveLabel}>
          {exclusiveLabel}
        </span>
        <button
          type="button"
          onClick={() => {
            playUiSound('select');
            onToggle(reform.id);
          }}
          className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wide transition ${buttonInfo.className}`}
        >
          {buttonInfo.text}
        </button>
      </div>
    </div>
  );
}

const CATEGORY_FILTERS: Array<{ id: 'TODAS' | ReformCategory; label: string }> = [
  { id: 'TODAS', label: 'Todas las reformas' },
  { id: 'CALENDARIO_ELECTORAL', label: 'Calendario electoral' },
  { id: 'REELECCION_MANDATOS', label: 'Reelección y mandatos' },
  { id: 'SISTEMA_ELECCION', label: 'Sistema de balotaje' },
  { id: 'PADRON_SUFRAGIO', label: 'Padrón y voto' },
  { id: 'INSTRUMENTOS_CAMPANA', label: 'Boleta y campaña' },
  { id: 'CONGRESO_REPRESENTACION', label: 'Bancas del Congreso' },
  { id: 'JUSTICIA', label: 'Justicia y Corte' },
  { id: 'FEDERALISMO', label: 'Federalismo y Coparticipación' },
  { id: 'TRABAJO_PREVISIONAL', label: 'Laboral y Previsional' },
  { id: 'ESTADO_EDUCACION', label: 'Estado y Educación' }
];

function matchesReformQuery(reform: FixedReformItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return reform.name.toLowerCase().includes(q) || reform.description.toLowerCase().includes(q);
}

export function ReformasInstitucionalesSection() {
  const [reforms, setReforms] = useState<FixedReformItem[]>(INITIAL_FIXED_REFORMS);
  const [selectedCat, setSelectedCat] = useState<'TODAS' | ReformCategory>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const { updatedReforms, deactivatedMutualId } = toggleFixedReformState(reforms, id);
    setReforms(updatedReforms);

    const target = updatedReforms.find((r) => r.id === id);
    if (target?.active) {
      const mutualText = deactivatedMutualId ? ` (se derogó automáticamente ${deactivatedMutualId}).` : '.';
      setBannerNotice(`Se promulgó la reforma: ${target.name}${mutualText}`);
    } else {
      setBannerNotice(`Se derogó la reforma: ${target?.name ?? id}.`);
    }
  };

  const filtered = reforms.filter(
    (r) => (selectedCat === 'TODAS' || r.category === selectedCat) && matchesReformQuery(r, searchQuery)
  );

  const activeCount = reforms.filter((r) => r.active).length;

  return (
    <div className="space-y-5">
      <div className="hoi-panel hoi-header-steel p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
            Sistema Electoral y Constitución Nacional
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-white mt-0.5">
            Reformas Institucionales y Electorales
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Catálogo fijo de reglas constitucionales de sufragio, mandatos presidenciales, balotaje y representación parlamentaria con mayorías ordinarias y de dos tercios.
          </p>
        </div>
        <div className="shrink-0 px-3.5 py-2 rounded-sm bg-[#090d14] border border-[#b89342]/60 font-mono text-xs font-extrabold text-amber-200 text-center">
          {activeCount} de {reforms.length} vigentes
        </div>
      </div>

      {bannerNotice ? (
        <div className="flex items-center justify-between p-3.5 rounded-sm bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs">
          <span className="inline-flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {bannerNotice}
          </span>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            aria-label="Cerrar aviso"
            className="text-emerald-400 hover:text-white font-bold ml-2 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((cat) => (
            <ReformFilterButton
              key={cat.id}
              label={cat.label}
              isSelected={selectedCat === cat.id}
              onClick={() => setSelectedCat(cat.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar (${filtered.length}/${reforms.length})...`}
              className="pl-8 pr-3 py-1.5 w-52 rounded-sm bg-[#090d14] border border-[#263142] focus:border-[#b89342] focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 font-mono"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reform) => (
          <ReformCard key={reform.id} reform={reform} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
