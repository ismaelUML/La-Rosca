import React, { useMemo, useState } from 'react';
import {
  assessCoalition,
  assessDelegateCandidacy,
  buildPlayerStanding,
  buildPoliticianProfile,
  createInitialCountryMood,
  rollNegotiation,
  type CampaignSimulationState,
  type DelegateAssessment,
  type NegotiationAssessment,
  type NegotiationRecord
} from '@argentina-sim/domain';
import { REAL_POLITICIANS_2027 } from '@argentina-sim/infrastructure';

// Vista de POLÍTICO -> Candidatura y coaliciones:
// Selección entre postulación personal o designación de un delfín partidario (con riesgo de traición
// y requisito de estatura nacional), más acuerdos electorales calculados contra el contexto del país.

interface CampaignCoalicionesViewProps {
  state: CampaignSimulationState;
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

interface DelegateSelectorProps {
  candidates: (typeof REAL_POLITICIANS_2027)[number][];
  selectedId: string;
  onSelect: (id: string) => void;
}

function DelegateSelector({ candidates, selectedId, onSelect }: DelegateSelectorProps) {
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
      Vas a ser la cara de la lista presidencial como <strong>{name}</strong>. Tus atributos personales impactan directo en debates y entrevistas.
    </p>
  );
}

function DelegateAssessmentPill({ assessment }: { assessment: DelegateAssessment | null }) {
  if (!assessment) {
    return null;
  }
  const color = assessment.eligible ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold';
  return (
    <div className="p-3 rounded-xl bg-[#0d1017] border border-slate-800 flex items-center justify-between text-xs">
      <span className={color}>{assessment.verdictText}</span>
      <span className="font-mono text-slate-400">
        Riesgo corte propio: {assessment.betrayalRiskPct} %
      </span>
    </div>
  );
}

function DelegatePickerBlock({
  candidates,
  selectedId,
  assessment,
  onSelect
}: {
  candidates: (typeof REAL_POLITICIANS_2027)[number][];
  selectedId: string;
  assessment: DelegateAssessment | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4 pt-1">
      <DelegateSelector
        candidates={candidates}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/70 text-xs text-amber-200/90 leading-relaxed">
        Si tu delegado gana las generales, la partida termina con tu legado como conductor del espacio. Necesita estatura nacional.
      </div>
      <DelegateAssessmentPill assessment={assessment} />
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

function CandidaturaSubmitButton({
  confirmed,
  disabled,
  onConfirm
}: {
  confirmed: boolean;
  disabled: boolean;
  onConfirm: () => void;
}) {
  if (confirmed) {
    return (
      <button
        type="button"
        disabled
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300"
      >
        ✓ Candidatura confirmada
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onConfirm}
      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed shadow"
    >
      Confirmar candidatura
    </button>
  );
}

interface CandidaturaSectionProps {
  state: CampaignSimulationState;
}

function CandidaturaSection({ state }: CandidaturaSectionProps) {
  const [candidateMode, setCandidateMode] = useState<'YO' | 'OTRO'>('YO');
  const [confirmed, setConfirmed] = useState(false);

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

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> 1 · Candidatura
        </h2>
        <span className="text-xs text-slate-400">Elegí quién encabeza la lista</span>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <CandidateModeToggle
          candidateMode={candidateMode}
          onChangeMode={(mode) => {
            setCandidateMode(mode);
            setConfirmed(false);
          }}
        />

        {candidateMode === 'YO' ? (
          <CandidateLeadText name={state.candidateName} />
        ) : (
          <DelegatePickerBlock
            candidates={ownPartyDirigentes}
            selectedId={selectedDelegateId}
            assessment={assessment}
            onSelect={(id) => {
              setSelectedDelegateId(id);
              setConfirmed(false);
            }}
          />
        )}

        <CandidaturaSubmitButton
          confirmed={confirmed}
          disabled={!canConfirm}
          onConfirm={() => setConfirmed(true)}
        />
      </div>
    </section>
  );
}

function CoalitionVerdictSlot({
  record,
  assessment,
  onPropose
}: {
  record?: NegotiationRecord;
  assessment: NegotiationAssessment;
  onPropose: () => void;
}) {
  if (record?.verdict === 'ACEPTO') {
    return (
      <div className="w-full py-2 text-center text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl">
        ✓ Pacto de coalición sellado
      </div>
    );
  }
  if (record?.verdict === 'RECHAZO') {
    return (
      <div className="w-full py-2 text-center text-xs font-semibold bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-xl">
        ✗ Rechazaron la alianza este mes
      </div>
    );
  }
  return (
    <button
      type="button"
      disabled={Boolean(assessment.blockedReason)}
      onClick={onPropose}
      className="w-full py-2 rounded-xl text-xs font-bold bg-[#161a26] hover:bg-[#1e2333] text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      Proponer acuerdo de coalición
    </button>
  );
}

interface CoalitionCardProps {
  partner: CoalitionPartnerConfig;
  assessment: NegotiationAssessment;
  record?: NegotiationRecord;
  onPropose: () => void;
}

function CoalitionCard({ partner, assessment, record, onPropose }: CoalitionCardProps) {
  const topFactor = assessment.factors[0]?.label;

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white text-sm">{partner.name}</span>
          <span className="text-xs font-mono font-bold text-sky-400">
            {assessment.probabilityPct} % viabilidad
          </span>
        </div>
        <p className="text-xs text-slate-400">{partner.description}</p>

        {assessment.blockedReason ? (
          <div className="text-[11px] text-rose-300 mt-2 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">
            {assessment.blockedReason}
          </div>
        ) : topFactor ? (
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Punto clave: <span className="text-slate-300">{topFactor}</span>
          </div>
        ) : null}
      </div>

      <CoalitionVerdictSlot
        record={record}
        assessment={assessment}
        onPropose={onPropose}
      />
    </div>
  );
}

export function CampaignCoalicionesView({ state }: CampaignCoalicionesViewProps) {
  const player = useMemo(() => buildPlayerStanding(state), [state]);
  const mood = state.countryMood ?? createInitialCountryMood();

  const [coalitionLedger, setCoalitionLedger] = useState<Record<string, NegotiationRecord>>(
    () => state.diplomacy?.coalitions ?? {}
  );

  const availablePartners = useMemo(
    () => COALITION_CATALOG.filter((p) => p.sigla !== state.partySigla),
    [state.partySigla]
  );

  const handleProposeCoalition = (partnerSigla: string) => {
    const assessment = assessCoalition(partnerSigla, player, mood);
    const accepted = rollNegotiation(assessment, `${partnerSigla}-coa-${state.stage.currentMonthIndex}`);
    setCoalitionLedger((prev) => ({
      ...prev,
      [partnerSigla]: {
        verdict: accepted ? 'ACEPTO' : 'RECHAZO',
        monthIndex: state.stage.currentMonthIndex,
        probabilityPct: assessment.probabilityPct
      }
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

      <CandidaturaSection state={state} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> 2 · Coaliciones
          </h2>
          <span className="text-xs text-slate-400">Alianzas con cálculo de fuerza y grieta</span>
        </div>

        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            La fórmula la encabeza el partido que más votos aporta. Si tu espacio es el más votado de la coalición, vas primero y tus socios ponen el vice y parte del gabinete. Las fuerzas lejanas o en polos opuestos no aceptan alianzas si la polarización supera los límites tolerados por sus votantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {availablePartners.map((partner) => {
            const assessment = assessCoalition(partner.sigla, player, mood);
            return (
              <CoalitionCard
                key={partner.sigla}
                partner={partner}
                assessment={assessment}
                record={coalitionLedger[partner.sigla]}
                onPropose={() => handleProposeCoalition(partner.sigla)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
