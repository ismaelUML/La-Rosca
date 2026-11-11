import React from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de SITUACIÓN -> Resumen (capturas 1, 2 y 3):
// Objetivo de la interna, imagen positiva/negativa/desconocimiento,
// encuesta de la interna partidaria, caracteristicas propias y barra de avance mensual.

interface CampaignResumenViewProps {
  state: CampaignSimulationState;
  onAdvanceMonth: () => void;
  onNavigateActions: () => void;
}

function CandidatePartyBadge({ partySigla, color }: { partySigla: string; color: string }) {
  return (
    <span
      style={{ backgroundColor: color }}
      className="px-1 py-0.5 rounded text-[9px] font-black text-slate-950 flex items-center gap-0.5 leading-none shrink-0"
    >
      <span className="text-[7px]">▶</span>
      <span>{partySigla.toLowerCase()}</span>
    </span>
  );
}

function CandidatePollBar({
  name,
  partySigla,
  voteSharePct,
  color,
  isPlayer
}: {
  name: string;
  partySigla: string;
  voteSharePct: number;
  color: string;
  isPlayer: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="flex items-center gap-2 text-slate-200">
          <CandidatePartyBadge partySigla={partySigla} color={color} />
          <strong className={isPlayer ? 'text-white' : 'text-slate-300'}>{name}</strong>
          <span className="text-slate-500 font-mono">· {partySigla}</span>
        </span>
        <span className="font-mono font-bold text-white text-xs">{voteSharePct.toFixed(1)} %</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          style={{ width: `${Math.min(100, voteSharePct)}%`, backgroundColor: color }}
          className="h-full rounded-full transition-all duration-300"
        />
      </div>
    </div>
  );
}

export function CampaignResumenView({
  state,
  onAdvanceMonth,
  onNavigateActions
}: CampaignResumenViewProps) {
  const attrs = state.attributes;
  const img = state.image;
  const poll = state.internalPoll;
  const vote = state.votingIntention;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#10131c] border-2 border-amber-500/80 p-5 shadow-lg shadow-amber-950/20">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          Objetivo
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
          {state.stage.objectiveTitle}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> Imagen
          </h2>
          <span className="text-[11px] text-slate-400">
            Positiva + negativa + desconocimiento = 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              IMAGEN POSITIVA · VERDE
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {img.imagenPositiva.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div style={{ width: `${img.imagenPositiva}%` }} className="h-full bg-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              IMAGEN NEGATIVA · ROJO
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {img.imagenNegativa.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div style={{ width: `${img.imagenNegativa}%` }} className="h-full bg-rose-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              DESCONOCIMIENTO · GRIS
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {img.desconocimiento.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div style={{ width: `${img.desconocimiento}%` }} className="h-full bg-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> Intención de voto
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[11px] text-slate-400 font-medium">INTENCIÓN DE VOTO (ELECCIÓN GENERAL)</div>
            <div className="text-2xl font-extrabold text-white mt-1">{vote.intencionVotoGeneral.toFixed(1)} %</div>
          </div>
          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[11px] text-slate-400 font-medium">PISO · BRONCE</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">{vote.piso.toFixed(1)} %</div>
          </div>
          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[11px] text-slate-400 font-medium">TU INTERNA</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{vote.tuInterna.toFixed(1)} %</div>
          </div>
          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[11px] text-slate-400 font-medium">TECHO · AZUL</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">{vote.techo.toFixed(1)} %</div>
          </div>
        </div>
      </section>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Encuesta de la interna</h3>
          <span className="text-[11px] text-slate-400">
            Intención entre los votantes de la interna · indecisos: {poll.undecidedPct.toFixed(1)} % · margen de error ±{poll.marginOfErrorPp.toFixed(1)} pp
          </span>
        </div>

        <div className="space-y-3.5">
          {poll.candidates.map((c) => (
            <CandidatePollBar
              key={c.id}
              name={c.name}
              partySigla={c.partySigla}
              voteSharePct={c.voteSharePct}
              color={c.color}
              isPlayer={c.isPlayer}
            />
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> Características propias
          </h2>
          <span className="text-xs text-slate-400">
            Estado de tu espacio: <strong className="text-amber-400">{attrs.espacioEstado.toLowerCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              INTELIGENCIA PERCIBIDA · TURQUESA
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {attrs.inteligenciaPercibida.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.inteligenciaPercibida}%` }} className="h-full bg-cyan-400" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
              CONVENCIMIENTO · FRAMBUESA
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {attrs.convencimiento.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.convencimiento}%` }} className="h-full bg-pink-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              RELEVANCIA · AZUL
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {attrs.relevancia.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.relevancia}%` }} className="h-full bg-sky-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              APOYO PARTIDARIO · NARANJA
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {attrs.apoyoPartidario.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.apoyoPartidario}%` }} className="h-full bg-orange-500" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {attrs.espacioEstadoDescripcion}
        </p>
      </section>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800 p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">
              Acciones este mes: {state.actionsRemainingThisMonth} de {state.actionsTotalThisMonth}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Presupuesto: <strong className="text-emerald-400 font-mono">{state.budgetArgentums.toFixed(1)} ¥</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateActions}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Ver acciones de campaña →
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
          <div className="flex-1 rounded-xl bg-[#181612] border border-amber-800/50 px-3.5 py-2 text-xs text-amber-200/90">
            Usá al menos una acción antes de avanzar (o quedate sin presupuesto).
          </div>
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-bold text-xs transition shadow shrink-0"
          >
            Avanzar al mes siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

