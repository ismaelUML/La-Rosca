import React, { useMemo, useState } from 'react';
import { seededUnit, type CampaignSimulationState } from '@argentina-sim/domain';
import { OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Vista de POLITICO -> Apoyo en Provincias en estetica tactica acero/bronce:
// Negociacion y cooptacion territorial con intendentes y referentes municipales en PBA, Cordoba, Santa Fe y Mendoza.

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

const LOCAL_LEADERS_BY_PROVINCE: Record<string, LocalMayorLeader[]> = {
  'Buenos Aires': [
    { id: 'NARDINI', name: 'Leonardo Nardini', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Malvinas Argentinas', roleText: 'Intendente de Malvinas Argentinas y armador de la Primera Sección', styleTrait: 'Dialoguista', isOfficial: true, relevance: 28, influence: 34, supportPct: 39, defectionChancePct: 19 },
    { id: 'SAMID', name: 'Alberto Samid', partyName: 'Principios y Valores', partySigla: 'PyV', district: 'La Matanza', roleText: 'Dirigente de Principios y Valores, empresario frigorífico del oeste', styleTrait: 'Dialoguista', isOfficial: false, relevance: 26, influence: 26, supportPct: 45, defectionChancePct: 25 },
    { id: 'BIONDINI', name: 'Alejandro Biondini', partyName: 'Frente Patriota Federal', partySigla: 'FPF', district: 'Buenos Aires', roleText: 'Referente nacionalista de Frente Patriota Federal', styleTrait: 'Dogmático', isOfficial: false, relevance: 23, influence: 27, supportPct: 12, defectionChancePct: 5 },
    { id: 'VALENZUELA', name: 'Diego Valenzuela', partyName: 'Propuesta Republicana / LLA', partySigla: 'PRO', district: 'Tres de Febrero', roleText: 'Intendente de Tres de Febrero y promotor de alivio fiscal municipal', styleTrait: 'Dialoguista', isOfficial: true, relevance: 42, influence: 48, supportPct: 58, defectionChancePct: 40 },
    { id: 'MAYRA_MENDOZA', name: 'Mayra Mendoza', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Quilmes', roleText: 'Intendenta de Quilmes y referente de La Cámpora en la Tercera Sección', styleTrait: 'Dogmático', isOfficial: true, relevance: 50, influence: 56, supportPct: 20, defectionChancePct: 8 },
    { id: 'SOLEDAD_MARTINEZ', name: 'Soledad Martínez', partyName: 'Propuesta Republicana', partySigla: 'PRO', district: 'Vicente López', roleText: 'Intendenta de Vicente López y referente metropolitana del PRO', styleTrait: 'Dialoguista', isOfficial: true, relevance: 36, influence: 42, supportPct: 65, defectionChancePct: 50 }
  ],
  Córdoba: [
    { id: 'PASSERINI', name: 'Daniel Passerini', partyName: 'Hacemos Unidos', partySigla: 'HxC', district: 'Córdoba Capital', roleText: 'Intendente de Córdoba Capital y alfil del cordobesismo', styleTrait: 'Dialoguista', isOfficial: true, relevance: 44, influence: 52, supportPct: 54, defectionChancePct: 28 },
    { id: 'DE_LOREDO', name: 'Rodrigo de Loredo', partyName: 'Unión Cívica Radical', partySigla: 'UCR', district: 'Córdoba Capital', roleText: 'Referente legislativo radical con fuerte peso en la capital provincial', styleTrait: 'Dialoguista', isOfficial: true, relevance: 48, influence: 46, supportPct: 61, defectionChancePct: 35 },
    { id: 'FERRER_M', name: 'Marcos Ferrer', partyName: 'Unión Cívica Radical', partySigla: 'UCR', district: 'Río Tercero', roleText: 'Intendente de Río Tercero y presidente del comité radical cordobés', styleTrait: 'Dialoguista', isOfficial: true, relevance: 31, influence: 37, supportPct: 56, defectionChancePct: 30 },
    { id: 'NATALIA_DLS', name: 'Natalia de la Sota', partyName: 'Peronismo Cordobés', partySigla: 'HxC', district: 'Punilla / Capital', roleText: 'Diputada nacional con puente hacia el peronismo tradicional', styleTrait: 'Dialoguista', isOfficial: true, relevance: 38, influence: 40, supportPct: 47, defectionChancePct: 22 }
  ],
  'Santa Fe': [
    { id: 'JAVKIN', name: 'Pablo Javkin', partyName: 'Frente Unidos', partySigla: 'UCR', district: 'Rosario', roleText: 'Intendente de Rosario y socio estratégico de Unidos para Cambiar Santa Fe', styleTrait: 'Dialoguista', isOfficial: true, relevance: 49, influence: 55, supportPct: 57, defectionChancePct: 32 },
    { id: 'POLETTI', name: 'Juan Pablo Poletti', partyName: 'Frente Unidos', partySigla: 'PRO', district: 'Santa Fe Capital', roleText: 'Intendente de Santa Fe Capital con perfil de gestión sanitaria', styleTrait: 'Dialoguista', isOfficial: true, relevance: 37, influence: 41, supportPct: 59, defectionChancePct: 36 },
    { id: 'VIOTTI', name: 'Leonardo Viotti', partyName: 'Unión Cívica Radical', partySigla: 'UCR', district: 'Rafaela', roleText: 'Intendente de Rafaela en el corazón de la cuenca lechera e industrial', styleTrait: 'Dialoguista', isOfficial: true, relevance: 29, influence: 35, supportPct: 55, defectionChancePct: 29 },
    { id: 'LEWANDOWSKI', name: 'Marcelo Lewandowski', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Gran Rosario', roleText: 'Senador y referente del peronismo santafesino en el sur provincial', styleTrait: 'Dialoguista', isOfficial: true, relevance: 40, influence: 43, supportPct: 36, defectionChancePct: 16 }
  ],
  Mendoza: [
    { id: 'ULPIANO_SUAREZ', name: 'Ulpiano Suarez', partyName: 'Cambia Mendoza', partySigla: 'UCR', district: 'Ciudad de Mendoza', roleText: 'Intendente de la Capital mendocina y referente de gestión urbana', styleTrait: 'Dialoguista', isOfficial: true, relevance: 41, influence: 47, supportPct: 62, defectionChancePct: 38 },
    { id: 'STEVANATO', name: 'Matías Stevanato', partyName: 'Partido Justicialista', partySigla: 'UxP', district: 'Maipú', roleText: 'Intendente de Maipú con perfil moderado y diálogo con bodegueros', styleTrait: 'Dialoguista', isOfficial: true, relevance: 34, influence: 39, supportPct: 48, defectionChancePct: 24 },
    { id: 'OMAR_FELIX', name: 'Omar Félix', partyName: 'Partido Justicialista', partySigla: 'UxP', district: 'San Rafael', roleText: 'Intendente de San Rafael y caudillo histórico del oasis sur mendocino', styleTrait: 'Dialoguista', isOfficial: true, relevance: 35, influence: 42, supportPct: 44, defectionChancePct: 20 },
    { id: 'ALLASINO', name: 'Esteban Allasino', partyName: 'La Unión Mendocina / PRO', partySigla: 'PRO', district: 'Luján de Cuyo', roleText: 'Intendente de Luján de Cuyo, polo petrolero y vitivinícola', styleTrait: 'Dialoguista', isOfficial: true, relevance: 33, influence: 38, supportPct: 64, defectionChancePct: 42 }
  ]
};

function getPartyPairKey(p1: string, p2: string): string {
  return [p1, p2].sort((a, b) => a.localeCompare(b)).join('_');
}

const PARTY_AFFINITY_MODIFIERS: Record<string, number> = {
  LLA_PRO: 12,
  LLA_UCR: 6,
  PRO_UCR: 14,
  HxC_PRO: 8,
  HxC_UCR: 8,
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
  return PARTY_AFFINITY_MODIFIERS[key] ?? -4;
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

function LocalLeaderFooterButton({
  isEndorsed,
  cooldownMonths,
  onRequestSupport
}: {
  isEndorsed: boolean;
  cooldownMonths: number;
  onRequestSupport: () => void;
}) {
  if (cooldownMonths > 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2 rounded-sm text-xs font-mono font-bold bg-[#090d14] border border-amber-800/50 text-amber-400/80 cursor-not-allowed"
      >
        En enfriamiento ({cooldownMonths} meses)
      </button>
    );
  }
  const btnCls = isEndorsed
    ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 cursor-default'
    : 'hoi-btn-gold';
  return (
    <button
      type="button"
      disabled={isEndorsed}
      onClick={onRequestSupport}
      className={`w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition shadow ${btnCls}`}
    >
      {isEndorsed ? '✓ Apoyo Asegurado' : 'Negociar Apoyo Territorial'}
    </button>
  );
}

function LocalLeaderCard({
  leader,
  isEndorsed,
  cooldownMonths,
  effectiveProb,
  onRequestSupport
}: LocalLeaderCardProps) {
  const cardBorder = isEndorsed ? 'border-emerald-500/50 bg-[#0d1917]' : 'border-[#263142] hover:border-[#8a6d33]';

  return (
    <div className={`hoi-panel rounded-sm p-4 flex flex-col justify-between space-y-3 transition ${cardBorder}`}>
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-[#1e293b] pb-2">
          <div className="flex items-start gap-2 min-w-0">
            <OfficialPartyLogo partyIdOrSigla={leader.partySigla} sizePx={26} />
            <div className="min-w-0">
              <div className="font-serif font-bold text-amber-100 text-sm uppercase tracking-wide truncate">
                {leader.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                {leader.partyName} · <span className="text-sky-300">{leader.district}</span>
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-sm bg-[#090d14] border border-[#263142] text-[10px] font-mono font-bold text-amber-300 shrink-0">
            {leader.partySigla}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 my-2.5">
          <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-[#090d14] border border-[#263142] text-slate-300">
            {leader.styleTrait.toUpperCase()}
          </span>
          {leader.isOfficial ? (
            <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-sky-950/50 border border-sky-700/60 text-sky-300">
              INTENDENTE / CARGO
            </span>
          ) : null}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{leader.roleText}</p>

        <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[11px]">
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
            <div className="text-[9px] text-slate-500 uppercase">Relevancia / Infl.</div>
            <div className="text-slate-200 font-bold mt-0.5">
              {leader.relevance} / {leader.influence}
            </div>
          </div>
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
            <div className="text-[9px] text-slate-500 uppercase">Apoyo estimado</div>
            <div className="text-amber-300 font-bold mt-0.5">{effectiveProb}%</div>
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#263142]">
        <LocalLeaderFooterButton
          isEndorsed={isEndorsed}
          cooldownMonths={cooldownMonths}
          onRequestSupport={onRequestSupport}
        />
      </div>
    </div>
  );
}

export interface CampaignApoyoProvinciasViewProps {
  state: CampaignSimulationState;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

function resolveProvinceLeaders(selectedProvince: string): LocalMayorLeader[] {
  return LOCAL_LEADERS_BY_PROVINCE[selectedProvince] ?? LOCAL_LEADERS_BY_PROVINCE['Buenos Aires']!;
}

function resolveLeaderCooldownMonths(
  cooldowns: Record<string, number> | undefined,
  leaderId: string,
  currentMonth: number
): number {
  const until = cooldowns ? (cooldowns[leaderId] ?? 0) : 0;
  return Math.max(0, until - currentMonth);
}

function isLeaderEndorsed(state: CampaignSimulationState, leaderId: string): boolean {
  return state.diplomacy?.endorsements?.[leaderId]?.verdict === 'ACEPTO';
}

export function CampaignApoyoProvinciasView({ state, onUpdateState }: CampaignApoyoProvinciasViewProps) {
  const [selectedProvince, setSelectedProvince] = useState('Buenos Aires');
  const [partyFilter, setPartyFilter] = useState('TODOS');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const approval = state.countryMood ? state.countryMood.governmentApprovalPct : 50;
  const currentMonth = state.stage.currentMonthIndex;
  const provinceLeaders = resolveProvinceLeaders(selectedProvince);

  const availableParties = useMemo(() => {
    const siglas = Array.from(new Set(provinceLeaders.map((l) => l.partySigla)));
    return ['TODOS', ...siglas];
  }, [provinceLeaders]);

  const filtered = useMemo(() => {
    return provinceLeaders.filter(
      (l) => partyFilter === 'TODOS' || l.partySigla === partyFilter
    );
  }, [provinceLeaders, partyFilter]);

  const handleRequestSupport = (leader: LocalMayorLeader) => {
    const effectiveProb = computeLeaderEffectiveProb(leader, state.partySigla, approval);
    const accepted = seededUnit(`${currentMonth}:${leader.id}`) * 100 < effectiveProb;

    if (accepted) {
      setBannerMessage(`✓ ${leader.name} (${leader.district}) aceptó respaldar tu estructura en ${selectedProvince} (+0,8% nacional).`);
      onUpdateState?.((prev) => {
        const prevDip = prev.diplomacy ?? { endorsements: {}, defections: {}, coalitions: {}, delegateId: null };
        return {
          ...prev,
          diplomacy: {
            ...prevDip,
            endorsements: {
              ...prevDip.endorsements,
              [leader.id]: { verdict: 'ACEPTO', monthIndex: currentMonth, probabilityPct: effectiveProb }
            }
          },
          votingIntention: {
            ...prev.votingIntention,
            intencionVotoGeneral: Math.min(100, Math.round((prev.votingIntention.intencionVotoGeneral + 0.8) * 10) / 10)
          },
          historyLog: [`Apoyo municipal: ${leader.name} (${leader.district}, ${selectedProvince}) se sumó a la campaña (+0,8% nacional).`, ...prev.historyLog]
        };
      });
    } else {
      setBannerMessage(`✕ ${leader.name} rechazó el acuerdo territorial. No podrás volver a insistirle por 5 meses.`);
      onUpdateState?.((prev) => {
        const prevDip = prev.diplomacy ?? { endorsements: {}, defections: {}, coalitions: {}, delegateId: null };
        return {
          ...prev,
          politicianCooldowns: { ...(prev.politicianCooldowns ?? {}), [leader.id]: currentMonth + 5 },
          diplomacy: {
            ...prevDip,
            endorsements: {
              ...prevDip.endorsements,
              [leader.id]: { verdict: 'RECHAZO', monthIndex: currentMonth, probabilityPct: effectiveProb }
            }
          },
          historyLog: [`${leader.name} (${leader.district}) rechazó el pedido de apoyo político en ${selectedProvince}.`, ...prev.historyLog]
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            POLÍTICO · INTENDENTES Y APARATO MUNICIPAL
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
            Apoyo en Provincias
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            La rosca territorial con intendentes del Conurbano y cabeceras del interior asegura fiscalización y corte de boleta.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#8a6d33]/80 text-xs font-mono text-amber-200">
          Distrito activo: <strong>{selectedProvince}</strong>
        </div>
      </header>

      {bannerMessage ? (
        <div className="flex items-center justify-between p-3.5 rounded-sm bg-[#090d14] border border-[#8a6d33] text-xs font-mono text-amber-100">
          <span>{bannerMessage}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 font-bold"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="hoi-panel rounded-sm p-4 flex flex-wrap items-end justify-between gap-4">
        <div className="w-full sm:w-72 space-y-1.5">
          <label htmlFor="apoyo-prov-selector" className="block text-[10px] font-mono uppercase tracking-wider text-amber-300">
            Seleccionar Provincia
          </label>
          <select
            id="apoyo-prov-selector"
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setPartyFilter('TODOS');
            }}
            className="w-full bg-[#090d14] border border-[#263142] rounded-sm px-3 py-2 text-xs font-mono text-amber-100"
          >
            <option value="Buenos Aires">Buenos Aires (Conurbano e Interior)</option>
            <option value="Córdoba">Córdoba (Capital y Gran Córdoba)</option>
            <option value="Santa Fe">Santa Fe (Rosario, Capital y Rafaela)</option>
            <option value="Mendoza">Mendoza (Gran Mendoza y San Rafael)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableParties.map((sigla) => (
            <button
              key={sigla}
              type="button"
              onClick={() => setPartyFilter(sigla)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition border ${
                partyFilter === sigla
                  ? 'bg-[#b89342] text-[#090d14] border-amber-300 shadow'
                  : 'bg-[#090d14] text-slate-300 border-[#263142] hover:border-[#8a6d33]'
              }`}
            >
              {sigla === 'TODOS' ? `Todos (${provinceLeaders.length})` : sigla}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((leader) => (
          <LocalLeaderCard
            key={leader.id}
            leader={leader}
            isEndorsed={isLeaderEndorsed(state, leader.id)}
            cooldownMonths={resolveLeaderCooldownMonths(state.politicianCooldowns, leader.id, currentMonth)}
            effectiveProb={computeLeaderEffectiveProb(leader, state.partySigla, approval)}
            onRequestSupport={() => handleRequestSupport(leader)}
          />
        ))}
      </div>
    </div>
  );
}
