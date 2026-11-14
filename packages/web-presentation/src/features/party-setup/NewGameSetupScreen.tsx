import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Search,
  UserCheck,
  Users
} from 'lucide-react';
import type {
  CharacterArchetypeId,
  CongressStartScenario,
  DifficultyLevel,
  GameSetupConfiguration,
  GameStartMode,
  PlayableRole,
  PoliticalPartyPreset,
  ProvinceSummary,
  RealPoliticianPreset
} from '@argentina-sim/domain';
import { deriveIdeologicalAllies } from '@argentina-sim/domain';
import {
  POLITICAL_PARTIES_2027,
  REAL_POLITICIANS_2027
} from '@argentina-sim/infrastructure';
import { PartyEmblemSvg } from './PartyEmblemSvg.js';
import { PartyDesignerStudio } from './PartyDesignerStudio.js';
import {
  CharacterArchetypeSelector,
  SetupScenarioAndCongressSection
} from './SetupScenarioAndCongressSection.js';
import { SetupSummarySidebar } from './SetupSummarySidebar.js';

interface NewGameSetupScreenProps {
  provinces: ProvinceSummary[];
  onBackToLanding: () => void;
  onStartConfiguredGame: (setup: GameSetupConfiguration) => void;
}

const INITIAL_CUSTOM_PARTY: PoliticalPartyPreset = {
  id: 'CUSTOM',
  sigla: 'PN',
  name: 'Partido Nacional',
  colorName: 'Dorado Acero',
  primaryColor: '#b89342',
  ideology: 'Centro / Desarrollismo Federal',
  description: 'Coalición amplia orientada a la estabilidad macro, producción federal y acuerdo institucional.',
  economicPosition: 55,
  culturalPosition: 52,
  socialBase: 'Clase media, PyMEs industriales y complejos agroexportadores',
  emblem: {
    shape: 'ESCUDO',
    pattern: 'MITADES_VERTICALES',
    primaryColor: '#1d3250',
    secondaryColor: '#0f172a',
    thirdColor: '#b89342',
    symbol: 'SOL',
    symbolColor: '#facc15',
    disc: 'DISCO_OSCURO',
    customImageDataUrl: null
  }
};

const IDEOLOGY_CHOICES = [
  { id: 'Izquierda / Socialismo', eco: 10, cul: 12 },
  { id: 'Progresismo / Peronismo', eco: 28, cul: 32 },
  { id: 'Socialdemocracia / Radicalismo', eco: 45, cul: 38 },
  { id: 'Centro / Desarrollismo Federal', eco: 55, cul: 52 },
  { id: 'Centroderecha / Liberalismo', eco: 72, cul: 58 },
  { id: 'Libertarismo / Anarcocapitalismo', eco: 90, cul: 78 },
  { id: 'Nacionalismo / Conservadurismo', eco: 65, cul: 88 }
];

const ROLE_OPTIONS: Array<{ id: PlayableRole; title: string; subtitle: string }> = [
  { id: 'PRESIDENTE', title: 'Presidente de la Nación', subtitle: 'Casa Rosada, BCRA, DNU y Cámaras' },
  { id: 'GOBERNADOR', title: 'Gobernador Provincial', subtitle: 'Presupuesto, policía y coparticipación' },
  { id: 'DIPUTADO', title: 'Diputado Nacional', subtitle: 'Armado en bloques y comisiones' },
  { id: 'SENADOR', title: 'Senador Nacional', subtitle: 'Representación federal y pliegos' }
];

const STYLE_TO_ARCHETYPE: Record<RealPoliticianPreset['styleTrait'], CharacterArchetypeId> = {
  Dogmático: 'ECONOMISTA_ORTODOXO',
  Dialoguista: 'GESTOR_TECNICO',
  Pragmático: 'CAUDILLO_TERRITORIAL',
  Combativo: 'SINDICAL_POPULAR'
};

function ModeTogglePair({
  leftLabel,
  rightLabel,
  isLeftActive,
  onSelectLeft,
  onSelectRight
}: {
  leftLabel: string;
  rightLabel: string;
  isLeftActive: boolean;
  onSelectLeft: () => void;
  onSelectRight: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onSelectLeft}
        className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition ${
          isLeftActive
            ? 'bg-[#1d3250] text-amber-200 border-[#b89342]'
            : 'bg-[#0b1018] text-slate-300 border-[#263142] hover:border-slate-500'
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={onSelectRight}
        className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition ${
          !isLeftActive
            ? 'bg-[#1d3250] text-amber-200 border-[#b89342]'
            : 'bg-[#0b1018] text-slate-300 border-[#263142] hover:border-slate-500'
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
}

function matchesPoliticianFilter(
  p: RealPoliticianPreset,
  queryLower: string,
  partyFilter: string
): boolean {
  const matchesParty = partyFilter === 'ALL' || p.partySigla === partyFilter;
  if (!matchesParty || !queryLower) {
    return matchesParty;
  }
  return [p.name, p.roleDescription, p.partySigla].some((field) =>
    field.toLowerCase().includes(queryLower)
  );
}

function RealPoliticiansSelector({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (p: RealPoliticianPreset) => void;
}) {
  const [query, setQuery] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');

  const partySiglas = useMemo(() => {
    return Array.from(new Set(REAL_POLITICIANS_2027.map((p) => p.partySigla)));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REAL_POLITICIANS_2027.filter((p) => matchesPoliticianFilter(p, q, partyFilter));
  }, [query, partyFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar entre 158 referentes por nombre, cargo o fuerza..."
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm pl-8 pr-3 py-2 text-xs text-white focus:border-[#b89342] focus:outline-none"
          />
        </div>
        <select
          value={partyFilter}
          onChange={(e) => setPartyFilter(e.target.value)}
          className="bg-[#080c13] border border-[#263142] rounded-sm px-2.5 py-2 text-xs font-mono text-slate-200 focus:border-[#b89342] focus:outline-none"
        >
          <option value="ALL">Todas las fuerzas ({REAL_POLITICIANS_2027.length})</option>
          {partySiglas.map((sigla) => (
            <option key={sigla} value={sigla}>
              {sigla}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className={`text-left p-2.5 rounded-sm border transition ${
                active
                  ? 'bg-[#17253b] border-[#b89342] shadow-[inset_0_0_0_1px_rgba(184,147,66,0.35)]'
                  : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{p.roleDescription}</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#080c13] border border-[#2b394d] text-amber-300 shrink-0">
                  {p.partySigla}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{p.ideology}</span>
                <span className="text-slate-300">{p.difficultyLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IdeologicalSpectrumBar({
  party,
  onChangePosition
}: {
  party: PoliticalPartyPreset;
  onChangePosition: (eco: number, cul: number) => void;
}) {
  return (
    <div className="p-3 rounded-sm bg-[#090d14] border border-[#223044] space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-300">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Espectro Ideológico del Espacio
        </div>
        <span className="text-[11px] font-mono text-amber-300">
          Eco {party.economicPosition}/100 · Cul {party.culturalPosition}/100
        </span>
      </div>

      <div className="relative h-7 rounded-sm border border-[#2a384c] overflow-hidden flex items-center">
        <div
          className="absolute inset-0 opacity-85"
          style={{
            background:
              'linear-gradient(90deg, #991b1b 0%, #c2410c 22%, #eab308 48%, #2563eb 74%, #7e22ce 100%)'
          }}
        />
        <div className="relative z-10 w-full flex justify-between px-3 text-[10px] font-mono font-bold text-white drop-shadow">
          <span>ESTATISTA</span>
          <span>CENTRO</span>
          <span>PRO-MERCADO</span>
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#fff]"
          style={{ left: `calc(${party.economicPosition}% - 2px)` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Eje Económico ({party.economicPosition <= 35 ? 'Intervencionista' : party.economicPosition >= 65 ? 'Libre Mercado' : 'Mixto'})
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={party.economicPosition}
            onChange={(e) => onChangePosition(Number(e.target.value), party.culturalPosition)}
            className="w-full accent-[#b89342]"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Eje Institucional / Cultural ({party.culturalPosition <= 35 ? 'Progresista' : party.culturalPosition >= 65 ? 'Conservador / Orden' : 'Moderado'})
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={party.culturalPosition}
            onChange={(e) => onChangePosition(party.economicPosition, Number(e.target.value))}
            className="w-full accent-[#b89342]"
          />
        </div>
      </div>
    </div>
  );
}

function CustomPartyCreatorPanel({
  party,
  onChangeParty
}: {
  party: PoliticalPartyPreset;
  onChangeParty: (next: PoliticalPartyPreset) => void;
}) {
  const naturalAllies = deriveIdeologicalAllies(party);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Corriente ideológica base
        </div>
        <div className="flex flex-wrap gap-1.5">
          {IDEOLOGY_CHOICES.map((opt) => {
            const active = party.ideology === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChangeParty({
                    ...party,
                    ideology: opt.id,
                    economicPosition: opt.eco,
                    culturalPosition: opt.cul
                  })
                }
                className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition ${
                  active
                    ? 'bg-[#1d3250] border-[#b89342] text-amber-200'
                    : 'bg-[#0b1018] border-[#263142] text-slate-300 hover:border-slate-500'
                }`}
              >
                {opt.id}
              </button>
            );
          })}
        </div>
      </div>

      <IdeologicalSpectrumBar
        party={party}
        onChangePosition={(eco, cul) =>
          onChangeParty({ ...party, economicPosition: eco, culturalPosition: cul })
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Nombre de la fuerza o coalición
          </label>
          <input
            type="text"
            value={party.name}
            onChange={(e) => onChangeParty({ ...party, name: e.target.value })}
            placeholder="Ej: Frente Federal de Desarrollo"
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs text-white focus:border-[#b89342] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Sigla (2-5 letras)
          </label>
          <input
            type="text"
            maxLength={5}
            value={party.sigla}
            onChange={(e) => onChangeParty({ ...party, sigla: e.target.value.toUpperCase() })}
            placeholder="FFD"
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs font-mono font-bold text-amber-300 uppercase focus:border-[#b89342] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Base social electoral
          </label>
          <input
            type="text"
            value={party.socialBase}
            onChange={(e) => onChangeParty({ ...party, socialBase: e.target.value })}
            placeholder="Ej: PyMEs exportadoras, clase media y agroindustria"
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-[#b89342] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Plataforma resumida
          </label>
          <input
            type="text"
            value={party.description}
            onChange={(e) => onChangeParty({ ...party, description: e.target.value })}
            placeholder="Programa económico e institucional"
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-[#b89342] focus:outline-none"
          />
        </div>
      </div>

      <div className="p-2.5 rounded-sm bg-[#090d14] border border-[#223044] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">
          Afinidad automática en el Congreso según tu posición ideológica:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {naturalAllies.length > 0 ? (
            naturalAllies.map((ally) => (
              <span
                key={ally}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#162133] border border-[#32445d] text-amber-200"
              >
                {ally}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-mono text-slate-400">Sin aliados cercanos</span>
          )}
        </div>
      </div>

      <PartyDesignerStudio
        emblem={party.emblem}
        sigla={party.sigla}
        onChange={(emblem) => onChangeParty({ ...party, emblem, primaryColor: emblem.primaryColor })}
      />
    </div>
  );
}

function ExistingPartiesGrid({
  selectedPartyId,
  onSelectParty
}: {
  selectedPartyId: string;
  onSelectParty: (p: PoliticalPartyPreset) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {POLITICAL_PARTIES_2027.map((party) => {
        const active = party.id === selectedPartyId;
        return (
          <button
            key={party.id}
            type="button"
            onClick={() => onSelectParty(party)}
            className={`text-left p-3 rounded-sm border transition flex items-start gap-3 ${
              active
                ? 'bg-[#17253b] border-[#b89342] shadow-[inset_0_0_0_1px_rgba(184,147,66,0.35)]'
                : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
            }`}
          >
            <PartyEmblemSvg config={party.emblem} size={46} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">{party.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#080c13] border border-[#2b394d] text-amber-300 shrink-0">
                  {party.sigla}
                </span>
              </div>
              <div className="text-[11px] text-amber-200/90 mt-0.5">{party.ideology}</div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">{party.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ProvinceStatsStrip({ province }: { province: ProvinceSummary }) {
  const balanceColor = province.fiscalBalancePct >= 0 ? 'text-emerald-300' : 'text-rose-300';
  const balancePrefix = province.fiscalBalancePct >= 0 ? '+' : '';
  const reelectionLabel = province.reelectionAllowed ? 'Habilitada' : 'Limitada';

  return (
    <div className="lg:col-span-7 p-2.5 rounded-sm bg-[#090d14] border border-[#223044] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
      <div>
        <div className="text-[10px] font-mono text-slate-500">BANCAS DIP. NAC.</div>
        <div className="font-mono font-bold text-slate-100">{province.nationalDeputiesCount} escaños</div>
      </div>
      <div>
        <div className="text-[10px] font-mono text-slate-500">DEP. COPARTIC.</div>
        <div className="font-mono font-bold text-amber-300">{province.coparticipationDependencyPct}%</div>
      </div>
      <div>
        <div className="text-[10px] font-mono text-slate-500">BALANCE FISCAL</div>
        <div className={`font-mono font-bold ${balanceColor}`}>
          {balancePrefix}
          {province.fiscalBalancePct.toFixed(1)}%
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono text-slate-500">REELECCIÓN</div>
        <div className="font-mono font-bold text-slate-200">{reelectionLabel}</div>
      </div>
      <div className="col-span-2 sm:col-span-4 text-[11px] text-slate-400 pt-1 border-t border-[#1b2434] truncate">
        Motor productivo: <span className="text-slate-200">{province.keyEconomicDriver}</span>
      </div>
    </div>
  );
}

function CargoSelectorSection({
  role,
  provinceId,
  provinces,
  onChangeRole,
  onChangeProvince
}: {
  role: PlayableRole;
  provinceId: string;
  provinces: ProvinceSummary[];
  onChangeRole: (r: PlayableRole) => void;
  onChangeProvince: (id: string) => void;
}) {
  const selectedProv = provinces.find((p) => p.id === provinceId) ?? provinces[0];

  return (
    <section className="hoi-panel rounded-sm p-4 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#243042]">
        <MapPin className="w-4 h-4 text-amber-400" />
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          02 · Cargo Institucional y Base Territorial
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ROLE_OPTIONS.map((item) => {
          const active = role === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeRole(item.id)}
              className={`text-left p-2.5 rounded-sm border transition ${
                active
                  ? 'bg-[#17253b] border-[#b89342]'
                  : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
              }`}
            >
              <div className="text-xs font-bold text-white">{item.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.subtitle}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Distrito de Origen (+8 Lealtad inicial del Gobernador)
          </label>
          <select
            value={provinceId}
            onChange={(e) => onChangeProvince(e.target.value)}
            className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs text-white focus:border-[#b89342] focus:outline-none"
          >
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.region}
              </option>
            ))}
          </select>
        </div>

        {selectedProv ? <ProvinceStatsStrip province={selectedProv} /> : null}
      </div>
    </section>
  );
}

function resolveLeaderName(mode: 'MI_PERSONAJE' | 'UN_POLITICO_REAL', rawName: string): string {
  if (mode !== 'MI_PERSONAJE') return rawName;
  const trimmed = rawName.trim();
  return trimmed.length > 0 ? trimmed : 'Mi Personaje';
}

function resolveActiveProvince(provinces: ProvinceSummary[], provinceId: string): ProvinceSummary | undefined {
  return provinces.find((p) => p.id === provinceId) ?? provinces[0];
}

function CharacterIdentityContent({
  characterMode,
  characterName,
  selectedPoliticianId,
  onChangeName,
  onSelectPolitician
}: {
  characterMode: 'MI_PERSONAJE' | 'UN_POLITICO_REAL';
  characterName: string;
  selectedPoliticianId: string;
  onChangeName: (name: string) => void;
  onSelectPolitician: (p: RealPoliticianPreset) => void;
}) {
  if (characterMode === 'MI_PERSONAJE') {
    return (
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
          Nombre completo del candidato o presidente
        </label>
        <input
          type="text"
          value={characterName}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Ej: Martín Palermo / Elena Roca"
          className="w-full bg-[#080c13] border border-[#263142] rounded-sm px-3 py-2 text-xs text-white focus:border-[#b89342] focus:outline-none"
        />
      </div>
    );
  }
  return <RealPoliticiansSelector selectedId={selectedPoliticianId} onSelect={onSelectPolitician} />;
}

function PartyChoiceContent({
  partyMode,
  selectedParty,
  customParty,
  onSelectExisting,
  onChangeCustom
}: {
  partyMode: 'PARTIDO_EXISTENTE' | 'CREAR_MI_PARTIDO';
  selectedParty: PoliticalPartyPreset;
  customParty: PoliticalPartyPreset;
  onSelectExisting: (p: PoliticalPartyPreset) => void;
  onChangeCustom: (p: PoliticalPartyPreset) => void;
}) {
  if (partyMode === 'PARTIDO_EXISTENTE') {
    return <ExistingPartiesGrid selectedPartyId={selectedParty.id} onSelectParty={onSelectExisting} />;
  }
  return <CustomPartyCreatorPanel party={customParty} onChangeParty={onChangeCustom} />;
}

export function NewGameSetupScreen({
  provinces,
  onBackToLanding,
  onStartConfiguredGame
}: NewGameSetupScreenProps) {
  const defaultPolitician = REAL_POLITICIANS_2027[0]!;
  const [characterMode, setCharacterMode] = useState<'MI_PERSONAJE' | 'UN_POLITICO_REAL'>('UN_POLITICO_REAL');
  const [characterName, setCharacterName] = useState(defaultPolitician.name);
  const [selectedPoliticianId, setSelectedPoliticianId] = useState(defaultPolitician.id);
  const [role, setRole] = useState<PlayableRole>(defaultPolitician.defaultRole);
  const [provinceId, setProvinceId] = useState(defaultPolitician.defaultProvinceId);
  const [partyMode, setPartyMode] = useState<'PARTIDO_EXISTENTE' | 'CREAR_MI_PARTIDO'>('PARTIDO_EXISTENTE');
  const [selectedParty, setSelectedParty] = useState<PoliticalPartyPreset>(POLITICAL_PARTIES_2027[0]!);
  const [customParty, setCustomParty] = useState<PoliticalPartyPreset>(INITIAL_CUSTOM_PARTY);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultPolitician.difficulty);
  const [characterArchetype, setCharacterArchetype] = useState<CharacterArchetypeId>(
    STYLE_TO_ARCHETYPE[defaultPolitician.styleTrait]
  );
  const [congressScenario, setCongressScenario] = useState<CongressStartScenario>('ESTANDAR_2027');
  const [startMode, setStartMode] = useState<GameStartMode>('CAMPAIGN');

  const handleSelectPolitician = (p: RealPoliticianPreset) => {
    setSelectedPoliticianId(p.id);
    setCharacterName(p.name);
    setRole(p.defaultRole);
    setProvinceId(p.defaultProvinceId);
    setDifficulty(p.difficulty);
    setCharacterArchetype(STYLE_TO_ARCHETYPE[p.styleTrait]);
    const matchingParty = POLITICAL_PARTIES_2027.find((party) => party.id === p.partyId);
    if (matchingParty) {
      setPartyMode('PARTIDO_EXISTENTE');
      setSelectedParty(matchingParty);
    }
  };

  const activeParty = partyMode === 'CREAR_MI_PARTIDO' ? customParty : selectedParty;
  const activeLeaderName = resolveLeaderName(characterMode, characterName);
  const activeProvince = resolveActiveProvince(provinces, provinceId);

  const handleLaunchGame = () => {
    onStartConfiguredGame({
      sessionId: String(Date.now()).slice(-13),
      characterMode,
      characterName: activeLeaderName,
      selectedPoliticianId,
      role,
      provinceId,
      partyMode,
      party: activeParty,
      difficulty,
      startMode,
      characterArchetype,
      congressScenario
    });
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="hoi-panel rounded-sm overflow-hidden">
          <div className="hoi-header-steel px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#0c121c] hover:bg-[#162133] border border-[#32445d] text-xs font-semibold text-slate-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al menú
              </button>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-300">
                  Sala de Situación // Briefing Inicial 2027
                </div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Configuración de Nueva Partida
                </h1>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#2a384c] text-amber-200">
              Todas las opciones modifican la simulación
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-4">
            <section className="hoi-panel rounded-sm p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#243042]">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  01 · Identidad del Líder y Perfil de Conducción
                </h2>
              </div>

              <ModeTogglePair
                leftLabel="Mi personaje"
                rightLabel="Un político real"
                isLeftActive={characterMode === 'MI_PERSONAJE'}
                onSelectLeft={() => {
                  setCharacterMode('MI_PERSONAJE');
                  setCharacterName((prev) => (prev === defaultPolitician.name ? '' : prev));
                }}
                onSelectRight={() => setCharacterMode('UN_POLITICO_REAL')}
              />

              <CharacterIdentityContent
                characterMode={characterMode}
                characterName={characterName}
                selectedPoliticianId={selectedPoliticianId}
                onChangeName={setCharacterName}
                onSelectPolitician={handleSelectPolitician}
              />

              <CharacterArchetypeSelector
                value={characterArchetype}
                onChange={setCharacterArchetype}
              />
            </section>

            <CargoSelectorSection
              role={role}
              provinceId={provinceId}
              provinces={provinces}
              onChangeRole={setRole}
              onChangeProvince={setProvinceId}
            />

            <section className="hoi-panel rounded-sm p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#243042]">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  03 · Fuerza Política, Boleta y Escudo
                </h2>
              </div>

              <ModeTogglePair
                leftLabel="Elegir partido existente"
                rightLabel="Fundar mi propio partido"
                isLeftActive={partyMode === 'PARTIDO_EXISTENTE'}
                onSelectLeft={() => setPartyMode('PARTIDO_EXISTENTE')}
                onSelectRight={() => setPartyMode('CREAR_MI_PARTIDO')}
              />

              <PartyChoiceContent
                partyMode={partyMode}
                selectedParty={selectedParty}
                customParty={customParty}
                onSelectExisting={setSelectedParty}
                onChangeCustom={setCustomParty}
              />
            </section>

            <SetupScenarioAndCongressSection
              difficulty={difficulty}
              congressScenario={congressScenario}
              startMode={startMode}
              onChangeDifficulty={setDifficulty}
              onChangeCongressScenario={setCongressScenario}
              onChangeStartMode={setStartMode}
            />
          </div>

          <div className="lg:col-span-4">
            <SetupSummarySidebar
              leaderName={activeLeaderName}
              role={role}
              province={activeProvince}
              party={activeParty}
              difficulty={difficulty}
              characterArchetype={characterArchetype}
              congressScenario={congressScenario}
              startMode={startMode}
              onLaunchGame={handleLaunchGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
