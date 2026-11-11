import React, { useMemo, useState } from 'react';
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

// Vista de ESTRATEGIA -> Apoyos:
// Cada figura evalúa el momento del país, la distancia ideológica y tu caudal de votos
// antes de darte aval o cruzarse de vereda. Nada de switches automáticos: hay rosca real.

interface CampaignApoyosViewProps {
  state: CampaignSimulationState;
  onAdvanceMonth?: () => void;
}

const PARTY_FILTER_BUTTONS = ['PRO', 'LLA', 'UCR', 'UxP', 'PF', 'FIT'];

function AssessmentPill({ assessment }: { assessment: NegotiationAssessment }) {
  if (assessment.blockedReason) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/60">
        Bloqueado
      </span>
    );
  }
  const color = assessment.probabilityPct >= 60 ? 'text-emerald-400' : assessment.probabilityPct >= 35 ? 'text-amber-400' : 'text-rose-400';
  return (
    <span className={`text-[11px] font-mono font-bold ${color}`}>
      {assessment.probabilityPct} % prob.
    </span>
  );
}

function EndorsementActionSlot({
  record,
  assessment,
  onRequest
}: {
  record?: NegotiationRecord;
  assessment: NegotiationAssessment;
  onRequest: () => void;
}) {
  if (record?.verdict === 'ACEPTO') {
    return (
      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
        ✓ Apoyo sellado
      </span>
    );
  }
  if (record?.verdict === 'RECHAZO') {
    return (
      <span className="text-xs font-semibold text-rose-400">
        ✗ Rechazó este mes
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={Boolean(assessment.blockedReason)}
      onClick={onRequest}
      className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      Pedir apoyo
    </button>
  );
}

function DefectionActionSlot({
  record,
  assessment,
  isOwnParty,
  onInvite
}: {
  record?: NegotiationRecord;
  assessment: NegotiationAssessment;
  isOwnParty: boolean;
  onInvite: () => void;
}) {
  if (isOwnParty) {
    return (
      <div className="w-full py-1 text-center text-[11px] text-slate-500 bg-slate-900/60 rounded-lg">
        Es de tu propio partido
      </div>
    );
  }
  if (record?.verdict === 'ACEPTO') {
    return (
      <div className="w-full py-1 text-center text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 rounded-lg">
        ✓ Se incorporó a tu partido
      </div>
    );
  }
  if (record?.verdict === 'RECHAZO') {
    return (
      <div className="w-full py-1 text-center text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg">
        ✗ Rechazó el pase de partido
      </div>
    );
  }
  return (
    <button
      type="button"
      disabled={Boolean(assessment.blockedReason)}
      onClick={onInvite}
      className="w-full py-1.5 rounded-xl text-xs font-semibold bg-[#181d2c] hover:bg-[#20273a] text-sky-300 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      Invitar a pasarse a tus filas ({assessment.probabilityPct} %)
    </button>
  );
}

interface PoliticianCardProps {
  pol: (typeof REAL_POLITICIANS_2027)[number];
  endorsementEval: NegotiationAssessment;
  defectionEval: NegotiationAssessment;
  endorsementRecord?: NegotiationRecord;
  defectionRecord?: NegotiationRecord;
  isOwnParty: boolean;
  onRequestEndorsement: () => void;
  onInviteDefection: () => void;
}

function PoliticianCard({
  pol,
  endorsementEval,
  defectionEval,
  endorsementRecord,
  defectionRecord,
  isOwnParty,
  onRequestEndorsement,
  onInviteDefection
}: PoliticianCardProps) {
  const topFactor = endorsementEval.factors[0]?.label;

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              {pol.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">{pol.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {pol.partySigla} · {pol.ideology}
              </div>
            </div>
          </div>
          <AssessmentPill assessment={endorsementEval} />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
            {pol.styleTrait.toUpperCase()}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/70 border border-purple-800/60 text-purple-300">
            {pol.difficulty}
          </span>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2">{pol.roleDescription}</p>

        {endorsementEval.blockedReason ? (
          <div className="text-[11px] text-rose-300 mt-2 bg-rose-950/30 p-2 rounded-lg border border-rose-900/60">
            {endorsementEval.blockedReason}
          </div>
        ) : topFactor ? (
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Factor clave: <span className="text-slate-300">{topFactor}</span>
          </div>
        ) : null}
      </div>

      <div className="pt-2 border-t border-slate-800/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Aval electoral</span>
          <EndorsementActionSlot
            record={endorsementRecord}
            assessment={endorsementEval}
            onRequest={onRequestEndorsement}
          />
        </div>

        <DefectionActionSlot
          record={defectionRecord}
          assessment={defectionEval}
          isOwnParty={isOwnParty}
          onInvite={onInviteDefection}
        />
      </div>
    </div>
  );
}

export function CampaignApoyosView({ state }: CampaignApoyosViewProps) {
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('LLA');
  const [endorsementLedger, setEndorsementLedger] = useState<Record<string, NegotiationRecord>>(() => state.diplomacy?.endorsements ?? {});
  const [defectionLedger, setDefectionLedger] = useState<Record<string, NegotiationRecord>>(() => state.diplomacy?.defections ?? {});

  const player = useMemo(() => buildPlayerStanding(state), [state]);
  const mood = state.countryMood ?? createInitialCountryMood();

  const filteredPoliticians = useMemo(
    () => REAL_POLITICIANS_2027.filter((pol) => pol.partySigla === selectedPartyFilter),
    [selectedPartyFilter]
  );

  const acceptedEndorsementsCount = Object.values(endorsementLedger).filter(
    (r) => r.verdict === 'ACEPTO'
  ).length;

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
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            ESTRATEGIA
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Apoyos</h1>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Avales confirmados: <strong className="text-emerald-400">{acceptedEndorsementsCount}</strong> dirigentes
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#0f1420] border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span>
          Momento nacional: <strong className="text-sky-400">{mood.phaseLabel}</strong>
        </span>
        <span className="font-mono text-slate-400">
          Aprobación Rosada: {mood.governmentApprovalPct} % · Inflación: {mood.inflationMonthlyPct} %
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
        Cada figura tiene ideología, lealtad y ambición propia. Los <strong>dialoguistas</strong> negocian con cualquiera si les conviene; los <strong>dogmáticos</strong> jamás avalan a fuerzas lejanas. El humor social y tu caudal de votos mueven la probabilidad cada mes.
      </p>

      <div className="flex flex-wrap gap-2">
        {PARTY_FILTER_BUTTONS.map((sigla) => (
          <button
            key={sigla}
            type="button"
            onClick={() => setSelectedPartyFilter(sigla)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              selectedPartyFilter === sigla
                ? 'bg-white text-slate-950 border-white shadow'
                : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {sigla}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {filteredPoliticians.map((pol) => {
          const profile = buildPoliticianProfile(pol);
          const endorsementEval = assessEndorsement(profile, player, mood);
          const defectionEval = assessDefection(profile, player, mood);
          return (
            <PoliticianCard
              key={pol.id}
              pol={pol}
              endorsementEval={endorsementEval}
              defectionEval={defectionEval}
              endorsementRecord={endorsementLedger[pol.id]}
              defectionRecord={defectionLedger[pol.id]}
              isOwnParty={pol.partySigla === state.partySigla}
              onRequestEndorsement={() => handleRequestEndorsement(pol)}
              onInviteDefection={() => handleInviteDefection(pol)}
            />
          );
        })}
      </div>
    </div>
  );
}
