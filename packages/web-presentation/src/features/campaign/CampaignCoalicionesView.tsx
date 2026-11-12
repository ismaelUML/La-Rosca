import React, { useMemo, useState } from 'react';
import {
  assessCoalition,
  assessDelegateCandidacy,
  buildPlayerStanding,
  buildPoliticianProfile,
  createInitialCountryMood,
  rollNegotiation,
  type CampaignSimulationState,
  type DelegateAssessment
} from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';
import { VicePresidentSelectionModal } from './VicePresidentSelectionModal.js';

// Vista de POLÍTICO -> Candidatura y coaliciones:
// En la rosca criolla las alianzas no son un contrato de amor: son un reparto de ministerios,
// de cargos en el Senado y de lugares en la boleta. Si armás frente con dos partidos (el tope
// legal de la mecánica), sumás músculo electoral pero te hipotecás el gabinete. Y si confirmás
// candidatura propia, ya no podés tirar la toalla ni poner a otro a dar la cara en el debate.

interface CampaignCoalicionesViewProps {
  state: CampaignSimulationState;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

interface CoalitionPartnerConfig {
  sigla: string;
  name: string;
  description: string;
  color: string;
}

const COALITION_CATALOG: CoalitionPartnerConfig[] = [
  {
    sigla: 'LLA',
    name: 'La Libertad Avanza',
    description: 'Votos de derecha y juventud. Exige veto a subas tributarias y control del BCRA.',
    color: '#8b5cf6'
  },
  {
    sigla: 'UCR',
    name: 'Unión Cívica Radical',
    description: 'Estructura territorial en municipios y senadores clave. Exige educación y federalismo.',
    color: '#dc2626'
  },
  {
    sigla: 'PF',
    name: 'Provincias Unidas / Peronismo Federal',
    description: 'Gobernadores de centro interior. Exigen reparto automático de fondos y obra pública.',
    color: '#2563eb'
  },
  {
    sigla: 'UxP',
    name: 'Unión por la Patria',
    description: 'Piso popular del Conurbano y sindicatos. Polarización alta con la centroderecha.',
    color: '#0284c7'
  },
  {
    sigla: 'PRO',
    name: 'Propuesta Republicana (PRO)',
    description: 'Votante urbano de clase media e institucionalistas. Piden equilibrio fiscal y seguridad.',
    color: '#eab308'
  },
  {
    sigla: 'FIT',
    name: 'Frente de Izquierda',
    description: 'Aporte de comisiones internas fabriles. Rechaza frentes burgueses tradicionales.',
    color: '#e11d48'
  }
];

function CoalitionAlertBanner({
  message,
  onDismiss
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) {
    return null;
  }
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-amber-400 hover:text-white px-2 py-0.5 rounded text-sm font-bold"
      >
        ✕
      </button>
    </div>
  );
}

function CoalitionHeaderSummary({
  candidateName,
  coalitionParties,
  currentMonth
}: {
  candidateName: string;
  coalitionParties: string[];
  currentMonth: number;
}) {
  const monthsRemaining = Math.max(0, 10 - currentMonth);
  const coalitionText =
    coalitionParties.length > 0 ? ` · Coalición con ${coalitionParties.join(', ')}` : '';

  return (
    <div className="rounded-2xl bg-[#0f131c] border border-slate-800 p-4 space-y-1">
      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
        Elecciones generales
      </div>
      <div className="text-sm font-extrabold text-white">
        24 de octubre de 2027 · faltan {monthsRemaining} meses
      </div>
      <div className="text-xs text-slate-300">
        Candidatura <span className="font-bold text-white">{candidateName}</span>
        {coalitionText}
      </div>
    </div>
  );
}

function CandidateModeToggle({
  candidateMode,
  onChangeMode
}: {
  candidateMode: 'YO' | 'OTRO';
  onChangeMode: (mode: 'YO' | 'OTRO') => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-[#0b0e15] border border-slate-800">
      <button
        type="button"
        onClick={() => onChangeMode('YO')}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
          candidateMode === 'YO' ? 'bg-white text-slate-950 shadow' : 'text-slate-300'
        }`}
      >
        Me presento yo
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('OTRO')}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
          candidateMode === 'OTRO' ? 'bg-white text-slate-950 shadow' : 'text-slate-300'
        }`}
      >
        Que me represente otra persona
      </button>
    </div>
  );
}

function CandidateLeadText({ name }: { name: string }) {
  return (
    <p className="text-xs text-slate-300 leading-relaxed">
      Vas a ser la cara visible de la boleta presidencial como <strong>{name}</strong>. Tus
      atributos de inteligencia percibida, relevancia e imagen impactan directo en debates y actos.
    </p>
  );
}

function DelegateSelector({
  candidates,
  selectedId,
  onSelect
}: {
  candidates: (typeof REAL_POLITICIANS_2027)[number][];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="delegate-picker" className="text-xs font-bold text-slate-300 block">
        Dirigente de tu espacio
      </label>
      <select
        id="delegate-picker"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-[#0b0e15] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
      >
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.roleDescription}
          </option>
        ))}
      </select>
    </div>
  );
}

function DelegateAssessmentPill({ assessment }: { assessment: DelegateAssessment | null }) {
  if (!assessment) {
    return null;
  }
  const color = assessment.eligible
    ? 'text-emerald-400 font-semibold'
    : 'text-rose-400 font-semibold';
  return (
    <div className="p-3 rounded-xl bg-[#0d1017] border border-slate-800 flex items-center justify-between text-xs">
      <span className={color}>{assessment.verdictText}</span>
      <span className="font-mono text-slate-400">
        Riesgo corte propio: {assessment.betrayalRiskPct} %
      </span>
    </div>
  );
}

function resolveDelegateData(
  dirigentes: (typeof REAL_POLITICIANS_2027)[number][],
  selectedId: string,
  role: CampaignSimulationState['targetRole']
) {
  const obj = dirigentes.find((d) => d.id === selectedId) ?? dirigentes[0];
  if (!obj) {
    return { profile: null, assessment: null };
  }
  const profile = buildPoliticianProfile(obj);
  const assessment = assessDelegateCandidacy(profile, role);
  return { profile, assessment };
}

interface CandidaturaSectionProps {
  state: CampaignSimulationState;
  onConfirm: (candidateId: string, candidateName: string) => void;
}

function CandidaturaSection({ state, onConfirm }: CandidaturaSectionProps) {
  const [candidateMode, setCandidateMode] = useState<'YO' | 'OTRO'>('YO');
  const ownPartyDirigentes = useMemo(
    () => REAL_POLITICIANS_2027.filter((p) => p.partySigla === state.partySigla),
    [state.partySigla]
  );
  const defaultId = ownPartyDirigentes[0]?.id ?? state.candidateId;
  const [selectedDelegateId, setSelectedDelegateId] = useState(defaultId);

  const { assessment } = useMemo(
    () => resolveDelegateData(ownPartyDirigentes, selectedDelegateId, state.targetRole),
    [ownPartyDirigentes, selectedDelegateId, state.targetRole]
  );

  const canConfirm = candidateMode === 'YO' ? true : Boolean(assessment?.eligible);

  if (state.isCandidacyConfirmed) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> 1 · Candidatura
          </h2>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
            Definida
          </span>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-2">
          <div className="text-xs text-slate-400">Candidato definido:</div>
          <div className="text-base font-extrabold text-white flex items-center gap-2">
            <span>{state.candidateName}</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({state.partySigla})
            </span>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            La fórmula ya fue oficializada y ratificada por las bases partidarias. Quedó firme para
            la elección general.
          </p>
        </div>
      </section>
    );
  }

  const handleConfirmClick = () => {
    if (candidateMode === 'YO') {
      onConfirm(state.candidateId, state.candidateName);
      return;
    }
    const delObj = ownPartyDirigentes.find((d) => d.id === selectedDelegateId);
    onConfirm(selectedDelegateId, delObj?.name ?? 'Delegado');
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> 1 · Candidatura
        </h2>
        <span className="text-xs text-slate-400">Elegí quién encabeza la lista</span>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <CandidateModeToggle candidateMode={candidateMode} onChangeMode={setCandidateMode} />

        {candidateMode === 'YO' ? (
          <CandidateLeadText name={state.candidateName} />
        ) : (
          <div className="space-y-4 pt-1">
            <DelegateSelector
              candidates={ownPartyDirigentes}
              selectedId={selectedDelegateId}
              onSelect={setSelectedDelegateId}
            />
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/70 text-xs text-amber-200/90 leading-relaxed">
              Si tu delegado gana las generales, la partida termina con tu legado como conductor
              del espacio. Requiere suficiente peso nacional.
            </div>
            <DelegateAssessmentPill assessment={assessment} />
          </div>
        )}

        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirmClick}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed shadow transition"
        >
          Confirmar candidatura
        </button>
      </div>
    </section>
  );
}

interface VicepresidenciaSectionProps {
  runningMateId?: string | null;
  onOpenModal: () => void;
}

function VicepresidenciaSection({ runningMateId, onOpenModal }: VicepresidenciaSectionProps) {
  const viceObj = REAL_POLITICIANS_2027.find((p) => p.id === runningMateId);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> 2 · Vicepresidencia de la fórmula
        </h2>
        <span className="text-xs text-slate-400">Compañero de binomio</span>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {viceObj ? (
          <div>
            <div className="text-xs text-slate-400">Vicepresidente proclamado:</div>
            <div className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
              <span>{viceObj.name}</span>
              <span className="text-xs font-mono text-slate-400">({viceObj.partySigla})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{viceObj.roleDescription}</p>
          </div>
        ) : (
          <div className="text-xs text-slate-400 leading-relaxed">
            Fórmula incompleta: todavía no elegiste quién te acompaña como vice. Podés seleccionar
            un referente de tu espacio o de los partidos socios de la coalición.
          </div>
        )}

        <button
          type="button"
          onClick={onOpenModal}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 transition shadow shrink-0"
        >
          {viceObj ? 'Cambiar vicepresidente' : 'Elegir a tu vicepresidente'}
        </button>
      </div>
    </section>
  );
}

function CoalitionPartnerActionSlot({
  isInCoalition,
  isRejected,
  isMaxReached,
  onPropose,
  onBreak
}: {
  isInCoalition: boolean;
  isRejected: boolean;
  isMaxReached: boolean;
  onPropose: () => void;
  onBreak: () => void;
}) {
  if (isInCoalition) {
    return (
      <div className="space-y-2">
        <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 py-1.5 rounded-xl">
          ✓ EN TU COALICIÓN
        </div>
        <button
          type="button"
          onClick={onBreak}
          className="w-full py-2 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 transition"
        >
          Desarmar la coalición
        </button>
        <div className="text-[10px] text-slate-400 leading-tight">
          Romper cuesta -3,4 puntos de imagen y parte de tu intención de voto.
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2 rounded-xl text-xs font-semibold bg-[#121622] border border-rose-900/50 text-rose-400/80 cursor-not-allowed uppercase tracking-wide"
      >
        Rechazó la alianza
      </button>
    );
  }

  if (isMaxReached) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2 rounded-xl text-xs font-medium bg-[#121622] border border-slate-800 text-slate-500 cursor-not-allowed"
      >
        Máximo 2 socios alcanzado
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPropose}
      className="w-full py-2 rounded-xl text-xs font-bold bg-[#161a26] hover:bg-[#1e2333] text-slate-200 border border-slate-700 transition"
    >
      Proponer alianza
    </button>
  );
}

interface CoalitionCardProps {
  partner: CoalitionPartnerConfig;
  affinityPct: number;
  isInCoalition: boolean;
  isRejected: boolean;
  isMaxReached: boolean;
  onPropose: () => void;
  onBreak: () => void;
}

function CoalitionCard({
  partner,
  affinityPct,
  isInCoalition,
  isRejected,
  isMaxReached,
  onPropose,
  onBreak
}: CoalitionCardProps) {
  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white text-sm">{partner.name}</span>
          <span className="text-xs font-mono font-bold text-sky-400">
            {affinityPct} % afinidad
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Afinidad ideológica {affinityPct} % · aporta parte de su fuerza pero ese partido deja de
          competir en la elección, designa varios ministros si ganás y sus legisladores te responden
          menos. Máximo 2 socios.
        </p>
      </div>

      <CoalitionPartnerActionSlot
        isInCoalition={isInCoalition}
        isRejected={isRejected}
        isMaxReached={isMaxReached}
        onPropose={onPropose}
        onBreak={onBreak}
      />
    </div>
  );
}

export function CampaignCoalicionesView({ state, onUpdateState }: CampaignCoalicionesViewProps) {
  const player = useMemo(() => buildPlayerStanding(state), [state]);
  const mood = state.countryMood ?? createInitialCountryMood();

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isViceModalOpen, setIsViceModalOpen] = useState(false);
  const coalitionParties = state.coalitionParties ?? [];
  const rejectedAlliances = state.rejectedAlliances ?? [];

  const activeRejectedMessage = useMemo(() => {
    const unread = rejectedAlliances.find((sigla) => !dismissedAlerts.includes(sigla));
    return unread ? `${unread} rechazó la alianza.` : null;
  }, [rejectedAlliances, dismissedAlerts]);

  const availablePartners = useMemo(
    () => COALITION_CATALOG.filter((p) => p.sigla !== state.partySigla),
    [state.partySigla]
  );

  const handleConfirmVice = (candidateId: string, candidateName: string) => {
    onUpdateState?.((prev) => ({
      ...prev,
      runningMateId: candidateId,
      attributes: {
        ...prev.attributes,
        apoyoPartidario: Math.min(100, Math.round((prev.attributes.apoyoPartidario + 3.0) * 10) / 10)
      },
      votingIntention: {
        ...prev.votingIntention,
        intencionVotoGeneral:
          Math.round((prev.votingIntention.intencionVotoGeneral + 1.8) * 10) / 10
      },
      historyLog: [
        `Binomio presidencial completado: ${prev.candidateName} - ${candidateName} (+3 apoyo partidario, +1.8 votos).`,
        ...prev.historyLog
      ]
    }));
  };

  const handleConfirmCandidacy = (candidateId: string, candidateName: string) => {
    onUpdateState?.((prev) => ({
      ...prev,
      candidateId,
      candidateName,
      isCandidacyConfirmed: true,
      attributes: {
        ...prev.attributes,
        apoyoPartidario: Math.min(100, Math.round((prev.attributes.apoyoPartidario + 5.0) * 10) / 10)
      },
      votingIntention: {
        ...prev.votingIntention,
        intencionVotoGeneral:
          Math.round((prev.votingIntention.intencionVotoGeneral + 1.5) * 10) / 10
      },
      historyLog: [
        `Candidatura presidencial confirmada oficialmente con ${candidateName} a la cabeza (+5 apoyo partidario, +1.5 intención de voto).`,
        ...prev.historyLog
      ]
    }));
  };

  const handleProposeCoalition = (partnerSigla: string) => {
    const assessment = assessCoalition(partnerSigla, player, mood);
    const accepted = rollNegotiation(
      assessment,
      `${partnerSigla}-coa-${state.stage.currentMonthIndex}`
    );
    if (accepted) {
      onUpdateState?.((prev) => ({
        ...prev,
        coalitionParties: [...(prev.coalitionParties ?? []), partnerSigla],
        votingIntention: {
          ...prev.votingIntention,
          intencionVotoGeneral:
            Math.round((prev.votingIntention.intencionVotoGeneral + 3.2) * 10) / 10
        },
        historyLog: [
          `Se selló la coalición electoral con ${partnerSigla} (+3.2% intención de voto).`,
          ...prev.historyLog
        ]
      }));
    } else {
      onUpdateState?.((prev) => ({
        ...prev,
        rejectedAlliances: [...(prev.rejectedAlliances ?? []), partnerSigla],
        historyLog: [`${partnerSigla} rechazó la alianza electoral este mes.`, ...prev.historyLog]
      }));
    }
  };

  const handleBreakCoalition = (partnerSigla: string) => {
    onUpdateState?.((prev) => ({
      ...prev,
      coalitionParties: (prev.coalitionParties ?? []).filter((s) => s !== partnerSigla),
      image: {
        ...prev.image,
        imagenPositiva: Math.max(5, Math.round((prev.image.imagenPositiva - 3.4) * 10) / 10),
        desconocimiento: Math.min(88, Math.round((prev.image.desconocimiento + 3.4) * 10) / 10)
      },
      votingIntention: {
        ...prev.votingIntention,
        intencionVotoGeneral: Math.max(
          2,
          Math.round((prev.votingIntention.intencionVotoGeneral - 1.2) * 10) / 10
        )
      },
      historyLog: [
        `Se rompió la coalición con ${partnerSigla} (-3.4 imagen positiva, -1.2 votos).`,
        ...prev.historyLog
      ]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
          POLÍTICO
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
          Candidatura y coaliciones
        </h1>
      </div>

      <CoalitionAlertBanner
        message={activeRejectedMessage}
        onDismiss={() => {
          if (activeRejectedMessage) {
            const sigla = activeRejectedMessage.split(' ')[0] ?? '';
            setDismissedAlerts((prev) => [...prev, sigla]);
          }
        }}
      />

      <CoalitionHeaderSummary
        candidateName={state.candidateName}
        coalitionParties={coalitionParties}
        currentMonth={state.stage.currentMonthIndex}
      />

      <CandidaturaSection state={state} onConfirm={handleConfirmCandidacy} />

      <VicepresidenciaSection
        runningMateId={state.runningMateId}
        onOpenModal={() => setIsViceModalOpen(true)}
      />

      <VicePresidentSelectionModal
        isOpen={isViceModalOpen}
        state={state}
        onClose={() => setIsViceModalOpen(false)}
        onConfirmVice={handleConfirmVice}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> 3 · Coaliciones
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
            Alianzas solo para esta elección
          </span>
        </div>

        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            La fórmula la encabeza el partido que más votos aporta. Si tu espacio es el más votado
            de la coalición, vas primero y tus socios ponen el vice y una parte del gabinete. Si un
            socio aporta más votos, su principal dirigente encabeza y vos vas como vice; si ganan,
            sos vicepresidente, seguís manejando tu partido, designás un cupo menor del gabinete y
            podés sugerirle medidas al presidente (las acepta según su afinidad con cada idea).
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Las fuerzas opositoras con más de 75 % de afinidad pueden aliarse entre sí: pasa en un
            10 % de las elecciones, 15 % si vos armás coalición y 12-13 % si les sacás mucha ventaja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {availablePartners.map((partner) => {
            const assessment = assessCoalition(partner.sigla, player, mood);
            const isIn = coalitionParties.includes(partner.sigla);
            const isRej = rejectedAlliances.includes(partner.sigla);
            const isMax = coalitionParties.length >= 2;

            return (
              <CoalitionCard
                key={partner.sigla}
                partner={partner}
                affinityPct={assessment.probabilityPct}
                isInCoalition={isIn}
                isRejected={isRej}
                isMaxReached={isMax}
                onPropose={() => handleProposeCoalition(partner.sigla)}
                onBreak={() => handleBreakCoalition(partner.sigla)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
