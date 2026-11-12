import React, { useMemo, useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de POLÍTICO -> Apoyo en Provincias:
// Negociación y cooptación territorial con intendentes y caudillos locales.
// Cada figura tiene afinidad ideológica, rasgo de carácter y probabilidad real
// calculada por algoritmo: si rechaza la propuesta, entra en cooldown estricto de 5 meses.

interface LocalMayorLeader {
  id: string;
  name: string;
  partyName: string;
  partySigla: string;
  district: string;
  roleText: string;
  styleTrait: 'Dialoguista' | 'Dogmático';
  isOfficial: boolean;
  relevance: number;
  influence: number;
  supportPct: number;
  defectionChancePct: number;
}

const LOCAL_LEADERS_PBA: LocalMayorLeader[] = [
  { id: 'NARDINI', name: 'Leonardo Nardini', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Malvinas Argentinas', roleText: 'Intendente de Malvinas Argentinas', styleTrait: 'Dialoguista', isOfficial: true, relevance: 28, influence: 34, supportPct: 39, defectionChancePct: 19 },
  { id: 'SAMID', name: 'Alberto Samid', partyName: 'Principios y Valores', partySigla: 'PyV', district: 'La Matanza', roleText: 'Dirigente de Principios y Valores, empresario de la carne', styleTrait: 'Dialoguista', isOfficial: false, relevance: 26, influence: 26, supportPct: 45, defectionChancePct: 25 },
  { id: 'BIONDINI', name: 'Alejandro Biondini', partyName: 'Frente Patriota Federal', partySigla: 'FPF', district: 'Buenos Aires', roleText: 'Referente nacionalista de Frente Patriota Federal', styleTrait: 'Dogmático', isOfficial: false, relevance: 23, influence: 27, supportPct: 12, defectionChancePct: 5 },
  { id: 'VALENZUELA', name: 'Diego Valenzuela', partyName: 'Propuesta Republicana / LLA', partySigla: 'PRO', district: 'Tres de Febrero', roleText: 'Intendente de Tres de Febrero, historiador y promotor de bajas impositivas', styleTrait: 'Dialoguista', isOfficial: true, relevance: 42, influence: 48, supportPct: 58, defectionChancePct: 40 },
  { id: 'MAYRA_MENDOZA', name: 'Mayra Mendoza', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Quilmes', roleText: 'Intendenta de Quilmes, referente de La Cámpora', styleTrait: 'Dogmático', isOfficial: true, relevance: 50, influence: 56, supportPct: 20, defectionChancePct: 8 },
  { id: 'SOLEDAD_MARTINEZ', name: 'Soledad Martínez', partyName: 'Propuesta Republicana', partySigla: 'PRO', district: 'Vicente López', roleText: 'Intendenta de Vicente López', styleTrait: 'Dialoguista', isOfficial: true, relevance: 36, influence: 42, supportPct: 65, defectionChancePct: 50 }
];

function getPartyPairKey(p1: string, p2: string): string {
  return [p1, p2].sort().join('_');
}

const PARTY_AFFINITY_MODIFIERS: Record<string, number> = {
  LLA_PRO: 12,
  LLA_UxP: -28,
  PRO_UxP: -22,
  FPF_LLA: -12,
  FPF_UxP: -24,
  PyV_UxP: 10,
  PyV_LLA: -14
};

function resolveLeaderAffinityDelta(leaderParty: string, playerParty: string): number {
  if (leaderParty === playerParty) return 22;
  const key = getPartyPairKey(leaderParty, playerParty);
  return PARTY_AFFINITY_MODIFIERS[key] ?? -6;
}

function computeLeaderEffectiveProb(
  leader: LocalMayorLeader,
  playerParty: string,
  approval: number
): number {
  const affinityDelta = resolveLeaderAffinityDelta(leader.partySigla, playerParty);
  const moodDelta = Math.round((approval - 45) * 0.3);
  const traitDelta = leader.styleTrait === 'Dialoguista' ? 8 : -14;
  const raw = leader.supportPct + affinityDelta + moodDelta + traitDelta;
  return Math.max(5, Math.min(92, raw));
}

interface LocalLeaderCardProps {
  leader: LocalMayorLeader;
  isEndorsed: boolean;
  cooldownMonths: number;
  effectiveProb: number;
  onRequestSupport: () => void;
}

function LocalLeaderCard({
  leader,
  isEndorsed,
  cooldownMonths,
  effectiveProb,
  onRequestSupport
}: LocalLeaderCardProps) {
  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3 shadow-md">
      <div>
        <div className="font-bold text-white text-sm">{leader.name}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {leader.partyName} · {leader.district}
        </div>

        <div className="flex gap-1.5 my-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
            {leader.styleTrait.toUpperCase()}
          </span>
          {leader.isOfficial ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-950/70 border border-sky-800/60 text-sky-300">
              FUNCIONARIO
            </span>
          ) : null}
        </div>

        <p className="text-xs text-slate-300 line-clamp-2">{leader.roleText}</p>

        <div className="text-[11px] text-slate-400 mt-2 font-mono">
          Relevancia {leader.relevance} · Influencia {leader.influence}
        </div>

        <div className="mt-2 text-xs text-slate-300 font-mono">
          Apoyo estimado: <strong className="text-white font-bold">{effectiveProb} %</strong>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/70 space-y-2">
        {cooldownMonths > 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-1.5 rounded-xl text-xs font-semibold bg-[#121622] border border-amber-900/50 text-amber-400/80 cursor-not-allowed"
          >
            Rechazó la propuesta ({cooldownMonths} meses)
          </button>
        ) : (
          <button
            type="button"
            disabled={isEndorsed}
            onClick={onRequestSupport}
            className={`w-full py-1.5 rounded-xl text-xs font-bold transition shadow ${
              isEndorsed
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 cursor-default'
                : 'bg-white hover:bg-slate-200 text-slate-950'
            }`}
          >
            {isEndorsed ? '✓ Apoyo asegurado' : 'Pedir apoyo'}
          </button>
        )}
      </div>
    </div>
  );
}

export interface CampaignApoyoProvinciasViewProps {
  state: CampaignSimulationState;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

export function CampaignApoyoProvinciasView({ state, onUpdateState }: CampaignApoyoProvinciasViewProps) {
  const [selectedProvince, setSelectedProvince] = useState('Buenos Aires');
  const [partyFilter, setPartyFilter] = useState('TODOS');
  const [endorsedLeaderIds, setEndorsedLeaderIds] = useState<Set<string>>(new Set());
  const [rejectedCooldowns, setRejectedCooldowns] = useState<Record<string, number>>({});
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const approval = state.countryMood?.governmentApprovalPct ?? 50;

  const filtered = useMemo(() => {
    return LOCAL_LEADERS_PBA.filter(
      (l) => partyFilter === 'TODOS' || l.partySigla === partyFilter
    );
  }, [partyFilter]);

  const handleRequestSupport = (leader: LocalMayorLeader) => {
    const effectiveProb = computeLeaderEffectiveProb(leader, state.partySigla, approval);
    const roll = Math.floor(Math.random() * 100) + 1;
    const accepted = roll <= effectiveProb;

    if (accepted) {
      setEndorsedLeaderIds((prev) => new Set([...prev, leader.id]));
      setBannerMessage(`✓ ${leader.name} aceptó respaldar tu candidatura (+2,5% votos en PBA).`);
      onUpdateState?.((prev) => ({
        ...prev,
        votingIntention: {
          ...prev.votingIntention,
          intencionVotoGeneral: Math.min(100, Math.round((prev.votingIntention.intencionVotoGeneral + 0.8) * 10) / 10)
        },
        historyLog: [`Apoyo provincial: ${leader.name} (${leader.district}) se sumó a la campaña (+0,8% nacional).`, ...prev.historyLog]
      }));
    } else {
      setRejectedCooldowns((prev) => ({ ...prev, [leader.id]: 5 }));
      setBannerMessage(`⚠️ ${leader.name} rechazó tu propuesta. No podrás volver a insistirle por 5 meses.`);
      onUpdateState?.((prev) => ({
        ...prev,
        historyLog: [`${leader.name} (${leader.district}) rechazó el pedido de apoyo político provincial.`, ...prev.historyLog]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
          POLÍTICO
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
          Apoyo en Provincias
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          La rosca territorial con intendentes del Conurbano y caudillos distritales define la elección.
          Las respuestas dependen de tu afinidad ideológica, humor social y temperamento de la figura.
        </p>
      </div>

      {bannerMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200">
          <span>{bannerMessage}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-xs space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Provincia</label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="Buenos Aires">Buenos Aires (PBA)</option>
          <option value="Córdoba">Córdoba</option>
          <option value="Santa Fe">Santa Fe</option>
          <option value="Mendoza">Mendoza</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {['TODOS', 'UxP', 'PRO', 'LLA', 'PyV', 'FPF'].map((sigla) => (
          <button
            key={sigla}
            type="button"
            onClick={() => setPartyFilter(sigla)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              partyFilter === sigla
                ? 'bg-white text-slate-950 border-white shadow'
                : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {sigla === 'TODOS' ? 'Todos (6)' : sigla}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {filtered.map((leader) => {
          const isEndorsed = endorsedLeaderIds.has(leader.id);
          const cooldown = rejectedCooldowns[leader.id] ?? 0;
          const prob = computeLeaderEffectiveProb(leader, state.partySigla, approval);

          return (
            <LocalLeaderCard
              key={leader.id}
              leader={leader}
              isEndorsed={isEndorsed}
              cooldownMonths={cooldown}
              effectiveProb={prob}
              onRequestSupport={() => handleRequestSupport(leader)}
            />
          );
        })}
      </div>
    </div>
  );
}
