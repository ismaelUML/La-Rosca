import React, { useMemo } from 'react';
import {
  affinityPctFromDistance,
  buildPoliticianProfile,
  ideologicalDistance,
  resolvePartyAxis,
  type CampaignSimulationState,
  type IdeologicalAxisPosition
} from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';
import { OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Modal de seleccion de Vicepresidente en estetica tactica acero/bronce:
// Evita caer en un slice crudo del dataset (que tiraba siempre los primeros 8 de LLA)
// cuando jugas con partido propio: genera cuadros propios + pases/socios + afines por eje.

export interface ViceCandidateOption {
  id: string;
  name: string;
  partySigla: string;
  roleDescription: string;
  sourceLabel: string;
  relevance: number;
  structure: number;
}

function computePolHash(polId: string, salt: number, mod: number): number {
  let h = 0;
  for (let i = 0; i < polId.length; i++) {
    h = (h * salt + polId.charCodeAt(i)) % 1000;
  }
  return h % mod;
}

function resolveEconomicCadre(economic: number): { idSuffix: string; name: string; roleDescription: string } {
  if (economic <= 36) {
    return {
      idSuffix: 'ECO_IND',
      name: 'Dr. Ricardo Altamirano',
      roleDescription: 'Economista industrial y exdirector de banca de desarrollo (cuadro propio)'
    };
  }
  if (economic <= 66) {
    return {
      idSuffix: 'ECO_DES',
      name: 'Lic. Mariana Sosa Etcheverry',
      roleDescription: 'Economista desarrollista, especialista en cuentas federales y producción'
    };
  }
  return {
    idSuffix: 'ECO_LIB',
    name: 'Mg. Tomás Urquiza',
    roleDescription: 'Economista fiscal y tributario, exasesor parlamentario de presupuesto'
  };
}

function resolveCulturalCadre(cultural: number): { idSuffix: string; name: string; roleDescription: string } {
  if (cultural <= 38) {
    return {
      idSuffix: 'CUL_SOC',
      name: 'Dra. Valeria Benítez',
      roleDescription: 'Referente en derechos laborales, educación pública y gestión social'
    };
  }
  if (cultural <= 66) {
    return {
      idSuffix: 'CUL_REP',
      name: 'Dr. Esteban Morales',
      roleDescription: 'Constitucionalista federal y exsecretario parlamentario'
    };
  }
  return {
    idSuffix: 'CUL_ORD',
    name: 'Cnel. (RE) Hernán Salgado',
    roleDescription: 'Especialista en seguridad interior, defensa y orden institucional'
  };
}

function buildCustomPartyViceCadres(state: CampaignSimulationState): ViceCandidateOption[] {
  const axis = state.partyAxis ?? resolvePartyAxis(state.partySigla);
  const eco = resolveEconomicCadre(axis.economic);
  const cul = resolveCulturalCadre(axis.cultural);
  const provTag = state.targetProvinceId.replace(/_/g, ' ');

  const cadres = [
    eco,
    {
      idSuffix: 'TERR',
      name: 'Cecilia Ferreyra',
      roleDescription: `Armadora territorial y exlegisladora por ${provTag} (estructura orgánica)`
    },
    cul
  ];

  return cadres.map((c, idx) => ({
    id: `CUSTOM_VICE_${state.partySigla}_${c.idSuffix}`,
    name: c.name,
    partySigla: state.partySigla,
    roleDescription: c.roleDescription,
    sourceLabel: `Cuadro propio · ${state.partySigla}`,
    relevance: 64 + idx * 4,
    structure: 74 - idx * 3
  }));
}

function getAcceptedDefectionIds(state: CampaignSimulationState): Set<string> {
  const out = new Set<string>();
  const entries = Object.entries(state.diplomacy?.defections ?? {});
  for (const [id, rec] of entries) {
    if (rec.verdict === 'ACEPTO') out.add(id);
  }
  return out;
}

function mapPoliticianToViceOption(
  p: (typeof REAL_POLITICIANS_2027)[number],
  sourceLabel: string,
  overrideSigla?: string
): ViceCandidateOption {
  return {
    id: p.id,
    name: p.name,
    partySigla: overrideSigla ?? p.partySigla,
    roleDescription: p.roleDescription,
    sourceLabel,
    relevance: 55 + computePolHash(p.id, 31, 20),
    structure: 60 + computePolHash(p.id, 19, 25)
  };
}

function rankAlignedExternalCandidates(
  state: CampaignSimulationState,
  excludeIds: Set<string>,
  playerAxis: IdeologicalAxisPosition,
  maxTotal: number
): ViceCandidateOption[] {
  const ranked = REAL_POLITICIANS_2027
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => {
      const dist = ideologicalDistance(buildPoliticianProfile(p).axis, playerAxis);
      return { p, dist, affinity: affinityPctFromDistance(dist) };
    })
    .sort((a, b) => a.dist - b.dist);

  const perPartyCount: Record<string, number> = {};
  const result: ViceCandidateOption[] = [];

  for (const item of ranked) {
    const sigla = item.p.partySigla;
    const used = perPartyCount[sigla] ?? 0;
    if (used >= 2) continue;
    perPartyCount[sigla] = used + 1;
    result.push(mapPoliticianToViceOption(item.p, `Extrapartidario afín (${item.affinity}%)`));
    if (result.length >= maxTotal) break;
  }

  return result;
}

function resolveAffiliatedSourceTag(
  polId: string,
  polPartySigla: string,
  playerSigla: string,
  coalitionSet: Set<string>,
  defectedIds: Set<string>
): { tag: string; displaySigla: string } {
  if (defectedIds.has(polId)) {
    return { tag: `Pase a ${playerSigla}`, displaySigla: playerSigla };
  }
  if (coalitionSet.has(polPartySigla)) {
    return { tag: `Socio · ${polPartySigla}`, displaySigla: polPartySigla };
  }
  return { tag: `Dirigente · ${polPartySigla}`, displaySigla: polPartySigla };
}

function collectAffiliatedCandidates(state: CampaignSimulationState): ViceCandidateOption[] {
  const coalitionSet = new Set(state.coalitionParties ?? []);
  const defectedIds = getAcceptedDefectionIds(state);

  return REAL_POLITICIANS_2027
    .filter((p) => {
      if (p.id === state.candidateId) return false;
      return p.partySigla === state.partySigla || coalitionSet.has(p.partySigla) || defectedIds.has(p.id);
    })
    .map((p) => {
      const { tag, displaySigla } = resolveAffiliatedSourceTag(
        p.id,
        p.partySigla,
        state.partySigla,
        coalitionSet,
        defectedIds
      );
      return mapPoliticianToViceOption(p, tag, displaySigla);
    });
}

export function resolveAvailableViceCandidates(state: CampaignSimulationState): ViceCandidateOption[] {
  const playerAxis = state.partyAxis ?? resolvePartyAxis(state.partySigla);
  const hasNativeRoster = REAL_POLITICIANS_2027.some((p) => p.partySigla === state.partySigla);
  const affiliated = collectAffiliatedCandidates(state);

  if (!hasNativeRoster) {
    const customCadres = buildCustomPartyViceCadres(state);
    const exclude = new Set([state.candidateId, ...affiliated.map((a) => a.id)]);
    const externals = rankAlignedExternalCandidates(state, exclude, playerAxis, 5);
    return [...customCadres, ...affiliated, ...externals];
  }

  if (affiliated.length > 0) return affiliated;
  const exclude = new Set([state.candidateId]);
  return rankAlignedExternalCandidates(state, exclude, playerAxis, 6);
}

export function findViceCandidateById(
  state: CampaignSimulationState,
  candidateId?: string | null
): ViceCandidateOption | null {
  if (!candidateId) return null;
  const fromPool = resolveAvailableViceCandidates(state).find((c) => c.id === candidateId);
  if (fromPool) return fromPool;
  const fromCatalog = REAL_POLITICIANS_2027.find((p) => p.id === candidateId);
  return fromCatalog ? mapPoliticianToViceOption(fromCatalog, `Dirigente · ${fromCatalog.partySigla}`) : null;
}

interface ViceCandidateCardProps {
  candidate: ViceCandidateOption;
  partyColor: string;
  isSelected: boolean;
  onSelect: (c: ViceCandidateOption) => void;
}

function ViceCandidateCard({ candidate, partyColor, isSelected, onSelect }: ViceCandidateCardProps) {
  return (
    <div
      className={`rounded-sm bg-[#0b0508] border p-4 flex flex-col justify-between space-y-3 transition ${
        isSelected ? 'border-emerald-500/70 bg-[#0d1917]' : 'border-white/15 hover:border-[#EB3F7D]/55'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
          <OfficialPartyLogo
            partyIdOrSigla={candidate.partySigla}
            sizePx={32}
            fallbackColor={partyColor}
          />
          <div>
            <h4 className="text-sm font-serif font-bold text-[#F5EFE6] uppercase tracking-wide leading-tight">
              {candidate.name}
            </h4>
            <div className="text-[11px] font-mono text-sky-300">
              {candidate.sourceLabel} · Relevancia {candidate.relevance}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {candidate.roleDescription}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-1.5 rounded-sm bg-[#11080d] border border-white/10 text-slate-300">
            Relevancia: <strong className="text-[#f472b6]">{candidate.relevance}</strong>
          </div>
          <div className="p-1.5 rounded-sm bg-[#11080d] border border-white/10 text-slate-300">
            Estructura: <strong className="text-emerald-400">{candidate.structure}</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(candidate)}
        className={`w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition shadow ${
          isSelected
            ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 cursor-default'
            : 'hoi-btn-gold'
        }`}
      >
        {isSelected ? '✓ Seleccionado en la Fórmula' : 'Proclamar Vicepresidente'}
      </button>
    </div>
  );
}

interface VicePresidentSelectionModalProps {
  isOpen: boolean;
  state: CampaignSimulationState;
  onClose: () => void;
  onConfirmVice: (candidateId: string, candidateName: string) => void;
}

export function VicePresidentSelectionModal({
  isOpen,
  state,
  onClose,
  onConfirmVice
}: VicePresidentSelectionModalProps) {
  const options = useMemo(() => resolveAvailableViceCandidates(state), [state]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (c: ViceCandidateOption) => {
    onConfirmVice(c.id, c.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="hoi-panel rounded-sm border-2 border-[#EB3F7D]/55 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="hoi-header-steel p-5 border-b border-white/15 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
              FÓRMULA PRESIDENCIAL 2027 · PRESIDENCIA DEL SENADO
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5EFE6] uppercase tracking-wide">
              Elegí a tu vicepresidente
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Tus socios de coalición y referentes partidarios proponen estos nombres para completar el binomio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-[#EFE9DA] px-2.5 py-1 rounded-sm bg-[#0b0508] border border-white/15 font-mono text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#11080d]">
          {options.map((opt) => (
            <ViceCandidateCard
              key={opt.id}
              candidate={opt}
              partyColor={state.partyColor}
              isSelected={state.runningMateId === opt.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="p-4 bg-[#0b0508] border-t border-white/15 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-[#EFE9DA] bg-[#11080d] border border-white/15"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
