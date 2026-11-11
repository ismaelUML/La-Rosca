import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de POLÍTICO -> Candidatura y coaliciones (captura de referencia del usuario):
// elección de encabezado de lista (personal vs delfín) y acuerdos programáticos de coalición
// electoral con reparto proporcional de vicepresidencia y ministerios de gabinete.

interface CampaignCoalicionesViewProps {
  state: CampaignSimulationState;
}

interface CoalitionPartner {
  sigla: string;
  name: string;
  affinityPct: number;
  description: string;
  color: string;
}

const COALITION_PARTNERS: CoalitionPartner[] = [
  {
    sigla: 'LLA',
    name: 'La Libertad Avanza',
    affinityPct: 87,
    description: 'Aporta votos de derecha libertaria y juventud; exige veto a aumentos impositivos y conducción del BCRA.',
    color: '#8b5cf6'
  },
  {
    sigla: 'UCR',
    name: 'Unión Cívica Radical',
    affinityPct: 70,
    description: 'Aporta estructura territorial en 400 municipios y senadores clave; exige educación pública y federalismo.',
    color: '#dc2626'
  },
  {
    sigla: 'PF',
    name: 'Provincias Unidas / Peronismo Federal',
    affinityPct: 62,
    description: 'Aporta gobernadores de Córdoba, Santa Cruz y Salta; exige reparto automático de ATNs y obra pública.',
    color: '#2563eb'
  },
  {
    sigla: 'UxP',
    name: 'Unión por la Patria',
    affinityPct: 22,
    description: 'Aporta el piso popular del Conurbano y centrales obreras; polarización ideológica casi insalvable.',
    color: '#0284c7'
  },
  {
    sigla: 'FIT',
    name: 'Frente de Izquierda',
    affinityPct: 8,
    description: 'Aporte militante y comisiones internas; rechaza de cuajo cualquier frente burgués institucional.',
    color: '#e11d48'
  }
];

function CandidaturaDescriptionText({ mode, name }: { mode: 'YO' | 'OTRO'; name: string }) {
  if (mode === 'YO') {
    return (
      <p className="text-xs text-slate-300">
        Vas a ser la cara de la lista presidencial como {name}. Tus atributos personales impactan directo en debates y entrevistas.
      </p>
    );
  }
  return (
    <p className="text-xs text-slate-300">
      Elegís un delfín político para encabezar la fórmula mientras retenés el control del partido y la jefatura del bloque legislativo.
    </p>
  );
}

function ConfirmCandidaturaButton({
  confirmed,
  onConfirm
}: {
  confirmed: boolean;
  onConfirm: () => void;
}) {
  if (confirmed) {
    return (
      <button
        type="button"
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300"
      >
        ✓ Candidatura confirmada
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onConfirm}
      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 shadow"
    >
      Confirmar candidatura
    </button>
  );
}

interface CandidaturaSectionProps {
  candidateName: string;
}

function CandidaturaSection({ candidateName }: CandidaturaSectionProps) {
  const [candidateMode, setCandidateMode] = useState<'YO' | 'OTRO'>('YO');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> 1 · Candidatura
        </h2>
        <span className="text-xs text-slate-400">Elegí quién encabeza la lista</span>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <div className="inline-flex p-1 rounded-xl bg-[#0b0e15] border border-slate-800">
          <button
            type="button"
            onClick={() => setCandidateMode('YO')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              candidateMode === 'YO' ? 'bg-white text-slate-950' : 'text-slate-300'
            }`}
          >
            Me presento yo
          </button>
          <button
            type="button"
            onClick={() => setCandidateMode('OTRO')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              candidateMode === 'OTRO' ? 'bg-white text-slate-950' : 'text-slate-300'
            }`}
          >
            Que me represente otra persona
          </button>
        </div>

        <CandidaturaDescriptionText mode={candidateMode} name={candidateName} />
        <ConfirmCandidaturaButton confirmed={confirmed} onConfirm={() => setConfirmed(true)} />
      </div>
    </section>
  );
}

function CoalicionesSection() {
  const [activeCoalitions, setActiveCoalitions] = useState<Set<string>>(new Set());

  const handleToggleCoalition = (sigla: string) => {
    const next = new Set(activeCoalitions);
    if (next.has(sigla)) {
      next.delete(sigla);
    } else {
      next.add(sigla);
    }
    setActiveCoalitions(next);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> 2 · Coaliciones
        </h2>
        <span className="text-xs text-slate-400">Alianzas solo para esta elección</span>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          La fórmula la encabeza el partido que más votos aporta. Si tu espacio es el más votado de la coalición, vas primero y tus socios ponen el vice y una parte del gabinete. Si un socio aporta más votos, su principal dirigente encabeza y vos vas como vice: si ganan, sos vicepresidente, seguís manejando tu partido, designás un cupo menor del gabinete y podés sugerirle medidas al presidente (las acepta según su afinidad con cada idea).
        </p>
        <div className="text-[11px] text-slate-500">
          Las fuerzas opositoras con más de 75 % de afinidad pueden aliarse entre sí: pasa en un 10 % de las elecciones, 15 % si vos armás coalición y 12-13 % si les sacás mucha ventaja.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {COALITION_PARTNERS.map((partner) => {
          const isAllied = activeCoalitions.has(partner.sigla);
          return (
            <div
              key={partner.sigla}
              className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">{partner.name}</span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {partner.affinityPct} % afinidad
                  </span>
                </div>
                <p className="text-xs text-slate-400">{partner.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleCoalition(partner.sigla)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  isAllied
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'bg-[#161a26] hover:bg-[#1e2333] text-slate-200 border border-slate-700'
                }`}
              >
                {isAllied ? 'Pacto de coalición sellado' : 'Proponer acuerdo de coalición'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CampaignCoalicionesView({ state }: CampaignCoalicionesViewProps) {
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

      <CandidaturaSection candidateName={state.candidateName} />
      <CoalicionesSection />
    </div>
  );
}
