import React, { useEffect, useMemo, useState } from 'react';
import type { CandidateVoteResult, ProvinceCampaignInfo } from '@argentina-sim/domain';
import {
  type GeoFeatureItem,
  normalizeConurbanoFeatures,
  normalizeFeatures,
  resolveFeatureProvinceId,
  TacticalSvgBackdrop
} from './ArgentinaRealVectorMap.js';

// Mapa oficial de resultados electorales (CNE / IGN):
// Soporta vista por provincia (24 jurisdicciones) y por departamento (527 distritos + Lente AMBA),
// con leyenda de fuerzas, rosa de los vientos tactica y desglose lateral por distrito.

interface ElectionResultsSvgMapProps {
  provinces: ProvinceCampaignInfo[];
  mode?: 'PROVINCIA' | 'DEPARTAMENTO';
  results?: CandidateVoteResult[];
}

interface ProvinceWinnerData {
  provinceId: string;
  name: string;
  winner: string;
  color: string;
  playerVotePct: number;
}

function hashDeptName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildProvinceColorMap(provinces: ProvinceCampaignInfo[]): Record<string, ProvinceWinnerData> {
  const map: Record<string, ProvinceWinnerData> = {};
  for (const p of provinces) {
    const entry: ProvinceWinnerData = {
      provinceId: p.provinceId,
      name: p.provinceName,
      winner: p.leadingCandidateName,
      color: p.leadingPartyColor || '#8b5cf6',
      playerVotePct: p.playerVotePct
    };
    map[p.provinceId] = entry;
    if (p.provinceId === 'SANTIAGO_DEL_ESTERO' || p.provinceId === 'SANTIAGO_ESTERO') {
      map.SANTIAGO_DEL_ESTERO = entry;
      map.SANTIAGO_ESTERO = entry;
    }
  }
  return map;
}

function buildFallbackDeptWinner(provData: ProvinceWinnerData | undefined) {
  if (!provData) {
    return { winner: 'Oficialismo', color: '#8b5cf6', pctText: '42.0%' };
  }
  return {
    winner: provData.winner,
    color: provData.color,
    pctText: `${provData.playerVotePct.toFixed(1)}%`
  };
}

function resolveDeptWinner(
  featName: string,
  provData: ProvinceWinnerData | undefined,
  results: CandidateVoteResult[] | undefined
): { winner: string; color: string; pctText: string } {
  if (!results || results.length < 2) {
    return buildFallbackDeptWinner(provData);
  }
  const h = hashDeptName(featName);
  const swing = ((h % 13) - 6) * 1.3;
  const topForce = results[0]!;
  const secondForce = results[1]!;
  const chosen = topForce.pct + swing >= secondForce.pct - swing ? topForce : secondForce;
  const winPct = Math.min(72, Math.max(31, chosen.pct + Math.abs(swing)));
  return {
    winner: `${chosen.candidato} (${chosen.fuerza})`,
    color: chosen.color,
    pctText: `${winPct.toFixed(1)}%`
  };
}

function ForcesLegendBar({ results }: { results?: CandidateVoteResult[] }) {
  if (!results || results.length === 0) return null;
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-sm bg-[#0b0508] border border-white/15 text-[11px] font-mono">
      <span className="text-slate-400 uppercase tracking-wider">Fuerza ganadora por distrito:</span>
      <div className="flex flex-wrap items-center gap-3">
        {results.map((r) => (
          <span key={r.fuerza} className="inline-flex items-center gap-1.5 text-slate-200">
            <span style={{ backgroundColor: r.color }} className="w-2.5 h-2.5 rounded-sm inline-block" />
            <span>{r.fuerza}</span>
            <strong className="text-[#f472b6]">{r.pct.toFixed(1)}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConurbanoResultsInset({
  features,
  pbaData,
  results,
  onHover
}: {
  features: GeoFeatureItem[];
  pbaData: ProvinceWinnerData | undefined;
  results?: CandidateVoteResult[];
  onHover: (label: string | null) => void;
}) {
  if (features.length === 0) return null;
  return (
    <div className="w-full md:w-[235px] rounded-sm bg-[#0b0508] border border-white/15 p-2.5 space-y-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#EFE9DA]">
          Zoom Conurbano (AMBA)
        </span>
        <span className="text-[9px] font-mono text-sky-400">24 Partidos</span>
      </div>
      <div className="h-[235px] w-full bg-[#090407] rounded-sm border border-[#1a2434] p-1">
        <svg viewBox="70 -10 210 270" className="w-full h-full filter drop-shadow-xl">
          {features.map((feat) => {
            const deptWin = resolveDeptWinner(feat.name, pbaData, results);
            return (
              <path
                key={feat.id}
                d={feat.pathD}
                fill={deptWin.color}
                stroke="#090d14"
                strokeWidth={0.95}
                className="cursor-pointer transition-colors hover:brightness-125 hover:stroke-amber-200"
                onMouseEnter={() => onHover(`${feat.name} (GBA): ${deptWin.winner} · ${deptWin.pctText}`)}
                onMouseLeave={() => onHover(null)}
              >
                <title>{feat.name}: {deptWin.winner}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>1ra y 3ra Sección PBA</span>
        <span className="text-emerald-400">Escrutado 100%</span>
      </div>
    </div>
  );
}

function ProvincialWinnersList({
  provinces,
  selectedId,
  onSelect
}: {
  provinces: ProvinceCampaignInfo[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="w-full lg:w-64 rounded-sm bg-[#0b0508] border border-white/15 p-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#F5EFE6]">
          Actas por Provincia (24)
        </span>
        <span className="text-[9px] font-mono text-emerald-400">CNE</span>
      </div>
      <div className="max-h-[310px] overflow-y-auto space-y-1 pr-1">
        {provinces.map((p) => {
          const isSelected = p.provinceId === selectedId;
          return (
            <button
              key={p.provinceId}
              type="button"
              onClick={() => onSelect(p.provinceId)}
              className={`w-full text-left px-2.5 py-1.5 rounded-sm border transition flex items-center justify-between ${
                isSelected
                  ? 'bg-[#172234] border-[#EB3F7D] text-[#F5EFE6] font-bold'
                  : 'bg-[#11080d] border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span
                  style={{ backgroundColor: p.leadingPartyColor || '#8b5cf6' }}
                  className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                />
                <span className="truncate text-[11px]">{p.provinceName}</span>
              </span>
              <span className="font-mono text-[10px] text-[#f472b6] shrink-0 ml-1">
                {p.playerVotePct.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatResultsBannerText(hovered: string | null, selectedData: ProvinceWinnerData | undefined): string {
  if (hovered) return hovered;
  if (selectedData) {
    return `${selectedData.name}: Ganador ${selectedData.winner} (${selectedData.playerVotePct.toFixed(1)}%)`;
  }
  return 'Pasa el cursor sobre un distrito';
}

function formatFeatureHoverText(
  feat: GeoFeatureItem,
  data: ProvinceWinnerData | undefined,
  deptWin: { winner: string; color: string; pctText: string } | null
): string {
  if (deptWin) {
    const provLabel = data ? data.name : feat.subRegion;
    return `${feat.name} (${provLabel}): ${deptWin.winner} · ${deptWin.pctText}`;
  }
  if (data) {
    return `${data.name}: ${data.winner} (${data.playerVotePct.toFixed(1)}%)`;
  }
  return `${feat.name}: Oficialismo (40.0%)`;
}

function resolveFeatureFill(
  data: ProvinceWinnerData | undefined,
  deptWin: { winner: string; color: string; pctText: string } | null
): string {
  if (deptWin) return deptWin.color;
  return data ? data.color : '#8b5cf6';
}

function ElectionFeaturePath({
  feat,
  mode,
  selectedId,
  colorMap,
  results,
  onSelect,
  onHover
}: {
  feat: GeoFeatureItem;
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  selectedId: string;
  colorMap: Record<string, ProvinceWinnerData>;
  results?: CandidateVoteResult[];
  onSelect: (id: string) => void;
  onHover: (label: string | null) => void;
}) {
  const mappedId = resolveFeatureProvinceId(feat);
  const data = colorMap[mappedId];
  const deptWin = mode === 'DEPARTAMENTO' ? resolveDeptWinner(feat.name, data, results) : null;
  const fill = resolveFeatureFill(data, deptWin);
  const isSelected = mappedId === selectedId;

  return (
    <path
      d={feat.pathD}
      fill={fill}
      stroke={isSelected ? '#fde68a' : '#090d14'}
      strokeWidth={isSelected ? 2.0 : 0.65}
      className="cursor-pointer transition-colors duration-150 hover:brightness-125"
      onClick={() => onSelect(mappedId)}
      onMouseEnter={() => onHover(formatFeatureHoverText(feat, data, deptWin))}
      onMouseLeave={() => onHover(null)}
    />
  );
}

export function ElectionResultsSvgMap({
  provinces,
  mode = 'PROVINCIA',
  results
}: ElectionResultsSvgMapProps) {
  const [provFeatures, setProvFeatures] = useState<GeoFeatureItem[]>([]);
  const [deptFeatures, setDeptFeatures] = useState<GeoFeatureItem[]>([]);
  const [conurbanoFeatures, setConurbanoFeatures] = useState<GeoFeatureItem[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('PBA');

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((topo) => setProvFeatures(normalizeFeatures(topo, 'ARG_adm1')))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch('/geo/argentina-departamentos.topojson')
      .then((res) => res.json())
      .then((topo) => {
        setDeptFeatures(normalizeFeatures(topo, 'departamentos-argentina'));
        setConurbanoFeatures(normalizeConurbanoFeatures(topo));
      })
      .catch(() => undefined);
  }, []);

  const colorMap = useMemo(() => buildProvinceColorMap(provinces), [provinces]);
  const activeFeatures = mode === 'DEPARTAMENTO' && deptFeatures.length > 0 ? deptFeatures : provFeatures;
  const bannerText = formatResultsBannerText(hovered, colorMap[selectedId]);

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-sm bg-[#0e070b] border border-white/15 relative select-none">
      <ForcesLegendBar results={results} />

      <div className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-[#0b0508] border border-white/10 text-[11px] font-mono">
        <span className="text-[#EFE9DA]">⌖ {bannerText}</span>
        <span className="text-slate-400 hidden sm:inline">
          Vista: {mode === 'PROVINCIA' ? '24 Provincias' : '527 Departamentos'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 flex-1">
          <div className="w-full max-w-[290px] h-[360px] rounded-sm bg-[#090407] border border-white/15 p-1.5 relative">
            <svg
              viewBox="50 50 330 660"
              className="w-full h-full filter drop-shadow-2xl"
              aria-label="Mapa oficial de resultados por distrito"
            >
              <TacticalSvgBackdrop />
              {activeFeatures.map((feat) => (
                <ElectionFeaturePath
                  key={feat.id}
                  feat={feat}
                  mode={mode}
                  selectedId={selectedId}
                  colorMap={colorMap}
                  results={results}
                  onSelect={setSelectedId}
                  onHover={setHovered}
                />
              ))}
            </svg>
          </div>

          <ConurbanoResultsInset
            features={conurbanoFeatures}
            pbaData={colorMap.PBA}
            results={results}
            onHover={setHovered}
          />
        </div>

        <ProvincialWinnersList
          provinces={provinces}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
