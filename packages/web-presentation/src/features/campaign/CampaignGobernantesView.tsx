import React, { useEffect, useMemo, useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import {
  type GeoFeatureItem,
  normalizeFeatures,
  resolveFeatureProvinceId,
  TacticalSvgBackdrop
} from './ArgentinaRealVectorMap.js';
import { OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Vista de POLITICO -> Gobernantes en estetica tactica acero/bronce:
// Mapa vectorial interactivo de los 24 gobernadores por bloque ideologico (Derecha 7, Centro 11, Izquierda 6),
// grilla de jurisdicciones y dossier politico de cada mandatario provincial.

interface GovernorInfo {
  provinceId: string;
  provinceName: string;
  governorName: string;
  partyName: string;
  sinceDate: string;
  faction: 'DERECHA' | 'CENTRO' | 'IZQUIERDA';
  factionLabel: string;
  politicalPosition: number;
  affinityWithPlayerPct: number;
  relationshipScore: number;
  color: string;
}

const GOVERNORS_DATASET: GovernorInfo[] = [
  { provinceId: 'PBA', provinceName: 'Buenos Aires', governorName: 'Axel Kicillof', partyName: 'Unión por la Patria', sinceDate: '10 de diciembre de 2023', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -45, affinityWithPlayerPct: 31, relationshipScore: 42, color: '#ef4444' },
  { provinceId: 'CABA', provinceName: 'Ciudad de Buenos Aires', governorName: 'Jorge Macri', partyName: 'PRO', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 65, affinityWithPlayerPct: 84, relationshipScore: 78, color: '#2563eb' },
  { provinceId: 'CORDOBA', provinceName: 'Córdoba', governorName: 'Martín Llaryora', partyName: 'Hacemos Unidos por Córdoba', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 15, affinityWithPlayerPct: 62, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'SANTA_FE', provinceName: 'Santa Fe', governorName: 'Maximiliano Pullaro', partyName: 'Unidos para Cambiar Santa Fe', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 30, affinityWithPlayerPct: 71, relationshipScore: 75, color: '#14b8a6' },
  { provinceId: 'MENDOZA', provinceName: 'Mendoza', governorName: 'Alfredo Cornejo', partyName: 'Cambia Mendoza (UCR)', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 55, affinityWithPlayerPct: 75, relationshipScore: 72, color: '#2563eb' },
  { provinceId: 'ENTRE_RIOS', provinceName: 'Entre Ríos', governorName: 'Rogelio Frigerio', partyName: 'Juntos por Entre Ríos', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 52, affinityWithPlayerPct: 80, relationshipScore: 82, color: '#2563eb' },
  { provinceId: 'TUCUMAN', provinceName: 'Tucumán', governorName: 'Osvaldo Jaldo', partyName: 'Partido Justicialista', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: -10, affinityWithPlayerPct: 55, relationshipScore: 60, color: '#14b8a6' },
  { provinceId: 'SALTA', provinceName: 'Salta', governorName: 'Gustavo Sáenz', partyName: 'Identidad Salteña', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 5, affinityWithPlayerPct: 58, relationshipScore: 64, color: '#14b8a6' },
  { provinceId: 'CHUBUT', provinceName: 'Chubut', governorName: 'Ignacio Torres', partyName: 'Despierta Chubut (PRO)', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 48, affinityWithPlayerPct: 78, relationshipScore: 70, color: '#2563eb' },
  { provinceId: 'CHACO', provinceName: 'Chaco', governorName: 'Leandro Zdero', partyName: 'Juntos por el Cambio', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 46, affinityWithPlayerPct: 72, relationshipScore: 70, color: '#2563eb' },
  { provinceId: 'CORRIENTES', provinceName: 'Corrientes', governorName: 'Gustavo Valdés', partyName: 'ECO + Vamos Corrientes', sinceDate: '10 de diciembre de 2021', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 35, affinityWithPlayerPct: 69, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'FORMOSA', provinceName: 'Formosa', governorName: 'Gildo Insfrán', partyName: 'Partido Justicialista', sinceDate: '10 de diciembre de 1995', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -60, affinityWithPlayerPct: 18, relationshipScore: 25, color: '#ef4444' },
  { provinceId: 'LA_RIOJA', provinceName: 'La Rioja', governorName: 'Ricardo Quintela', partyName: 'Frente de Todos', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -55, affinityWithPlayerPct: 22, relationshipScore: 30, color: '#ef4444' },
  { provinceId: 'TIERRA_DEL_FUEGO', provinceName: 'Tierra del Fuego', governorName: 'Gustavo Melella', partyName: 'FORJA / UxP', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -40, affinityWithPlayerPct: 28, relationshipScore: 35, color: '#ef4444' },
  { provinceId: 'SANTA_CRUZ', provinceName: 'Santa Cruz', governorName: 'Claudio Vidal', partyName: 'Por Santa Cruz', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 8, affinityWithPlayerPct: 54, relationshipScore: 58, color: '#14b8a6' },
  { provinceId: 'NEUQUEN', provinceName: 'Neuquén', governorName: 'Rolando Figueroa', partyName: 'Comunidad', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 12, affinityWithPlayerPct: 60, relationshipScore: 65, color: '#14b8a6' },
  { provinceId: 'RIO_NEGRO', provinceName: 'Río Negro', governorName: 'Alberto Weretilneck', partyName: 'Juntos Somos Río Negro', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 10, affinityWithPlayerPct: 58, relationshipScore: 62, color: '#14b8a6' },
  { provinceId: 'MISIONES', provinceName: 'Misiones', governorName: 'Hugo Passalacqua', partyName: 'Frente Renovador de la Concordia', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 5, affinityWithPlayerPct: 55, relationshipScore: 59, color: '#14b8a6' },
  { provinceId: 'SAN_JUAN', provinceName: 'San Juan', governorName: 'Marcelo Orrego', partyName: 'Cambia San Juan', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 45, affinityWithPlayerPct: 74, relationshipScore: 72, color: '#2563eb' },
  { provinceId: 'SAN_LUIS', provinceName: 'San Luis', governorName: 'Claudio Poggi', partyName: 'Cambia San Luis', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 44, affinityWithPlayerPct: 73, relationshipScore: 74, color: '#2563eb' },
  { provinceId: 'JUJUY', provinceName: 'Jujuy', governorName: 'Carlos Sadir', partyName: 'Frente Cambia Jujuy', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 28, affinityWithPlayerPct: 67, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'CATAMARCA', provinceName: 'Catamarca', governorName: 'Raúl Jalil', partyName: 'Frente de Todos', sinceDate: '10 de diciembre de 2019', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: -15, affinityWithPlayerPct: 48, relationshipScore: 52, color: '#14b8a6' },
  { provinceId: 'SANTIAGO_DEL_ESTERO', provinceName: 'Santiago del Estero', governorName: 'Gerardo Zamora', partyName: 'Frente Cívico por Santiago', sinceDate: '10 de diciembre de 2005', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -35, affinityWithPlayerPct: 34, relationshipScore: 40, color: '#ef4444' },
  { provinceId: 'LA_PAMPA', provinceName: 'La Pampa', governorName: 'Sergio Ziliotto', partyName: 'Frente Justicialista Pampeano', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -42, affinityWithPlayerPct: 32, relationshipScore: 38, color: '#ef4444' }
];

function GovernorsBlocSvgMap({
  selectedProvId,
  onSelectProv
}: {
  selectedProvId: string;
  onSelectProv: (id: string) => void;
}) {
  const [features, setFeatures] = useState<GeoFeatureItem[]>([]);
  const [hoveredText, setHoveredText] = useState<string | null>(null);

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((topo) => setFeatures(normalizeFeatures(topo, 'ARG_adm1')))
      .catch(() => undefined);
  }, []);

  const govById = useMemo(() => {
    const map: Record<string, GovernorInfo> = {};
    for (const g of GOVERNORS_DATASET) {
      map[g.provinceId] = g;
      if (g.provinceId === 'SANTIAGO_DEL_ESTERO') {
        map.SANTIAGO_ESTERO = g;
      }
    }
    return map;
  }, []);

  return (
    <div className="w-full md:w-[300px] h-[410px] rounded-sm bg-[#090407] border border-white/15 p-2 relative select-none shrink-0">
      {hoveredText ? (
        <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-sm bg-[#0b0508]/95 border border-[#EB3F7D]/55 text-[10px] font-mono text-[#EFE9DA] pointer-events-none">
          ⌖ {hoveredText}
        </div>
      ) : null}

      <svg
        viewBox="50 50 330 660"
        className="w-full h-full filter drop-shadow-2xl"
        aria-label="Mapa de gobernadores por bloque"
      >
        <TacticalSvgBackdrop />
        {features.map((feat) => {
          const mappedId = resolveFeatureProvinceId(feat);
          const gov = govById[mappedId];
          const isSelected = mappedId === selectedProvId;
          return (
            <path
              key={feat.id}
              d={feat.pathD}
              fill={gov?.color ?? '#14b8a6'}
              stroke={isSelected ? '#fde68a' : '#090d14'}
              strokeWidth={isSelected ? 2.2 : 0.65}
              className="cursor-pointer transition-colors duration-150 hover:brightness-125"
              onMouseEnter={() =>
                setHoveredText(gov ? `${gov.provinceName}: ${gov.governorName} (${gov.factionLabel})` : feat.name)
              }
              onMouseLeave={() => setHoveredText(null)}
              onClick={() => onSelectProv(mappedId)}
            />
          );
        })}
      </svg>

      <button
        type="button"
        onClick={() => onSelectProv('CABA')}
        className={`absolute top-40 right-2.5 px-2 py-1 rounded-sm border text-[10px] font-mono font-bold transition shadow ${
          selectedProvId === 'CABA'
            ? 'bg-[#EB3F7D] text-[#090407] border-[#EFE9DA]'
            : 'bg-[#0b0508]/95 text-[#EFE9DA] border-[#EB3F7D]/55 hover:bg-[#1c0e16]'
        }`}
      >
        ● CABA
      </button>
    </div>
  );
}

const GOV_LOGO_RULES: Array<[string, string]> = [
  ['libertad', 'LLA'],
  ['pro', 'PRO'],
  ['radical', 'UCR'],
  ['ucr', 'UCR'],
  ['cambia', 'UCR'],
  ['hacemos', 'PF'],
  ['unidos', 'PF'],
  ['patria', 'UXP'],
  ['justicialista', 'UXP'],
  ['todos', 'UXP'],
  ['uxp', 'UXP']
];

function resolveGovPartySigla(partyName: string): string {
  const lower = partyName.toLowerCase();
  const match = GOV_LOGO_RULES.find(([keyword]) => lower.includes(keyword));
  return match ? match[1] : 'PROVINCIALES';
}

function GovernorDossierPanel({ gov }: { gov: GovernorInfo }) {
  const badgeBg =
    gov.faction === 'IZQUIERDA'
      ? '#450a0a'
      : gov.faction === 'DERECHA'
        ? '#172554'
        : '#042f2e';

  return (
    <div className="hoi-panel rounded-sm p-5 space-y-4">
      <div className="border-b border-white/15 pb-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#EB3F7D]">
          DOSSIER DE MANDATARIO PROVINCIAL
        </div>
        <div className="text-xl font-serif font-bold text-[#F5EFE6] mt-0.5 uppercase tracking-wide">
          {gov.provinceName}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <OfficialPartyLogo partyIdOrSigla={resolveGovPartySigla(gov.partyName)} sizePx={24} fallbackColor={gov.color} />
          <span className="text-base font-bold text-white">{gov.governorName}</span>
          <span
            style={{
              backgroundColor: badgeBg,
              borderColor: gov.color,
              color: gov.color
            }}
            className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border"
          >
            {gov.factionLabel}
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400 mt-1">
          ● {gov.partyName} · en el cargo desde {gov.sinceDate}
        </div>
      </div>

      <div className="space-y-3.5 text-xs font-mono">
        <div className="p-3 rounded-sm bg-[#0b0508] border border-white/15">
          <div className="flex justify-between text-slate-300">
            <span>Posición ideológica:</span>
            <strong className="text-[#EFE9DA]">
              {gov.politicalPosition > 0 ? `+${gov.politicalPosition}` : gov.politicalPosition} (escala -100 a +100)
            </strong>
          </div>
        </div>

        <div className="p-3 rounded-sm bg-[#0b0508] border border-white/15 space-y-1.5">
          <div className="flex justify-between text-slate-300">
            <span>Afinidad con tu espacio:</span>
            <strong className="text-[#f472b6]">{gov.affinityWithPlayerPct}%</strong>
          </div>
          <div className="w-full h-2 rounded-sm bg-[#141c28] border border-white/15 overflow-hidden">
            <div
              style={{ width: `${gov.affinityWithPlayerPct}%` }}
              className="h-full bg-amber-400"
            />
          </div>
        </div>

        <div className="p-3 rounded-sm bg-[#0b0508] border border-white/15 space-y-1.5">
          <div className="flex justify-between text-slate-300">
            <span>Relación institucional y gobernabilidad:</span>
            <strong className="text-sky-400">{gov.relationshipScore} / 100</strong>
          </div>
          <div className="w-full h-2 rounded-sm bg-[#141c28] border border-white/15 overflow-hidden">
            <div
              style={{ width: `${gov.relationshipScore}%` }}
              className="h-full bg-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampaignGobernantesViewProps {
  state: CampaignSimulationState;
}

const BLOC_FILTER_SPECS: Array<{
  id: 'TODOS' | 'DERECHA' | 'CENTRO' | 'IZQUIERDA';
  label: string;
  activeCls: string;
  idleCls: string;
}> = [
  {
    id: 'TODOS',
    label: 'Todos · 24',
    activeCls: 'bg-[#EB3F7D] text-[#090407] border-[#EFE9DA]',
    idleCls: 'bg-[#0b0508] text-slate-300 border-white/15'
  },
  {
    id: 'DERECHA',
    label: '● Derecha · 7',
    activeCls: 'bg-blue-600 text-white border-blue-300',
    idleCls: 'bg-blue-950/50 border-blue-800/60 text-blue-300'
  },
  {
    id: 'CENTRO',
    label: '● Centro · 11',
    activeCls: 'bg-teal-600 text-white border-teal-300',
    idleCls: 'bg-teal-950/50 border-teal-800/60 text-teal-300'
  },
  {
    id: 'IZQUIERDA',
    label: '● Izquierda · 6',
    activeCls: 'bg-rose-600 text-white border-rose-300',
    idleCls: 'bg-rose-950/50 border-rose-800/60 text-rose-300'
  }
];

function BlocFilterButtonsBar({
  blocFilter,
  onSelectBloc
}: {
  blocFilter: 'TODOS' | 'DERECHA' | 'CENTRO' | 'IZQUIERDA';
  onSelectBloc: (bloc: 'TODOS' | 'DERECHA' | 'CENTRO' | 'IZQUIERDA') => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      {BLOC_FILTER_SPECS.map((spec) => (
        <button
          key={spec.id}
          type="button"
          onClick={() => onSelectBloc(spec.id)}
          className={`px-2.5 py-1 rounded-sm border font-bold transition ${
            blocFilter === spec.id ? spec.activeCls : spec.idleCls
          }`}
        >
          {spec.label}
        </button>
      ))}
    </div>
  );
}

export function CampaignGobernantesView({ state: _state }: CampaignGobernantesViewProps) {
  const [selectedProvId, setSelectedProvId] = useState('PBA');
  const [blocFilter, setBlocFilter] = useState<'TODOS' | 'DERECHA' | 'CENTRO' | 'IZQUIERDA'>('TODOS');

  const selectedGov =
    GOVERNORS_DATASET.find((g) => g.provinceId === selectedProvId) ?? GOVERNORS_DATASET[0]!;

  const visibleGovernors = useMemo(() => {
    if (blocFilter === 'TODOS') return GOVERNORS_DATASET;
    return GOVERNORS_DATASET.filter((g) => g.faction === blocFilter);
  }, [blocFilter]);

  return (
    <div className="space-y-6">
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
            POLÍTICO · LIGA DE GOBERNADORES
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#F5EFE6] mt-0.5 uppercase tracking-wide">
            Gobernantes
          </h1>
        </div>
        <BlocFilterButtonsBar blocFilter={blocFilter} onSelectBloc={setBlocFilter} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 hoi-panel rounded-sm p-5 flex flex-col md:flex-row gap-4 items-center md:items-start">
          <GovernorsBlocSvgMap selectedProvId={selectedProvId} onSelectProv={setSelectedProvId} />

          <div className="flex-1 w-full space-y-2.5">
            <div className="text-xs font-serif font-bold uppercase tracking-wider text-[#F5EFE6] border-b border-white/15 pb-2 flex items-center justify-between">
              <span>Distribución de Poder Provincial (2027)</span>
              <span className="text-[10px] font-mono text-slate-400">{visibleGovernors.length} distritos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[365px] overflow-y-auto pr-1">
              {visibleGovernors.map((gov) => {
                const isSelected = gov.provinceId === selectedProvId;
                return (
                  <button
                    key={gov.provinceId}
                    type="button"
                    onClick={() => setSelectedProvId(gov.provinceId)}
                    className={`text-left p-2.5 rounded-sm border transition ${
                      isSelected
                        ? 'bg-[#172234] border-[#EB3F7D] text-[#F5EFE6] font-bold'
                        : 'bg-[#0b0508] border-white/15 text-slate-300 hover:border-[#EB3F7D]/55'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          style={{ backgroundColor: gov.color }}
                          className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                        />
                        <span className="truncate text-xs font-serif font-bold">{gov.provinceName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#f472b6] shrink-0">
                        {gov.affinityWithPlayerPct}%
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{gov.governorName}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <GovernorDossierPanel gov={selectedGov} />
        </div>
      </div>
    </div>
  );
}
