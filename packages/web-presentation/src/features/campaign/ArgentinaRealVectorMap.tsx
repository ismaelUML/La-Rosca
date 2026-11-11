import React, { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceCampaignInfo } from '@argentina-sim/domain';
import {
  buildDistrictPopup,
  type DistrictCandidateProjection,
  type DistrictPopupData
} from './districtPollGenerator.js';

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
  'SANTIAGO DEL ESTERO': 'SANTIAGO_ESTERO',
  'TIERRA DEL FUEGO': 'TIERRA_DEL_FUEGO',
  TUCUMAN: 'TUCUMAN'
};

function resolveFeatureProvinceId(feat: GeoFeatureItem): string {
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
  if (!d) {
    return null;
  }
  const { name, subRegion } = extractFeatureNames(feat.properties);
  const id = feat.properties.id ? String(feat.properties.id) : name;
  return { id, name, subRegion, pathD: d };
}

function sanitizeDeptFeature(feat: any): any | null {
  const id = Number(feat.properties?.id);
  // Feature 488 es el sector antartico con latitudes hasta -90 que hace divergir geoMercator a -infinito
  if (id === 488) {
    return null;
  }
  // Feature 489 contiene las Islas Malvinas y Georgias/Sandwich.
  // Filtramos para incluir las Islas Malvinas (lon < -56) dentro de la proyeccion continental.
  if (id === 489 && feat.geometry?.type === 'MultiPolygon') {
    const malvinasPolys = feat.geometry.coordinates.filter((poly: any) => {
      let minLon = 999;
      function walk(c: any) {
        if (typeof c[0] === 'number') {
          minLon = Math.min(minLon, c[0]);
        } else {
          c.forEach(walk);
        }
      }
      walk(poly);
      return minLon < -56;
    });
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
  if (!props || props.provincia !== 'BUENOS AIRES') {
    return false;
  }
  const dept = String(props.departamento || '').toUpperCase();
  return CONURBANO_NAMES.has(dept);
}

function normalizeConurbanoFeatures(topoData: any): GeoFeatureItem[] {
  const pathGen = buildConurbanoPathGenerator();
  const geoObj = topojson.feature(topoData, topoData.objects['departamentos-argentina']) as any;
  const items: GeoFeatureItem[] = [];

  for (const feat of geoObj.features) {
    if (!isConurbanoFeature(feat.properties)) {
      continue;
    }
    const item = convertGeoFeature(feat, pathGen);
    if (item) {
      items.push(item);
    }
  }
  return items;
}

function normalizeFeatures(topoData: any, objectKey: string): GeoFeatureItem[] {
  const pathGen = buildPathGenerator();
  const geoObj = topojson.feature(topoData, topoData.objects[objectKey]) as any;
  const items: GeoFeatureItem[] = [];

  for (const rawFeat of geoObj.features) {
    const feat = objectKey === 'departamentos-argentina' ? sanitizeDeptFeature(rawFeat) : rawFeat;
    if (!feat) {
      continue;
    }
    const item = convertGeoFeature(feat, pathGen);
    if (item) {
      items.push(item);
    }
  }
  return items;
}

function DistrictPopupCard({
  data,
  onClose
}: {
  data: DistrictPopupData;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-3 left-3 z-30 w-72 rounded-2xl bg-[#0d1017]/95 border border-slate-700/80 p-4 shadow-2xl backdrop-blur-md text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold text-white text-sm">{data.title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {data.subTitle} · padrón: {data.electorateText} · indecisos ≈ {data.indecisosPct} %
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md text-xs font-bold"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        {data.candidates.map((c) => (
          <div key={c.name}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <span
                  style={{ backgroundColor: c.color }}
                  className="w-2 h-2 rounded-full inline-block"
                />
                <span className="truncate max-w-[150px]">{c.name}</span>
              </span>
              <span className="font-mono font-bold text-white">{c.pct.toFixed(1)} %</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
        Proyección de voto.
      </div>
    </div>
  );
}

interface ConurbanoZoomPanelProps {
  features: GeoFeatureItem[];
  partySigla: string;
  onSelectDistrict: (popup: DistrictPopupData) => void;
}

function ConurbanoZoomPanel({
  features,
  partySigla,
  onSelectDistrict
}: ConurbanoZoomPanelProps) {
  return (
    <div className="w-full md:w-[280px] rounded-2xl bg-[#0d1017] border border-slate-800 p-3 space-y-2 select-none">
      <div className="flex justify-between items-center text-xs">
        <span className="font-extrabold text-white">Zoom: conurbano bonaerense</span>
        <span className="text-[10px] text-slate-400">Proyección por partido</span>
      </div>
      <div className="h-[260px] w-full relative">
        <svg
          viewBox="70 -10 210 270"
          className="w-full h-full filter drop-shadow-xl"
          aria-label="Zoom del Conurbano Bonaerense"
        >
          {features.map((feat) => (
            <path
              key={feat.id}
              d={feat.pathD}
              fill="#ca8a04"
              stroke="#0f172a"
              strokeWidth={0.9}
              className="cursor-pointer transition-colors hover:brightness-125 hover:stroke-white"
              onClick={() =>
                onSelectDistrict(
                  buildDistrictPopup(feat.name, 'Buenos Aires', 'PBA', partySigla)
                )
              }
            >
              <title>{feat.name} (Conurbano)</title>
            </path>
          ))}
        </svg>
      </div>
    </div>
  );
}

interface ArgentinaRealVectorMapProps {
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  provinces: ProvinceCampaignInfo[];
  selectedProvinceId: string;
  partySigla?: string;
  onSelectProvince: (id: string) => void;
}

interface ArgentinaSideProvinceListProps {
  provinces: ProvinceCampaignInfo[];
  selectedProvinceId: string;
  mode: 'PROVINCIA' | 'DEPARTAMENTO';
  partySigla: string;
  onSelectProvince: (id: string) => void;
  onSelectPopup: (popup: DistrictPopupData) => void;
}

function ArgentinaSideProvinceList({
  provinces,
  selectedProvinceId,
  mode,
  partySigla,
  onSelectProvince,
  onSelectPopup
}: ArgentinaSideProvinceListProps) {
  const title = mode === 'PROVINCIA' ? '24 Provincias Oficiales' : '527 Departamentos IGN';

  return (
    <div className="flex-1 max-w-sm space-y-3 text-xs">
      <div className="flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider">
        <span>{title}</span>
        <span className="text-[10px] font-mono text-emerald-400">Cartografía IGN 100% Vectorial</span>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-2">
        {provinces.map((p) => {
          const isSelected = p.provinceId === selectedProvinceId;
          const bgClass = isSelected
            ? 'bg-[#181d2c] border-white text-white font-bold'
            : 'bg-[#10131b] border-slate-800 text-slate-300 hover:border-slate-700';

          return (
            <button
              key={p.provinceId}
              type="button"
              onClick={() => {
                onSelectProvince(p.provinceId);
                onSelectPopup(buildDistrictPopup(p.provinceName, '', p.provinceId, partySigla));
              }}
              className={`w-full text-left px-3 py-2 rounded-xl border transition flex items-center justify-between ${bgClass}`}
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
  );
}

interface ArgentinaMainSvgCardProps {
  activeFeatures: GeoFeatureItem[];
  selectedProvinceId: string;
  provinceColorMap: Record<string, string>;
  partySigla: string;
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
  popupDistrict,
  onHover,
  onSelectProvince,
  onSelectPopup,
  onClosePopup
}: ArgentinaMainSvgCardProps) {
  return (
    <div className="w-full md:w-[360px] h-[480px] relative select-none">
      <svg
        viewBox="50 50 330 660"
        className="w-full h-full filter drop-shadow-2xl"
        aria-label="Mapa cartográfico oficial de la República Argentina"
      >
        {activeFeatures.map((feat) => {
          const mappedProvId = resolveFeatureProvinceId(feat);
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
                onHover(feat.subRegion ? `${feat.name} (${feat.subRegion})` : feat.name)
              }
              onMouseLeave={() => onHover(null)}
              onClick={() => {
                onSelectProvince(mappedProvId);
                onSelectPopup(buildDistrictPopup(feat.name, feat.subRegion, mappedProvId, partySigla));
              }}
            />
          );
        })}
      </svg>

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
  if (!info) {
    return null;
  }
  return (
    <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-slate-700 text-xs font-medium text-slate-200 shadow-xl pointer-events-none">
      {info}
    </div>
  );
}

function ConurbanoZoomSlot({
  show,
  features,
  partySigla,
  onSelectDistrict
}: {
  show: boolean;
  features: GeoFeatureItem[];
  partySigla: string;
  onSelectDistrict: (popup: DistrictPopupData) => void;
}) {
  if (!show) {
    return null;
  }
  return (
    <ConurbanoZoomPanel
      features={features}
      partySigla={partySigla}
      onSelectDistrict={onSelectDistrict}
    />
  );
}

export function ArgentinaRealVectorMap({
  mode,
  provinces,
  selectedProvinceId,
  partySigla = 'PRO',
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
    if (deptFeatures.length > 0) {
      return;
    }
    if (mode === 'DEPARTAMENTO' || selectedProvinceId === 'PBA') {
      fetch('/geo/argentina-departamentos.topojson')
        .then((res) => res.json())
        .then((topo) => {
          setDeptFeatures(normalizeFeatures(topo, 'departamentos-argentina'));
          setConurbanoFeatures(normalizeConurbanoFeatures(topo));
        })
        .catch(() => undefined);
    }
  }, [mode, selectedProvinceId, deptFeatures.length]);

  const provinceColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of provinces) {
      map[p.provinceId] = p.leadingPartyColor;
    }
    return map;
  }, [provinces]);

  const activeFeatures = resolveActiveFeatures(mode, deptFeatures, provinceFeatures);
  const showConurbano = selectedProvinceId === 'PBA' && conurbanoFeatures.length > 0;

  return (
    <div className="rounded-2xl bg-[#0b0e15] border border-slate-800/90 p-4 relative flex flex-col md:flex-row items-center justify-center gap-6">
      <HoveredDistrictBadge info={hoveredInfo} />

      <div className="flex flex-col xl:flex-row items-center gap-4">
        <ArgentinaMainSvgCard
          activeFeatures={activeFeatures}
          selectedProvinceId={selectedProvinceId}
          provinceColorMap={provinceColorMap}
          partySigla={partySigla}
          popupDistrict={popupDistrict}
          onHover={setHoveredInfo}
          onSelectProvince={onSelectProvince}
          onSelectPopup={setPopupDistrict}
          onClosePopup={() => setPopupDistrict(null)}
        />

        <ConurbanoZoomSlot
          show={showConurbano}
          features={conurbanoFeatures}
          partySigla={partySigla}
          onSelectDistrict={(popup) => setPopupDistrict(popup)}
        />
      </div>

      <ArgentinaSideProvinceList
        provinces={provinces}
        selectedProvinceId={selectedProvinceId}
        mode={mode}
        partySigla={partySigla}
        onSelectProvince={onSelectProvince}
        onSelectPopup={setPopupDistrict}
      />
    </div>
  );
}
