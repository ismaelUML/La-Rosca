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
import { OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';
import { VicePresidentSelectionModal } from './VicePresidentSelectionModal.js';

// Vista de POLITICO -> Candidatura y coaliciones en estetica tactica acero/bronce:
// Oficializacion de candidatura, designacion de companero de formula y armado de alianzas electorales.

interface CampaignCoalicionesViewProps {
  state: CampaignSimulationState;
  onUpdateState?: (updater: (prev: CampaignSimulationState) => CampaignSimulationState) => void;
}

interface CoalitionPartnerLeader {
  name: string;
  role: string;
}

interface CoalitionPartnerConfig {
  sigla: string;
  name: string;
  description: string;
  color: string;
  leaders: CoalitionPartnerLeader[];
  voteContributionPct: number;
}

const COALITION_CATALOG: CoalitionPartnerConfig[] = [
  {
    sigla: 'LLA',
    name: 'La Libertad Avanza',
    description: 'Votos de derecha y juventud. Exige veto a subas tributarias y control del BCRA.',
    color: '#8b5cf6',
    leaders: [
      { name: 'Javier Milei', role: 'Líder liberal libertario' },
      { name: 'Patricia Bullrich', role: 'Referente de Seguridad y orden' },
      { name: 'Victoria Villarruel', role: 'Vicepresidenta de la Nación' }
    ],
    voteContributionPct: 6.8
  },
  {
    sigla: 'UCR',
    name: 'Unión Cívica Radical',
    description: 'Estructura territorial en municipios y senadores clave. Exige educación y federalismo.',
    color: '#dc2626',
    leaders: [
      { name: 'Rodrigo de Loredo', role: 'Presidente bloque UCR Diputados' },
      { name: 'Martín Lousteau', role: 'Presidente Comité Nacional UCR' },
      { name: 'Maximiliano Pullaro', role: 'Gobernador de Santa Fe' }
    ],
    voteContributionPct: 3.8
  },
  {
    sigla: 'PF',
    name: 'Provincias Unidas / Encuentro Federal',
    description: 'Gobernadores de centro interior. Exigen reparto automático de fondos y obra pública.',
    color: '#2563eb',
    leaders: [
      { name: 'Juan Schiaretti', role: 'Exgobernador de Córdoba' },
      { name: 'Florencio Randazzo', role: 'Diputado peronismo federal' },
      { name: 'Martín Llaryora', role: 'Gobernador de Córdoba' }
    ],
    voteContributionPct: 3.5
  },
  {
    sigla: 'UxP',
    name: 'Fuerza Patria / Unión por la Patria (PJ)',
    description: 'Piso popular del Conurbano y sindicatos. Polarización alta con la centroderecha.',
    color: '#0284c7',
    leaders: [
      { name: 'Axel Kicillof', role: 'Gobernador de Buenos Aires' },
      { name: 'Sergio Massa', role: 'Líder Frente Renovador' },
      { name: 'Eduardo "Wado" de Pedro', role: 'Senador nacional' }
    ],
    voteContributionPct: 6.5
  },
  {
    sigla: 'PRO',
    name: 'PRO - Propuesta Republicana',
    description: 'Votante urbano de clase media e institucionalistas. Piden equilibrio fiscal y seguridad.',
    color: '#eab308',
    leaders: [
      { name: 'Mauricio Macri', role: 'Fundador y líder del PRO' },
      { name: 'Cristian Ritondo', role: 'Jefe bloque PRO Diputados' },
      { name: 'Diego Santilli', role: 'Diputado nacional bonaerense' }
    ],
    voteContributionPct: 4.2
  },
  {
    sigla: 'FIT',
    name: 'Frente de Izquierda y de Trabajadores - Unidad',
    description: 'Aporte de comisiones internas fabriles. Rechaza frentes burgueses tradicionales.',
    color: '#e11d48',
    leaders: [
      { name: 'Myriam Bregman', role: 'Referente nacional PTS/FIT' },
      { name: 'Nicolás del Caño', role: 'Diputado nacional de izquierda' },
      { name: 'Romina del Plá', role: 'Dirigente Partido Obrero' }
    ],
    voteContributionPct: 1.5
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
    <div className="flex items-center justify-between p-3.5 rounded-sm bg-amber-950/40 border border-[#8a6d33] text-amber-200 text-xs font-mono">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-amber-300 hover:text-white px-2 py-0.5 rounded-sm text-xs font-bold"
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
    coalitionParties.length > 0 ? ` · Coalición activa con ${coalitionParties.join(', ')}` : ' · Sin socios externos';

  return (
    <div className="hoi-panel rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400">
          CRONOGRAMA ELECTORAL CNE
        </div>
        <div className="text-sm font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
          Elección General: 24 de octubre de 2027 · faltan {monthsRemaining} meses
        </div>
      </div>
      <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] text-xs font-mono text-slate-300">
        Fórmula: <strong className="text-amber-200">{candidateName}</strong>
        <span className="text-sky-300">{coalitionText}</span>
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
    <div className="inline-flex p-1 rounded-sm bg-[#090d14] border border-[#263142]">
      <button
        type="button"
        onClick={() => onChangeMode('YO')}
        className={`px-4 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
          candidateMode === 'YO' ? 'bg-[#b89342] text-[#090d14] shadow' : 'text-slate-300 hover:bg-[#151e2c]'
        }`}
      >
        Encabezo yo la boleta
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('OTRO')}
        className={`px-4 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
          candidateMode === 'OTRO' ? 'bg-[#b89342] text-[#090d14] shadow' : 'text-slate-300 hover:bg-[#151e2c]'
        }`}
      >
        Designar delegado partidario
      </button>
    </div>
  );
}

function CandidateLeadText({ name }: { name: string }) {
  return (
    <p className="text-xs text-slate-300 leading-relaxed">
      Vas a encabezar personalmente la boleta como <strong className="text-amber-100">{name}</strong>. Tus atributos de inteligencia percibida, relevancia e imagen impactan de lleno en debates, recorridas y spots.
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
    <div className="space-y-1.5">
      <label htmlFor="delegate-picker" className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
        Seleccionar dirigente de tu espacio
      </label>
      <select
        id="delegate-picker"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-[#090d14] border border-[#263142] rounded-sm px-3.5 py-2 text-xs font-mono text-amber-100 focus:outline-none focus:border-[#8a6d33]"
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
    ? 'text-emerald-400 font-bold'
    : 'text-rose-400 font-bold';
  return (
    <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142] flex items-center justify-between text-xs font-mono">
      <span className={color}>{assessment.verdictText}</span>
      <span className="text-slate-400">
        Riesgo corte propio: <strong className="text-amber-300">{assessment.betrayalRiskPct}%</strong>
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
      <section className="hoi-panel rounded-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#263142] pb-2.5">
          <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-100">
            1 · Candidatura Oficializada
          </h2>
          <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-600/60 px-2.5 py-0.5 rounded-sm uppercase">
            ✓ Ratificada
          </span>
        </div>
        <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Candidato proclamado:</div>
          <div className="text-base font-serif font-bold text-amber-100 flex items-center gap-2">
            <span>{state.candidateName}</span>
            <span className="text-xs font-mono font-normal text-sky-300">
              ({state.partySigla})
            </span>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            La candidatura ya fue oficializada ante la junta electoral partidaria y quedó firme para los comicios.
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
    <section className="hoi-panel rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#263142] pb-2.5">
        <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-100">
          1 · Definición de Candidatura
        </h2>
        <span className="text-[11px] font-mono text-slate-400">Elegí quién encabeza la boleta</span>
      </div>

      <CandidateModeToggle candidateMode={candidateMode} onChangeMode={setCandidateMode} />

      {candidateMode === 'YO' ? (
        <CandidateLeadText name={state.candidateName} />
      ) : (
        <div className="space-y-3.5 pt-1">
          <DelegateSelector
            candidates={ownPartyDirigentes}
            selectedId={selectedDelegateId}
            onSelect={setSelectedDelegateId}
          />
          <div className="p-3 rounded-sm bg-amber-950/30 border border-[#8a6d33]/70 text-xs font-mono text-amber-200/90 leading-relaxed">
            Si tu delegado gana las generales, conducís el espacio desde las sombras pero con riesgo de rebelión de palacio.
          </div>
          <DelegateAssessmentPill assessment={assessment} />
        </div>
      )}

      <div>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirmClick}
          className="hoi-btn-gold px-5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow transition"
        >
          Confirmar Candidatura Oficial
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
    <section className="hoi-panel rounded-sm p-5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-[#263142] pb-2.5">
        <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-100">
          2 · Vicepresidencia de la Fórmula
        </h2>
        <span className="text-[11px] font-mono text-slate-400">Compañero de binomio y Presidencia del Senado</span>
      </div>

      <div className="p-4 rounded-sm bg-[#090d14] border border-[#263142] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {viceObj ? (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              Vicepresidente proclamado:
            </div>
            <div className="text-base font-serif font-bold text-amber-100 flex items-center gap-2 mt-0.5">
              <span>{viceObj.name}</span>
              <span className="text-xs font-mono text-sky-300">({viceObj.partySigla})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{viceObj.roleDescription}</p>
          </div>
        ) : (
          <div className="text-xs text-slate-300 leading-relaxed">
            Fórmula incompleta: todavía no designaste quién te acompaña como vice. Podés elegir un referente propio o de tus socios de coalición.
          </div>
        )}

        <button
          type="button"
          onClick={onOpenModal}
          className="hoi-btn-gold px-5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition shadow shrink-0"
        >
          {viceObj ? 'Cambiar Vicepresidente' : 'Designar Vicepresidente'}
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
      <div className="space-y-2 pt-2 border-t border-[#263142]">
        <div className="text-center text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-600/60 py-1.5 rounded-sm uppercase">
          ✓ SOCIO EN TU COALICIÓN
        </div>
        <button
          type="button"
          onClick={onBreak}
          className="w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-200 transition"
        >
          Romper Alianza (-3,4 Imagen)
        </button>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="pt-2 border-t border-[#263142]">
        <button
          type="button"
          disabled
          className="w-full py-2 rounded-sm text-xs font-mono font-bold bg-[#090d14] border border-rose-900/50 text-rose-400/80 cursor-not-allowed uppercase tracking-wider"
        >
          ✕ Rechazó la Alianza
        </button>
      </div>
    );
  }

  if (isMaxReached) {
    return (
      <div className="pt-2 border-t border-[#263142]">
        <button
          type="button"
          disabled
          className="w-full py-2 rounded-sm text-xs font-mono font-bold bg-[#090d14] border border-[#263142] text-slate-500 cursor-not-allowed uppercase tracking-wider"
        >
          Cupo máximo (2 socios)
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-[#263142]">
      <button
        type="button"
        onClick={onPropose}
        className="hoi-btn-gold w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition shadow"
      >
        Proponer Alianza Electoral
      </button>
    </div>
  );
}

function CoalitionLeadersList({ leaders }: { leaders: CoalitionPartnerLeader[] }) {
  return (
    <div className="p-2.5 rounded-sm bg-[#090d14] border border-[#1e293b] space-y-1.5 my-2.5">
      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
        Principales referentes:
      </div>
      <div className="space-y-1">
        {leaders.map((lead) => (
          <div key={lead.name} className="flex items-center justify-between text-xs gap-2">
            <span className="text-slate-100 font-semibold truncate">{lead.name}</span>
            <span className="text-[10px] font-mono text-slate-400 truncate">{lead.role}</span>
          </div>
        ))}
      </div>
    </div>
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
    <div
      className={`hoi-panel rounded-sm p-4 flex flex-col justify-between space-y-3 transition ${
        isInCoalition ? 'border-emerald-500/60 bg-[#0d1917]' : 'border-[#263142] hover:border-[#8a6d33]'
      }`}
    >
      <div>
        <div className="flex justify-between items-center border-b border-[#1e293b] pb-2 mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <OfficialPartyLogo partyIdOrSigla={partner.sigla} sizePx={28} fallbackColor={partner.color} />
            <span className="font-serif font-bold text-amber-100 text-sm uppercase tracking-wide truncate">
              {partner.name}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-sm bg-[#090d14] border border-[#263142] text-[10px] font-mono font-bold text-sky-300 shrink-0">
            {affinityPct}% afinidad
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {partner.description}
        </p>

        <CoalitionLeadersList leaders={partner.leaders} />

        <div className="flex items-center justify-between text-xs text-emerald-400 font-mono pt-1">
          <span>Aporte electoral estimado:</span>
          <strong>+{partner.voteContributionPct.toFixed(1).replace('.', ',')}% votos</strong>
        </div>
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
    return unread ? `${unread} rechazó la propuesta de alianza electoral.` : null;
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
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            POLÍTICO · INGENIERÍA DE FRENTES Y FÓRMULA
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
            Candidatura y coaliciones
          </h1>
        </div>
        <div className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#8a6d33]/80 text-xs font-mono text-amber-200">
          Socios activos: <strong>{coalitionParties.length} / 2</strong>
        </div>
      </header>

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

      <section className="space-y-4">
        <div className="hoi-panel rounded-sm p-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263142] pb-2.5">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-100">
              3 · Mesa de Coaliciones Interpartidarias
            </h2>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-[#090d14] border border-[#8a6d33]/60 px-2.5 py-0.5 rounded-sm uppercase">
              Tope legal: 2 fuerzas aliadas
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            La fórmula la encabeza el partido que más votos aporta. Sumar socios amplía el piso electoral hacia octubre, pero compromete ministerios clave y bancas en las listas nacionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
