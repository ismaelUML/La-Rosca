import React from 'react';
import {
  MANDATE_MONTHS,
  describeEventEffects,
  describeMandateGrade,
  findGovernmentEvent,
  getGovernmentRuntime,
  type GovernmentEventDefinition,
  type GovernmentEventOption,
  type MandateStatus,
  type SimulationState
} from '@argentina-sim/domain';

// Capas que se montan por encima del tablero de gobierno: la "Situación de Gobierno" que
// frena el avance del mes hasta que el Presidente decide, y la pantalla final del mandato.
// Se dejan juntas en un solo componente para que App.tsx no sume ramas de render.

const OUTCOME_TITLES: Record<Exclude<MandateStatus, 'EN_CURSO'>, { title: string; isVictory: boolean }> = {
  MANDATO_COMPLETADO: { title: 'Cumpliste el mandato', isVictory: true },
  RENUNCIA: { title: 'Renunciaste a la Presidencia', isVictory: false },
  JUICIO_POLITICO: { title: 'Te destituyó el Congreso', isVictory: false },
  DEFAULT_SOBERANO: { title: 'El país entró en default', isVictory: false },
  HIPERINFLACION: { title: 'Hiperinflación: perdiste el control', isVictory: false }
};

function EventOptionCard({ option, onChoose }: { option: GovernmentEventOption; onChoose: (id: string) => void }) {
  return (
    <div className="rounded-2xl bg-[#0f131c] border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
      <div className="space-y-3">
        <h4 className="text-base font-extrabold text-white leading-snug">{option.title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{option.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {describeEventEffects(option.effects).map((b) => (
            <span
              key={b.label}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-tight border ${
                b.isPositive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChoose(option.id)}
        className="w-full py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-950 transition shadow"
      >
        Elegir esta opción
      </button>
    </div>
  );
}

function GovernmentEventModal({
  event,
  monthLabel,
  onChoose
}: {
  event: GovernmentEventDefinition;
  monthLabel: string;
  onChoose: (optionId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e15] border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
            SITUACIÓN DE GOBIERNO · {monthLabel} · {event.category}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{event.title}</h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">{event.description}</p>
        </div>
        <div className={`grid grid-cols-1 gap-4 ${event.options.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {event.options.map((o) => (
            <EventOptionCard key={o.id} option={o} onChoose={onChoose} />
          ))}
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          El mes no avanza hasta que resuelvas la situación.
        </div>
      </div>
    </div>
  );
}

function FinalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0f131c] border border-slate-800 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-lg font-extrabold text-white font-mono">{value}</div>
    </div>
  );
}

function MandateEndScreen({
  state,
  status,
  onExitToMenu
}: {
  state: SimulationState;
  status: Exclude<MandateStatus, 'EN_CURSO'>;
  onExitToMenu: () => void;
}) {
  const gov = getGovernmentRuntime(state);
  const outcome = OUTCOME_TITLES[status];
  const score = gov.finalScore ?? 0;
  const accent = outcome.isVictory ? 'text-emerald-400' : 'text-rose-400';
  const fmt = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e15] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <div className={`text-[11px] font-bold uppercase tracking-wider ${accent}`}>
            FIN DEL MANDATO · MES {state.turnMonth - 1} DE {MANDATE_MONTHS}
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">{outcome.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{gov.endReason ?? describeMandateGrade(score)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FinalStat label="Puntaje del mandato" value={`${fmt(score)} / 100`} />
          <FinalStat label="Aprobación" value={`${fmt(state.publicOpinion.managementApprovalPct)} %`} />
          <FinalStat label="Inflación interanual" value={`${fmt(state.inflation.interannualIpcPct)} %`} />
          <FinalStat label="Pobreza" value={`${fmt(state.inflation.povertyCbtPct)} %`} />
          <FinalStat label="Riesgo país" value={`${Math.round(state.countryRiskEmbiPb)} pb`} />
          <FinalStat label="Reservas brutas" value={`${fmt(state.centralBank.grossReservesBillionUsd)} MM USD`} />
        </div>
        <button
          type="button"
          onClick={onExitToMenu}
          className="w-full py-3 rounded-xl text-sm font-bold bg-white hover:bg-slate-200 text-slate-950 transition shadow"
        >
          Volver al menú principal
        </button>
      </div>
    </div>
  );
}

interface GovernmentOverlaysProps {
  state: SimulationState;
  monthLabel: string;
  onChooseEventOption: (optionId: string) => void;
  onExitToMenu: () => void;
}

export function GovernmentOverlays({ state, monthLabel, onChooseEventOption, onExitToMenu }: GovernmentOverlaysProps) {
  const gov = getGovernmentRuntime(state);
  const event = findGovernmentEvent(gov.pendingEventId);
  if (gov.mandateStatus !== 'EN_CURSO') {
    return <MandateEndScreen state={state} status={gov.mandateStatus} onExitToMenu={onExitToMenu} />;
  }
  return event ? <GovernmentEventModal event={event} monthLabel={monthLabel} onChoose={onChooseEventOption} /> : null;
}
