import React from 'react';
import {
  Activity,
  Compass,
  Landmark,
  MapPin,
  Play,
  ShieldCheck,
  Users
} from 'lucide-react';
import type {
  CharacterArchetypeId,
  CongressStartScenario,
  DifficultyLevel,
  GameStartMode,
  PlayableRole,
  PoliticalPartyPreset,
  ProvinceSummary
} from '@argentina-sim/domain';
import {
  CHARACTER_ARCHETYPE_CATALOG,
  CONGRESS_SCENARIO_CATALOG,
  deriveIdeologicalAllies,
  DIFFICULTY_CATALOG
} from '@argentina-sim/domain';
import { PartyEmblemSvg } from './PartyEmblemSvg.js';

interface SetupSummarySidebarProps {
  leaderName: string;
  role: PlayableRole;
  province: ProvinceSummary | undefined;
  party: PoliticalPartyPreset;
  difficulty: DifficultyLevel;
  characterArchetype: CharacterArchetypeId;
  congressScenario: CongressStartScenario;
  startMode: GameStartMode;
  onLaunchGame: () => void;
}

const ROLE_LABELS: Record<PlayableRole, string> = {
  PRESIDENTE: 'Presidencia de la Nación',
  GOBERNADOR: 'Gobernación Provincial',
  DIPUTADO: 'Cámara de Diputados',
  SENADOR: 'Senado de la Nación'
};

function DossierRow({
  icon,
  label,
  value,
  subvalue
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="p-2.5 rounded-sm bg-[#090d14] border border-[#1e293b]">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs font-bold text-slate-100 mt-1">{value}</div>
      {subvalue ? <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{subvalue}</div> : null}
    </div>
  );
}

function AlliesBadgeRow({ allies }: { allies: string[] }) {
  return (
    <div className="p-2.5 rounded-sm bg-[#090d14] border border-[#1e293b]">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
        <Users className="w-3.5 h-3.5 text-amber-400" />
        <span>Aliados Ideológicos Iniciales</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {allies.length > 0 ? (
          allies.map((ally) => (
            <span
              key={ally}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#162133] border border-[#32445d] text-amber-200"
            >
              {ally}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3" /> Construcción sin aliados automáticos (frente propio)
          </span>
        )}
      </div>
    </div>
  );
}

function formatProvinceSubvalue(province: ProvinceSummary | undefined): string | undefined {
  if (!province) return undefined;
  return `Región ${province.region} · ${province.nationalDeputiesCount} dip. nac. · +8 lealtad local`;
}

function resolveCatalogSpecs(
  difficulty: DifficultyLevel,
  characterArchetype: CharacterArchetypeId,
  congressScenario: CongressStartScenario
) {
  return {
    macro: DIFFICULTY_CATALOG.find((d) => d.id === difficulty) ?? DIFFICULTY_CATALOG[1]!,
    arch: CHARACTER_ARCHETYPE_CATALOG.find((a) => a.id === characterArchetype) ?? CHARACTER_ARCHETYPE_CATALOG[3]!,
    congress: CONGRESS_SCENARIO_CATALOG.find((c) => c.id === congressScenario) ?? CONGRESS_SCENARIO_CATALOG[0]!
  };
}

export function SetupSummarySidebar({
  leaderName,
  role,
  province,
  party,
  difficulty,
  characterArchetype,
  congressScenario,
  startMode,
  onLaunchGame
}: SetupSummarySidebarProps) {
  const { macro, arch, congress } = resolveCatalogSpecs(difficulty, characterArchetype, congressScenario);
  const allies = deriveIdeologicalAllies(party);
  const provinceName = province ? province.name : 'CABA';
  const modeTag = startMode === 'DIRECT_GOVERNMENT' ? 'Modo Gobierno' : 'Ciclo Electoral';
  const ctaLabel =
    startMode === 'DIRECT_GOVERNMENT' ? 'Asumir en Casa Rosada · 10 Dic' : 'Iniciar Campaña 2027';

  return (
    <aside className="hoi-panel rounded-sm p-4 space-y-3 lg:sticky lg:top-4">
      <div className="pb-2.5 border-b border-[#243042] flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
          Dossier de Partida
        </span>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#162133] border border-[#32445d] text-slate-200">
          {modeTag}
        </span>
      </div>

      <div className="p-3 rounded-sm bg-[#080c13] border border-[#283548] flex items-center gap-3">
        <PartyEmblemSvg config={party.emblem} size={56} />
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-white truncate">{leaderName || 'Mi Personaje'}</div>
          <div className="text-xs font-mono text-amber-300 truncate">
            {party.sigla} · {party.name}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">{party.ideology}</div>
        </div>
      </div>

      <div className="space-y-2">
        <DossierRow
          icon={<MapPin className="w-3.5 h-3.5 text-amber-400" />}
          label="Cargo y Base Territorial"
          value={`${ROLE_LABELS[role]} (${provinceName})`}
          subvalue={formatProvinceSubvalue(province)}
        />

        <DossierRow
          icon={<ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
          label="Perfil y Modificadores"
          value={arch.label}
          subvalue={arch.tradeoffSummary}
        />

        <DossierRow
          icon={<Activity className="w-3.5 h-3.5 text-emerald-400" />}
          label="Escenario Macroeconómico"
          value={`${macro.label} (${macro.climateLabel})`}
          subvalue={`Reservas ${macro.reservesLabel} · Riesgo ${macro.riskLabel} · IPC ${macro.inflationLabel}`}
        />

        <DossierRow
          icon={<Landmark className="w-3.5 h-3.5 text-amber-300" />}
          label="Correlación en Cámaras"
          value={`${congress.label} (${congress.seatTag})`}
          subvalue={congress.description}
        />

        <AlliesBadgeRow allies={allies} />
      </div>

      <button
        type="button"
        onClick={onLaunchGame}
        className="w-full hoi-btn-gold py-3 px-4 rounded-sm font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        {ctaLabel}
      </button>
    </aside>
  );
}
