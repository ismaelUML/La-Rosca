import React, { useMemo, useState } from 'react';
import type { CabinetMinister, RealPoliticianPreset } from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Armar gabinete en Argentina es puro equilibrio de rosca: si no le das ministerios
// a tus socios de coalicion te rompen el bloque en Diputados, pero si pones a alguien
// en una cartera que no domina (tipo Bullrich en Capital Humano o un radical en Economia)
// te explota la gestion en tres semanas. Cada nombramiento tiene costo y premio.

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
  const roleLower = pol.roleDescription.toLowerCase();
  return checkRoleKeywordMatch(ministryId, roleLower);
}

function resolveEligiblePoliticians(playerPartySigla: string, coalitionParties: string[]): RealPoliticianPreset[] {
  const allowed = new Set([playerPartySigla, ...coalitionParties]);
  const matched = REAL_POLITICIANS_2027.filter((p) => allowed.has(p.partySigla));
  if (matched.length > 0) return matched;
  return REAL_POLITICIANS_2027;
}

function computeMinisterCompetence(isSuitable: boolean, pol: RealPoliticianPreset): number {
  const base = pol.difficulty === 'VIENTO_DE_COLA' ? 70 : 60;
  if (isSuitable) {
    return Math.min(92, base + 12);
  }
  return Math.max(38, base - 18);
}

function computeMinisterRisk(isSuitable: boolean, isQuota: boolean): number {
  let risk = isSuitable ? 14 : 32;
  if (isQuota) {
    risk += 8;
  }
  return risk;
}

const TRAIT_LOYALTY_BASE: Record<string, number> = {
  Dogmático: 85,
  Dialoguista: 78,
  Pragmático: 70
};

function computeMinisterLoyalty(pol: RealPoliticianPreset, isQuota: boolean): number {
  const base = TRAIT_LOYALTY_BASE[pol.styleTrait] ?? 55;
  if (isQuota) {
    return Math.max(45, base - 15);
  }
  return base;
}

function buildMonthlyEffect(ministryId: string, isSuitable: boolean, polName: string): string {
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
  const competence = computeMinisterCompetence(suitable, pol);
  const risk = computeMinisterRisk(suitable, isQuota);
  const loyalty = computeMinisterLoyalty(pol, isQuota);
  const performance = suitable ? 72 : 44;
  const affinity = isQuota ? 85 : 100;
  const effect = buildMonthlyEffect(ministry.id, suitable, pol.name);

  return {
    id: ministry.id,
    ministryName: ministry.ministryName,
    ministerName: pol.name,
    partySigla: pol.partySigla,
    affinityPct: affinity,
    isCoalitionQuota: isQuota,
    competence,
    loyalty,
    risk,
    performance,
    monthlyEffectText: effect
  };
}

interface CandidateItemProps {
  pol: RealPoliticianPreset;
  ministryId: string;
  playerPartySigla: string;
  isSelected: boolean;
  onSelect: (pol: RealPoliticianPreset) => void;
}

function CandidateItem({ pol, ministryId, playerPartySigla, isSelected, onSelect }: CandidateItemProps) {
  const isSuitable = isSuitableForMinistry(ministryId, pol);
  const isQuota = pol.partySigla !== playerPartySigla;

  return (
    <div
      onClick={() => onSelect(pol)}
      className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-2 ${
        isSelected
          ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
          : 'bg-[#0b0e15] border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
              {pol.partySigla}
            </span>
            <span className="font-extrabold text-sm text-white">{pol.name}</span>
          </div>
          {isQuota ? (
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
              Cuota de coalición
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
              Partido propio
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pol.roleDescription}</p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {isSuitable ? (
          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
            ✓ Perfil idóneo (+12 comp.)
          </span>
        ) : (
          <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
            ⚠️ Incompatibilidad (-18 comp.)
          </span>
        )}
        <span className="text-[11px] text-slate-400">Estilo: {pol.styleTrait}</span>
      </div>
    </div>
  );
}

export interface MinisterReplacementModalProps {
  ministry: CabinetMinister;
  playerPartySigla: string;
  coalitionParties: string[];
  onConfirm: (newMinister: CabinetMinister) => void;
  onClose: () => void;
}

export function MinisterReplacementModal({
  ministry,
  playerPartySigla,
  coalitionParties,
  onConfirm,
  onClose
}: MinisterReplacementModalProps) {
  const eligiblePoliticians = useMemo(
    () => resolveEligiblePoliticians(playerPartySigla, coalitionParties),
    [playerPartySigla, coalitionParties]
  );

  const [selectedPol, setSelectedPol] = useState<RealPoliticianPreset | null>(
    () => eligiblePoliticians[0] ?? null
  );

  const handleConfirm = () => {
    if (!selectedPol) return;
    const newMinister = createCabinetMinister(ministry, selectedPol, playerPartySigla);
    onConfirm(newMinister);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#10131b] border border-slate-800 rounded-3xl shadow-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              RELEVO DE CARTERA
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Designar Ministro de {ministry.ministryName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Actual: <span className="text-slate-200 font-semibold">{ministry.ministerName}</span> ({ministry.partySigla}).
              Elegí una figura de tu partido o de tus socios de coalición ({coalitionParties.length > 0 ? coalitionParties.join(', ') : 'Sin socios'}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300">
            Figuras disponibles ({eligiblePoliticians.length})
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
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedPol}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-extrabold text-white transition shadow-lg"
          >
            Confirmar designación
          </button>
        </div>
      </div>
    </div>
  );
}
