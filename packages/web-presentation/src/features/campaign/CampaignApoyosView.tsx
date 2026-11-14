import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { SectionPageHeader } from '@/components/ui/SectionPageHeader';
import { playUiSound } from '@/lib/gameFeedback';
import {
  assessDefection,
  assessEndorsement,
  buildPlayerStanding,
  buildPoliticianProfile,
  createInitialCountryMood,
  rollNegotiation,
  type CampaignSimulationState,
  type NegotiationAssessment,
  type NegotiationRecord
} from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Vista de Apoyos y Figuras Políticas:
// En la política argentina, un llamado a destiempo quema puentes. Si le pedís apoyo a un
// dirigente o lo invitás a saltar de bancada a tu espacio y te rechaza, te clava el visto:
// se come un cooldown de 5 meses sin poder insistirle. Si acepta, suma votos e imagen.

const PARTY_FILTER_BUTTONS = ['LLA', 'PRO', 'UCR', 'UxP', 'PF', 'FIT'] as const;

const PARTY_FILTER_CLASSES: Record<string, { active: string; idle: string }> = {
  LLA: {
    active: 'bg-purple-950 border-purple-500 text-white shadow-md',
    idle: 'bg-[#10131b] border-purple-900/60 text-purple-300 hover:border-purple-600'
  },
  PRO: {
    active: 'bg-amber-950 border-yellow-500 text-white shadow-md',
    idle: 'bg-[#10131b] border-yellow-900/60 text-yellow-300 hover:border-yellow-600'
  },
  UCR: {
    active: 'bg-red-950 border-red-500 text-white shadow-md',
    idle: 'bg-[#10131b] border-red-900/60 text-red-300 hover:border-red-600'
  },
  UxP: {
    active: 'bg-sky-950 border-sky-500 text-white shadow-md',
    idle: 'bg-[#10131b] border-sky-900/60 text-sky-300 hover:border-sky-600'
  },
  PF: {
    active: 'bg-blue-950 border-blue-500 text-white shadow-md',
    idle: 'bg-[#10131b] border-blue-900/60 text-blue-300 hover:border-blue-600'
  },
  FIT: {
    active: 'bg-rose-950 border-rose-600 text-white shadow-md',
    idle: 'bg-[#10131b] border-rose-900/60 text-rose-300 hover:border-rose-600'
  }
};

function resolvePartyFilterClass(sigla: string, isSelected: boolean): string {
  const conf = PARTY_FILTER_CLASSES[sigla];
  if (!conf) return isSelected ? 'bg-white text-slate-950' : 'bg-[#10131b] text-slate-400';
  return isSelected ? conf.active : conf.idle;
}

function getPoliticianRelevance(polId: string): number {
  let hash = 0;
  for (let i = 0; i < polId.length; i++) hash = (hash * 31 + polId.charCodeAt(i)) % 1000;
  return 55 + (hash % 15);
}

function getPoliticianInfluence(polId: string): number {
  let hash = 0;
  for (let i = 0; i < polId.length; i++) hash = (hash * 17 + polId.charCodeAt(i)) % 1000;
  return 60 + (hash % 12);
}

function isPoliticianFuncionario(roleDescription: string): boolean {
  const lower = roleDescription.toLowerCase();
  return (
    lower.includes('gobernador') ||
    lower.includes('intendente') ||
    lower.includes('ministro') ||
    lower.includes('diputado') ||
    lower.includes('senador')
  );
}

function PoliticianToggleSwitch({
  blocked,
  cooldownMonths,
  probSupport
}: {
  blocked: boolean;
  cooldownMonths: number;
  probSupport: number;
}) {
  if (cooldownMonths > 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-400 py-1 font-mono">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Rechazó la propuesta · Disponible en {cooldownMonths} meses</span>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-slate-400 py-1">
        <div className="w-8 h-4 rounded-full bg-slate-800 flex items-center p-0.5 opacity-60">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
        </div>
        <span className="text-slate-400">Es candidato de otra fuerza.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-xs py-1">
      <div className="w-8 h-4 rounded-full bg-slate-600 flex items-center justify-end p-0.5">
        <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
      </div>
      <span className="text-slate-200 font-medium">Probabilidad ≈ {probSupport} %</span>
    </div>
  );
}

function PoliticianActionButtons({
  blocked,
  cooldownMonths,
  endorsementRecord,
  onRequestEndorsement,
  onInviteDefection
}: {
  blocked: boolean;
  cooldownMonths: number;
  endorsementRecord?: NegotiationRecord;
  onRequestEndorsement: () => void;
  onInviteDefection: () => void;
}) {
  const isAccepted = endorsementRecord?.verdict === 'ACEPTO';
  const inCooldown = cooldownMonths > 0;

  if (inCooldown) {
    return (
      <div className="pt-2">
        <button
          type="button"
          disabled
          className="w-full py-2 rounded-sm text-xs font-mono font-semibold bg-[#090d14] border border-amber-900/50 text-amber-400/80 cursor-not-allowed"
        >
          Rechazó la propuesta ({cooldownMonths} meses restantes)
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        disabled={blocked || isAccepted}
        onClick={() => {
          playUiSound('select');
          onRequestEndorsement();
        }}
        className="px-3.5 py-2 rounded-sm text-xs font-mono font-bold bg-[#111824] border border-[#344661] hover:border-[#b89342] text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1.5"
      >
        {isAccepted ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Te apoya
          </>
        ) : (
          'Pedir apoyo'
        )}
      </button>

      <button
        type="button"
        disabled={blocked}
        onClick={() => {
          playUiSound('select');
          onInviteDefection();
        }}
        className="hoi-btn-gold px-3.5 py-2 rounded-sm text-xs font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Invitar a tu partido
      </button>
    </div>
  );
}

function PoliticianCard({
  pol,
  cooldownMonths,
  endorsementEval,
  endorsementRecord,
  onRequestEndorsement,
  onInviteDefection
}: {
  pol: (typeof REAL_POLITICIANS_2027)[number];
  cooldownMonths: number;
  endorsementEval: NegotiationAssessment;
  endorsementRecord?: NegotiationRecord;
  onRequestEndorsement: () => void;
  onInviteDefection: () => void;
}) {
  const isBlocked = Boolean(endorsementEval.blockedReason);
  const relevance = getPoliticianRelevance(pol.id);
  const influence = getPoliticianInfluence(pol.id);
  const isFuncionario = isPoliticianFuncionario(pol.roleDescription);
  const probSupport = endorsementEval.probabilityPct;
  const probDefection = Math.max(5, probSupport - 20);

  const defectionText = isBlocked
    ? 'Que se pase a tu partido: Es candidato de otra fuerza. (20 puntos menos que el apoyo)'
    : `Que se pase a tu partido: ≈ ${probDefection} % (20 puntos menos que el apoyo)`;

  return (
    <div className="hoi-panel rounded-sm p-5 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#162233] border border-[#344661] flex items-center justify-center font-mono font-bold text-xs text-amber-200 shrink-0">
            {pol.partySigla}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white leading-tight">{pol.name}</h3>
            <div className="text-xs text-slate-400 mt-0.5">
              {pol.partySigla} · {pol.partySigla === 'UCR' ? 'Rojo y blanco' : pol.ideology}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
            {pol.styleTrait.toUpperCase()}
          </span>
          {isFuncionario && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
              FUNCIONARIO
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{pol.roleDescription}</p>
        <div className="text-xs text-slate-400 font-mono">
          Relevancia {relevance} · Influencia {influence}
        </div>

        <PoliticianToggleSwitch
          blocked={isBlocked}
          cooldownMonths={cooldownMonths}
          probSupport={probSupport}
        />
      </div>

      <div className="space-y-2 border-t border-slate-800/70 pt-3">
        <PoliticianActionButtons
          blocked={isBlocked}
          cooldownMonths={cooldownMonths}
          endorsementRecord={endorsementRecord}
          onRequestEndorsement={onRequestEndorsement}
          onInviteDefection={onInviteDefection}
        />
        <div className="text-[11px] text-slate-400 leading-normal">{defectionText}</div>
      </div>
    </div>
  );
}

export interface CampaignApoyosViewProps {
  state: CampaignSimulationState;
  onAdvanceMonth?: () => void;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

export function CampaignApoyosView({ state, onUpdateState }: CampaignApoyosViewProps) {
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('UCR');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [endorsementLedger, setEndorsementLedger] = useState<Record<string, NegotiationRecord>>(
    () => state.diplomacy?.endorsements ?? {}
  );
  const [defectionLedger, setDefectionLedger] = useState<Record<string, NegotiationRecord>>(
    () => state.diplomacy?.defections ?? {}
  );

  const player = useMemo(() => buildPlayerStanding(state), [state]);
  const mood = state.countryMood ?? createInitialCountryMood();

  const filteredPoliticians = useMemo(
    () => REAL_POLITICIANS_2027.filter((pol) => pol.partySigla === selectedPartyFilter),
    [selectedPartyFilter]
  );

  const pageSize = 3;
  const maxIndex = Math.max(0, filteredPoliticians.length - pageSize);
  const visiblePoliticians = filteredPoliticians.slice(carouselIndex, carouselIndex + pageSize);

  const acceptedEndorsementsCount =
    Object.values(endorsementLedger).filter((r) => r.verdict === 'ACEPTO').length + 70;

  const handleSelectParty = (sigla: string) => {
    setSelectedPartyFilter(sigla);
    setCarouselIndex(0);
  };

  const handlePrevPage = () => {
    setCarouselIndex((prev) => Math.max(0, prev - pageSize));
  };

  const handleNextPage = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + pageSize));
  };

  const handleRequestEndorsement = (pol: (typeof REAL_POLITICIANS_2027)[number]) => {
    const profile = buildPoliticianProfile(pol);
    const assessment = assessEndorsement(profile, player, mood);
    const accepted = rollNegotiation(assessment, `${pol.id}-end-${state.stage.currentMonthIndex}`);

    setEndorsementLedger((prev) => ({
      ...prev,
      [pol.id]: {
        verdict: accepted ? 'ACEPTO' : 'RECHAZO',
        monthIndex: state.stage.currentMonthIndex,
        probabilityPct: assessment.probabilityPct
      }
    }));

    if (accepted) {
      onUpdateState?.((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          apoyoPartidario: Math.min(100, Math.round((prev.attributes.apoyoPartidario + 1.2) * 10) / 10)
        },
        votingIntention: {
          ...prev.votingIntention,
          intencionVotoGeneral:
            Math.round((prev.votingIntention.intencionVotoGeneral + 0.8) * 10) / 10
        },
        historyLog: [
          `${pol.name} confirmó su respaldo público a tu campaña (+1.2 apoyo partidario, +0.8 votos).`,
          ...prev.historyLog
        ]
      }));
    } else {
      // 5 meses de enfriamiento político si te rechaza la propuesta
      onUpdateState?.((prev) => ({
        ...prev,
        politicianCooldowns: {
          ...(prev.politicianCooldowns ?? {}),
          [pol.id]: 5
        },
        historyLog: [
          `${pol.name} rechazó tu pedido de apoyo (bloqueado por 5 meses para nuevas negociaciones).`,
          ...prev.historyLog
        ]
      }));
    }
  };

  const handleInviteDefection = (pol: (typeof REAL_POLITICIANS_2027)[number]) => {
    const profile = buildPoliticianProfile(pol);
    const assessment = assessDefection(profile, player, mood);
    const accepted = rollNegotiation(assessment, `${pol.id}-def-${state.stage.currentMonthIndex}`);

    setDefectionLedger((prev) => ({
      ...prev,
      [pol.id]: {
        verdict: accepted ? 'ACEPTO' : 'RECHAZO',
        monthIndex: state.stage.currentMonthIndex,
        probabilityPct: assessment.probabilityPct
      }
    }));

    if (accepted) {
      onUpdateState?.((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          apoyoPartidario: Math.min(100, Math.round((prev.attributes.apoyoPartidario + 2.5) * 10) / 10)
        },
        votingIntention: {
          ...prev.votingIntention,
          intencionVotoGeneral:
            Math.round((prev.votingIntention.intencionVotoGeneral + 1.6) * 10) / 10
        },
        historyLog: [
          `¡Pase político del año! ${pol.name} saltó de bancada y se afilió a tu partido (+2.5 apoyo, +1.6 votos).`,
          ...prev.historyLog
        ]
      }));
    } else {
      // 5 meses de enfriamiento político por rechazo de pase partidario
      onUpdateState?.((prev) => ({
        ...prev,
        politicianCooldowns: {
          ...(prev.politicianCooldowns ?? {}),
          [pol.id]: 5
        },
        historyLog: [
          `${pol.name} rechazó pasarse a tu espacio (bloqueado por 5 meses).`,
          ...prev.historyLog
        ]
      }));
    }
  };

  return (
    <div className="space-y-5 rosca-panel-enter">
      <SectionPageHeader
        eyebrow="Político · Red de Dirigentes"
        title="Apoyos"
        description="Cada figura es dialoguista (puede apoyar a cualquiera) o dogmática (solo apoya a ideologías relativamente cercanas). Si el pedido no es posible, el interruptor aparece apagado y se indica el motivo."
        icon={<Users className="w-4 h-4 text-amber-300" />}
        rightSlot={
          <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] text-xs font-mono font-bold text-slate-300">
            Te apoyan <strong className="text-amber-300 text-sm ml-1">{acceptedEndorsementsCount}</strong>
          </div>
        }
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {PARTY_FILTER_BUTTONS.map((sigla) => {
            const isSelected = selectedPartyFilter === sigla;
            const btnClass = resolvePartyFilterClass(sigla, isSelected);
            return (
              <button
                key={sigla}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  handleSelectParty(sigla);
                }}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-mono font-bold transition border ${btnClass}`}
              >
                {sigla}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <button
            type="button"
            disabled={carouselIndex === 0}
            onClick={() => {
              playUiSound('tab');
              handlePrevPage();
            }}
            aria-label="Página anterior"
            className="p-1.5 rounded-sm bg-[#090d14] border border-[#263142] hover:border-[#b89342] disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {carouselIndex + 1}-{Math.min(carouselIndex + pageSize, filteredPoliticians.length)} de{' '}
            {filteredPoliticians.length}
          </span>
          <button
            type="button"
            disabled={carouselIndex >= maxIndex}
            onClick={() => {
              playUiSound('tab');
              handleNextPage();
            }}
            aria-label="Página siguiente"
            className="p-1.5 rounded-sm bg-[#090d14] border border-[#263142] hover:border-[#b89342] disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visiblePoliticians.map((pol) => {
          const profile = buildPoliticianProfile(pol);
          const endorsementEval = assessEndorsement(profile, player, mood);
          const cooldown = state.politicianCooldowns?.[pol.id] ?? 0;

          return (
            <PoliticianCard
              key={pol.id}
              pol={pol}
              cooldownMonths={cooldown}
              endorsementEval={endorsementEval}
              endorsementRecord={endorsementLedger[pol.id]}
              onRequestEndorsement={() => handleRequestEndorsement(pol)}
              onInviteDefection={() => handleInviteDefection(pol)}
            />
          );
        })}
      </div>
    </div>
  );
}
