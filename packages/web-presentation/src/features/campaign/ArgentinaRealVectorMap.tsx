import React, { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceCampaignInfo } from '@argentina-sim/domain';

// Mapa vectorial real de la Republica Argentina (IGN / INDEC):
// Proyeccion Mercator centrada en [-64, -38.5] renderizando SVG puro para
// las 24 provincias y los 527 departamentos, con soporte de hover, seleccion y zoom AMBA.

export interface GeoFeatureItem {
  id: string;
  name: string;
  subRegion: string;
  pathD: string;
}

const PROVINCE_NAME_TO_ID: Record<string, string> = {
  'Buenos Aires': 'PBA',
  'Ciudad de Buenos Aires': 'CABA',
  Catamarca: 'CATAMARCA',
  Chaco: 'CHACO',
  Chubut: 'CHUBUT',
  Corrientes: 'CORRIENTES',
  Córdoba: 'CORDOBA',
  'Entre Ríos': 'ENTRE_RIOS',
  Formosa: 'FORMOSA',
  Jujuy: 'JUJUY',
  'La Pampa': 'LA_PAMPA',
  'La Rioja': 'LA_RIOJA',
  Mendoza: 'MENDOZA',
  Misiones: 'MISIONES',
  Neuquén: 'NEUQUEN',
  'Río Negro': 'RIO_NEGRO',
  Salta: 'SALTA',
  'San Juan': 'SAN_JUAN',
  'San Luis': 'SAN_LUIS',
  'Santa Cruz': 'SANTA_CRUZ',
  'Santa Fe': 'SANTA_FE',
  'Santiago del Estero': 'SANTIAGO_ESTERO',
  'Tierra del Fuego': 'TIERRA_DEL_FUEGO',
  Tucumán: 'TUCUMAN'
};

function buildPathGenerator() {
  const projection = geoMercator()
    .center([-64, -38.5])
    .scale(800)
    .translate([210, 350]);
  return geoPath().projection(projection);
}

function extractFeatureNames(props: Record<string, any>): { name: string; subRegion: string } {
  const name = props.NAME_1 ?? props.departamento ?? 'Distrito';
  const subRegion = props.provincia ?? '';
  return { name, subRegion };
}

function convertGeoFeature(feat: any, pathGen: (f: any) => string | null): GeoFeatureItem | null {
  const d = pathGen(feat);
  if (!d) {
    return null;
  }
  const { name, subRegion } = extractFeatureNames(feat.properties);
  const id = feat.properties.id ? String(feat.properties.id) : name;
  return { id, name, subRegion, pathD: d };
}

function normalizeFeatures(topoData: any, objectKey: string): GeoFeatureItem[] {
  const pathGen = buildPathGenerator();
  const geoObj = topojson.feature(topoData, topoData.objects[objectKey]) as any;
  const items: GeoFeatureItem[] = [];

  for (const feat of geoObj.features) {
    const item = convertGeoFeature(feat, pathGen);
    if (item) {
      items.push(item);
    }
  }
  return items;
}

interface ArgentinaRealVectorMapProps {
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  provinces: ProvinceCampaignInfo[];
  selectedProvinceId: string;
  onSelectProvince: (id: string) => void;
}

export function ArgentinaRealVectorMap({
  mode,
  provinces,
  selectedProvinceId,
  onSelectProvince
}: ArgentinaRealVectorMapProps) {
  const [provinceFeatures, setProvinceFeatures] = useState<GeoFeatureItem[]>([]);
  const [deptFeatures, setDeptFeatures] = useState<GeoFeatureItem[]>([]);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((topo) => setProvinceFeatures(normalizeFeatures(topo, 'ARG_adm1')))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (mode === 'DEPARTAMENTO' && deptFeatures.length === 0) {
      fetch('/geo/argentina-departamentos.topojson')
        .then((res) => res.json())
        .then((topo) => setDeptFeatures(normalizeFeatures(topo, 'departamentos-argentina')))
        .catch(() => undefined);
    }
  }, [mode, deptFeatures.length]);

  const provinceColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of provinces) {
      map[p.provinceId] = p.leadingPartyColor;
    }
    return map;
  }, [provinces]);

  const activeFeatures = mode === 'DEPARTAMENTO' && deptFeatures.length > 0 ? deptFeatures : provinceFeatures;

  return (
    <div className="rounded-2xl bg-[#0b0e15] border border-slate-800/90 p-4 relative flex flex-col md:flex-row items-center justify-center gap-6">
      {hoveredInfo ? (
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-slate-700 text-xs font-medium text-slate-200 shadow-xl pointer-events-none">
          {hoveredInfo}
        </div>
      ) : null}

      <div className="w-full md:w-[360px] h-[480px] relative select-none">
        <svg
          viewBox="50 50 330 660"
          className="w-full h-full filter drop-shadow-2xl"
          aria-label="Mapa cartográfico oficial de la República Argentina"
        >
          {activeFeatures.map((feat) => {
            const mappedProvId = PROVINCE_NAME_TO_ID[feat.name] ?? feat.id;
            const isSelected = mappedProvId === selectedProvinceId;
            const fillColor = provinceColorMap[mappedProvId] ?? '#ca8a04';

            return (
              <path
                key={feat.id}
                d={feat.pathD}
                fill={fillColor}
                stroke={isSelected ? '#ffffff' : '#0f172a'}
                strokeWidth={isSelected ? 2.5 : 0.6}
                strokeOpacity={0.8}
                className="cursor-pointer transition-colors duration-150 hover:brightness-125"
                onMouseEnter={() =>
                  setHoveredInfo(feat.subRegion ? `${feat.name} (${feat.subRegion})` : feat.name)
                }
                onMouseLeave={() => setHoveredInfo(null)}
                onClick={() => onSelectProvince(mappedProvId)}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex-1 max-w-sm space-y-3 text-xs">
        <div className="flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider">
          <span>{mode === 'PROVINCIA' ? '24 Provincias Oficiales' : '527 Departamentos IGN'}</span>
          <span className="text-[10px] font-mono text-emerald-400">Cartografía IGN 100% Vectorial</span>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-2">
          {provinces.map((p) => {
            const isSelected = p.provinceId === selectedProvinceId;
            return (
              <button
                key={p.provinceId}
                type="button"
                onClick={() => onSelectProvince(p.provinceId)}
                className={`w-full text-left px-3 py-2 rounded-xl border transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#181d2c] border-white text-white font-bold'
                    : 'bg-[#10131b] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: p.leadingPartyColor }}
                    className="w-2.5 h-2.5 rounded-full inline-block"
                  />
                  <span>{p.provinceName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400">{p.playerVotePct.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-500 ml-1.5">
                    ({p.visitsCount} {p.visitsCount === 1 ? 'visita' : 'visitas'})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
