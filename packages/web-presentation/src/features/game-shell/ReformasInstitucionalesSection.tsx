import React, { useState } from 'react';
import {
  INITIAL_FIXED_REFORMS,
  toggleFixedReformState,
  type FixedReformItem,
  type ReformCategory
} from '@argentina-sim/domain';

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
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
        isSelected
          ? 'bg-white text-slate-950 border-white shadow-md'
          : 'bg-[#10131b] border-slate-800 text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function ReformMajorityBadge({ majority }: { majority: 'ORDINARIA' | 'CONSTITUCIONAL' }) {
  if (majority === 'CONSTITUCIONAL') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-700 text-purple-300">
        Constitucional (2/3: 172 Dip · 48 Sen)
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/80 border border-sky-700 text-sky-300">
      Ordinaria (Mayoría absoluta: 129 · 37)
    </span>
  );
}

function resolveCardBorder(active: boolean): string {
  if (active) return 'bg-[#121826] border-purple-800/80';
  return 'bg-[#10131b] border-slate-800/90';
}

function resolveCardBadge(active: boolean): { className: string; text: string } {
  if (active) {
    return {
      className: 'bg-emerald-950 border border-emerald-700 text-emerald-300',
      text: 'VIGENTE'
    };
  }
  return {
    className: 'bg-slate-900 border border-slate-800 text-slate-400',
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
    className: 'bg-white hover:bg-slate-200 text-slate-950',
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
    <div className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition shadow-md ${borderClass}`}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold text-white leading-tight">{reform.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badgeInfo.className}`}>
            {badgeInfo.text}
          </span>
        </div>

        <ReformMajorityBadge majority={reform.majorityType} />

        <p className="text-xs text-slate-300 leading-relaxed pt-1">{reform.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-[#0b0e15] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Apoyo social</div>
            <div className="font-bold text-white text-sm mt-0.5">{reform.publicSupportPct} %</div>
          </div>
          <div className="p-2 rounded-xl bg-[#0b0e15] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Polémica</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{reform.polemicaPct} %</div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{exclusiveLabel}</span>
        <button
          type="button"
          onClick={() => onToggle(reform.id)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${buttonInfo.className}`}
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
  { id: 'JUSTICIA', label: 'Justicia y Corte' }
];

export function ReformasInstitucionalesSection() {
  const [reforms, setReforms] = useState<FixedReformItem[]>(INITIAL_FIXED_REFORMS);
  const [selectedCat, setSelectedCat] = useState<'TODAS' | ReformCategory>('TODAS');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const { updatedReforms, deactivatedMutualId } = toggleFixedReformState(reforms, id);
    setReforms(updatedReforms);

    const target = updatedReforms.find((r) => r.id === id);
    if (target?.active) {
      const mutualText = deactivatedMutualId ? ` (se derogó automáticamente ${deactivatedMutualId}).` : '.';
      setBannerNotice(`✓ Se promulgó la reforma: ${target.name}${mutualText}`);
    } else {
      setBannerNotice(`Se derogó la reforma: ${target?.name ?? id}.`);
    }
  };

  const filtered = reforms.filter(
    (r) => selectedCat === 'TODAS' || r.category === selectedCat
  );

  const activeCount = reforms.filter((r) => r.active).length;

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#10141e] to-sky-950/60 border border-purple-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
            SISTEMA ELECTORAL Y CONSTITUCIÓN NACIONAL (ea)
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Reformas Institucionales y Electorales
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Catálogo fijo de reglas constitucionales de sufragio, mandatos presidenciales, balotaje y representación parlamentaria con mayorías ordinarias y de dos tercios.
          </p>
        </div>
        <div className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-900/50 border border-purple-700/80 font-mono text-xs font-extrabold text-purple-200 text-center">
          {activeCount} de {reforms.length} vigentes
        </div>
      </div>

      {bannerNotice ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs">
          <span>{bannerNotice}</span>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-emerald-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pb-1">
        {CATEGORY_FILTERS.map((cat) => (
          <ReformFilterButton
            key={cat.id}
            label={cat.label}
            isSelected={selectedCat === cat.id}
            onClick={() => setSelectedCat(cat.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reform) => (
          <ReformCard key={reform.id} reform={reform} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
