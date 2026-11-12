import React, { useEffect, useMemo, useState } from 'react';
import type { ProvinceCampaignInfo } from '@argentina-sim/domain';
import {
  type GeoFeatureItem,
  normalizeFeatures,
  resolveFeatureProvinceId
} from './ArgentinaRealVectorMap.js';

interface ElectionResultsSvgMapProps {
  provinces: ProvinceCampaignInfo[];
}

interface ProvinceWinnerData {
  name: string;
  winner: string;
  color: string;
}

function buildProvinceColorMap(provinces: ProvinceCampaignInfo[]): Record<string, ProvinceWinnerData> {
  const map: Record<string, ProvinceWinnerData> = {};
  for (const p of provinces) {
    map[p.provinceId] = {
      name: p.provinceName,
      winner: p.leadingCandidateName,
      color: p.leadingPartyColor || '#8b5cf6'
    };
  }
  return map;
}

export function ElectionResultsSvgMap({ provinces }: ElectionResultsSvgMapProps) {
  const [features, setFeatures] = useState<GeoFeatureItem[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((topo) => setFeatures(normalizeFeatures(topo, 'ARG_adm1')))
      .catch(() => undefined);
  }, []);

  const colorMap = useMemo(() => buildProvinceColorMap(provinces), [provinces]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0b0e15] border border-slate-800 relative select-none">
      <div className="absolute top-2 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none">
        {hovered ?? 'Pasa el cursor sobre un distrito para ver quién ganó'}
      </div>

      <div className="w-full flex justify-center py-2">
        <svg
          viewBox="50 50 330 660"
          className="w-full max-w-[280px] h-[360px] filter drop-shadow-2xl"
          aria-label="Mapa oficial de resultados por provincia"
        >
          {features.map((feat) => {
            const mappedId = resolveFeatureProvinceId(feat);
            const data = colorMap[mappedId];
            const fill = data?.color ?? '#8b5cf6';

            return (
              <path
                key={feat.id}
                d={feat.pathD}
                fill={fill}
                stroke="#0f172a"
                strokeWidth={0.8}
                className="cursor-pointer transition-colors duration-150 hover:brightness-125"
                onMouseEnter={() =>
                  setHovered(`${data?.name ?? feat.name}: ${data?.winner ?? 'Oficialismo'}`)
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{data?.name ?? feat.name}: {data?.winner ?? 'Oficialismo'}</title>
              </path>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

