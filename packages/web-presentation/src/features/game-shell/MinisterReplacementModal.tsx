import React, { useMemo, useState } from 'react';
import type { CabinetMinister, RealPoliticianPreset } from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';
import { AlertTriangle, Award, Check, UserCheck, X } from 'lucide-react';
import { playUiSound } from '../../lib/gameFeedback.js';

// Relevo de cartera: excluye al propio presidente/jugador y ordena primero
// a los perfiles idoneos para el ministerio, acoplado a la estetica La Rosca.

const SUITABLE_POLITICIANS_BY_MINISTRY: Record<string, string[]> = {
  SEGURIDAD: ['PATRICIA_BULLRICH', 'CRISTIAN_RITONDO', 'LUIS_PETRI', 'GUILLERMO_MONTENEGRO', 'SERGIO_BERNI'],
  DEFENSA: ['LUIS_PETRI', 'CARLOS_PRESTI', 'OSCAR_AGUAD', 'PATRICIA_BULLRICH'],
  ECONOMIA: ['LUIS_CAPUTO', 'HERNAN_LACUNZA', 'CARLOS_MELCONIAN', 'MARTIN_LOUSTEAU', 'ALFONSO_PRAT_GAY', 'FEDERICO_STURZENEGGER', 'JOSE_LUIS_ESPERT', 'LUCIANO_LASPINA'],
  INTERIOR: ['GUILLERMO_FRANCOS', 'ROGELIO_FRIGERIO', 'MARCOS_PENA', 'HORACIO_RODRIGUEZ_LARRETA', 'CRISTIAN_RITONDO', 'DIEGO_SANTILLI', 'EMILIO_MONZO'],
  JEFATURA: ['GUILLERMO_FRANCOS', 'MARCOS_PENA', 'SANTIAGO_CAPUTO', 'HORACIO_RODRIGUEZ_LARRETA', 'DIEGO_SANTILLI', 'ROGELIO_FRIGERIO', 'NICOLAS_POSSE'],
  CAPITAL_HUMANO: ['SANDRA_PETTOVELLO', 'CAROLINA_LOSADA', 'GRACIELA_OCANA', 'MARIA_EUGENIA_VIDAL', 'SOLEDAD_ACUNA'],
  JUSTICIA: ['MARIANO_CUNEO_LIBARONA', 'JULIETA_CABRERA', 'GERMAN_GARAVANO', 'RICARDO_GIL_LAVEDRA'],
  SALUD: ['MARIO_LUGONES', 'FERNAN_QUIROS', 'ADOLFO_RUBINSTEIN'],
  CANCILLERIA: ['GERARDO_WERTHEIN', 'DIANA_MONDINO', 'FEDERICO_PINEDO', 'JORGE_FAURIE'],
  INFRAESTRUCTURA: ['FEDERICO_STURZENEGGER', 'GUILLERMO_FERRARO', 'JAVIER_IGUACEL', 'GUILLERMO_DIETRICH']
};

const MINISTRY_KEYWORDS: Record<string, string[]> = {
  ECONOMIA: ['econom', 'hacienda', 'finanz'],
  SEGURIDAD: ['seguridad', 'polic', 'orden'],
  SALUD: ['salud', 'médic', 'medic'],
  JUSTICIA: ['justicia', 'abogad', 'juez']
};

function checkRoleKeywordMatch(ministryId: string, roleLower: string): boolean {
  const keywords = MINISTRY_KEYWORDS[ministryId];
  if (!keywords) return false;
  return keywords.some((kw) => roleLower.includes(kw));
}

function isSuitableForMinistry(ministryId: string, pol: RealPoliticianPreset): boolean {
  const directList = SUITABLE_POLITICIANS_BY_MINISTRY[ministryId];
  if (directList && directList.includes(pol.id)) {
    return true;
  }
  return checkRoleKeywordMatch(ministryId, pol.roleDescription.toLowerCase());
}

function isSelfCandidate(
  pol: RealPoliticianPreset,
  playerId?: string,
  playerName?: string
): boolean {
  if (playerId && pol.id === playerId) return true;
  if (!playerName) return false;
  return pol.name.trim().toLowerCase() === playerName.trim().toLowerCase();
}

function scoreCandidateOrder(
  pol: RealPoliticianPreset,
  ministryId: string,
  playerPartySigla: string
): number {
  const suitableScore = isSuitableForMinistry(ministryId, pol) ? 100 : 0;
  const partyScore = pol.partySigla === playerPartySigla ? 10 : 0;
  return suitableScore + partyScore;
}

function resolveEligiblePoliticians(
  ministryId: string,
  playerPartySigla: string,
  coalitionParties: string[],
  playerCandidateId?: string,
  playerCandidateName?: string
): RealPoliticianPreset[] {
  const allowed = new Set([playerPartySigla, ...coalitionParties]);
  const pool = REAL_POLITICIANS_2027.filter((p) => !isSelfCandidate(p, playerCandidateId, playerCandidateName));
  const matched = pool.filter((p) => allowed.has(p.partySigla));
  const list = matched.length > 0 ? matched : pool;
  return [...list].sort((a, b) => {
    const diff = scoreCandidateOrder(b, ministryId, playerPartySigla) - scoreCandidateOrder(a, ministryId, playerPartySigla);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

function computeMinisterCompetence(isSuitable: boolean, pol: RealPoliticianPreset): number {
  const base = pol.difficulty === 'VIENTO_DE_COLA' ? 70 : 60;
  if (isSuitable) return Math.min(92, base + 12);
  return Math.max(38, base - 18);
}

function computeMinisterRisk(isSuitable: boolean, isQuota: boolean): number {
  const base = isSuitable ? 14 : 32;
  return isQuota ? base + 8 : base;
}

const TRAIT_LOYALTY_BASE: Record<string, number> = {
  Dogmático: 85,
  Dialoguista: 78,
  Pragmático: 70
};

function computeMinisterLoyalty(pol: RealPoliticianPreset, isQuota: boolean): number {
  const base = TRAIT_LOYALTY_BASE[pol.styleTrait] ?? 55;
  return isQuota ? Math.max(45, base - 15) : base;
}

function buildMonthlyEffect(isSuitable: boolean, polName: string): string {
  if (isSuitable) {
    return `Gestión idónea de ${polName}: efectividad +10% en metas ministeriales`;
  }
  return `Advertencia técnica: ${polName} requiere curva de aprendizaje (+riesgo)`;
}

export function createCabinetMinister(
  ministry: CabinetMinister,
  pol: RealPoliticianPreset,
  playerPartySigla: string
): CabinetMinister {
  const isQuota = pol.partySigla !== playerPartySigla;
  const suitable = isSuitableForMinistry(ministry.id, pol);
  return {
    id: ministry.id,
    ministryName: ministry.ministryName,
    ministerName: pol.name,
    partySigla: pol.partySigla,
    affinityPct: isQuota ? 85 : 100,
    isCoalitionQuota: isQuota,
    competence: computeMinisterCompetence(suitable, pol),
    loyalty: computeMinisterLoyalty(pol, isQuota),
    risk: computeMinisterRisk(suitable, isQuota),
    performance: suitable ? 72 : 44,
    monthlyEffectText: buildMonthlyEffect(suitable, pol.name)
  };
}

function CandidateItem({
  pol,
  ministryId,
  playerPartySigla,
  isSelected,
  onSelect
}: {
  pol: RealPoliticianPreset;
  ministryId: string;
  playerPartySigla: string;
  isSelected: boolean;
  onSelect: (pol: RealPoliticianPreset) => void;
}) {
  const isSuitable = isSuitableForMinistry(ministryId, pol);
  const isQuota = pol.partySigla !== playerPartySigla;

  return (
    <button
      type="button"
      onClick={() => {
        playUiSound('select');
        onSelect(pol);
      }}
      className={`w-full p-3.5 rounded-sm border text-left transition flex flex-col justify-between gap-2 ${
        isSelected
          ? 'bg-[#17253b] border-[#c9a24d] shadow-md'
          : 'bg-[#0b1018] border-[#263142] hover:border-[#415370]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#141b26] text-slate-200 border border-[#334155]">
              {pol.partySigla}
            </span>
            <span className="font-extrabold text-sm text-slate-100">{pol.name}</span>
          </div>
          {isQuota ? (
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-[#2d210b] px-2 py-0.5 rounded-sm border border-amber-700/60">
              CUOTA COALICIÓN
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-[#0f291e] px-2 py-0.5 rounded-sm border border-emerald-700/60">
              PROPIO
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pol.roleDescription}</p>
      </div>

      <div className="pt-2 border-t border-[#1d2738] flex items-center justify-between text-xs">
        {isSuitable ? (
          <span className="text-emerald-400 font-mono font-bold text-[11px] inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>IDÓNEO (+12 comp.)</span>
          </span>
        ) : (
          <span className="text-amber-400 font-mono font-bold text-[11px] inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sin especialidad (-18 comp.)</span>
          </span>
        )}
        <span className="text-[11px] font-mono text-slate-400">Estilo: {pol.styleTrait}</span>
      </div>
    </button>
  );
}

export interface MinisterReplacementModalProps {
  ministry: CabinetMinister;
  playerPartySigla: string;
  coalitionParties: string[];
  playerCandidateId?: string;
  playerCandidateName?: string;
  onConfirm: (newMinister: CabinetMinister) => void;
  onClose: () => void;
}

export function MinisterReplacementModal({
  ministry,
  playerPartySigla,
  coalitionParties,
  playerCandidateId,
  playerCandidateName,
  onConfirm,
  onClose
}: MinisterReplacementModalProps) {
  const eligiblePoliticians = useMemo(
    () =>
      resolveEligiblePoliticians(
        ministry.id,
        playerPartySigla,
        coalitionParties,
        playerCandidateId,
        playerCandidateName
      ),
    [ministry.id, playerPartySigla, coalitionParties, playerCandidateId, playerCandidateName]
  );

  const [selectedPol, setSelectedPol] = useState<RealPoliticianPreset | null>(
    () => eligiblePoliticians[0] ?? null
  );

  const handleConfirm = () => {
    if (!selectedPol) return;
    playUiSound('atn');
    onConfirm(createCabinetMinister(ministry, selectedPol, playerPartySigla));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl hoi-panel rounded-sm shadow-2xl overflow-hidden rosca-panel-enter">
        <div className="hoi-header-steel px-5 py-3.5 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>RELEVO DE CARTERA</span>
            </div>
            <h3 className="text-lg font-serif font-black text-amber-50 mt-0.5">
              Designar Ministro de {ministry.ministryName}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Actual: <strong className="text-white">{ministry.ministerName}</strong> ({ministry.partySigla}).
              Perfiles idóneos ordenados arriba.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-sm border border-transparent hover:border-[#334155]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Candidatos habilitados ({eligiblePoliticians.length})</span>
            <span>Socios: {coalitionParties.length > 0 ? coalitionParties.join(', ') : 'Sin socios'}</span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {eligiblePoliticians.map((pol) => (
              <CandidateItem
                key={pol.id}
                pol={pol}
                ministryId={ministry.id}
                playerPartySigla={playerPartySigla}
                isSelected={selectedPol?.id === pol.id}
                onSelect={setSelectedPol}
              />
            ))}
          </div>

          <div className="pt-3 border-t border-[#263142] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-[#0b1018] border border-[#334155] text-xs font-semibold text-slate-300 hover:bg-[#172233] transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedPol}
              onClick={handleConfirm}
              className="hoi-btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Nombramiento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
