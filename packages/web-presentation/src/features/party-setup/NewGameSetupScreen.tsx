import React, { useState } from 'react';
import type {
  DifficultyLevel,
  GameSetupConfiguration,
  PlayableRole,
  PoliticalPartyPreset,
  ProvinceSummary,
  RealPoliticianPreset
} from '@argentina-sim/domain';
import { POLITICAL_PARTIES_2027, REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';
import { PartyEmblemSvg } from './PartyEmblemSvg.js';
import { PartyDesignerStudio } from './PartyDesignerStudio.js';

// Pantalla de configuracion de partida previa al juego (capturas 3, 5 y 6):
// dividida en secciones modulares para mantener CC <= 4 en cada funcion.

const IDEOLOGY_CHOICES: Array<{ label: string; summary: string }> = [
  { label: 'Centrismo', summary: 'Moderación, equilibrio institucional y búsqueda de consensos.' },
  { label: 'Liberalismo', summary: 'Superávit fiscal innegociable, desregulación y apertura comercial.' },
  { label: 'Conservadurismo', summary: 'Orden público, institucionalidad republicana y clima de negocios.' },
  { label: 'Desarrollismo Federal', summary: 'Alianza con el complejo agro-minero-energético e infraestructura.' },
  { label: 'Socialdemocracia', summary: 'Educación pública, federalismo fiscal y Estado regulador.' },
  { label: 'Peronismo / Kirchnerismo', summary: 'Mercado interno, paritarias libres, obra pública y soberanía.' },
  { label: 'Socialismo Trotskista', summary: 'Ruptura con el FMI, nacionalización energética y banca estatal.' }
];

function describePositionLabel(value: number): string {
  if (value < 35) {
    return 'izquierda';
  }
  if (value > 65) {
    return 'derecha';
  }
  return 'centro';
}

interface RealPoliticiansSelectorProps {
  selectedId: string;
  spaceFilter: string;
  onFilterChange: (space: string) => void;
  onSelectPolitician: (pol: RealPoliticianPreset) => void;
}

function RealPoliticiansSelector({
  selectedId,
  spaceFilter,
  onFilterChange,
  onSelectPolitician
}: RealPoliticiansSelectorProps) {
  const filtered = REAL_POLITICIANS_2027.filter(
    (pol) => spaceFilter === 'TODOS' || pol.partySigla === spaceFilter
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-300 mb-1.5 font-medium">Filtrar por espacio</label>
        <select
          value={spaceFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
        >
          <option value="TODOS">Todos</option>
          <option value="LLA">LLA · La Libertad Avanza</option>
          <option value="PRO">PRO · Propuesta Republicana</option>
          <option value="PF">PF · Peronismo Federal / Provincias Unidas</option>
          <option value="UCR">UCR · Unión Cívica Radical</option>
          <option value="UxP">UxP · Unión por la Patria</option>
          <option value="FIT">FIT · Frente de Izquierda</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[410px] overflow-y-auto pr-1">
        {filtered.map((pol) => {
          const isSelected = pol.id === selectedId;
          return (
            <button
              key={pol.id}
              type="button"
              onClick={() => onSelectPolitician(pol)}
              style={{ borderTopColor: pol.accentColor }}
              className={`text-left rounded-xl bg-[#121520] border border-slate-800 border-t-4 p-4 transition ${
                isSelected ? 'ring-2 ring-white bg-[#171c2b]' : 'hover:bg-[#161a26]'
              }`}
            >
              <div className="font-bold text-white text-sm">{pol.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {pol.partySigla} · {pol.ideology}
              </div>
              <div className="text-xs text-slate-300 mt-2 line-clamp-2">{pol.roleDescription}</div>
              <div className="text-xs text-slate-400 mt-2">
                Dificultad: <strong className="text-white">{pol.difficultyLabel}</strong> · {pol.styleTrait}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-[#181612] border border-amber-800/50 px-4 py-2.5 text-xs text-amber-200/90">
        Los datos de cada figura son una simulación del juego. La dificultad de Javier Milei es <strong>Fácil</strong> y viene preconfigurada con el escenario inicial.
      </div>
    </div>
  );
}

interface IdeologicalSpectrumBarProps {
  customParty: PoliticalPartyPreset;
}

function IdeologicalSpectrumBar({ customParty }: IdeologicalSpectrumBarProps) {
  const playerAxis = Math.round((customParty.economicPosition + customParty.culturalPosition) / 2);

  return (
    <div className="py-5 px-3">
      <div className="relative h-14 flex items-center">
        <div className="w-full h-0.5 bg-slate-700 relative">
          {POLITICAL_PARTIES_2027.map((preset) => (
            <div
              key={preset.id}
              style={{ left: `${preset.economicPosition}%` }}
              className="absolute -top-7 -translate-x-1/2 flex flex-col items-center"
            >
              <span
                style={{ borderColor: preset.primaryColor }}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#111520] border text-slate-200"
              >
                {preset.sigla}
              </span>
              <span
                style={{ backgroundColor: preset.primaryColor }}
                className="w-2.5 h-2.5 rounded-full mt-1"
              />
            </div>
          ))}

          <div
            style={{ left: `${playerAxis}%` }}
            className="absolute -top-2 -translate-x-1/2 flex flex-col items-center z-10"
          >
            <span
              style={{ backgroundColor: customParty.emblem.primaryColor }}
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
            />
            <span
              style={{ backgroundColor: customParty.emblem.primaryColor }}
              className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white mt-1 shadow"
            >
              {customParty.sigla}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Izquierda</span>
        <span>Centro</span>
        <span>Derecha</span>
      </div>
    </div>
  );
}

interface CustomPartyCreatorPanelProps {
  customParty: PoliticalPartyPreset;
  onChangeParty: (next: PoliticalPartyPreset) => void;
}

function CustomPartyCreatorPanel({ customParty, onChangeParty }: CustomPartyCreatorPanelProps) {
  const selectedIdeologyObj =
    IDEOLOGY_CHOICES.find((item) => item.label === customParty.ideology) ?? IDEOLOGY_CHOICES[0]!;

  return (
    <div className="space-y-5">
      <IdeologicalSpectrumBar customParty={customParty} />

      <div>
        <div className="text-xs font-semibold text-white mb-1">
          Posición económica: {describePositionLabel(customParty.economicPosition)} ({customParty.economicPosition} de 100)
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={customParty.economicPosition}
          onChange={(e) =>
            onChangeParty({ ...customParty, economicPosition: Number(e.target.value) })
          }
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>1 · izquierda</span>
          <span>100 · derecha</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-white mb-1">
          Posición cultural ({customParty.culturalPosition} de 100)
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={customParty.culturalPosition}
          onChange={(e) =>
            onChangeParty({ ...customParty, culturalPosition: Number(e.target.value) })
          }
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>1 · progresista</span>
          <span>100 · conservador</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white mb-1.5">Ideología principal</label>
        <select
          value={customParty.ideology}
          onChange={(e) => onChangeParty({ ...customParty, ideology: e.target.value })}
          className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
        >
          {IDEOLOGY_CHOICES.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">{selectedIdeologyObj.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white mb-1.5">Nombre del partido</label>
          <input
            type="text"
            value={customParty.name}
            onChange={(e) => onChangeParty({ ...customParty, name: e.target.value })}
            placeholder="Ej.: Frente Federal Productivo"
            className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white mb-1.5">Sigla (hasta 5)</label>
          <input
            type="text"
            maxLength={5}
            value={customParty.sigla}
            onChange={(e) =>
              onChangeParty({ ...customParty, sigla: e.target.value.toUpperCase() })
            }
            placeholder="MIP"
            className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white"
          />
        </div>
      </div>

      <PartyDesignerStudio
        emblem={customParty.emblem}
        onChange={(emblem) =>
          onChangeParty({
            ...customParty,
            primaryColor: emblem.primaryColor,
            emblem
          })
        }
      />
    </div>
  );
}

interface ExistingPartiesGridProps {
  selectedPartyId: string;
  onSelectParty: (id: string) => void;
}

function ExistingPartiesGrid({ selectedPartyId, onSelectParty }: ExistingPartiesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {POLITICAL_PARTIES_2027.map((party) => {
        const isSelected = party.id === selectedPartyId;
        return (
          <button
            key={party.id}
            type="button"
            onClick={() => onSelectParty(party.id)}
            style={{ borderTopColor: party.primaryColor }}
            className={`text-left rounded-2xl bg-[#121520] border border-slate-800 border-t-4 p-5 transition ${
              isSelected ? 'ring-2 ring-white bg-[#171c2b]' : 'hover:bg-[#161a26]'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 mb-3">
              <PartyEmblemSvg config={party.emblem} size={18} />
              <span className="text-xs font-bold text-white">{party.sigla}</span>
              <span className="text-xs text-slate-400">· {party.colorName}</span>
            </div>
            <div className="text-xs text-slate-300 mb-2">
              Ideología: <strong className="text-white">{party.ideology}</strong>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{party.description}</p>
          </button>
        );
      })}
    </div>
  );
}

interface ModeTogglePairProps<T extends string> {
  value: T;
  firstOption: { id: T; label: string };
  secondOption: { id: T; label: string };
  onChange: (next: T) => void;
}

function ModeTogglePair<T extends string>({
  value,
  firstOption,
  secondOption,
  onChange
}: ModeTogglePairProps<T>) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-[#10131c] border border-slate-800">
      {[firstOption, secondOption].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
            value === opt.id ? 'bg-white text-slate-950' : 'text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface CargoSelectorSectionProps {
  role: PlayableRole;
  provinceId: string;
  provinces: ProvinceSummary[];
  onRoleChange: (r: PlayableRole) => void;
  onProvinceChange: (p: string) => void;
}

function CargoSelectorSection({
  role,
  provinceId,
  provinces,
  onRoleChange,
  onProvinceChange
}: CargoSelectorSectionProps) {
  const isPresident = role === 'PRESIDENTE';

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> Cargo
        </h2>
      </div>

      <div className="inline-flex p-1 rounded-xl bg-[#10131c] border border-slate-800">
        <button
          type="button"
          onClick={() => onRoleChange('PRESIDENTE')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            isPresident ? 'bg-white text-slate-950 font-bold shadow' : 'text-slate-300'
          }`}
        >
          Presidente de la Nación
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('GOBERNADOR')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            !isPresident ? 'bg-white text-slate-950 font-bold shadow' : 'text-slate-300'
          }`}
        >
          Gobernador de provincia
        </button>
      </div>

      {!isPresident ? (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-white">Provincia</label>
          <select
            value={provinceId}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
          >
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name} ({prov.region}) · Coparticipación {prov.coparticipationDependencyPct}% · {prov.keyEconomicDriver}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Método electoral: Gobernador por mayoría simple a una sola vuelta; una reelección consecutiva; con PASO (piso para la general: 1,5 % de los votos válidos (ley 14.086)); legislatura bicameral (92 diputados y 46 senadores). Las PASO provinciales se suspendieron en 2025; en el juego siguen vigentes para 2027.
          </p>
        </div>
      ) : null}
    </section>
  );
}

interface NewGameSetupScreenProps {
  provinces: ProvinceSummary[];
  onBackToLanding: () => void;
  onStartConfiguredGame: (setup: GameSetupConfiguration) => void;
}

export function NewGameSetupScreen({
  provinces,
  onBackToLanding,
  onStartConfiguredGame
}: NewGameSetupScreenProps) {
  const [characterMode, setCharacterMode] = useState<'MI_PERSONAJE' | 'UN_POLITICO_REAL'>('UN_POLITICO_REAL');
  const [customCharacterName, setCustomCharacterName] = useState('Ana Rivas');
  const [spaceFilter, setSpaceFilter] = useState('TODOS');
  const [selectedPolitician, setSelectedPolitician] = useState<RealPoliticianPreset>(REAL_POLITICIANS_2027[0]!);
  const [role, setRole] = useState<PlayableRole>('PRESIDENTE');
  const [provinceId, setProvinceId] = useState<string>('PBA');
  const [partyMode, setPartyMode] = useState<'PARTIDO_EXISTENTE' | 'CREAR_MI_PARTIDO'>('PARTIDO_EXISTENTE');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('LLA');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('ESTANDAR_2027');

  const [customParty, setCustomParty] = useState<PoliticalPartyPreset>({
    id: 'CUSTOM',
    sigla: 'MIP',
    name: 'Movimiento Integración Productiva',
    colorName: 'Esmeralda',
    primaryColor: '#10b981',
    ideology: 'Centrismo',
    description: 'Espacio fundado por el jugador con insignia y programa propio.',
    economicPosition: 50,
    culturalPosition: 50,
    socialBase: 'Clases medias urbanas y PyMEs',
    emblem: {
      shape: 'ESCUDO',
      pattern: 'MITADES_VERTICALES',
      primaryColor: '#10b981',
      secondaryColor: '#34d399',
      thirdColor: '#ffffff',
      symbol: 'ESTRELLA',
      symbolColor: '#ffffff',
      disc: 'SIN_FONDO',
      customImageDataUrl: null
    }
  });

  const handleSelectPolitician = (pol: RealPoliticianPreset) => {
    setSelectedPolitician(pol);
    setSelectedPartyId(pol.partyId);
    setRole(pol.defaultRole);
    setProvinceId(pol.defaultProvinceId);
    setDifficulty(pol.difficulty);
  };

  const handleLaunchGame = () => {
    const existingParty =
      POLITICAL_PARTIES_2027.find((p) => p.id === selectedPartyId) ?? POLITICAL_PARTIES_2027[0]!;
    const activeParty = partyMode === 'CREAR_MI_PARTIDO' ? customParty : existingParty;
    const characterName =
      characterMode === 'MI_PERSONAJE' ? customCharacterName : selectedPolitician.name;

    onStartConfiguredGame({
      sessionId: String(Math.floor(100000000000 + Math.random() * 899999999999)),
      characterMode,
      characterName,
      selectedPoliticianId: selectedPolitician.id,
      role,
      provinceId,
      partyMode,
      party: activeParty,
      difficulty
    });
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
              República Argentina · Elecciones y Mandato 2027
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
              Configuración de Nueva Partida
            </h1>
          </div>
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300"
          >
            ← Volver al inicio
          </button>
        </div>

        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-slate-500">|</span> ¿Con quién jugás?
            </h2>
          </div>

          <ModeTogglePair
            value={characterMode}
            firstOption={{ id: 'MI_PERSONAJE', label: 'Mi personaje' }}
            secondOption={{ id: 'UN_POLITICO_REAL', label: 'Un político real' }}
            onChange={setCharacterMode}
          />

          {characterMode === 'MI_PERSONAJE' ? (
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Nombre de tu personaje
              </label>
              <input
                type="text"
                value={customCharacterName}
                onChange={(e) => setCustomCharacterName(e.target.value)}
                placeholder="Ej.: Ana Rivas"
                className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>
          ) : (
            <RealPoliticiansSelector
              selectedId={selectedPolitician.id}
              spaceFilter={spaceFilter}
              onFilterChange={setSpaceFilter}
              onSelectPolitician={handleSelectPolitician}
            />
          )}
        </section>

        <CargoSelectorSection
          role={role}
          provinceId={provinceId}
          provinces={provinces}
          onRoleChange={setRole}
          onProvinceChange={setProvinceId}
        />

        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-slate-500">|</span> Partido
            </h2>
          </div>

          <ModeTogglePair
            value={partyMode}
            firstOption={{ id: 'PARTIDO_EXISTENTE', label: 'Partido existente' }}
            secondOption={{ id: 'CREAR_MI_PARTIDO', label: 'Crear mi partido' }}
            onChange={setPartyMode}
          />

          {partyMode === 'PARTIDO_EXISTENTE' ? (
            <ExistingPartiesGrid
              selectedPartyId={selectedPartyId}
              onSelectParty={setSelectedPartyId}
            />
          ) : (
            <CustomPartyCreatorPanel
              customParty={customParty}
              onChangeParty={setCustomParty}
            />
          )}
        </section>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Iniciás el <strong>10 de diciembre de 2027</strong> con motor económico, judicial, bancario y militar activo.
          </div>
          <button
            type="button"
            onClick={handleLaunchGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-sm shadow-xl transition"
          >
            Comenzar partida →
          </button>
        </div>
      </div>
    </div>
  );
}
