import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { PressAndDebateSimulatorModal } from '../game-shell/PressAndDebateSimulatorModal.js';
import { playUiSound } from '../../lib/gameFeedback.js';

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
  const [debateOpen, setDebateOpen] = useState(false);
  const attrs = state.attributes;
  const img = state.image;
  const poll = state.internalPoll;
  const vote = state.votingIntention;

  return (
    <div className="space-y-6">
      <div className="rounded-sm bg-gradient-to-r from-[#131924] via-[#101620] to-[#1a160f] border border-[#263142] border-l-2 border-l-[#c5a059] p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#d4b26a]">
            Objetivo de Campaña
          </div>
          <div className="text-xl md:text-2xl font-serif font-bold text-white mt-0.5">
            {state.stage.objectiveTitle}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            setDebateOpen(true);
          }}
          className="hoi-btn-gold px-3.5 py-2 rounded-sm text-xs font-mono font-extrabold uppercase tracking-wider shrink-0"
        >
          Estudio TV 3D · Debate y Prensa en Vivo
        </button>
      </div>

      <PressAndDebateSimulatorModal
        open={debateOpen}
        speakerName={state.candidateName}
        onClose={() => setDebateOpen(false)}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span className="text-[#c5a059]">■</span> Imagen Pública
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Positiva + negativa + desconocimiento = 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              IMAGEN POSITIVA · VERDE
            </div>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {img.imagenPositiva.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-3 overflow-hidden">
              <div style={{ width: `${img.imagenPositiva}%` }} className="h-full bg-emerald-500" />
            </div>
          </div>

          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              IMAGEN NEGATIVA · ROJO
            </div>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {img.imagenNegativa.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-3 overflow-hidden">
              <div style={{ width: `${img.imagenNegativa}%` }} className="h-full bg-rose-500" />
            </div>
          </div>

          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              DESCONOCIMIENTO · GRIS
            </div>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              {img.desconocimiento.toFixed(1)} <span className="text-lg text-slate-400 font-normal">%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-3 overflow-hidden">
              <div style={{ width: `${img.desconocimiento}%` }} className="h-full bg-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <span className="text-[#c5a059]">■</span> Intención de voto
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              INTENCIÓN DE VOTO (GENERAL)
            </div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {vote.intencionVotoGeneral.toFixed(1)} %
            </div>
          </div>
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              PISO · BRONCE
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-500 mt-1">
              {vote.piso.toFixed(1)} %
            </div>
          </div>
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              TU INTERNA
            </div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {vote.tuInterna.toFixed(1)} %
            </div>
          </div>
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              TECHO · AZUL
            </div>
            <div className="text-2xl font-mono font-extrabold text-sky-400 mt-1">
              {vote.techo.toFixed(1)} %
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Encuesta de la interna
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Intención interna · indecisos: {poll.undecidedPct.toFixed(1)} % · error ±{poll.marginOfErrorPp.toFixed(1)} pp
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
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span className="text-[#c5a059]">■</span> Características propias
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Estado de tu espacio: <strong className="text-[#d4b26a]">{attrs.espacioEstado.toLowerCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              INTELIGENCIA PERCIBIDA · TURQUESA
            </div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {attrs.inteligenciaPercibida.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.inteligenciaPercibida}%` }} className="h-full bg-cyan-400" />
            </div>
          </div>

          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
              CONVENCIMIENTO · FRAMBUESA
            </div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {attrs.convencimiento.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.convencimiento}%` }} className="h-full bg-pink-500" />
            </div>
          </div>

          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
              RELEVANCIA · AZUL
            </div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {attrs.relevancia.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.relevancia}%` }} className="h-full bg-sky-500" />
            </div>
          </div>

          <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
              APOYO PARTIDARIO · NARANJA
            </div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {attrs.apoyoPartidario.toFixed(1)}
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#161e2b] mt-2.5 overflow-hidden">
              <div style={{ width: `${attrs.apoyoPartidario}%` }} className="h-full bg-orange-500" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {attrs.espacioEstadoDescripcion}
        </p>
      </section>

      <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-mono font-bold text-white">
              Acciones este mes: {state.actionsRemainingThisMonth} de {state.actionsTotalThisMonth}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              Presupuesto: <strong className="text-emerald-400">{state.budgetArgentums.toFixed(1)} ¥</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateActions}
            className="px-3.5 py-1.5 rounded-sm bg-[#121926] hover:bg-[#192233] border border-[#2c384b] text-xs font-mono font-bold uppercase tracking-wider text-white transition"
          >
            Ver acciones de campaña →
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1c2432]">
          <div className="flex-1 rounded-sm bg-[#16130d] border border-[#8a6d33]/50 px-3.5 py-2 text-xs font-mono text-amber-200/90">
            Usá al menos una acción antes de avanzar (o quedate sin presupuesto).
          </div>
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="px-5 py-2.5 rounded-sm bg-gradient-to-b from-[#d8b76c] to-[#9b7a38] hover:from-[#e6c87d] hover:to-[#b08c42] text-slate-950 font-mono font-extrabold uppercase tracking-wider text-xs border border-[#f3d893]/40 transition shadow shrink-0"
          >
            Avanzar al mes siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

