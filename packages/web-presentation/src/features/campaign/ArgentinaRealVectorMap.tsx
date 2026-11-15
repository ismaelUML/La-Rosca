import React, { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceCampaignInfo } from '@argentina-sim/domain';
import {
  buildDistrictPopup,
  type DistrictCandidateBase,
  type DistrictPopupData
} from './districtPollGenerator.js';

// Mapa vectorial tactico de la Republica Argentina (IGN / INDEC):
// Proyeccion Mercator centrada en [-64, -38.5] renderizando SVG puro para
// las 24 provincias y los 527 departamentos, con grilla cartografica, rosa de los vientos y zoom AMBA.

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
  'Santiago del Estero': 'SANTIAGO_DEL_ESTERO',
  'Tierra del Fuego': 'TIERRA_DEL_FUEGO',
  Tucumán: 'TUCUMAN',
  'BUENOS AIRES': 'PBA',
  'CIUDAD AUTONOMA DE BUENOS AIRES': 'CABA',
  CATAMARCA: 'CATAMARCA',
  CHACO: 'CHACO',
  CHUBUT: 'CHUBUT',
  CORRIENTES: 'CORRIENTES',
  CORDOBA: 'CORDOBA',
  'ENTRE RIOS': 'ENTRE_RIOS',
  FORMOSA: 'FORMOSA',
  JUJUY: 'JUJUY',
  'LA PAMPA': 'LA_PAMPA',
  'LA RIOJA': 'LA_RIOJA',
  MENDOZA: 'MENDOZA',
  MISIONES: 'MISIONES',
  NEUQUEN: 'NEUQUEN',
  'RIO NEGRO': 'RIO_NEGRO',
  SALTA: 'SALTA',
  'SAN JUAN': 'SAN_JUAN',
  'SAN LUIS': 'SAN_LUIS',
  'SANTA CRUZ': 'SANTA_CRUZ',
  'SANTA FE': 'SANTA_FE',
  'SANTIAGO DEL ESTERO': 'SANTIAGO_DEL_ESTERO',
  SANTIAGO_ESTERO: 'SANTIAGO_DEL_ESTERO',
  'TIERRA DEL FUEGO': 'TIERRA_DEL_FUEGO',
  TUCUMAN: 'TUCUMAN'
};

export function resolveFeatureProvinceId(feat: GeoFeatureItem): string {
  if (feat.subRegion && PROVINCE_NAME_TO_ID[feat.subRegion]) {
    return PROVINCE_NAME_TO_ID[feat.subRegion]!;
  }
  return PROVINCE_NAME_TO_ID[feat.name] ?? feat.id;
}

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
  if (!d) return null;
  const { name, subRegion } = extractFeatureNames(feat.properties);
  const id = feat.properties.id ? String(feat.properties.id) : name;
  return { id, name, subRegion, pathD: d };
}

function findMinPolygonLongitude(poly: any): number {
  let minLon = 999;
  function walk(c: any) {
    if (typeof c[0] === 'number') {
      minLon = Math.min(minLon, c[0]);
    } else {
      c.forEach(walk);
    }
  }
  walk(poly);
  return minLon;
}

function filterMalvinasPolygons(feat: any) {
  const malvinasPolys = feat.geometry.coordinates.filter(
    (poly: any) => findMinPolygonLongitude(poly) < -56
  );
  return {
    ...feat,
    properties: {
      ...feat.properties,
      departamento: 'ISLAS MALVINAS',
      provincia: 'TIERRA DEL FUEGO'
    },
    geometry: {
      ...feat.geometry,
      coordinates: malvinasPolys
    }
  };
}

function sanitizeDeptFeature(feat: any): any | null {
  const id = Number(feat.properties?.id);
  // Feature 488 en el IGN trae coordenadas antarticas hasta -90 que explotan en Mercator.
  if (id === 488) return null;
  // Feature 489 agrupa Malvinas + Georgias + Sandwich; filtramos a lon < -56 para escala real.
  if (id === 489 && feat.geometry?.type === 'MultiPolygon') {
    return filterMalvinasPolygons(feat);
  }
  return feat;
}

const CONURBANO_NAMES = new Set([
  'ALMIRANTE BROWN',
  'AVELLANEDA',
  'BERAZATEGUI',
  'ESTEBAN ECHEVERRIA',
  'EZEIZA',
  'FLORENCIO VARELA',
  'GENERAL SAN MARTIN',
  'HURLINGHAM',
  'ITUZAINGO',
  'JOSE C. PAZ',
  'LA MATANZA',
  'LANUS',
  'LOMAS DE ZAMORA',
  'MALVINAS ARGENTINAS',
  'MERLO',
  'MORENO',
  'MORON',
  'QUILMES',
  'SAN FERNANDO',
  'SAN ISIDRO',
  'SAN MIGUEL',
  'TIGRE',
  'TRES DE FEBRERO',
  'VICENTE LOPEZ'
]);

function buildConurbanoPathGenerator() {
  const projection = geoMercator()
    .center([-58.58, -34.62])
    .scale(11500)
    .translate([150, 150]);
  return geoPath().projection(projection);
}

function isConurbanoFeature(props: any): boolean {
  if (!props || props.provincia !== 'BUENOS AIRES') return false;
  const dept = String(props.departamento || '').toUpperCase();
  return CONURBANO_NAMES.has(dept);
}

export function normalizeConurbanoFeatures(topoData: any): GeoFeatureItem[] {
  const pathGen = buildConurbanoPathGenerator();
  const geoObj = topojson.feature(topoData, topoData.objects['departamentos-argentina']) as any;
  const items: GeoFeatureItem[] = [];
  for (const feat of geoObj.features) {
    if (!isConurbanoFeature(feat.properties)) continue;
    const item = convertGeoFeature(feat, pathGen);
    if (item) items.push(item);
  }
  return items;
}

export function normalizeFeatures(topoData: any, objectKey: string): GeoFeatureItem[] {
  const pathGen = buildPathGenerator();
  const geoObj = topojson.feature(topoData, topoData.objects[objectKey]) as any;
  const items: GeoFeatureItem[] = [];
  for (const rawFeat of geoObj.features) {
    const feat = objectKey === 'departamentos-argentina' ? sanitizeDeptFeature(rawFeat) : rawFeat;
    if (!feat) continue;
    const item = convertGeoFeature(feat, pathGen);
    if (item) items.push(item);
  }
  return items;
}

export function TacticalSvgBackdrop() {
  return (
    <g className="pointer-events-none">
      {[120, 220, 320, 420, 520, 620].map((y) => (
        <line
          key={`lat-${y}`}
          x1={55}
          y1={y}
          x2={375}
          y2={y}
          stroke="#1e293b"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      ))}
      {[110, 180, 250, 320].map((x) => (
        <line
          key={`lon-${x}`}
          x1={x}
          y1={55}
          x2={x}
          y2={700}
          stroke="#1e293b"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      ))}
      <g transform="translate(338, 92)">
        <circle cx={0} cy={0} r={18} fill="#090d14" stroke="#8a6d33" strokeWidth={0.9} />
        <circle cx={0} cy={0} r={13} fill="none" stroke="#263142" strokeWidth={0.6} />
        <polygon points="0,-15 3.5,-3 0,-6 -3.5,-3" fill="#eab308" />
        <polygon points="0,15 3,3 0,6 -3,3" fill="#64748b" />
        <text x={0} y={-19} textAnchor="middle" fill="#eab308" fontSize={7} fontFamily="monospace" fontWeight="bold">
          N
        </text>
      </g>
      <g transform="translate(278, 595)">
        <rect x={0} y={0} width={88} height={22} rx={2} fill="#090d14" stroke="#263142" strokeWidth={0.8} />
        <text x={44} y={9} textAnchor="middle" fill="#94a3b8" fontSize={6} fontFamily="monospace">
          ATLÁNTICO SUR · IGN
        </text>
        <line x1={12} y1={16} x2={52} y2={16} stroke="#eab308" strokeWidth={1.2} />
        <text x={68} y={18} textAnchor="middle" fill="#eab308" fontSize={6} fontFamily="monospace">
          500km
        </text>
      </g>
    </g>
  );
}

function DistrictPopupCard({
  data,
  onClose
}: {
  data: DistrictPopupData;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-3 left-3 z-30 w-72 rounded-sm bg-[#090d14]/95 border border-[#8a6d33] p-3.5 shadow-2xl text-xs">
      <div className="flex items-start justify-between gap-2 border-b border-[#263142] pb-2">
        <div>
          <div className="font-serif font-bold text-amber-100 text-sm uppercase tracking-wide">{data.title}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            {data.subTitle ? `${data.subTitle} · ` : ''}Padrón: {data.electorateText} · Indecisos {data.indecisosPct}%
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-amber-200 px-1.5 py-0.5 rounded-sm border border-[#263142] text-[10px] font-mono"
        >
          ✕
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        {data.candidates.map((c, idx) => (
          <div key={c.name}>
            <div className="flex justify-between items-center mb-0.5 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-200">
                <span
                  style={{ backgroundColor: c.color }}
                  className="w-2 h-2 rounded-sm inline-block shrink-0"
                />
                <span className={`truncate max-w-[155px] ${idx === 0 ? 'font-bold text-amber-100' : ''}`}>
                  {c.name}
                </span>
              </span>
              <span className="font-mono font-bold text-amber-300">{c.pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#141c28] border border-[#263142] overflow-hidden">
              <div
                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                className="h-full transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>SONDEO TERRITORIAL</span>
        <span className="text-emerald-400">Líder: {data.candidates[0]?.name ?? '-'}</span>
      </div>
    </div>
  );
}

function resolveDistrictLeadColor(
  name: string,
  subRegion: string,
  provId: string,
  partySigla: string,
  internalCandidates: DistrictCandidateBase[] | undefined,
  fallbackColor: string
): string {
  const popup = buildDistrictPopup(name, subRegion, provId, partySigla, internalCandidates);
  return popup.candidates[0]?.color ?? fallbackColor;
}

interface ConurbanoZoomPanelProps {
  features: GeoFeatureItem[];
  partySigla: string;
  internalCandidates?: DistrictCandidateBase[];
  onSelectDistrict: (popup: DistrictPopupData) => void;
}

function ConurbanoZoomPanel({
  features,
  partySigla,
  internalCandidates,
  onSelectDistrict
}: ConurbanoZoomPanelProps) {
  const [hoveredPartido, setHoveredPartido] = useState<string | null>(null);

  return (
    <div className="w-full md:w-[270px] rounded-sm bg-[#090d14] border border-[#263142] p-3 space-y-2 select-none">
      <div className="flex justify-between items-center border-b border-[#1e293b] pb-1.5">
        <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-200">
          Lente AMBA · 24 Partidos
        </span>
        <span className="text-[10px] font-mono text-sky-400">
          {hoveredPartido ?? '1ra y 3ra Sección'}
        </span>
      </div>
      <div className="h-[260px] w-full relative bg-[#070a10] rounded-sm border border-[#1a2434] p-1">
        <svg
          viewBox="70 -10 210 270"
          className="w-full h-full filter drop-shadow-xl"
          aria-label="Zoom del Conurbano Bonaerense"
        >
          {features.map((feat) => {
            const fillColor = resolveDistrictLeadColor(
              feat.name,
              'Buenos Aires',
              'PBA',
              partySigla,
              internalCandidates,
              '#eab308'
            );
            return (
              <path
                key={feat.id}
                d={feat.pathD}
                fill={fillColor}
                stroke="#090d14"
                strokeWidth={0.95}
                className="cursor-pointer transition-all hover:brightness-125 hover:stroke-amber-200"
                onMouseEnter={() => setHoveredPartido(feat.name)}
                onMouseLeave={() => setHoveredPartido(null)}
                onClick={() =>
                  onSelectDistrict(
                    buildDistrictPopup(feat.name, 'Buenos Aires', 'PBA', partySigla, internalCandidates)
                  )
                }
              >
                <title>{feat.name} (Conurbano)</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>Click en cada municipio para sondeo</span>
        <span className="text-amber-300">Padrón: 9,4M</span>
      </div>
    </div>
  );
}

interface ArgentinaRealVectorMapProps {
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  provinces: ProvinceCampaignInfo[];
  selectedProvinceId: string;
  partySigla?: string;
  internalCandidates?: DistrictCandidateBase[];
  onSelectProvince: (id: string) => void;
}

interface ArgentinaSideProvinceListProps {
  provinces: ProvinceCampaignInfo[];
  selectedProvinceId: string;
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  partySigla: string;
  internalCandidates?: DistrictCandidateBase[];
  onSelectProvince: (id: string) => void;
  onSelectPopup: (popup: DistrictPopupData) => void;
}

function isSameProvinceId(a: string, b: string): boolean {
  const normA = a === 'SANTIAGO_ESTERO' ? 'SANTIAGO_DEL_ESTERO' : a;
  const normB = b === 'SANTIAGO_ESTERO' ? 'SANTIAGO_DEL_ESTERO' : b;
  return normA === normB;
}

function ArgentinaSideProvinceList({
  provinces,
  selectedProvinceId,
  mode,
  partySigla,
  internalCandidates,
  onSelectProvince,
  onSelectPopup
}: ArgentinaSideProvinceListProps) {
  const title = mode === 'PROVINCIA' ? '24 Jurisdicciones Federales' : '527 Departamentos IGN';

  return (
    <div className="w-full lg:w-80 rounded-sm bg-[#090d14] border border-[#263142] p-3 space-y-2.5 text-xs">
      <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
        <span className="text-[11px] font-serif font-bold text-amber-100 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[10px] font-mono text-emerald-400">IGN Vectorial</span>
      </div>

      <div className="max-h-[410px] overflow-y-auto space-y-1.5 pr-1">
        {provinces.map((p) => {
          const isSelected = isSameProvinceId(p.provinceId, selectedProvinceId);
          const leadColor = resolveDistrictLeadColor(
            p.provinceName,
            '',
            p.provinceId,
            partySigla,
            internalCandidates,
            p.leadingPartyColor
          );
          const bgClass = isSelected
            ? 'bg-[#172234] border-[#c9a24d] text-amber-100 font-bold'
            : 'bg-[#0c1119] border-[#1e293b] text-slate-300 hover:border-[#344661]';

          return (
            <button
              key={p.provinceId}
              type="button"
              onClick={() => {
                onSelectProvince(p.provinceId);
                onSelectPopup(buildDistrictPopup(p.provinceName, '', p.provinceId, partySigla, internalCandidates));
              }}
              className={`w-full text-left px-3 py-2 rounded-sm border transition flex items-center justify-between ${bgClass}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ backgroundColor: leadColor }}
                  className="w-2.5 h-2.5 rounded-sm inline-block shrink-0 border border-black/40"
                />
                <span className="truncate">{p.provinceName}</span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-emerald-400 font-bold">{p.playerVotePct.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500 ml-1.5">
                  ({p.visitsCount}v)
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ArgentinaMainSvgCardProps {
  activeFeatures: GeoFeatureItem[];
  selectedProvinceId: string;
  provinceColorMap: Record<string, string>;
  partySigla: string;
  internalCandidates?: DistrictCandidateBase[];
  popupDistrict: DistrictPopupData | null;
  onHover: (info: string | null) => void;
  onSelectProvince: (id: string) => void;
  onSelectPopup: (popup: DistrictPopupData) => void;
  onClosePopup: () => void;
}

function ArgentinaMainSvgCard({
  activeFeatures,
  selectedProvinceId,
  provinceColorMap,
  partySigla,
  internalCandidates,
  popupDistrict,
  onHover,
  onSelectProvince,
  onSelectPopup,
  onClosePopup
}: ArgentinaMainSvgCardProps) {
  return (
    <div className="w-full md:w-[360px] h-[470px] relative select-none rounded-sm bg-[#070a10] border border-[#263142] p-2">
      <svg
        viewBox="50 50 330 660"
        className="w-full h-full filter drop-shadow-2xl"
        aria-label="Mapa cartográfico oficial de la República Argentina"
      >
        <TacticalSvgBackdrop />
        {activeFeatures.map((feat) => {
          const mappedProvId = resolveFeatureProvinceId(feat);
          const isSelected = isSameProvinceId(mappedProvId, selectedProvinceId);
          const fallbackColor = provinceColorMap[mappedProvId] ?? '#ca8a04';
          const fillColor = resolveDistrictLeadColor(
            feat.name,
            feat.subRegion,
            mappedProvId,
            partySigla,
            internalCandidates,
            fallbackColor
          );

          return (
            <path
              key={feat.id}
              d={feat.pathD}
              fill={fillColor}
              stroke={isSelected ? '#fde68a' : '#090d14'}
              strokeWidth={isSelected ? 2.2 : 0.65}
              strokeOpacity={0.92}
              className="cursor-pointer transition-colors duration-150 hover:brightness-125"
              onMouseEnter={() =>
                onHover(feat.subRegion ? `${feat.name} (${feat.subRegion})` : feat.name)
              }
              onMouseLeave={() => onHover(null)}
              onClick={() => {
                onSelectProvince(mappedProvId);
                onSelectPopup(buildDistrictPopup(feat.name, feat.subRegion, mappedProvId, partySigla, internalCandidates));
              }}
            />
          );
        })}
      </svg>

      <button
        type="button"
        onClick={() => {
          onSelectProvince('CABA');
          onSelectPopup(buildDistrictPopup('Ciudad de Buenos Aires', '', 'CABA', partySigla, internalCandidates));
        }}
        className={`absolute top-48 right-3 px-2 py-1 rounded-sm border text-[10px] font-mono font-bold transition shadow-lg ${
          selectedProvinceId === 'CABA'
            ? 'bg-[#b89342] text-[#090d14] border-amber-200'
            : 'bg-[#090d14]/95 text-amber-200 border-[#8a6d33] hover:bg-[#162234]'
        }`}
      >
        ● CABA
      </button>

      {popupDistrict ? (
        <DistrictPopupCard data={popupDistrict} onClose={onClosePopup} />
      ) : null}
    </div>
  );
}

function resolveActiveFeatures(
  mode: 'PROVINCIA' | 'DEPARTAMENTO',
  deptFeatures: GeoFeatureItem[],
  provinceFeatures: GeoFeatureItem[]
): GeoFeatureItem[] {
  if (mode === 'DEPARTAMENTO' && deptFeatures.length > 0) {
    return deptFeatures;
  }
  return provinceFeatures;
}

function HoveredDistrictBadge({ info }: { info: string | null }) {
  if (!info) return null;
  return (
    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-sm bg-[#090d14]/95 border border-[#8a6d33] text-[11px] font-mono font-bold text-amber-200 shadow-xl pointer-events-none">
      ⌖ {info}
    </div>
  );
}

function CandidateMapLegend({
  candidates
}: {
  candidates?: DistrictCandidateBase[];
}) {
  if (!candidates || candidates.length === 0) return null;
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-sm bg-[#090d14] border border-[#263142] text-[11px] font-mono">
      <span className="text-slate-400 uppercase tracking-wider">Puntero por distrito:</span>
      <div className="flex flex-wrap items-center gap-3">
        {candidates.map((c) => (
          <span key={c.name} className="inline-flex items-center gap-1.5 text-slate-200">
            <span style={{ backgroundColor: c.color }} className="w-2.5 h-2.5 rounded-sm inline-block" />
            <span>{c.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ArgentinaRealVectorMap({
  mode,
  provinces,
  selectedProvinceId,
  partySigla = 'LLA',
  internalCandidates,
  onSelectProvince
}: ArgentinaRealVectorMapProps) {
  const [provinceFeatures, setProvinceFeatures] = useState<GeoFeatureItem[]>([]);
  const [deptFeatures, setDeptFeatures] = useState<GeoFeatureItem[]>([]);
  const [conurbanoFeatures, setConurbanoFeatures] = useState<GeoFeatureItem[]>([]);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [popupDistrict, setPopupDistrict] = useState<DistrictPopupData | null>(null);

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((topo) => setProvinceFeatures(normalizeFeatures(topo, 'ARG_adm1')))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (deptFeatures.length > 0) return;
    fetch('/geo/argentina-departamentos.topojson')
      .then((res) => res.json())
      .then((topo) => {
        setDeptFeatures(normalizeFeatures(topo, 'departamentos-argentina'));
        setConurbanoFeatures(normalizeConurbanoFeatures(topo));
      })
      .catch(() => undefined);
  }, [deptFeatures.length]);

  const provinceColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of provinces) {
      map[p.provinceId] = p.leadingPartyColor;
      if (p.provinceId === 'SANTIAGO_DEL_ESTERO' || p.provinceId === 'SANTIAGO_ESTERO') {
        map.SANTIAGO_DEL_ESTERO = p.leadingPartyColor;
        map.SANTIAGO_ESTERO = p.leadingPartyColor;
      }
    }
    return map;
  }, [provinces]);

  const activeFeatures = resolveActiveFeatures(mode, deptFeatures, provinceFeatures);
  const showConurbano = conurbanoFeatures.length > 0;

  return (
    <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4 relative space-y-3">
      <HoveredDistrictBadge info={hoveredInfo} />
      <CandidateMapLegend candidates={internalCandidates} />

      <div className="flex flex-col xl:flex-row items-stretch justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-1">
          <ArgentinaMainSvgCard
            activeFeatures={activeFeatures}
            selectedProvinceId={selectedProvinceId}
            provinceColorMap={provinceColorMap}
            partySigla={partySigla}
            internalCandidates={internalCandidates}
            popupDistrict={popupDistrict}
            onHover={setHoveredInfo}
            onSelectProvince={onSelectProvince}
            onSelectPopup={setPopupDistrict}
            onClosePopup={() => setPopupDistrict(null)}
          />

          {showConurbano ? (
            <ConurbanoZoomPanel
              features={conurbanoFeatures}
              partySigla={partySigla}
              internalCandidates={internalCandidates}
              onSelectDistrict={(popup) => setPopupDistrict(popup)}
            />
          ) : null}
        </div>

        <ArgentinaSideProvinceList
          provinces={provinces}
          selectedProvinceId={selectedProvinceId}
          mode={mode}
          partySigla={partySigla}
          internalCandidates={internalCandidates}
          onSelectProvince={onSelectProvince}
          onSelectPopup={setPopupDistrict}
        />
      </div>
    </div>
  );
}
